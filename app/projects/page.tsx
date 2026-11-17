import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FloatingContact } from "@/components/FloatingContact";
import { Arrow } from "@/components/ui/Arrow";
import { getAllSettings, getProjects } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Industrial & Plotted Real Estate Projects | MAAS Industrial Ventures",
  description:
    "Explore active industrial hubs and demarcated plot developments by MAAS Industrial Ventures, including Gayatri Industrial Park (Bhojpur) and Shri Balaji Industrial Park (Hapur).",
  keywords: [
    "Gayatri Industrial Park Bhojpur",
    "Shri Balaji Industrial Park Hapur",
    "industrial plots Ghaziabad",
    "industrial land UP MSME policy",
    "MAAS Industrial Ventures projects",
  ],
  alternates: {
    canonical: "https://maasventures.com/projects",
  },
};

export default async function ProjectsIndexPage() {
  const [settings, projects] = await Promise.all([
    getAllSettings(),
    getProjects(true), // active projects only
  ]);

  const { site_info, sections, media, social_links } = settings;

  return (
    <>
      <SiteHeader
        brandName={site_info.brandName}
        logoSrc={media.logo}
        phone={site_info.phone}
        sections={sections}
      />

      <main className="projects-catalog-page" id="top">
        {/* Projects Catalog Hero */}
        <section className="projects-hero-section page-wrap">
          <div className="section-label">
            <span>01</span> / Development Portfolio
          </div>
          <p className="eyebrow">{site_info.projectsEyebrow || "Strategic Land Assets & Plotted Parks"}</p>
          <h1 className="projects-hero-heading">
            {site_info.projectsHeadline || "Our Development Projects."}
          </h1>
          <p className="projects-hero-lead">
            {site_info.projectsDescription ||
              "Thoughtfully planned industrial hubs, demarcated industrial plots, and plotted real estate developments engineered for business scale, logistics efficiency, and long-term asset value."}
          </p>

          <div className="projects-count-bar">
            <span className="projects-count-chip">
              <strong>{projects.length}</strong> Active Developments Available
            </span>
            <span className="projects-count-chip">
              Delhi–Meerut Expressway &amp; Western UP Corridors
            </span>
          </div>
        </section>

        {/* Projects Grid / Directory */}
        <section className="projects-list-section page-wrap">
          {projects.length === 0 ? (
            <div className="projects-empty-state">
              <h3>No active developments listed at this moment.</h3>
              <p>Contact our advisory desk for upcoming land releases and private allocations.</p>
              <Link href="/contact" className="button button-gold">
                Contact Advisory Desk
              </Link>
            </div>
          ) : (
            <div className="projects-catalog-grid">
              {projects.map((project, idx) => {
                const rawDesc = project.shortDescription || project.fullDescription || "";
                const cleanLead = rawDesc.includes(".")
                  ? rawDesc.split(". ")[0].trim() + "."
                  : rawDesc.slice(0, 140) + "...";

                const roadDisplay = /rcc|concrete/i.test(project.roadWidth)
                  ? "Heavy-Duty RCC"
                  : project.roadWidth.split(".")[0] || "45–52 Ft. Wide";

                const corridorDisplay = project.addressShort || project.location.split(",")[0] || "Western UP Corridor";

                return (
                  <article key={project.id || idx} className="project-catalog-card">
                    <div className="project-catalog-media">
                      <Image
                        src={
                          project.coverImage ||
                          "https://images.unsplash.com/photo-1567789884554-0b844b597180?auto=format&fit=crop&w=1400&q=82"
                        }
                        alt={project.title}
                        fill
                        sizes="(max-width: 900px) 100vw, 50vw"
                        className="project-catalog-img"
                      />
                      <div className="project-catalog-badges">
                        <span className="proj-status-badge">
                          <span className="status-live-dot" /> {project.status || "Active Plots Available"}
                        </span>
                        <span className="proj-location-badge">
                          {corridorDisplay}
                        </span>
                      </div>
                      <span className="project-catalog-index-stamp">0{idx + 1}</span>
                    </div>

                    <div className="project-catalog-body">
                      <div className="project-catalog-header">
                        <div className="project-catalog-kicker-row">
                          <span className="project-kicker">
                            <span className="kicker-index">0{idx + 1}</span>
                            <span className="kicker-divider">/</span>
                            {project.tagline || "Planned Industrial Park"}
                          </span>
                          <span className="project-location-tag">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                            {corridorDisplay}
                          </span>
                        </div>
                        <h2 className="project-card-title">
                          <Link href={`/projects/${project.slug}`}>{project.title}</Link>
                        </h2>
                      </div>

                      <p className="project-card-desc">
                        {cleanLead}
                      </p>

                      {/* Specifications Quick Strip (3 Tiles) */}
                      <div className="project-specs-row">
                        <div className="spec-item">
                          <span className="spec-label">Plot Sizing</span>
                          <strong className="spec-val">{project.plotSizes}</strong>
                        </div>
                        <div className="spec-item">
                          <span className="spec-label">Road Network</span>
                          <strong className="spec-val">{roadDisplay}</strong>
                        </div>
                        <div className="spec-item">
                          <span className="spec-label">Corridor Access</span>
                          <strong className="spec-val">{corridorDisplay}</strong>
                        </div>
                      </div>

                      {/* Key Features Bullets */}
                      {project.features && project.features.length > 0 && (
                        <ul className="project-features-list">
                          {project.features.slice(0, 3).map((feat, fIdx) => (
                            <li key={fIdx}>
                              <span className="feat-check" aria-hidden="true">
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              </span>
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* MSME Subsidies Highlight */}
                      {project.subsidiesInfo && (
                        <div className="project-subsidy-alert">
                          <span className="subsidy-badge">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "-1px", marginRight: "4px" }}>
                              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                              <path d="m9 12 2 2 4-4" />
                            </svg>
                            UP MSME 2022
                          </span>
                          <span>Eligible for capital investment subsidies &amp; stamp duty exemptions</span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="project-card-actions">
                        <Link href={`/projects/${project.slug}`} className="button button-gold">
                          Explore Project Details <Arrow diagonal />
                        </Link>
                        <button
                          type="button"
                          className="button button-outline-dark"
                          data-enquiry-trigger
                          data-enquiry-project={project.title}
                          data-enquiry-title={`Enquiry for ${project.title}`}
                        >
                          Schedule Site Visit <Arrow />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Master Plan & Dossier Callout Banner */}
        <section className="projects-dossier-banner page-wrap">
          <div className="dossier-card">
            <div className="dossier-copy">
              <span className="eyebrow">Technical Due Diligence</span>
              <h3>Need comprehensive layout blueprints and government subsidy guidelines?</h3>
              <p>
                Request our complete project documentation pack including site demarcation coordinates, road cross-sections, and UP MSME policy subsidy schedules.
              </p>
            </div>
            <div className="dossier-actions">
              <button
                type="button"
                className="button button-gold"
                data-enquiry-trigger
                data-enquiry-title="Request Complete Development Dossier"
                data-enquiry-req="Complete Master Dossier & MSME Subsidies Guide"
              >
                Download Technical Dossier <Arrow diagonal />
              </button>
            </div>
          </div>
        </section>
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
