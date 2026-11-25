import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FloatingContact } from "@/components/FloatingContact";
import { Arrow } from "@/components/ui/Arrow";
import { BlogPaginationControls } from "@/components/blog/BlogPaginationControls";
import { getAllSettings, getPublishedCategoryCounts, getPaginatedBlogPosts } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Industrial Land Insights & Real Estate News | MAAS Industrial Ventures",
  description:
    "Authoritative analysis on Uttar Pradesh MSME industrial policies, Delhi-Meerut Expressway logistics hubs, plot demarcation, and manufacturing infrastructure.",
  keywords: [
    "industrial land insights",
    "UP MSME policy 2022 subsidies",
    "Delhi Meerut Expressway industrial plots",
    "MAAS Industrial Ventures blog",
  ],
  alternates: {
    canonical: "/blog",
  },
};

function formatDisplayDate(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
}

interface BlogIndexPageProps {
  searchParams: Promise<{
    category?: string;
    page?: string;
    search?: string;
  }>;
}

export default async function BlogIndexPage({ searchParams }: BlogIndexPageProps) {
  const resolvedParams = await searchParams;
  const currentCategory = resolvedParams.category || "all";
  const currentPage = Math.max(1, parseInt(resolvedParams.page || "1", 10));
  const currentSearch = resolvedParams.search?.trim() || "";
  const pageSize = 6;

  const [settings, categoryCounts, paginatedResult] = await Promise.all([
    getAllSettings(),
    getPublishedCategoryCounts(), // To obtain complete category list & total count
    getPaginatedBlogPosts({
      publishedOnly: true,
      page: currentPage,
      limit: pageSize,
      search: currentSearch,
      category: currentCategory === "all" ? undefined : currentCategory,
      includeContent: false, // Heavy markdown excluded from card list
    }),
  ]);

  const { site_info, sections, media, social_links } = settings;
  const posts = paginatedResult.items;

  const publishedCount = categoryCounts.reduce((total, group) => total + group.count, 0);

  return (
    <>
      <SiteHeader
        brandName={site_info.brandName}
        logoSrc={media.logo}
        phone={site_info.phone}
        sections={sections}
      />

      <main className="blog-catalog-page" id="top">
        {/* Blog Catalog Hero */}
        <section className="blog-catalog-hero page-wrap">
          <div className="section-label">
            <span>01</span> / Research &amp; Insights
          </div>
          <p className="eyebrow">{site_info.blogEyebrow}</p>
          <h1 className="blog-catalog-title">{site_info.blogHeadline}</h1>
          <p className="blog-catalog-lead">{site_info.blogDescription}</p>

          {/* Category Chips with Interactive Links */}
          {categoryCounts.length > 0 && (
            <div className="blog-categories-bar" aria-label="Article categories">
              <Link
                href="/blog"
                className={`cat-chip ${currentCategory === "all" ? "is-active" : ""}`}
              >
                All Insights ({publishedCount})
              </Link>
              {categoryCounts.filter(group => group.category).map(({ category: cat, count }) => {
                return (
                  <Link
                    key={cat}
                    href={`/blog?category=${encodeURIComponent(cat)}`}
                    className={`cat-chip ${currentCategory === cat ? "is-active" : ""}`}
                  >
                    {cat} ({count})
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Blog Posts Grid */}
        <section className="blog-catalog-content page-wrap" id="catalog">
          {posts.length === 0 ? (
            <div className="blog-empty-state">
              <h3>No articles found.</h3>
              <p>
                {currentCategory !== "all"
                  ? `No published articles found in category "${currentCategory}".`
                  : "Check back shortly for upcoming industrial market reports."}
              </p>
              <Link href="/blog" className="button button-gold">
                View All Insights
              </Link>
            </div>
          ) : (
            <>
              <div className="blog-grid blog-grid-catalog">
                {posts.map((post) => (
                  <article key={post.id} className="blog-card">
                    <Link href={`/blog/${post.slug}`} className="blog-card-media">
                      <Image
                        src={
                          post.coverImage ||
                          "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80"
                        }
                        alt={post.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="blog-card-img"
                      />
                      <span className="blog-category-tag">{post.category}</span>
                    </Link>

                    <div className="blog-card-body">
                      <div className="blog-meta-row">
                        <span className="blog-date">{formatDisplayDate(post.publishedAt) || post.publishedAt}</span>
                        <span className="blog-dot">•</span>
                        <span className="blog-read-time">{post.readTime}</span>
                      </div>

                      <h2 className="blog-card-title">
                        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                      </h2>

                      <p className="blog-card-excerpt">{post.excerpt}</p>

                      <div className="blog-card-foot">
                        <Link href={`/blog/${post.slug}`} className="text-link">
                          Read Full Article <Arrow diagonal />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Dynamic URL-Synced Pagination */}
              {paginatedResult.totalPages > 1 && (
                <BlogPaginationControls
                  currentPage={paginatedResult.page}
                  totalPages={paginatedResult.totalPages}
                  totalItems={paginatedResult.total}
                  pageSize={paginatedResult.limit}
                />
              )}
            </>
          )}
        </section>
      </main>

      {/* FOOTER */}
      <SiteFooter
        brandName={site_info.brandName}
        logoSrc={media.logo}
        address={site_info.address}
        phone={site_info.phone}
        email={site_info.email}
        socialLinks={social_links}
      />

      <FloatingContact
        phone={site_info.phone}
        whatsapp={site_info.whatsapp}
        brochureUrl={site_info.brochureUrl}
      />
    </>
  );
}
