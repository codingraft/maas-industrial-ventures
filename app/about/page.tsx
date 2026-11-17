import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FloatingContact } from "@/components/FloatingContact";
import { Arrow } from "@/components/ui/Arrow";
import { getAllSettings } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About Us | MAAS Industrial Ventures Pvt. Limited",
  description:
    "Learn about MAAS Industrial Ventures Pvt. Limited — land and real estate developers creating industrial hubs, demarcated industrial plots, and residential developments across strategic corridors.",
  keywords: [
    "About MAAS Industrial Ventures",
    "industrial land developer India",
    "industrial parks Modinagar Ghaziabad",
    "Hapur industrial plots",
    "real estate development company",
  ],
  alternates: {
    canonical: "https://maasventures.com/about",
  },
};

const verticalIcons = [
  // 01: Industrial Development
  <svg key="icon-0" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
    <path d="M17 18h1" /><path d="M12 18h1" /><path d="M7 18h1" />
  </svg>,
  // 02: Industrial Plot Development
  <svg key="icon-1" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M3 9h18" /><path d="M3 15h18" /><path d="M9 3v18" /><path d="M15 3v18" />
  </svg>,
  // 03: Residential Development
  <svg key="icon-2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>,
  // 04: Land & Real Estate Development
  <svg key="icon-3" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>,
];

