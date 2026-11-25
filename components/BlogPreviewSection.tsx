import Image from "next/image";
import Link from "next/link";
import { Arrow } from "@/components/ui/Arrow";
import { BlogPost } from "@/lib/types";

interface BlogPreviewSectionProps {
  posts?: BlogPost[];
  eyebrow?: string;
  headline?: string;
  description?: string;
}

export function BlogPreviewSection({
  posts,
  eyebrow = "Market Intelligence & Property Updates",
  headline = "Industrial Land Insights & Real Estate Updates.",
  description = "Stay informed with our latest news, Uttar Pradesh MSME policy analysis, and corridor infrastructure updates designed to guide manufacturers and investors.",
}: BlogPreviewSectionProps) {
  const displayPosts = (posts ?? []).slice(0, 3);

  return (
    <section className="blog-section section-pad" id="blog">
      <div className="page-wrap">
        <div className="section-label">
        <span>05</span> / Insights &amp; Market News
      </div>

      <div className="blog-head">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="section-title">{headline}</h2>
        </div>
        <div className="blog-head-right">
          <p className="blog-head-copy">{description}</p>
          <Link href="/blog" className="button button-gold">
            Browse All Articles <Arrow diagonal />
          </Link>
        </div>
      </div>

      <div className="blog-grid">
        {displayPosts.map((post) => (
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
                <span className="blog-date">{post.publishedAt}</span>
                <span className="blog-dot">•</span>
                <span className="blog-read-time">{post.readTime}</span>
              </div>

              <h3 className="blog-card-title">
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h3>

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
      </div>
    </section>
  );
}
