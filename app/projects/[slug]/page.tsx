import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FloatingContact } from "@/components/FloatingContact";
import { EnquiryForm } from "@/components/EnquiryForm";
import { ProjectPhotoGrid } from "@/components/ProjectPhotoGrid";
import { ProjectQuickBooking } from "@/components/ProjectQuickBooking";
import styles from "./project.module.css";
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
  const coverSrc = !project.coverImage || project.coverImage === "https://images.unsplash.com/photo-1758304481470-e575d1d44efa?auto=format&fit=crop&w=1600&q=85"
    ? "/images/industrial-hero.webp" : project.coverImage;
  const facts = [["Plot sizes", project.plotSizes], ["Internal roads", project.roadWidth],
    ["Location", project.location || project.addressShort], ["Availability", project.status]];
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

      <main className={"project-detail-page " + styles.page} id="top">
        <section className={"page-wrap " + styles.intro} aria-labelledby="project-title">
          <nav className="project-breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span className="crumb-sep" aria-hidden="true">/</span>
            <Link href="/projects">Projects</Link>
            <span className="crumb-sep" aria-hidden="true">/</span>
            <span className="crumb-current">{project.title}</span>
          </nav>

          <div className={styles.spread}>
            <div className={styles.identity}>
              <div className="project-meta-badges">
                <span className="proj-status-badge">
                  <span className="status-live-dot" /> {project.status || "Active Plots Available"}
                </span>
                {hasSubsidies && (
                  <span className="proj-policy-badge">UP MSME Policy 2022</span>
                )}
              </div>

              {project.tagline && <p className={styles.kicker}>{project.tagline}</p>}
              <h1 id="project-title">{project.title}</h1>
              {project.shortDescription && <p className={styles.summary}>{project.shortDescription}</p>}

              <div className={styles.actions}>
                <button
                  type="button"
                  className="button button-gold"
                  data-enquiry-trigger
                  data-enquiry-project={project.title}
                  data-enquiry-title={`Site visit for ${project.title}`}
                >
                  Request a Site Visit <Arrow diagonal />
                </button>
                {project.brochureUrl && (
                  <a
                    href={project.brochureUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button button-outline-dark"
                  >
                    Project Brochure <Arrow diagonal />
                  </a>
                )}
                {cleanWa && (
                  <a
                    href={`https://wa.me/${cleanWa}?text=${encodeURIComponent("Please share plot availability for " + project.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button button-wa-outline"
                  >
                    WhatsApp Desk <Arrow diagonal />
                  </a>
                )}
              </div>
            </div>

            <div className={styles.cover}>
              <Image src={coverSrc} alt={project.title} fill priority sizes="(max-width: 760px) 100vw, 52vw" />
              <div className="project-cover-gradient" />
              <div className={styles.coverFooter}>
                {(project.location || project.addressShort) && (
                  <span className="project-cover-geo">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>{project.location || project.addressShort}</span>
                  </span>
                )}
                {hasGallery && (
                  <a className={styles.photoLink} href="#gallery">
                    Site Photos ({project.galleryImages.length}) ↓
                  </a>
                )}
              </div>
            </div>
          </div>

          <dl className={styles.facts} id="specifications">
            {facts.filter(([, value]) => value).map(([label, value]) => (
              <div key={label} className={styles.factTile}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>

          <nav aria-label="Project sections" className={styles.contents}>
            {project.fullDescription && <a href="#overview">01 Overview</a>}
            {hasFeatures && <a href="#features">02 Infrastructure</a>}
            {hasConnectivity && <a href="#connectivity">03 Connectivity</a>}
            {hasSubsidies && <a href="#subsidies">04 Policy &amp; Subsidies</a>}
            {hasGallery && <a href="#gallery">05 Site Photos</a>}
            <a href="#detailed-enquiry">06 Enquire</a>
          </nav>
        </section>

        {/* Balanced 2-Column Asset Dossier & Sticky Advisory */}
        <section className="project-body-section page-wrap">
          <div className="project-body-grid">
            {/* Main Asset Column */}
            <div className="project-dossier-main">
              {/* 01: Master Overview & Vision */}
              {project.fullDescription && (
                <article className="dossier-card" id="overview">
                  <div className="dossier-card-head">
                    <span className="dossier-kicker">01 / Master Overview</span>
                    <h2 className="dossier-title">Project Overview</h2>
                  </div>

                  <div className="dossier-body">
                    <div className="dossier-narrative">
                      {project.fullDescription.split("\n\n").map((para, pIdx) => (
                        <p key={pIdx}>{para}</p>
                      ))}
                    </div>
                  </div>
                </article>
              )}

              {/* 02: Delivered Infrastructure Features (100% Dynamic) */}
              {hasFeatures && (
                <article className="dossier-card" id="features">
                  <div className="dossier-card-head">
                    <span className="dossier-kicker">02 / Engineered Utilities</span>
                    <h2 className="dossier-title">Site Infrastructure</h2>
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
                    <span className="dossier-kicker">03 / Logistics &amp; Corridors</span>
                    <h2 className="dossier-title">Strategic Connectivity</h2>
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
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                    </div>
                    <div>
                      <span className="dossier-kicker">04 / Statutory Incentives</span>
                      <h2 className="dossier-title">Policy &amp; Subsidies</h2>
                    </div>
                  </div>

                  <p className="subsidies-desc-text">{project.subsidiesInfo}</p>

                  <div className="subsidies-action-row">
                    <a href="#detailed-enquiry" className="button button-gold">
                      Ask About Subsidy Eligibility <Arrow diagonal />
                    </a>
                  </div>
                </article>
              )}

              {/* 05: Visual Site Progress Records (100% Dynamic) */}
              {hasGallery && (
                <article className="dossier-card" id="gallery">
                  <div className="dossier-card-head">
                    <span className="dossier-kicker">05 / On-Site Visuals</span>
                    <h2 className="dossier-title">Project Site Photos</h2>
                  </div>

                  <ProjectPhotoGrid title={project.title} images={project.galleryImages} />
                </article>
              )}

              {/* 06: Corporate Procurement & Detailed Tender Desk */}
              <article className="dossier-card dossier-enquiry-card" id="detailed-enquiry">
                <div className="dossier-card-head">
                  <span className="dossier-kicker">06 / Allocation &amp; Tender Desk</span>
                  <h2 className="dossier-title">Enquire About {project.title}</h2>
                  <p className="dossier-lead" style={{ fontSize: "13.5px", marginTop: "6px", marginBottom: 0 }}>
                    Ask about plot dimensions, power requirements, pricing schedule, or tender documents.
                  </p>
                </div>

                <div className="dossier-form-wrap">
                  <EnquiryForm defaultProject={project.title} />
                </div>
              </article>
            </div>

            {/* Right Sticky Inbound Concierge Sidebar */}
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
            <div className="other-projects-head">
              <div className="section-label">
                <span>+</span> / Explore More Developments
              </div>
              <h2 className="other-projects-heading">Other Active MAAS Developments</h2>
            </div>
            <div className="other-projects-grid">
              {otherProjects.map((op, opIdx) => (
                <article key={op.id || opIdx} className="other-proj-card">
                  <Link href={`/projects/${op.slug}`} className="other-proj-media">
                    <Image
                      src={op.coverImage || "/images/industrial-hero.webp"}
                      alt={op.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="other-proj-img"
                    />
                    <div className="project-image-gradient" />
                    <span className="other-proj-badge">{op.addressShort || op.location.split(",")[0]}</span>
                  </Link>
                  <div className="other-proj-body">
                    <span className="other-proj-status">{op.status || "Active Plots Available"}</span>
                    <h3>
                      <Link href={`/projects/${op.slug}`}>{op.title}</Link>
                    </h3>
                    <p>{op.plotSizes} · {op.roadWidth}</p>
                    <Link href={`/projects/${op.slug}`} className="text-link">
                      View Project Details <Arrow diagonal />
                    </Link>
                  </div>
                </article>
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
