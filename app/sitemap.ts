import type { MetadataRoute } from "next";
import { getAllSettings, getProjects, getBlogPosts } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [settings, projects, posts] = await Promise.all([
    getAllSettings(), getProjects(true), getBlogPosts(true),
  ]);
  const base = settings.seo.canonicalUrl || "https://maasventures.com";
  const paths = ["/", "/about", "/projects", "/gallery", "/blog", "/contact",
    ...projects.filter(p => p.isActive).map(p => "/projects/" + encodeURIComponent(p.slug)),
    ...posts.filter(p => p.isPublished).map(p => "/blog/" + encodeURIComponent(p.slug)),
  ];
  return paths.map(path => ({ url: new URL(path, base).href }));
}
