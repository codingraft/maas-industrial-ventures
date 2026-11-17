import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FloatingContact } from "@/components/FloatingContact";
import { Arrow } from "@/components/ui/Arrow";
import { ShareArticleButtons } from "@/components/ShareArticleButtons";
import { getAllSettings, getBlogPostBySlug, getBlogPosts, getProjects } from "@/lib/db";
import { formatMarkdown } from "@/lib/markdown";

export const dynamic = "force-dynamic";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [settings, post] = await Promise.all([
    getAllSettings(),
    getBlogPostBySlug(slug),
  ]);

  const brand = settings.site_info.brandName || "MAAS Industrial Ventures";

  if (!post) {
    return {
      title: `Article Not Found | ${brand}`,
    };
  }

  const title = post.metaTitle || `${post.title} | ${brand}`;
  const description = post.metaDescription || post.excerpt;

  return {
    title,
    description,
    keywords: post.keywords?.length ? post.keywords : [post.category, brand, "industrial plots"],
    alternates: {
      canonical: `https://maasventures.com/blog/${post.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author || brand],
      images: post.coverImage
        ? [
            {
              url: post.coverImage,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ]
        : [],
    },
  };
}

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

function getInitials(name?: string): string {
  if (!name) return "MV";
  const clean = name.trim().split(/\s+/).filter(Boolean);
  if (clean.length === 0) return "MV";
  if (clean.length === 1) return clean[0].slice(0, 2).toUpperCase();
  return (clean[0][0] + clean[1][0]).toUpperCase();
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;

  const [settings, post, allPosts, projects] = await Promise.all([
    getAllSettings(),
    getBlogPostBySlug(slug),
    getBlogPosts(true),
    getProjects(true),
  ]);

  if (!post) {
    notFound();
  }

  const { site_info, sections, media, social_links } = settings;

  // Filter other articles
  const relatedPosts = allPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  const formattedHtml = formatMarkdown(post.content);
  const formattedDate = formatDisplayDate(post.publishedAt);
  const authorName = post.author || site_info.brandName || "Advisory Desk";
  const authorInitials = getInitials(authorName);

  // Schema.org Article Structured Data (100% dynamic)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    datePublished: post.publishedAt,
    author: {
      "@type": "Organization",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: site_info.brandName,
      logo: {
        "@type": "ImageObject",
        url: media.logo || "https://maasventures.com/images/maas-logo-white.svg",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://maasventures.com/blog/${post.slug}`,
    },
  };

  return (
    <>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <SiteHeader
        brandName={site_info.brandName}
        logoSrc={media.logo}
        phone={site_info.phone}
        sections={sections}
      />

      <main className="blog-reader-page" id="top">
        {/* Breadcrumb Navigation */}
        <nav className="page-wrap blog-breadcrumbs" aria-label="Breadcrumbs">
          <Link href="/">Home</Link>
          <span className="crumb-sep">/</span>
          <Link href="/blog">Research &amp; Insights</Link>
          <span className="crumb-sep">/</span>
          <span className="crumb-current">{post.category}</span>
        </nav>

        {/* Article Header & Editorial Headline */}
        <header className="page-wrap blog-article-header">
          {post.category && (
            <div className="article-eyebrow">
              <span className="article-cat-badge">{post.category}</span>
            </div>
          )}

          <h1 className="blog-article-headline">{post.title}</h1>

          {post.excerpt && <p className="blog-article-lead">{post.excerpt}</p>}

          {/* Unified Editorial Byline & Share Bar */}
          <div className="blog-byline-bar">
            <div className="blog-author-meta">
              <div className="author-avatar-mini">{authorInitials}</div>
              <div className="author-text-meta">
                <span className="author-name">By {authorName}</span>
                <div className="author-sub-meta">
                  {formattedDate && <span>{formattedDate}</span>}
                  {formattedDate && post.readTime && <span className="meta-dot">•</span>}
                  {post.readTime && <span>{post.readTime}</span>}
                </div>
              </div>
            </div>

            <ShareArticleButtons title={post.title} />
          </div>
        </header>

        {/* Hero Cover Image with Luxury Architectural Frame */}
        {post.coverImage && (
          <div className="page-wrap blog-cover-wrap">
            <div className="blog-cover-frame">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                sizes="(max-width: 900px) 100vw, 85vw"
                priority
                className="blog-cover-img"
              />
            </div>
            <div className="blog-cover-caption">
              <span>
                {post.title} • {post.category} • Published by {authorName}
              </span>
            </div>
          </div>
        )}

        {/* Article Body & Sidebar Container */}
        <div className="page-wrap blog-layout-container">
          {/* Main Article Content */}
          <article className="blog-article-body">
            {/* Executive Intelligence Highlight Box (Dynamic from post) */}
            {post.excerpt && (
              <div className="blog-takeaways-card">
                <div className="btc-header">
                  <span className="btc-badge">EXECUTIVE INTELLIGENCE</span>
                  <span className="btc-dot">•</span>
                  <span className="btc-meta">{post.category}</span>
                </div>
                <h3 className="btc-title">Executive Summary &amp; Key Focus</h3>
                <p className="btc-summary">{post.excerpt}</p>
              </div>
            )}

            {/* Formatted Markdown Content */}
            <div
              className="article-rich-text"
              dangerouslySetInnerHTML={{ __html: formattedHtml }}
            />

            {/* In-Article Project CTA Card (100% Dynamic from live Projects & Site Info) */}
            {projects.length > 0 ? (
              <div className="article-project-cta">
                <div className="apc-head">
                  <span className="apc-badge">FEATURED {site_info.brandName.toUpperCase()} DEVELOPMENTS</span>
                  {projects[0]?.location && (
                    <span className="apc-sub">{projects[0].location.toUpperCase()}</span>
                  )}
                </div>
                <h4>Looking for Verified Industrial Plots or Commercial Land?</h4>
                <p>
                  Explore available plots and infrastructure across our active portfolio, including{" "}
                  {projects.map((proj, idx) => (
                    <span key={proj.id}>
                      <Link href={`/projects/${proj.slug || proj.id}`}>
                        <strong>{proj.title}</strong>
                      </Link>
                      {proj.addressShort ? ` (${proj.addressShort})` : proj.location ? ` (${proj.location})` : ""}
                      {idx < projects.length - 1 ? ", " : ". "}
                    </span>
                  ))}
                  Connect directly with our land advisory desk for site visits, demarcation blueprints, and allotment documentation.
                </p>
                <div className="apc-actions">
                  <Link href="/projects" className="button button-gold">
                    Explore All Active Projects <Arrow diagonal />
                  </Link>
                  <Link href="/contact" className="button button-outline">
                    Contact Advisory Desk <Arrow />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="article-project-cta">
                <div className="apc-head">
                  <span className="apc-badge">{site_info.brandName.toUpperCase()} ADVISORY</span>
                </div>
                <h4>Connect With Our Land &amp; Real Estate Advisory Team</h4>
                <p>
                  Interested in upcoming land opportunities, plotted industrial developments, or customized plot requirements? Speak directly with our team.
                </p>
                <div className="apc-actions">
                  <Link href="/contact" className="button button-gold">
                    Get in Touch <Arrow diagonal />
                  </Link>
                </div>
              </div>
            )}

            {/* Author Dossier Card (100% Dynamic) */}
            <div className="blog-author-card">
              <div className="bac-avatar">{authorInitials}</div>
              <div className="bac-info">
                <strong>{authorName}</strong>
                <p>
                  {post.authorBio ||
                    `Authored by the ${authorName} at ${site_info.brandName}. Published to provide transparent market analysis, regulatory updates, and strategic infrastructure insights for investors and developers.`}
                </p>
              </div>
            </div>

            {/* Footer Navigation */}
            <div className="blog-article-footer">
              <Link href="/blog" className="text-link">
                ← Return to all Research &amp; Market Insights
              </Link>
            </div>
          </article>

          {/* Sticky Editorial Sidebar */}
          <aside className="blog-sidebar">
            {/* Quick Enquiry Box */}
            <div className="sidebar-widget sidebar-enquiry-widget">
              <span className="widget-label">DIRECT INQUIRY DESK</span>
              <h3 className="widget-title">Connect with {site_info.brandName}</h3>
              <p className="widget-desc">
                Receive verified demarcation plans, plot schedules, and statutory clearance guidance for active developments.
              </p>
              {site_info.phone && (
                <div className="widget-phone">
                  <small>PROJECT HELPLINE</small>
                  <strong>{site_info.phone}</strong>
                </div>
              )}
              <Link href="/contact" className="button button-gold" style={{ width: "100%", justifyContent: "center" }}>
                Request Allocation Details <Arrow diagonal />
              </Link>
            </div>

            {/* Active Projects Mini-List (100% Dynamic from database) */}
            {projects.length > 0 && (
              <div className="sidebar-widget">
                <span className="widget-label">FEATURED DEVELOPMENTS</span>
                <h4 className="widget-subtitle">Active Land Addresses</h4>
                <div className="sidebar-projects-list">
                  {projects.map((proj) => (
                    <div key={proj.id} className="sidebar-project-item">
                      <strong>{proj.title}</strong>
                      <span className="spi-loc">{proj.addressShort || proj.location}</span>
                      {proj.plotSizes && <span className="spi-sizes">{proj.plotSizes}</span>}
                      <Link href={`/projects/${proj.slug || proj.id}`} className="spi-link">
                        Explore Specifications →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related Research Reports (100% Dynamic from published blogs) */}
            {relatedPosts.length > 0 && (
              <div className="sidebar-widget">
                <span className="widget-label">RELATED INTELLIGENCE</span>
                <h4 className="widget-subtitle">Further Market Research</h4>
                <div className="sidebar-articles-list">
                  {relatedPosts.map((rp) => (
                    <Link key={rp.id} href={`/blog/${rp.slug || rp.id}`} className="sidebar-article-item">
                      <span className="sai-cat">{rp.category}</span>
                      <strong className="sai-title">{rp.title}</strong>
                      <div className="sai-meta">
                        <span>{formatDisplayDate(rp.publishedAt)}</span>
                        {rp.readTime && (
                          <>
                            <span>•</span>
                            <span>{rp.readTime}</span>
                          </>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
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