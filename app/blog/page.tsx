import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FloatingContact } from "@/components/FloatingContact";
import { Arrow } from "@/components/ui/Arrow";
import { getAllSettings, getBlogPosts } from "@/lib/db";

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
    canonical: "https://maasventures.com/blog",
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

export default async function BlogIndexPage() {
  const [settings, posts] = await Promise.all([
    getAllSettings(),
    getBlogPosts(true), // published only
  ]);

  const { site_info, sections, media, social_links } = settings;

  const categories = Array.from(new Set(posts.map((p) => p.category))).filter(Boolean);

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

          {/* Category Chips */}
          {categories.length > 0 && (
            <div className="blog-categories-bar" aria-label="Article categories">
              <span className="cat-chip is-active">All Insights ({posts.length})</span>
              {categories.map((cat) => (
                <span key={cat} className="cat-chip">
                  {cat}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Blog Posts Grid */}
        <section className="blog-catalog-content page-wrap">
          {posts.length === 0 ? (
            <div className="blog-empty-state">
              <h3>No articles published yet.</h3>
              <p>Check back shortly for upcoming industrial market reports.</p>
              <Link href="/" className="button button-gold">
                Return to Homepage
              </Link>
            </div>
          ) : (
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
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
