# MAAS engineering audit • 24 November 2026

## Scope and baseline

Revision dc3d0aa, initially clean working tree. This is the discovery and roadmap review checkpoint. Application behavior, schema and deployment have not been changed by this audit.

Strict TypeScript, ESLint and the Next 15.5.28 production build passed locally. The build used local database mode. First-load JS reported by Next was 103 kB shared, 129 kB home, 118–122 kB on other public pages and 138 kB on the dashboard. These are build estimates. They exclude subsequently loaded editor chunks, photographs and runtime data. There is no test script, tracked regression suite, CI workflow or setup README in this checkout.

Read-only Mongo executionStats, first page, limit ten, current configured database, ID-only projection:

| Query and sort | Returned | Keys examined | Documents examined | Server ms |
|---|---:|---:|---:|---:|
| Leads by descending lead_id and _id | 3 | 0 | 3 | 1 |
| Published blogs by descending publishedAt and _id | 3 | 3 | 3 | 2 |
| Active projects by order and _id | 2 | 2 | 2 | 2 |

These collections are too small to establish production latency or justify more indexes. Record cold/warm HTTP timings, full projection explain plans and search/export behavior on a representative isolated fixture before tuning. Production deployment, backups, session configuration, webhook delivery, visual breakpoints, keyboard and screen-reader behavior, multi-instance consistency and load capacity were not verified. No before/after speedup is claimed.

## Feature and architecture inventory

| Entry | Workflow and dependencies |
|---|---|
| Home, about, projects, project detail, gallery, contact | App Router server pages read settings and active records. Interactive components provide navigation, hero slides, galleries, plan viewing, booking, brochure and enquiry actions. |
| Blog index and article | Category/search/page controls, publication lists, article lookup, Markdown rendering, metadata, related articles and sharing. Robots reads SEO settings. Sitemap currently emits home only. |
| Enquiry API | Multiple public forms submit consent, contact details and attribution. The handler validates fields, checks a honeypot and process-local rate limit, inserts the lead and optionally forwards a webhook. |
| Admin login/logout and dashboard | Credential check issues a signed expiring HTTP-only cookie. Dashboard checks session and reads settings and lead metrics. Restricted handlers call the same authentication helper. |
| Leads API and table | Search, status and project filters, pagination, CSV, status/notes updates and deletion. |
| Projects and blogs APIs | Authenticated collection and detail handlers, paginated managers, create/update/delete, Markdown editor, active/published flags. |
| Settings | Content, hero, verticals, vision, visibility, media, contact/social, tracking and SEO. PATCH allows top-level groups, database normalizer fills older record defaults. |
| Media/upload | Library and picker collect file and record references. Upload selects Cloudinary, local files or embedded data. Delete behavior varies by storage. |

Existing structure: app/ owns pages, metadata, loading/error boundaries and API handlers. components/ owns public UI, blog controls and admin editors. lib/ contains authentication, caching, rate limiting, rendering, types/defaults and a roughly 1,560-line dual-backend database module. config/ contains project configuration, scripts/ contains asset/seed utilities, public/ contains logos and uploaded files. The MongoDB driver accesses settings, projects, blogs and leads directly. Projects and blogs have public slugs and internal IDs. Media references are embedded across records. SQLite provides a second persistence implementation. Vercel configuration selects Next.js. There are six direct runtime packages including React/React DOM and a dynamically imported admin editor.

Proposed structure: retain routes, component ownership and public API paths. Introduce lib/db/ modules for leads, publishing and settings behind existing exports as each workflow gains contract tests. Keep shared session and request validation at the server boundary. Add tests/ for storage and route contracts. Keep public appearance in app/styles and admin CSS scoped. Add setup/recovery instructions alongside this register. This sequence isolates changes to callers and avoids reorganizing unrelated modules.

## Findings and implementation register

All items are **Not Started** pending roadmap review. Effort estimates are engineering days for implementation and focused tests, excluding external approvals. Risk refers to changing existing behavior.

