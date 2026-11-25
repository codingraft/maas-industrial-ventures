import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getLeads, exportLeads, updateLead, deleteLead } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim().toLowerCase() || "";
  const status = searchParams.get("status")?.trim().toLowerCase() || "";
  const project = searchParams.get("project")?.trim() || "";
  const isExport = searchParams.get("export") === "csv";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "10", 10)));



  // If CSV export is requested, return all filtered records
  if (isExport) {
    async function* csv() {
      yield [
        "ID",
        "Date",
        "Name",
        "Phone",
        "Email",
        "Project",
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
        .join(",") + "\r\n";

    for await (const lead of exportLeads(search, status, project)) {
        yield [
          lead.id,
          lead.created_at,
          lead.name,
          lead.phone,
          lead.email,
          lead.project || "",
          lead.industry,
          lead.requirement,
          lead.message,
          lead.status,
          lead.notes,
          lead.utm_source,
          lead.utm_medium,
          lead.utm_campaign,
          lead.utm_term,
          lead.utm_content,
          lead.gclid,
          lead.fbclid,
        ]
          .map((v) => {
            const value = String(v ?? "").replace(/"/g, '""');
            const prefix = /^\s*[=+@-]|^[\t\r\n]/.test(value) ? "'" : "";
            return `"${prefix}${value}"`;
          })
          .join(",") + "\r\n";
    }

    }
    const rows = csv();
    const encoder = new TextEncoder();
    const csvContent = new ReadableStream<Uint8Array>({
      async pull(controller) {
        const row = await rows.next();
        if (row.done) controller.close();
        else controller.enqueue(encoder.encode(row.value));
      },
      async cancel() { await rows.return(undefined); },
    });
    const filename = `maas-leads-${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  const result = await getLeads({ search, status, project, page, limit });
  return NextResponse.json({
    leads: result.leads,
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    },
  });
}

export async function PATCH(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let body: { id?: number | string; status?: string; notes?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  if (!body.id) {
    return NextResponse.json({ message: "Missing lead id" }, { status: 400 });
  }

  const validStatuses = ["new", "contacted", "qualified", "converted", "archived"];
  const updates: { status?: string; notes?: string } = {};

  if (body.status && validStatuses.includes(body.status)) {
    updates.status = body.status;
  }
  if (typeof body.notes === "string") {
    updates.notes = body.notes;
  }

  if (Object.keys(updates).length > 0) {
    await updateLead(body.id, updates);
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const idStr = searchParams.get("id");

  if (!idStr) {
    return NextResponse.json({ message: "Missing lead id" }, { status: 400 });
  }

  await deleteLead(idStr);

  return NextResponse.json({ ok: true });
}
