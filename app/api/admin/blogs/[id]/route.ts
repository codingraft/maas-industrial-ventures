import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { deleteBlogPost, getBlogPostBySlug } from "@/lib/db";

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
    const post = await getBlogPostBySlug(id);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    return NextResponse.json({ blog: post });
  } catch (error) {
    console.error("Failed to load blog post:", error);
    return NextResponse.json({ error: "Failed to load blog post" }, { status: 500 });
  }
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