| ID / severity | Evidence, root cause and impact | Proposed change and acceptance check | Effort / risk / dependency |
|---|---|---|---|
| A01 P0 authentication | lib/auth.ts supplies static credentials and signing material when configuration is absent. Its fixed padding does not guarantee equal byte lengths for credential comparison. Misconfiguration compromises admin access, malformed input can cause 500s. | Require explicitly provisioned credentials and key, compare fixed-length digests, validate types and timestamps. Test missing configuration, Unicode, expiry and cookie lifecycle. | 1 / medium / confirm deployed variables before rollout |
| A02 P0 durability | lib/db.ts catches Mongo write failures and falls through to SQLite. Serverless storage can be temporary. An accepted lead or CMS edit can disappear after recovery. | Select one authoritative writable store per environment. Return a retryable error on failed durable writes. Rehearse outage and recovery against isolated data and inventory any divergent records before rollout. | 2–3 / high / backup and reconciliation plan |
| A03 P1 publication | Both public slug pages and metadata call unrestricted lookups shared with admin. The pages only check record existence. Mongo misses can fall through to local or seeded records. | Separate public and editorial reads including cache keys. Test draft, inactive, missing, deleted and republished URLs with cold and warm caches. | 1–2 / medium / two-store fixtures |
| A04 P1 content safety | lib/markdown.ts interpolates text and link destinations into HTML. Blog detail injects the result and embeds JSON-LD without script-context escaping. CSP permits inline script. | Render restricted Markdown with safe URL schemes and escaped text. Use safe JSON serialization. Verify formatting, inert markup, valid links and structured data. | 1–2 / medium / representative stored articles |
| A05 P1 identity | insertLead reads the last numeric ID before inserting. Mongo index on lead_id is nonunique. Concurrent enquiries can share an admin-facing ID. | Preserve existing identifiers, audit duplicates and choose atomic allocation. Test concurrent inserts and exact update/delete identity. | 2 / high / migration review before index or counter changes |
| A06 P1 uploads | upload/route.ts accepts MIME or extension, trusts client metadata, buffers up to 15 MiB and may embed base64 in CMS settings. Large media can dominate payloads or exceed document limits. | Validate actual image content and derive extension, enforce provider-compatible sizes and durable storage. Test local and hosted limits, valid legacy assets and invalid files. | 2 / medium / provider configuration |
| A07 P1 dependencies | npm audit --omit=dev reported two affected runtime packages, next and postcss, one high and one moderate finding overall. | Review compatible patched lockfile, check advisories again and run route/build smoke tests before upgrade. | 1 / medium / supported Node and Next versions |
| A08 P1 API and admin saves | settings PATCH checks keys but assigns unvalidated nested values with any. Editors submit entire groups. Multi-editor saves can overwrite unrelated fields. Login and enquiry assume parsed JSON is an object. | Validate group shapes and bounds, distinguish omission from intentional empty values, add conflict detection to shared records. Exercise old settings and simultaneous saves. | 2–3 / medium / agree conflict UX |
| A09 P1 export | leads GET disables pagination for CSV, collects rows and builds a second response string. Quoting differs across columns and spreadsheet formula cells are untreated. | Stream bounded batches using stable ordering and a common CSV encoder. Test formula-like text, quotes, Unicode and large exports. | 2 / medium / agreed export contract |
| A10 P2 query volume | Blog index fetches all published summaries alongside a paginated result. Detail pages load collections for related content. Media GET scans directories, stats files and slices a fully assembled inventory. | Query distinct categories and limited related records. Profile media indexing separately. Retain numbered admin pages and existing database pagination for leads/projects/blogs. Test search, stable ordering, empty and invalid pages. | 2–4 / medium / representative fixture |
| A11 P2 caching and traffic | lib/cache.ts and rateLimit.ts use instance-local maps. Write paths invalidate before persistence. Other workers can serve stale data or enforce separate limits. | Invalidate after durable writes and define freshness guarantees. Verify read/write races, proxy IP assumptions and multiple workers before proposing external services. | 1–2 / medium / hosting topology |
| A12 P2 delivery and diagnosis | Enquiry notification starts an unawaited fetch and only catches transport failures. Non-success HTTP responses need handling. Console errors lack consistent operation IDs. | Define notification delivery expectations, record status/latency with PII redaction and distinguish stored leads from failed notifications. Test remote timeout and rejection. | 1–2 / low / webhook contract |
| A13 P2 accessibility and layout | Gallery lightbox has arrow/Escape handling and dialog semantics but no explicit focus transfer, containment or restoration in ProjectGallery.tsx. Existing responsive CSS is spread over component and page rules. | Exercise keyboard-only operation, focus restoration, zoom, overflow and long CMS text across mobile/tablet/desktop, including admin tables. Capture 375/768/1024/1440 results before visual edits. | 2 / low / browser fixtures |
| A14 P2 SEO | sitemap.ts emits only home while live routes include public catalogues and detail pages. Blog/project canonicals hard-code a host despite CMS canonical settings. | Share URL construction, enumerate public records only and give admin login explicit indexing policy. Compare sitemap, metadata and robots after publishing changes. | 1 / low / A03 |
| A15 P2 maintainability and regression | Mongo mapping repeats across list, page and single-record functions in lib/db.ts. Multiple enquiry components submit to the same endpoint. Strict TS coexists with untyped database values. | Extract typed mappers per domain and share submission semantics where workflows match. Add fixtures for both stores, route contracts, CMS round trips and admin interaction tests. | 3–5 / medium / isolated test stores |
| A16 P2 admin media feedback | Media DELETE returns success for external/static URLs without updating any persistent reference. Local deletion can leave CMS references. | Expose supported actions by ownership and check references before removal. Reload library and affected public pages after each action. | 1–2 / medium / media ownership policy |
| A17 P2 operations | Minimal Vercel config, no tracked CI/test command, setup guide or recovery drill. Database initialization manages indexes in application runtime. | Add reproducible CI, explicit Node runtime minimum, env contract, read-only health diagnostics, backup/restore and rollback rehearsal. Review indexes and privileges before changing production. | 2–3 / medium / deployment owner and isolated restore target |
| A18 P3 repository hygiene | Five earlier screenshot PNGs are tracked under tmp/pdfs. Seed scripts, logos and uploads can be referenced outside static imports. | Define fixture/artifact ownership and check dynamic CMS references before deleting any asset. | 0.5 / low / asset owner |

