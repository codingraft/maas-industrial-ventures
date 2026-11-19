"use client";

import Image from "next/image";
import Link from "next/link";
import { Arrow } from "@/components/ui/Arrow";
import { ProjectItem } from "@/lib/types";

interface ProjectsSectionProps {
  projects: ProjectItem[];
  eyebrow?: string;
  headline?: string;
  description?: string;
}

export function ProjectsSection({
  projects,
  eyebrow = "Our Landmark Developments",
  headline = "Industrial Land Opportunities & Planned Developments.",
  description = "Strategically positioned along prime expressway corridors in Western Uttar Pradesh. Engineered with completed boundary demarcation, heavy concrete roads, continuous power feeds, and government policy benefits.",
}: ProjectsSectionProps) {
  if (!projects || projects.length === 0) return null;

  function handleEnquireClick(projectTitle: string) {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("open-enquiry-modal", {
          detail: {
            title: `Enquiry: ${projectTitle}`,
            project: projectTitle,
            requirement: "500 to 1,000 Sq. Yards",
          },
        })
      );
    }
  }

  return (
    <section className="projects-section section-pad" id="projects">
      <div className="page-wrap">
        <div className="section-label">
          <span>02</span> / Projects Portfolio
        </div>

        <div className="projects-head">
          <div className="projects-head-copy">
            <p className="eyebrow">{eyebrow}</p>
            <h2 className="section-title">{headline}</h2>
            <p className="projects-head-lead">{description}</p>
          </div>

          <div className="projects-head-action">
            <Link href="/projects" className="text-link projects-catalog-link">
              View All Active Projects ({projects.length}) <Arrow diagonal />
            </Link>
          </div>
        </div>

        <div className="projects-list">
          {projects.map((project, idx) => {
            // Create a clean, punchy 1-sentence executive summary
            const rawDesc = project.shortDescription || project.fullDescription || "";
            const cleanLead = rawDesc.includes(".")
              ? rawDesc.split(". ")[0].trim() + "."
              : rawDesc.slice(0, 140) + "...";

            // Clean, non-clipped road and corridor labels
            const roadDisplay = /rcc|concrete/i.test(project.roadWidth)
              ? "Heavy-Duty RCC"
              : project.roadWidth.split(".")[0] || "45–52 Ft. Wide";

            const corridorDisplay = project.addressShort || project.location.split(",")[0] || "Delhi-NCR Corridor";

            return (
              <article
                key={project.id || idx}
                className={`project-card ${idx % 2 === 1 ? "project-card-reverse" : ""}`}
                id={`project-${project.slug}`}
              >
                {/* Visual Media Column */}
                <div className="project-card-media">
                  <div className="project-card-image-wrap">
                    <Image
                      src={
                        project.coverImage ||
                        "https://images.unsplash.com/photo-1758304481470-e575d1d44efa?auto=format&fit=crop&w=1200&q=80"
                      }
                      alt={project.title}
                      fill
                      sizes="(max-width: 900px) 100vw, 50vw"
                      className="project-cover-img"
                    />
                    <div className="project-image-gradient" />
                    <span className="project-status-badge">
                      <span className="pulse-dot" /> {project.status || "Active Plots Available"}
                    </span>
                    <span className="project-index-stamp">0{idx + 1}</span>
                    <div className="project-media-location">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {project.location}
                    </div>
                  </div>
                </div>

                {/* Refined Institutional Information Column */}
                <div className="project-card-info">
                  <div className="project-card-body-content">
                    {/* Header Kicker & Location Tag */}
                    <div className="project-kicker-row">
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

                    <h3 className="project-title">
                      <Link href={`/projects/${project.slug}`}>
                        {project.title}
                      </Link>
                    </h3>

                    <p className="project-description">
                      {cleanLead}
                    </p>

                    {/* Architectural 3-Tile Specification Strip */}
                    <div className="project-specs-strip">
                      <div className="spec-cell">
                        <span className="spec-lbl">Plot Sizing</span>
                        <span className="spec-val">{project.plotSizes}</span>
                      </div>
                      <div className="spec-cell">
                        <span className="spec-lbl">Road Network</span>
                        <span className="spec-val">{roadDisplay}</span>
                      </div>
                      <div className="spec-cell">
                        <span className="spec-lbl">Corridor Access</span>
                        <span className="spec-val">{corridorDisplay}</span>
                      </div>
                    </div>

                    {/* Clean Architectural Feature Highlights */}
                    {project.features && project.features.length > 0 && (
                      <ul className="project-checklist" aria-label="Key Highlights">
                        {project.features.slice(0, 3).map((feat, fIdx) => (
                          <li key={fIdx} className="project-checklist-item">
                            <span className="check-icon" aria-hidden="true">
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </span>
                            <span className="check-text">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Compact Institutional Subsidies Callout */}
                    {project.subsidiesInfo && (
                      <div className="project-incentives-bar">
                        <span className="incentive-badge">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "-1px", marginRight: "4px" }}>
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                            <path d="m9 12 2 2 4-4" />
                          </svg>
                          UP MSME 2022
                        </span>
                        <span className="incentive-text">Eligible for capital investment subsidies &amp; stamp duty exemptions</span>
                      </div>
                    )}
                  </div>

                  {/* Sleek Balanced Actions */}
                  <div className="project-card-actions">
                    <Link href={`/projects/${project.slug}`} className="button button-gold">
                      Explore Project Details <Arrow diagonal />
                    </Link>

                    <button
                      type="button"
                      className="button button-outline-dark"
                      onClick={() => handleEnquireClick(project.title)}
                      data-enquiry-trigger
                      data-enquiry-project={project.title}
                    >
                      Schedule Site Visit <Arrow />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
