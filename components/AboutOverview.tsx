import Image from "next/image";
import Link from "next/link";
import { Arrow } from "@/components/ui/Arrow";
import { DevelopmentVertical, VisionMissionPhilosophy, SectionImage } from "@/lib/types";

interface AboutOverviewProps {
  overviewHeadline?: string;
  overviewParagraphs?: string[];
  verticals?: DevelopmentVertical[];
  visionMission?: VisionMissionPhilosophy;
  overviewImage?: SectionImage;
  overviewEyebrow?: string;
  overviewCtaText?: string;
  verticalsEyebrow?: string;
  verticalsHeadline?: string;
  verticalsDescription?: string;
}

const verticalIcons = [
  // 01: Industrial Development (Industrial Park & Gable)
  <svg key="icon-0" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
    <path d="M17 18h1" /><path d="M12 18h1" /><path d="M7 18h1" />
  </svg>,
  // 02: Industrial Plot Development (Demarcated Plots Grid)
  <svg key="icon-1" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M3 9h18" /><path d="M3 15h18" /><path d="M9 3v18" /><path d="M15 3v18" />
  </svg>,
  // 03: Residential Development (Architectural Villa / Plotted Community)
  <svg key="icon-2" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>,
  // 04: Land & Real Estate Development (Master Planning Compass & Destination)
  <svg key="icon-3" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>,
];

export function AboutOverview({
  overviewHeadline = "We Develop Land. We Build Destinations. We Create Opportunities.",
  overviewParagraphs = [
    "MAAS Industrial Ventures Pvt. Limited is a land and real estate development company specialising in industrial and residential development. We focus on identifying land opportunities, planning and developing integrated industrial hubs, creating industrial plots and developing residential plotted projects.",
    "We are developers who believe that every piece of land has the potential to become something greater. From developing industrial hubs that provide opportunities for businesses and manufacturers to create residential developments for individuals and families, our aim is to transform land into well-planned destinations.",
    "Our work goes beyond selling land. We focus on the development process — from land identification and planning to project development and offering developed plots to buyers. Through our projects, we aim to create opportunities for businesses, entrepreneurs, investors and communities.",
  ],
  verticals = [],
  visionMission,
  overviewImage,
  overviewEyebrow = "About MAAS Industrial Ventures Pvt. Limited",
  overviewCtaText = "Learn More About MAAS",
  verticalsEyebrow = "Our Focus Areas",
  verticalsHeadline = "Our Development Verticals",
  verticalsDescription = "From strategic industrial manufacturing estates to planned plotted communities, our developments are engineered for long-term value.",
}: AboutOverviewProps) {
  return (
    <section className="overview section-pad" id="overview">
      <div className="page-wrap">
        <div className="section-label">
          <span>02</span> / About MAAS
        </div>

        {/* Main Narrative Split */}
        <div className="overview-grid">
          <div className="overview-heading">
            <p className="eyebrow">{overviewEyebrow}</p>
            <h2>
              {overviewHeadline.split(".").map((part, i, arr) => {
                const trimmed = part.trim();
                if (!trimmed) return null;
                return (
                  <span key={i} className="headline-part">
                    {i === arr.length - 2 ? <em>{trimmed}.</em> : `${trimmed}.`}
                  </span>
                );
              })}
            </h2>
            <div className="overview-cta-wrap">
              <Link className="button button-gold" href="/about">
                {overviewCtaText} <Arrow diagonal />
              </Link>
              <Link className="button button-outline-dark" href="/projects">
                Explore Projects <Arrow />
              </Link>
            </div>
          </div>

          <div className="overview-copy">
            {overviewParagraphs.slice(0, 2).map((para, idx) => (
              <p key={idx} className={idx === 0 ? "lead" : ""}>
                {para}
              </p>
            ))}
            <div className="overview-actions-row">
              <Link href="/about" className="text-link">
                Read our full company pedigree &amp; development philosophy <Arrow diagonal />
              </Link>
            </div>
          </div>
        </div>

        {/* Developer Hero Image Banner */}
        {overviewImage?.src && (
          <div className="overview-image image-frame">
            <Image
              src={overviewImage.src}
              alt={overviewImage.alt || "MAAS Industrial Land Development"}
              fill
              sizes="(max-width: 900px) 100vw, 90vw"
            />
            <span className="image-caption">
              {overviewImage.caption || "MAAS Industrial Ventures · Developing Land. Building Opportunities."}
            </span>
            <span className="image-stamp">
              TRANSFORMING<br />LAND
            </span>
          </div>
        )}

        {/* 4 Development Verticals Section */}
        <div className="verticals-container">
          <div className="verticals-header">
            <div className="verticals-header-text">
              <p className="eyebrow">{verticalsEyebrow}</p>
              <h3>{verticalsHeadline}</h3>
              <p className="verticals-sub">{verticalsDescription}</p>
            </div>
            <Link href="/about#verticals" className="text-link verticals-explore-all">
              Detailed Verticals Breakdown <Arrow diagonal />
            </Link>
          </div>

          <div className="verticals-grid">
            {verticals.map((vert, idx) => (
              <div key={vert.id || idx} className="vertical-card">
                <div className="vertical-card-header">
                  <div className="vertical-card-icon" aria-hidden="true">
                    {verticalIcons[idx % verticalIcons.length]}
                  </div>
                  <div className="vertical-badge-wrap">
                    <span className="vertical-num">0{idx + 1}</span>
                    <span className="vertical-tag">{vert.tag || "Vertical"}</span>
                  </div>
                </div>
                <h4 className="vertical-title">{vert.title}</h4>
                <p className="vertical-desc">{vert.description}</p>
                <div className="vertical-card-foot">
                  <Link href="/projects" className="vertical-link">
                    <span>Explore Projects</span>
                    <Arrow diagonal />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Philosophy Feature Quote Banner */}
        {visionMission && (
          <div className="purpose-section home-purpose-teaser">
            <div className="philosophy-showcase">
              <div className="philosophy-quote-mark" aria-hidden="true">“</div>
              <div className="philosophy-content">
                <span className="philosophy-eyebrow">Our Guiding Philosophy</span>
                <blockquote className="philosophy-quote">
                  “{visionMission.philosophyTitle}”
                </blockquote>
                <p className="philosophy-narrative">{visionMission.philosophyText}</p>
                <div className="philosophy-actions-row">
                  <Link href="/about" className="button button-gold">
                    Read Our Full Story &amp; Principles <Arrow diagonal />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