## Prioritized delivery and review gates

1. Establish isolated storage fixtures and session, enquiry and publication contracts. Resolve A01–A04 first. Verify that an acknowledged enquiry survives process restart and that private records stay private across cache states.
2. Address A05–A09. Inventory existing IDs and media sizes read-only. Obtain separate approval for data/index migrations and rehearse rollback before applying them.
3. Address A10–A12 and A15 incrementally. Compare counts, projections, HTTP timings, memory during export, cache behavior and first-load JS against this baseline using the same workload.
4. Complete A13, A14 and A16, then A17–A18. Verify public and admin workflows, accessibility and layout with real content. Document residual risk, dependency versions, release evidence and any unverified infrastructure assumptions before requesting deployment approval.

The architecture already supports incremental repair. Highest priority is trustworthy access and durable writes. Existing pagination, connection reuse, image optimization, code splitting and strict compilation provide a foundation. Build success alone gives no assurance about authorization boundaries, concurrent persistence, keyboard usability or recovery.

## Implementation evidence • 25 November 2026

The register above is the pre-change baseline. The following statuses supersede its initial status.

| IDs | Current status and evidence |
|---|---|
| A01 | Implemented. Removed embedded credential and key fallbacks, replaced padding with fixed-size digest comparisons and rejected future session timestamps. Real HTTP login, Unicode mismatch, malformed JSON shape and authenticated access passed on the fixture. Existing deployments must explicitly provision the three admin variables. |
| A02 | Tested for the lead outage case. Configured Mongo errors propagate, hosted mode requires Mongo, and Mongo deletion no longer writes a second store. An isolated production server with an unavailable Mongo URI returned 503 and left the SQLite directory empty. Recovery and reconciliation of historical divergent records require deployment-owner review. |
| A03 | Tested. Both public page and metadata queries require active/published records. The fixture published, hid and re-requested a project and article and verified the private title was absent. A streamed Next response can carry the framework's not-found boundary after HTTP headers are sent. |
| A04 | Implemented. Escaped Markdown source, restricted link schemes, escaped JSON-LD and gated tracking identifiers by expected formats. |
| A05 | Implemented locally. A Mongo counter allocates numeric lead IDs atomically after initialization from existing numeric IDs. Gaps are allowed. Before rollout, stop old writers and check for pre-existing duplicate IDs. No production counter initialization or duplicate repair was performed. Eight simultaneous HTTP submissions to disposable MongoDB 8.0.12 returned distinct numeric IDs and all eight records appeared in the admin list. |
| A06 | Implemented. Uploads require an allowed extension/MIME and Sharp decodes and re-encodes accepted inputs as WebP with a pixel cap. Hosted mode returns an error when storage is unavailable. Existing media URLs are unchanged. Cloudinary upload and legacy codec compatibility need staging verification. |
| A07 | Tested. Updated the compatible lockfile to Next 15.5.29 and pinned PostCSS 8.5.33 via npm override. Production build passed and npm audit --omit=dev reported zero known findings. Revisit override on the next framework upgrade. |
| A08 | In Progress. Login, settings and enquiry reject non-object bodies. Settings validate supplied known fields against default shapes. The contact/social and content editors now submit grouped changes in one request. HTTP tests verify settings rereads and published overview, vertical, vision, gallery, contact and visibility changes. Full domain validation of optional fields and concurrent-editor conflicts remain open. |
| A09 | Tested for HTTP export. Mongo uses a batched cursor, SQLite iterates rows, and the route streams escaped CSV with spreadsheet-safe prefixes. Fixture submitted and retrieved a lead and found it in CSV. Large-file memory profiling remains open. |
| A10 | In Progress. SQLite admin publication lists now filter and paginate in SQL. The public blog uses grouped category counts and the homepage requests three summaries. Detail related-content lookups and the media inventory scan remain candidates for profiling. |
| A11, A12 | In Progress. Successful CMS writes invalidate local caches after persistence. Read caching is bounded to 512 entries per worker. Mongo initialization shares pending index setup within the process. Enquiry forwarding awaits a bounded notification attempt and reports non-success statuses. Local cache consistency across workers, centralized traffic limits, and guaranteed webhook retries remain open. |
| A13 | In Progress. Gallery dialog takes and restores focus and cycles Tab through its controls. Isolated Chromium checked document overflow and page errors on home, about, projects, gallery, blog, contact and authenticated dashboard at 375, 768, 1024 and 1440 pixels. Mobile navigation focus and Escape restoration passed. Manual hero advancement and gallery focus restoration passed, including keeping the hero on its selected slide while navigating gallery photos. Desktop and mobile homepage screenshots were reviewed. These checks do not measure contrast, clipped descendants, screen-reader output or every admin tab. |
| A14 | In Progress. Sitemap includes public routes and visible project/article records. Relative page canonicals inherit the configured metadata base and admin routes declare noindex. Fixture checks confirmed the CMS host appears in blog metadata and the sitemap. |
| A15, A17 | In Progress. Added production HTTP regression fixtures using Node's test runner, disposable SQLite and random credentials. GitHub Actions installs the lockfile and runs lint, typecheck, build and HTTP tests with disposable SQLite and Mongo. Local build, lint and strict typecheck passed. Per-domain data access extraction, production recovery rehearsal and Mongo load measurements are outstanding. |
| A16 | Implemented. Admin disables unsupported deletion and local assets in use. The API checks references and rejects unsupported asset ownership. Deletion remains subject to a race with a concurrent reference assignment. |
| A18 | Deferred. Existing tracked assets have been preserved. |

