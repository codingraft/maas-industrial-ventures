import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getPaginatedBlogPosts, saveBlogPost } from "@/lib/db";
import { BlogPost } from "@/lib/types";

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
    const category = searchParams.get("category")?.trim() || "";

    const result = await getPaginatedBlogPosts({
      publishedOnly: false,
      page,
      limit,
      search,
      category,
      includeContent: false,
    });

    return NextResponse.json({
      blogs: result.items,
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
