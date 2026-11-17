import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getPaginatedProjects, saveProject } from "@/lib/db";
import { ProjectItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "10", 10)));
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";

    const result = await getPaginatedProjects({
      activeOnly: false,
      page,
      limit,
      search,
      status,
    });

    return NextResponse.json({
      projects: result.items,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      },
    });
  } catch (error) {
    console.error("Failed to load projects:", error);
    return NextResponse.json({ error: "Failed to load projects" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as ProjectItem;
    if (!body.title || !body.location) {
      return NextResponse.json({ error: "Title and location are required." }, { status: 400 });
    }

    const saved = await saveProject(body);
    return NextResponse.json({ project: saved });
  } catch (error) {
    console.error("Failed to save project:", error);
    return NextResponse.json({ error: "Failed to save project" }, { status: 500 });
  }
}
