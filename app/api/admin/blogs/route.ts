import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getBlogPosts, saveBlogPost } from "@/lib/db";
import { BlogPost } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const blogs = await getBlogPosts(false);
    return NextResponse.json({ blogs });
  } catch (error) {
    console.error("Failed to load blogs:", error);
    return NextResponse.json({ error: "Failed to load blogs" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as BlogPost;
    if (!body.title || !body.excerpt) {
      return NextResponse.json({ error: "Title and excerpt are required." }, { status: 400 });
    }

    const saved = await saveBlogPost(body);
    return NextResponse.json({ blog: saved });
  } catch (error) {
    console.error("Failed to save blog post:", error);
    return NextResponse.json({ error: "Failed to save blog post" }, { status: 500 });
  }
}