export default async function AboutPage() {
  const settings = await getAllSettings();
  const { site_info, sections, media, social_links, verticals, vision_mission: visionMission } = settings;

  const paragraphs = site_info.overviewParagraphs && site_info.overviewParagraphs.length > 0
    ? site_info.overviewParagraphs
    : [
        "MAAS Industrial Ventures Pvt. Limited is a land and real estate development company specialising in industrial and residential development. We focus on identifying land opportunities, planning and developing integrated industrial hubs, creating industrial plots and developing residential plotted projects.",
        "We are developers who believe that every piece of land has the potential to become something greater. From developing industrial hubs that provide opportunities for businesses and manufacturers to create residential developments for individuals and families, our aim is to transform land into well-planned destinations.",
        "Our work goes beyond selling land. We focus on the development process — from land identification and planning to project development and offering developed plots to buyers. Through our projects, we aim to create opportunities for businesses, entrepreneurs, investors and communities.",
      ];

  return (
    <>
      <SiteHeader
        brandName={site_info.brandName}
        logoSrc={media.logo}
        phone={site_info.phone}
        sections={sections}
      />

      <main className="about-dedicated-page" id="top">
        {/* About Hero Section */}
        <section className="about-hero-section page-wrap">
          <div className="section-label">
            <span>01</span> / Company Profile &amp; Pedigree
          </div>
          <p className="eyebrow">{site_info.overviewEyebrow || "About MAAS Industrial Ventures Pvt. Limited"}</p>
          <h1 className="about-hero-heading">
            We Develop Land.<br />
            <em>We Build Destinations.</em><br />
            We Create Opportunities.
          </h1>
          <p className="about-hero-lead">
            {site_info.introduction || "A considered land development enterprise engineering institutional manufacturing estates, demarcated industrial plots, and planned communities."}
          </p>
        </section>

        {/* Narrative Split & Development Philosophy */}
        <section className="about-narrative-section page-wrap">
          <div className="about-narrative-grid">
            <div className="about-narrative-left">
              <h2 className="about-subheading">
                Engineering Land Into Purposeful Destinations.
              </h2>
              <div className="about-badge-strip">
                <span className="about-pill">
                  <span className="pill-dot" /> Institutional Clearances
                </span>
                <span className="about-pill">
                  <span className="pill-dot" /> Demarcated Possession
                </span>
                <span className="about-pill">
                  <span className="pill-dot" /> High-Load Infrastructure
                </span>
              </div>
            </div>

            <div className="about-narrative-right">
              {paragraphs.map((p, idx) => (
                <p key={idx} className={idx === 0 ? "narrative-lead" : "narrative-p"}>
                  {p}
                </p>
              ))}
            </div>
          </div>

          {/* Overview Hero Image Feature */}
          {media.overviewImage?.src && (
            <div className="about-image-feature image-frame">
              <Image
                src={media.overviewImage.src}
                alt={media.overviewImage.alt || "MAAS Industrial Land Development"}
                fill
                priority
                sizes="(max-width: 900px) 100vw, 92vw"
              />
              <span className="image-caption">
                {media.overviewImage.caption || "MAAS Industrial Ventures · Developing Land. Building Opportunities."}
              </span>
              <span className="image-stamp">
                DEVELOPING<br />DESTINATIONS
              </span>
            </div>
          )}
        </section>

        {/* 4 Development Verticals Section */}
        <section className="about-verticals-section page-wrap" id="verticals">
          <div className="verticals-header">
            <div className="section-label">
              <span>02</span> / Strategic Focus
            </div>
            <p className="eyebrow">{site_info.verticalsEyebrow || "Our Focus Areas"}</p>
            <h2>{site_info.verticalsHeadline || "Our 4 Development Verticals"}</h2>
            <p className="verticals-sub">
              {site_info.verticalsDescription || "From strategic industrial manufacturing estates to planned plotted communities, our developments are engineered for long-term value."}
            </p>
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
                <h3 className="vertical-title">{vert.title}</h3>
                <p className="vertical-desc">{vert.description}</p>
                <div className="vertical-card-foot">
                  <Link href="/projects" className="vertical-link">
                    <span>View Related Projects</span>
                    <Arrow diagonal />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Vision, Mission & Philosophy Feature Showcase */}
        {visionMission && (
          <section className="about-purpose-section page-wrap">
            <div className="section-label">
              <span>03</span> / Purpose &amp; Guiding Principles
            </div>

            <div className="vision-mission-row">
              {/* Vision Card */}
              <div className="purpose-card vm-vision">
                <div className="purpose-badge-row">
                  <span className="purpose-icon" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                  </span>
                  <span className="purpose-label">Our Vision</span>
                </div>
                <p className="purpose-text">{visionMission.vision}</p>
              </div>

              {/* Mission Card */}
              <div className="purpose-card vm-mission">
                <div className="purpose-badge-row">
                  <span className="purpose-icon" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </span>
                  <span className="purpose-label">Our Mission</span>
                </div>
                <p className="purpose-text">{visionMission.mission}</p>
              </div>
            </div>

            {/* Architectural Philosophy Feature Banner */}
            <div className="philosophy-showcase">
              <span className="philosophy-quote-mark" aria-hidden="true">“</span>
              <div className="philosophy-content">
                <span className="philosophy-eyebrow">Development Philosophy</span>
                <blockquote className="philosophy-quote">
                  {visionMission.philosophyTitle || "We don't just sell land. We develop the places where the future takes shape."}
                </blockquote>
                {visionMission.philosophyText && (
                  <p className="philosophy-body">{visionMission.philosophyText}</p>
                )}
                <div className="philosophy-signature">
                  <strong>MAAS Industrial Ventures Pvt. Limited</strong>
                  <span>Board of Development &amp; Planning</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Development Standards / Why Choose MAAS */}
        <section className="about-standards-section page-wrap">
          <div className="section-label">
            <span>04</span> / Execution Benchmarks
          </div>
          <h2 className="about-subheading">Built to Institutional Specifications</h2>
          <div className="standards-grid">
            <div className="standard-item">
              <span className="standard-num">01</span>
              <h4>Engineered Concrete Roads</h4>
              <p>Wide 45–52 ft heavy-duty RCC roads engineered to withstand 40+ tonne multi-axle freight and continuous container transport.</p>
            </div>
            <div className="standard-item">
              <span className="standard-num">02</span>
              <h4>Completed Plot Demarcation</h4>
              <p>Physical corner-stone demarcation and ground-level grading completed in advance for immediate construction commencement upon registration.</p>
            </div>
            <div className="standard-item">
              <span className="standard-num">03</span>
              <h4>High-Tension Dedicated Power</h4>
              <p>Dedicated industrial feeder lines, transformer substations, and planned dual storm/effluent drainage corridors.</p>
            </div>
            <div className="standard-item">
              <span className="standard-num">04</span>
              <h4>State Policy &amp; Subsidy Assistance</h4>
              <p>Facilitation of Uttar Pradesh MSME Promotion Policy 2022 benefits, capital investment subsidies, and stamp duty exemptions.</p>
            </div>
          </div>
        </section>

        {/* Direct CTA Banner */}
        <section className="about-cta-banner page-wrap">
          <div className="about-cta-card">
            <div className="about-cta-copy">
              <p className="eyebrow">Enterprise Allocation Desk</p>
              <h3>Ready to explore available land or discuss customized requirements?</h3>
              <p>Our senior advisory desk provides plot demarcations, technical dossiers, and site visit scheduling.</p>
            </div>
            <div className="about-cta-actions">
              <Link href="/projects" className="button button-gold">
                View Active Projects <Arrow diagonal />
              </Link>
              <Link href="/contact" className="button button-outline-light">
                Contact Advisory Desk <Arrow />
              </Link>
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
