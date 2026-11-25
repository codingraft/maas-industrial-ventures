import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createServer } from "node:net";
import { randomUUID } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";

async function fixture(t, overrides = {}) {
  const directory = await mkdtemp(path.join(tmpdir(), "maas-test-"));
  const listener = createServer();
  listener.listen(0, "127.0.0.1");
  await once(listener, "listening");
  const port = listener.address().port;
  await new Promise(resolve => listener.close(resolve));
  const password = randomUUID();
  const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-H", "127.0.0.1", "-p", String(port)], {
    windowsHide: true, stdio: "ignore",
    env: { ...process.env, NODE_ENV: "production", MONGODB_URI: " ", SQLITE_DATA_DIR: directory,
      ADMIN_USERNAME: "fixture", ADMIN_PASSWORD: password, ADMIN_SECRET: randomUUID(),
      ENQUIRY_WEBHOOK_URL: " ", VERCEL: "", AWS_LAMBDA_FUNCTION_NAME: "", ...overrides },
  });
  t.after(async () => {
    if (server.exitCode === null && server.signalCode === null) {
      const closed = once(server, "exit");
      server.kill();
      await closed;
    }
    await rm(directory, { recursive: true, force: true });
  });
  const request = (route, options) => fetch("http://127.0.0.1:" + port + route, options);
  for (let attempt = 0; attempt < 100; attempt++) {
    try { if ((await request("/api/admin/settings")).status === 401) break; } catch {}
    await delay(100);
  }
  const post = (route, data, cookie = "") => request(route, { method: "POST",
    headers: { "Content-Type": "application/json", cookie }, body: JSON.stringify(data) });
  return { request, post, password, directory };
}

test("authenticated CMS, public visibility and lead persistence", async t => {
  const { request, post, password } = await fixture(t);
  assert.equal((await post("/api/admin/login", null)).status, 400);
  assert.equal((await post("/api/admin/login", { username: "fixture", password: "ø".repeat(100) })).status, 401);
  const login = await post("/api/admin/login", { username: "fixture", password });
  assert.equal(login.status, 200);
  const cookie = login.headers.get("set-cookie").split(";")[0];
  const admin = { headers: { cookie } };
  assert.equal((await request("/api/admin/settings", admin)).status, 200);
  const current = (await (await request("/api/admin/settings", admin)).json()).settings;
  const patch = data => request("/api/admin/settings", { method: "PATCH", headers: { cookie, "Content-Type": "application/json" }, body: JSON.stringify(data) });
  assert.equal((await patch({ sections: { blog: "enabled" } })).status, 400);
  const headline = "Fixture " + randomUUID();
  const overview = "Overview " + randomUUID();
  const vertical = "Vertical " + randomUUID();
  const vision = "Vision " + randomUUID();
  const caption = "Gallery " + randomUUID();
  const email = "contact-" + randomUUID() + "@example.invalid";
  const canonical = "https://cms-fixture.example";
  const changes = {
    site_info: { ...current.site_info, heroHeadline: headline, overviewHeadline: overview, email },
    verticals: current.verticals.map((item, i) => i === 0 ? { ...item, title: vertical } : item),
    vision_mission: { ...current.vision_mission, vision },
    media: { ...current.media, gallery: current.media.gallery.map((item, i) => i === 0 ? { ...item, caption } : item) },
    seo: { ...current.seo, canonicalUrl: canonical },
    sections: { ...current.sections, overview: true, gallery: true },
  };
  assert.equal((await patch(changes)).status, 200);
  const saved = (await (await request("/api/admin/settings", admin)).json()).settings;
  for (const key of Object.keys(changes)) assert.deepEqual(saved[key], changes[key]);
  const home = await (await request("/")).text();
  for (const copy of [headline, overview, vertical, caption, email]) assert.ok(home.includes(copy), copy);
  assert.ok((await (await request("/about")).text()).includes(vision));
  assert.equal((await patch({ sections: { ...changes.sections, overview: false } })).status, 200);
  assert.ok(!(await (await request("/")).text()).includes(overview));
  assert.ok((await (await request("/blog")).text()).includes(canonical + "/blog"));
  assert.ok((await (await request("/sitemap.xml")).text()).includes(canonical + "/projects"));
  for (const [collection, flag, publicPath] of [["blogs", "isPublished", "blog"], ["projects", "isActive", "projects"]]) {
    const list = await (await request("/api/admin/" + collection, admin)).json();
    const item = list[collection][0];
    const detail = await (await request("/api/admin/" + collection + "/" + item.id, admin)).json();
    const record = detail.blog || detail.project;
    assert.equal((await request("/" + publicPath + "/" + record.slug)).status, 200);
    const privateTitle = "Draft " + randomUUID();
    assert.equal((await post("/api/admin/" + collection, { ...record, title: privateTitle, [flag]: false }, cookie)).status, 200);
    const hidden = await request("/" + publicPath + "/" + record.slug);
    const html = await hidden.text();
    // Next can start a streaming response before the nested page calls notFound().
    assert.ok(hidden.status === 404 || html.includes("NEXT_HTTP_ERROR_FALLBACK;404"));
    assert.ok(!html.includes(privateTitle));
  }
  assert.equal((await post("/api/enquiry", { name: "Fixture Buyer", phone: "1234567890", email: "buyer@example.invalid", consent: true })).status, 200);
  const leads = await (await request("/api/admin/leads", admin)).json();
  assert.equal(leads.leads[0].name, "Fixture Buyer");
  const csv = await request("/api/admin/leads?export=csv", admin);
  assert.match(await csv.text(), /"Fixture Buyer"/);
});

test("Mongo outage cannot acknowledge a lead in SQLite", async t => {
  const { post, directory } = await fixture(t, { MONGODB_URI: "mongodb://127.0.0.1:1/test" });
  const result = await post("/api/enquiry", { name: "Fixture Buyer", phone: "1234567890", email: "buyer@example.invalid", consent: true });
  assert.equal(result.status, 503);
  const { readdir } = await import("node:fs/promises");
  assert.deepEqual(await readdir(directory), []);
});

test("missing signing configuration disables login", async t => {
  const { post, password } = await fixture(t, { ADMIN_SECRET: "" });
  assert.equal((await post("/api/admin/login", { username: "fixture", password })).status, 401);
});

test("simultaneous enquiries receive distinct persistent Mongo IDs", {
  skip: !process.env.TEST_MONGODB_URI && "Requires a disposable TEST_MONGODB_URI",
}, async t => {
  const { post, request, password } = await fixture(t, {
    MONGODB_URI: process.env.TEST_MONGODB_URI,
    MONGODB_DB: "maas_fixture_" + randomUUID().replaceAll("-", ""),
  });
  const responses = await Promise.all(Array.from({ length: 8 }, (_, index) =>
    post("/api/enquiry", { name: "Fixture " + index, email: "buyer@example.invalid", phone: "1234567890", consent: true })
  ));
  const ids = [];
  for (const response of responses) {
    assert.equal(response.status, 200);
    const { leadId } = await response.json();
    assert.ok(Number.isSafeInteger(leadId));
    ids.push(leadId);
  }
  assert.equal(new Set(ids).size, responses.length);
  const login = await post("/api/admin/login", { username: "fixture", password });
  const cookie = login.headers.get("set-cookie").split(";")[0];
  const saved = await (await request("/api/admin/leads", { headers: { cookie } })).json();
  assert.equal(saved.pagination.total, responses.length);
});
