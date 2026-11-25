import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FloatingContact } from "@/components/FloatingContact";
import { EnquiryForm } from "@/components/EnquiryForm";
import { ProjectQuickBooking } from "@/components/ProjectQuickBooking";
import { Arrow } from "@/components/ui/Arrow";
import { getAllSettings, getProjects, getProjectBySlug } from "@/lib/db";

export const dynamic = "force-dynamic";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug, true);

  if (!project?.isActive) {
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
      project.roadWidth,
    ],
    openGraph: {
      title: `${project.title} | Industrial Development Hub | MAAS Industrial Ventures`,
      description: project.shortDescription,
      images: project.coverImage ? [{ url: project.coverImage }] : undefined,
    },
    alternates: {
      canonical: `/projects/${project.slug}`,
    },
  };
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const [settings, project, allProjects] = await Promise.all([
    getAllSettings(),
    getProjectBySlug(slug, true),
    getProjects(true),
  ]);

  if (!project?.isActive) {
    notFound();
  }

  const { site_info, sections, media, social_links } = settings;
  const otherProjects = allProjects.filter((p) => p.id !== project.id && p.slug !== project.slug);
  const cleanPhone = site_info.phone.replace(/\D/g, "");
  const cleanWa = site_info.whatsapp.replace(/\D/g, "");

  const hasFeatures = project.features && project.features.length > 0;
  const hasConnectivity = project.connectivity && project.connectivity.length > 0;
  const hasSubsidies = Boolean(project.subsidiesInfo && project.subsidiesInfo.trim().length > 0);
  const hasGallery = project.galleryImages && project.galleryImages.length > 0;

  return (
    <>
      <SiteHeader
        brandName={site_info.brandName}
        logoSrc={media.logo}
        phone={site_info.phone}
        sections={sections}
      />

      <main className="project-detail-page" id="top">
        {/* Compact Integrated Executive Header */}
        <section className="project-header-compact page-wrap">
          {/* Breadcrumb Navigation Bar */}
          <nav aria-label="Breadcrumb" className="project-breadcrumbs">
            <Link href="/" title="Back to Homepage">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "-1px", marginRight: "4px" }}>
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Home
            </Link>
            <span className="crumb-sep">/</span>
            <Link href="/projects">Projects</Link>
            <span className="crumb-sep">/</span>
            <span className="crumb-current">{project.title}</span>
          </nav>

          <div className="project-header-main-row">
            <div className="project-header-identity">
              <div className="project-meta-badges">
                <span className="proj-status-badge">
                  <span className="status-live-dot" /> {project.status || "Active Plots Available"}
                </span>
                <span className="proj-location-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--gold)" }}>
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {project.addressShort || project.location}
                </span>
                {hasSubsidies && (
                  <span className="proj-policy-badge">
                    Policy Subsidies Eligible
                  </span>
                )}
              </div>

              <h1 className="project-detail-title">{project.title}</h1>
              {project.tagline && (
                <p className="project-detail-tagline">{project.tagline}</p>
              )}
            </div>

            <div className="project-header-actions">
              <button
                type="button"
                className="button button-gold"
                data-enquiry-trigger
                data-enquiry-project={project.title}
                data-enquiry-title={`Site Visit for ${project.title}`}
              >
                Schedule Site Visit <Arrow diagonal />
              </button>

              <a
                href={`https://wa.me/${cleanWa}?text=Hi,%20I%20am%20interested%20in%20${encodeURIComponent(project.title)}.%20Please%20share%20the%20master%20layout%20and%20plot%20availability.`}
                target="_blank"
                rel="noopener noreferrer"
                className="button button-wa-outline"
                title="Chat with project desk on WhatsApp"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                </svg>
                WhatsApp Desk
              </a>

              {project.brochureUrl && (
                <a
                  href={project.brochureUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button button-outline-dark"
                  title="Download Masterplan Brochure"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Brochure (PDF)
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Cinematic Visual Showcase & Attached Factsheet */}
        <section className="project-visual-showcase page-wrap">
          <div className="project-cover-container image-frame">
            <Image
              src={
                project.coverImage ||
                "https://images.unsplash.com/photo-1567789884554-0b844b597180?auto=format&fit=crop&w=1800&q=80"
              }
              alt={project.title}
              fill
              priority
              sizes="100vw"
              className="project-cover-img"
              style={{ objectFit: "cover" }}
            />
            <div className="project-cover-gradient" aria-hidden="true" />
            
            <div className="project-cover-meta-bar">
              <span className="project-cover-geo">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {project.location}
              </span>
              <span className="project-cover-status">
                {project.status || "Demarcated Freehold Industrial Plots"}
              </span>
            </div>
          </div>

          {/* Integrated 4-Tile Factsheet Matrix (Zero Disconnected Gap) */}
          <div className="project-factsheet-strip" id="specifications">
            <div className="factsheet-cell">
              <span className="factsheet-lbl">Plot Configurations</span>
              <strong className="factsheet-val">{project.plotSizes}</strong>
              <small className="factsheet-sub">Freehold industrial plots</small>
            </div>

            <div className="factsheet-cell">
              <span className="factsheet-lbl">Internal Road Width</span>
              <strong className="factsheet-val">{project.roadWidth}</strong>
              <small className="factsheet-sub">Heavy-duty freight transit</small>
            </div>

            <div className="factsheet-cell">
              <span className="factsheet-lbl">Corridor Access</span>
              <strong className="factsheet-val">{project.addressShort || project.location.split(",")[0]}</strong>
              <small className="factsheet-sub">Expressway transit corridor</small>
            </div>

            <div className="factsheet-cell">
              <span className="factsheet-lbl">Current Allotment</span>
              <strong className="factsheet-val">{project.status || "Active Plots Available"}</strong>
              <small className="factsheet-sub">Direct developer allocation</small>
            </div>
          </div>
        </section>

        {/* Balanced 2-Column Asset Dossier & Sticky Advisory (No Empty Rail) */}
        <section className="project-body-section page-wrap">
          <div className="project-body-grid">
            {/* Main Asset Column (64%) */}
            <div className="project-dossier-main">
              {/* 01: Master Overview & Vision */}
              <article className="dossier-card" id="overview">
                <div className="dossier-card-head">
                  <span className="dossier-kicker">01 / Master Scope</span>
                  <h2 className="dossier-title">Project Vision &amp; Technical Topography</h2>
                </div>
                
                <div className="dossier-body">
                  {project.shortDescription && (
                    <p className="dossier-lead">{project.shortDescription}</p>
                  )}
                  {project.fullDescription && (
                    <div className="dossier-narrative">
                      {project.fullDescription.split("\n\n").map((para, pIdx) => (
                        <p key={pIdx}>{para}</p>
                      ))}
                    </div>
                  )}
                </div>
              </article>

              {/* 02: Delivered Infrastructure Features (100% Dynamic) */}
              {hasFeatures && (
                <article className="dossier-card" id="features">
                  <div className="dossier-card-head">
                    <span className="dossier-kicker">02 / Infrastructure</span>
                    <h3 className="dossier-title">Delivered Infrastructure &amp; Features</h3>
                  </div>

                  <div className="features-compact-grid">
                    {project.features.map((feat, fIdx) => (
                      <div key={fIdx} className="feature-tile">
                        <span className="feature-check-icon" aria-hidden="true">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </span>
                        <span className="feature-tile-text">{feat}</span>
                      </div>
                    ))}
                  </div>
                </article>
              )}

              {/* 03: Multi-Modal Transit Connectivity (100% Dynamic) */}
              {hasConnectivity && (
                <article className="dossier-card" id="connectivity">
                  <div className="dossier-card-head">
                    <span className="dossier-kicker">03 / Multi-Modal Logistics</span>
                    <h3 className="dossier-title">Strategic Freight &amp; Highway Connectivity</h3>
                  </div>

                  <div className="connectivity-compact-list">
                    {project.connectivity.map((conn, cIdx) => (
                      <div key={cIdx} className="connectivity-row">
                        <span className="connectivity-index">0{cIdx + 1}</span>
                        <div className="connectivity-content">
                          <strong>{conn}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              )}

              {/* 04: Statutory Policy & Subsidies Dossier (100% Dynamic) */}
              {hasSubsidies && (
                <article className="dossier-card dossier-subsidies-card" id="subsidies">
                  <div className="subsidies-head-row">
                    <div className="subsidies-badge-icon" aria-hidden="true">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                    </div>
                    <div>
                      <span className="dossier-kicker" style={{ color: "var(--gold-dark)" }}>Statutory &amp; Financial Incentives</span>
                      <h3 className="dossier-title">Government Industrial Policy &amp; Subsidies</h3>
                    </div>
                  </div>

                  <p className="subsidies-desc-text">{project.subsidiesInfo}</p>

                  <div className="subsidies-action-row">
                    <a href="#detailed-enquiry" className="button button-gold">
                      Consult Policy Advisory Desk <Arrow diagonal />
                    </a>
                  </div>
                </article>
              )}

              {/* 05: Visual Site Progress Records (100% Dynamic) */}
              {hasGallery && (
                <article className="dossier-card" id="gallery">
                  <div className="dossier-card-head">
                    <span className="dossier-kicker">05 / Visual Records</span>
                    <h3 className="dossier-title">Development Topography &amp; Site Progress</h3>
                  </div>

                  <div className="gallery-compact-grid">
                    {project.galleryImages.map((imgSrc, gIdx) => (
                      <div key={gIdx} className="gallery-thumb-wrap image-frame">
                        <Image
                          src={imgSrc}
                          alt={`${project.title} Site Progress ${gIdx + 1}`}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="gallery-thumb-img"
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                    ))}
                  </div>
                </article>
              )}

              {/* 06: Corporate Procurement & Detailed Tender Desk */}
              <article className="dossier-card dossier-enquiry-card" id="detailed-enquiry">
                <div className="dossier-card-head">
                  <span className="dossier-kicker">06 / Corporate Allocation</span>
                  <h3 className="dossier-title">Corporate Tender &amp; Custom Sizing Desk</h3>
                  <p className="dossier-lead" style={{ fontSize: "13.5px", marginTop: "6px" }}>
                    Looking for customized plot dimensions, high-tension power sanction requirements, or tender documentation? Submit your institutional specifications below:
                  </p>
                </div>

                <div className="dossier-form-wrap">
                  <EnquiryForm defaultProject={project.title} />
                </div>
              </article>
            </div>

            {/* Right Sticky Inbound Concierge Sidebar (36%) */}
            <aside className="project-dossier-sidebar">
              <ProjectQuickBooking
                projectTitle={project.title}
                phone={site_info.phone}
                whatsapp={site_info.whatsapp}
              />
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
                      style={{ objectFit: "cover" }}
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

        {/* Mobile Floating Bottom Action Dock */}
        <div className="project-mobile-dock">
          <a
            href={`tel:${cleanPhone}`}
            className="dock-btn dock-btn-call"
            title="Call Developer Sales"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            Call
          </a>

          <a
            href="#top"
            data-enquiry-trigger
            data-enquiry-project={project.title}
            data-enquiry-title={`Site Visit for ${project.title}`}
            className="dock-btn dock-btn-gold"
            title="Schedule Site Visit"
          >
            Book Site Visit
          </a>

          <a
            href={`https://wa.me/${cleanWa}?text=Hi,%20I%20am%20interested%20in%20${encodeURIComponent(project.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="dock-btn dock-btn-wa"
            title="Chat on WhatsApp"
          >
            WhatsApp
          </a>
        </div>
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
