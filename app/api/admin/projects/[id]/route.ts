import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { deleteProject, getProjectBySlug } from "@/lib/db";

export const dynamic = "force-dynamic";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteProps) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const project = await getProjectBySlug(id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    return NextResponse.json({ project });
  } catch (error) {
    console.error("Failed to load project:", error);
    return NextResponse.json({ error: "Failed to load project" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteProps) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await deleteProject(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete project:", error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
