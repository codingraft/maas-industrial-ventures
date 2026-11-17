import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { deleteBlogPost } from "@/lib/db";

export const dynamic = "force-dynamic";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function DELETE(_request: Request, { params }: RouteProps) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await deleteBlogPost(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete blog post:", error);
    return NextResponse.json({ error: "Failed to delete blog post" }, { status: 500 });
  }
}
