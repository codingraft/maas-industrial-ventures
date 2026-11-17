import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getProjects, saveProject } from "@/lib/db";
import { ProjectItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const projects = await getProjects(false);
    return NextResponse.json({ projects });
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