First-load estimates after changes: home 130 kB, admin 138 kB, shared 103 kB. The homepage estimate increased by 1 kB. The database work reduces rows materialized in memory for SQLite lists and export; no claim about production response time or operating cost is made.

## Public design and release inventory

The homepage now places the CMS headline and calls to action over the original full-width photograph and dark overlay. Navigation remains operable while changing slides manually. The first default image is a 175 kB local WebP rendition of the existing seeded photo. Custom slide URLs continue to come from the CMS. Only the selected hero image is mounted. Shared public component and page colors reference the palette in app/styles/theme.css. The hero uses the shared banner styles, system fonts and the existing Next image component.

The folder layout retains the public and admin routes in app/, shared React components in components/ and database logic in lib/. The additions include CI under .github/workflows/, HTTP fixtures in tests/, and a local rendition in public/images/. No route migration is required.

### Working-tree file inventory

~~~text
.github/workflows/checks.yml
ENGINEERING-AUDIT.md
README.md
app/admin/layout.tsx
public/images/industrial-hero.webp
tests/workflows.test.mjs
.env.example
app/about/page.tsx
app/admin/AdminDashboardClient.tsx
app/api/admin/leads/route.ts
app/api/admin/login/route.ts
app/api/admin/media/route.ts
app/api/admin/settings/route.ts
app/api/admin/upload/route.ts
app/api/enquiry/route.ts
app/blog/[slug]/page.tsx
app/blog/page.tsx
app/contact/page.tsx
app/error.tsx
app/gallery/page.tsx
app/layout.tsx
app/loading.tsx
app/page.tsx
app/projects/[slug]/page.tsx
app/projects/page.tsx
app/sitemap.ts
app/styles/public-components.css
app/styles/public-pages.css
app/styles/theme.css
components/BlogPreviewSection.tsx
components/BrochureModal.tsx
components/HeroSlider.tsx
components/MasterPlanViewer.tsx
components/ProjectGallery.tsx
components/SiteHeader.tsx
components/admin/ContactSocialForm.tsx
components/admin/ContentManager.tsx
components/admin/MediaLibrary.tsx
lib/auth.ts
lib/cache.ts
lib/db.ts
lib/markdown.ts
lib/mongodb.ts
package-lock.json
package.json
~~~
