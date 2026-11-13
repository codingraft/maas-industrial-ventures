import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getDb, Lead } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim().toLowerCase() || "";
  const status = searchParams.get("status")?.trim().toLowerCase() || "";
  const isExport = searchParams.get("export") === "csv";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "10", 10)));

  const db = getDb();
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (status && status !== "all") {
    conditions.push("status = ?");
    params.push(status);
  }

  if (search) {
    conditions.push("(LOWER(name) LIKE ? OR LOWER(phone) LIKE ? OR LOWER(email) LIKE ? OR LOWER(industry) LIKE ? OR LOWER(requirement) LIKE ?)");
    const wild = `%${search}%`;
    params.push(wild, wild, wild, wild, wild);
  }

  const whereClause = conditions.length > 0 ? " WHERE " + conditions.join(" AND ") : "";

  // If CSV export is requested, return all filtered records without pagination limit
  if (isExport) {
    const query = `SELECT * FROM leads${whereClause} ORDER BY id DESC`;
    const stmt = db.prepare(query);
    const leads = stmt.all(...params) as Lead[];

    const csvRows: string[] = [
      [
        "ID",
        "Date",
        "Name",
        "Phone",
        "Email",
        "Industry",
        "Requirement",
        "Message",
        "Status",
        "Notes",
        "UTM Source",
        "UTM Medium",
        "UTM Campaign",
        "UTM Term",
        "UTM Content",
        "Google Click ID (GCLID)",
        "Meta Click ID (FBCLID)",
      ]
        .map((h) => `"${h}"`)
        .join(","),
    ];

    for (const lead of leads) {
      csvRows.push(
        [
          lead.id,
          lead.created_at,
          lead.name,
          lead.phone,
          lead.email,
          lead.industry,
          lead.requirement,
          lead.message ? lead.message.replace(/"/g, '""') : "",
          lead.status,
          lead.notes ? lead.notes.replace(/"/g, '""') : "",
          lead.utm_source,
          lead.utm_medium,
          lead.utm_campaign,
          lead.utm_term,
          lead.utm_content,
          lead.gclid,
          lead.fbclid,
        ]
          .map((v) => `"${String(v ?? "").replace(/\n/g, " ")}"`)
          .join(",")
      );
    }

    const csvContent = csvRows.join("\n");
    const filename = `maas-leads-${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  // Count total matches for pagination
  const countQuery = `SELECT COUNT(*) as total FROM leads${whereClause}`;
  const countStmt = db.prepare(countQuery);
  const total = (countStmt.get(...params) as { total: number }).total;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  // Query paginated slice
  const offset = (page - 1) * limit;
  const dataQuery = `SELECT * FROM leads${whereClause} ORDER BY id DESC LIMIT ? OFFSET ?`;
  const dataStmt = db.prepare(dataQuery);
  const leads = dataStmt.all(...params, limit, offset) as Lead[];

  return NextResponse.json({
    leads,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  });
}

export async function PATCH(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let body: { id?: number; status?: string; notes?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  if (!body.id) {
    return NextResponse.json({ message: "Missing lead id" }, { status: 400 });
  }

  const db = getDb();
  const validStatuses = ["new", "contacted", "qualified", "converted", "archived"];

  if (body.status && validStatuses.includes(body.status)) {
    const stmt = db.prepare("UPDATE leads SET status = ? WHERE id = ?");
    stmt.run(body.status, body.id);
  }

  if (typeof body.notes === "string") {
    const stmt = db.prepare("UPDATE leads SET notes = ? WHERE id = ?");
    stmt.run(body.notes, body.id);
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const idStr = searchParams.get("id");
  const id = idStr ? parseInt(idStr, 10) : null;

  if (!id) {
    return NextResponse.json({ message: "Missing lead id" }, { status: 400 });
  }

  const db = getDb();
  const stmt = db.prepare("DELETE FROM leads WHERE id = ?");
  stmt.run(id);

  return NextResponse.json({ ok: true });
}
