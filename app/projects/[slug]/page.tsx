import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FloatingContact } from "@/components/FloatingContact";
import { EnquiryForm } from "@/components/EnquiryForm";
import { Arrow } from "@/components/ui/Arrow";
import { getAllSettings, getProjects, getProjectBySlug } from "@/lib/db";

export const dynamic = "force-dynamic";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return {
      title: "Project Not Found | MAAS Industrial Ventures",
    };
  }

  return {
    title: `${project.title} | MAAS Industrial Ventures`,
    description: project.shortDescription || project.fullDescription.slice(0, 160),
    keywords: [
      project.title,
      project.location,
      "industrial plots",
      "MAAS Industrial Ventures",
      project.plotSizes,
    ],
    openGraph: {
      title: `${project.title} | MAAS Industrial Ventures`,
      description: project.shortDescription,
      images: project.coverImage ? [{ url: project.coverImage }] : undefined,
    },
    alternates: {
      canonical: `https://maasventures.com/projects/${project.slug}`,
    },
  };
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const [settings, project, allProjects] = await Promise.all([
    getAllSettings(),
    getProjectBySlug(slug),
    getProjects(true),
  ]);

  if (!project) {
    notFound();
  }

  const { site_info, sections, media, social_links } = settings;
  const otherProjects = allProjects.filter((p) => p.id !== project.id && p.slug !== project.slug);

  return (
    <>
      <SiteHeader
        brandName={site_info.brandName}
        logoSrc={media.logo}
        phone={site_info.phone}
        sections={sections}
      />

      <main className="project-detail-page" id="top">
        {/* Breadcrumb Navigation */}
        <div className="project-breadcrumb-bar page-wrap">
          <nav aria-label="Breadcrumb" className="project-breadcrumbs">
            <Link href="/">Home</Link>
            <span className="crumb-sep">/</span>
            <Link href="/projects">Projects</Link>
            <span className="crumb-sep">/</span>
            <span className="crumb-current">{project.title}</span>
          </nav>
        </div>

        {/* Project Hero Header */}
        <section className="project-detail-hero page-wrap">
          <div className="project-hero-head">
            <div className="hero-head-copy">
              <div className="project-meta-badges">
                <span className="proj-status-badge">
                  <span className="status-live-dot" /> {project.status || "Active Plots Available"}
                </span>
                <span className="proj-location-badge">📍 {project.location}</span>
              </div>
              <h1 className="project-detail-title">{project.title}</h1>
              <p className="project-detail-tagline">{project.tagline}</p>
            </div>

            <div className="hero-head-actions">
              <button
                type="button"
                className="button button-gold"
                data-enquiry-trigger
                data-enquiry-project={project.title}
                data-enquiry-title={`Site Visit for ${project.title}`}
              >
                Schedule Site Visit <Arrow diagonal />
              </button>
              <a href="#project-enquiry" className="button button-outline-dark">
                Reserve Plot Requirements <Arrow />
              </a>
            </div>
          </div>

          {/* Large Hero Imagery */}
          <div className="project-detail-cover image-frame">
            <Image
              src={
                project.coverImage ||
                "https://images.unsplash.com/photo-1567789884554-0b844b597180?auto=format&fit=crop&w=1800&q=85"
              }
              alt={project.title}
              fill
              priority
              sizes="100vw"
              quality={85}
              className="project-cover-img"
            />
            <span className="image-caption">{project.title} · {project.location}</span>
            <span className="image-stamp">
              DEVELOPMENT<br />READY
            </span>
          </div>

          {/* Quick Specifications Strip */}
          <div className="project-specs-grid">
            <div className="spec-card">
              <span className="spec-icon" aria-hidden="true">📐</span>
              <div>
                <span className="spec-title">Plot Sizes Available</span>
                <strong className="spec-value">{project.plotSizes}</strong>
              </div>
            </div>
            <div className="spec-card">
              <span className="spec-icon" aria-hidden="true">🛣️</span>
              <div>
                <span className="spec-title">Internal Freight Roads</span>
                <strong className="spec-value">{project.roadWidth}</strong>
              </div>
            </div>
            <div className="spec-card">
              <span className="spec-icon" aria-hidden="true">⚡</span>
              <div>
                <span className="spec-title">Power Infrastructure</span>
                <strong className="spec-value">HT/LT Dedicated Feeders</strong>
              </div>
            </div>
            <div className="spec-card">
              <span className="spec-icon" aria-hidden="true">🛡️</span>
              <div>
                <span className="spec-title">Possession &amp; Security</span>
                <strong className="spec-value">24/7 Gated Perimeter</strong>
              </div>
            </div>
          </div>
        </section>

        {/* Narrative & Strategic Infrastructure Breakdown */}
        <section className="project-content-section page-wrap">
          <div className="project-content-grid">
            {/* Left Content Column */}
            <div className="project-main-column">
              <div className="content-block">
                <span className="section-label">01 / Overview</span>
                <h2 className="block-title">Project Overview &amp; Infrastructure</h2>
                <div className="block-body">
                  <p className="lead-paragraph">{project.shortDescription}</p>
                  <p>{project.fullDescription}</p>
                </div>
              </div>

              {/* Infrastructure Features Checklist */}
              {project.features && project.features.length > 0 && (
                <div className="content-block">
                  <span className="section-label">02 / Features</span>
                  <h3 className="block-title">Delivered Infrastructure Features</h3>
                  <div className="features-checklist-grid">
                    {project.features.map((feat, fIdx) => (
                      <div key={fIdx} className="feature-check-item">
                        <span className="check-icon" aria-hidden="true">✓</span>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strategic Road Connectivity */}
              {project.connectivity && project.connectivity.length > 0 && (
                <div className="content-block">
                  <span className="section-label">03 / Connectivity</span>
                  <h3 className="block-title">Strategic Freight &amp; Highway Connectivity</h3>
                  <div className="connectivity-list">
                    {project.connectivity.map((conn, cIdx) => (
                      <div key={cIdx} className="connectivity-item">
                        <span className="conn-num">0{cIdx + 1}</span>
                        <div className="conn-text">
                          <strong>{conn}</strong>
                          <small>Direct access for multi-axle freight and enterprise transport.</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Government Policy & MSME Subsidy Feature */}
              {project.subsidiesInfo && (
                <div className="content-block subsidy-feature-block">
                  <div className="subsidy-badge">
                    <span className="subsidy-icon-large">🏛️</span>
                    <div>
                      <span className="subsidy-tag">Statutory &amp; Financial Incentives</span>
                      <h3 className="subsidy-heading">Government Policy &amp; MSME Subsidies</h3>
                    </div>
                  </div>
                  <p className="subsidy-body-text">{project.subsidiesInfo}</p>
                  <div className="subsidy-highlights-row">
                    <div className="subsidy-sub-item">
                      <strong>Stamp Duty Concessions</strong>
                      <span>Eligible units may access up to 100% stamp duty exemption under UP MSME Policy 2022.</span>
                    </div>
                    <div className="subsidy-sub-item">
                      <strong>Capital Subsidies</strong>
                      <span>Eligible fixed capital investment subsidies for qualifying manufacturing setups.</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Project Photo Gallery */}
              {project.galleryImages && project.galleryImages.length > 0 && (
                <div className="content-block">
                  <span className="section-label">04 / Visual Records</span>
                  <h3 className="block-title">Development &amp; Site Progress</h3>
                  <div className="project-detail-gallery-grid">
                    {project.galleryImages.map((imgSrc, gIdx) => (
                      <div key={gIdx} className="project-detail-gallery-item image-frame">
                        <Image
                          src={imgSrc}
                          alt={`${project.title} Site Photo ${gIdx + 1}`}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="gallery-thumb"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Sticky Enquiry Sidebar */}
            <aside className="project-sidebar-column" id="project-enquiry">
              <div className="project-enquiry-card">
                <div className="card-head">
                  <span className="eyebrow">Direct Project Allocation</span>
                  <h3>Register Interest in {project.title}</h3>
                  <p>Inbound priority enquiry desk for land buyers, industrial investors, and manufacturers.</p>
                </div>

                <div className="card-form-wrap">
                  <EnquiryForm defaultProject={project.title} />
                </div>

                <div className="card-advisory-support">
                  <p className="support-lead">Need instant advisory or layout maps?</p>
                  <a href={`tel:${site_info.phone}`} className="support-call-link">
                    📞 Call Sales: <strong>{site_info.phone}</strong>
                  </a>
                  <a
                    href={`https://wa.me/${site_info.whatsapp.replace(/\D/g, "")}?text=Hi,%20I%20am%20interested%20in%20${encodeURIComponent(project.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="support-wa-link"
                  >
                    💬 Chat on WhatsApp
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* Cross-linking to Other Projects */}
        {otherProjects.length > 0 && (
          <section className="other-projects-section page-wrap">
            <div className="section-label">Explore More Developments</div>
            <h2 className="other-projects-heading">Other Active MAAS Developments</h2>
            <div className="other-projects-grid">
              {otherProjects.map((op) => (
                <div key={op.id} className="other-proj-card">
                  <div className="other-proj-media image-frame">
                    <Image
                      src={op.coverImage || "https://images.unsplash.com/photo-1567789884554-0b844b597180?auto=format&fit=crop&w=800&q=80"}
                      alt={op.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <span className="other-proj-badge">{op.addressShort || op.location.split(",")[0]}</span>
                  </div>
                  <div className="other-proj-body">
                    <h3>{op.title}</h3>
                    <p>{op.plotSizes} · {op.roadWidth}</p>
                    <Link href={`/projects/${op.slug}`} className="text-link">
                      View Project <Arrow diagonal />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

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
