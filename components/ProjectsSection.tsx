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
          <span>03</span> / Projects Portfolio
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
          {projects.map((project, idx) => (
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
                    quality={85}
                  />
                  <div className="project-image-gradient" />
                  <span className="project-status-badge">
                    <span className="pulse-dot" /> {project.status || "Active Plots Available"}
                  </span>
                  <span className="project-index-stamp">0{idx + 1}</span>
                </div>
              </div>

              {/* Minimalist Information Column */}
              <div className="project-card-info">
                <div className="project-meta-top">
                  <span className="project-tagline">
                    <span className="project-index-num">0{idx + 1}</span>
                    <span className="meta-sep">/</span>
                    {project.tagline || "Planned Industrial Development"}
                  </span>
                  <span className="project-loc">
                    <span className="loc-pin" aria-hidden="true">📍</span> {project.addressShort || project.location.split(",")[0]}
                  </span>
                </div>

                <h3 className="project-title">
                  <Link href={`/projects/${project.slug}`}>
                    {project.title}
                  </Link>
                </h3>

                <p className="project-description">
                  {project.shortDescription || project.fullDescription}
                </p>

                {/* Minimalist Hairline Metrics Strip */}
                <div className="project-metrics-strip">
                  <div className="metric-cell">
                    <span className="metric-val">{project.plotSizes}</span>
                    <span className="metric-lbl">Plot Configurations</span>
                  </div>
                  <div className="metric-cell">
                    <span className="metric-val">{project.roadWidth.split(".")[0] || "45–52 ft."}</span>
                    <span className="metric-lbl">Internal Road Width</span>
                  </div>
                  {project.connectivity?.[0] && (
                    <div className="metric-cell">
                      <span className="metric-val">Direct Transit</span>
                      <span className="metric-lbl">{project.connectivity[0].replace(/Direct access to /i, "").slice(0, 26)}</span>
                    </div>
                  )}
                </div>

                {/* Minimalist Key Highlights Tags */}
                {project.features && project.features.length > 0 && (
                  <div className="project-tags-strip" aria-label="Key Features">
                    {project.features.slice(0, 3).map((feat, fIdx) => (
                      <span key={fIdx} className="project-micro-tag">
                        <span className="tag-dot" aria-hidden="true" /> {feat}
                      </span>
                    ))}
                  </div>
                )}

                {/* Clean Minimal Policy Callout */}
                {project.subsidiesInfo && (
                  <div className="project-policy-callout">
                    <span className="policy-pill">Incentives</span>
                    <span className="policy-text">{project.subsidiesInfo}</span>
                  </div>
                )}

                {/* Sleek Dual Actions */}
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
          ))}
        </div>
      </div>
    </section>
  );
}
