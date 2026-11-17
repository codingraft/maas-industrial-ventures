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
              {projects.map((project, idx) => (
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
                        {project.addressShort || project.location.split(",")[0]}
                      </span>
                    </div>
                  </div>

                  <div className="project-catalog-body">
                    <div className="project-catalog-header">
                      <span className="project-index">0{idx + 1}</span>
                      <div>
                        <h2 className="project-card-title">
                          <Link href={`/projects/${project.slug}`}>{project.title}</Link>
                        </h2>
                        <p className="project-card-tagline">{project.tagline}</p>
                      </div>
                    </div>

                    <p className="project-card-desc">
                      {project.shortDescription || project.fullDescription.slice(0, 180) + "..."}
                    </p>

                    {/* Specifications Quick Strip */}
                    <div className="project-specs-row">
                      <div className="spec-item">
                        <span className="spec-label">Plot Sizes</span>
                        <strong className="spec-val">{project.plotSizes}</strong>
                      </div>
                      <div className="spec-item">
                        <span className="spec-label">Internal Roads</span>
                        <strong className="spec-val">{project.roadWidth}</strong>
                      </div>
                    </div>

                    {/* Key Features Bullets */}
                    {project.features && project.features.length > 0 && (
                      <ul className="project-features-list">
                        {project.features.slice(0, 3).map((feat, fIdx) => (
                          <li key={fIdx}>
                            <span className="feat-check" aria-hidden="true">✓</span>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* MSME Subsidies Highlight */}
                    {project.subsidiesInfo && (
                      <div className="project-subsidy-alert">
                        <span className="subsidy-icon" aria-hidden="true">🏛️</span>
                        <span>{project.subsidiesInfo}</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="project-card-actions">
                      <Link href={`/projects/${project.slug}`} className="button button-gold">
                        View Project Details <Arrow diagonal />
                      </Link>
                      <button
                        type="button"
                        className="button button-outline-dark"
                        data-enquiry-trigger
                        data-enquiry-project={project.title}
                        data-enquiry-title={`Enquiry for ${project.title}`}
                      >
                        Enquire / Site Visit <Arrow />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
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
