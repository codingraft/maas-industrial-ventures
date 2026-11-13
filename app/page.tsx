import Image from "next/image";
import { EnquiryForm } from "@/components/EnquiryForm";
import { EnquiryModal } from "@/components/EnquiryModal";
import { ProjectGallery } from "@/components/ProjectGallery";
import { MasterPlanViewer } from "@/components/MasterPlanViewer";
import { SiteHeader } from "@/components/SiteHeader";
import { FloatingContact } from "@/components/FloatingContact";
import { HeroSlider } from "@/components/HeroSlider";
import { Arrow } from "@/components/ui/Arrow";
import { getAllSettings, defaultContent } from "@/lib/db";

export const dynamic = "force-dynamic";

export default function Home() {
  const settings = getAllSettings();
  const { site_info, sections, media, social_links, content } = settings;

  return (
    <>
      <SiteHeader
        brandName={site_info.brandName}
        logoSrc={media.logo}
        phone={site_info.phone}
        sections={sections}
      />

      <main id="top">
        {/* HERO SECTION WITH INTERACTIVE SLIDER */}
        {sections.hero && (
          <HeroSlider
            slides={media.heroSlides}
            locationText={site_info.address}
            brandShortName={site_info.shortName}
          />
        )}

        {/* FACTS STRIP */}
        {sections.facts && (
          <section className="facts-strip" aria-label="Project Key Facts">
            <div className="page-wrap facts-inner">
              <p className="facts-label">Project at a glance</p>
              {(content?.facts?.length ? content.facts : defaultContent.facts).map((fact) => (
                <div className="fact" key={fact.id}>
                  <span>{fact.label}</span>
                  <strong>{fact.value}</strong>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* OVERVIEW / THE PROPOSITION */}
        {sections.overview && (
          <section className="overview section-pad page-wrap" id="overview">
            <div className="section-label">
              <span>01</span> / The Proposition
            </div>
            <div className="overview-grid">
              <div className="overview-heading">
                <p className="eyebrow">A place for purposeful industrial growth</p>
                <h2>
                  Make room for<br />
                  <em>what’s next.</em>
                </h2>
              </div>
              <div className="overview-copy">
                <p className="lead">
                  {site_info.introduction}
                </p>
                <p>
                  Whether scaling high-precision manufacturing, establishing automated distribution, or deploying long-term institutional capital, every square meter is engineered for efficiency, speed, and continuous business continuity.
                </p>
                <a className="text-link" href="#enquire">
                  Discuss your space requirements <Arrow diagonal />
                </a>
              </div>
            </div>
            <div className="overview-image image-frame">
              <Image
                src={media.overviewImage?.src || media.overview}
                alt={media.overviewImage?.alt || "Modern industrial warehouse interior"}
                fill
                sizes="(max-width: 900px) 100vw, 90vw"
              />
              <span className="image-caption">
                {media.overviewImage?.caption || "MAAS Industrial Ventures · Engineering & High-Cube Logistics"}
              </span>
              <span className="image-stamp">
                ENGINEERED<br />FOR SCALE
              </span>
            </div>
          </section>
        )}

        {/* HIGHLIGHTS / SUBSTANCE */}
        {sections.highlights && (
          <section className="highlights section-pad">
            <div className="page-wrap">
              <div className="highlights-head">
                <div>
                  <p className="eyebrow">Data that moves corporate decisions</p>
                  <h2>
                    Substance before<br />
                    <em>superlatives.</em>
                  </h2>
                </div>
                <p>
                  We believe institutional commitments begin with clear, verifiable information. Our investment advisory team provides verified technical specifications, power sanction schedules, and approvals directly.
                </p>
              </div>
              <div className="data-list">
                {(content?.highlights?.length ? content.highlights : defaultContent.highlights).map((hl) => (
                  <div className="data-row" key={hl.id}>
                    <span className="data-index">{hl.index}</span>
                    <span className="data-title">{hl.title}</span>
                    <strong>{hl.value}</strong>
                    <span className="data-note">{hl.note}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* INFRASTRUCTURE FRAMEWORK */}
        {sections.infrastructure && (
          <section className="infrastructure section-pad page-wrap" id="infrastructure">
            <div className="section-label">
              <span>02</span> / The Framework
            </div>
            <div className="infrastructure-head">
              <div>
                <p className="eyebrow">Infrastructure, thoughtfully considered</p>
                <h2>
                  Designed around<br />
                  <em>how work moves.</em>
                </h2>
              </div>
              <p className="muted-copy">
                A dependable industrial ecosystem aligns logistics, utilities, workforce accessibility, and expansion capacity into a seamless operational rhythm.
              </p>
            </div>
            <div className="infrastructure-grid">
              <article className="infra-feature">
                <div className="infra-symbol">↗</div>
                <span className="infra-number">01 / SITE PLANNING</span>
                <h3>Room to operate</h3>
                <p>
                  Modular plot layouts, optimal perimeter setbacks, and scalable footprints supporting phased expansion for modern industry.
                </p>
                <span className="status-note">Engineered for heavy operations</span>
              </article>

              <article className="infra-feature infra-dark">
                <div className="infra-symbol">⌁</div>
                <span className="infra-number">02 / MOVEMENT</span>
                <h3>Built for flow</h3>
                <p>
                  Generous turning radiuses, designated freight staging areas, and separate passenger-freight ingress and egress gates.
                </p>
                <span className="status-note">Zero-congestion design</span>
              </article>

              <article className="infra-feature infra-photo">
                <Image
                  src={media.infraImage?.src || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=82"}
                  alt={media.infraImage?.alt || "Industrial operations"}
                  fill
                  sizes="(max-width: 800px) 100vw, 33vw"
                />
                <div className="infra-photo-shade" />
                <div className="infra-photo-copy">
                  <span className="infra-number">03 / UTILITIES</span>
                  <h3>Ready for heavy industry</h3>
                  <p>
                    Redundant electrical substations, industrial-grade water filtration, advanced telecommunication conduits, and effluent management.
                  </p>
                  <span className="status-note">Reliability guaranteed</span>
                </div>
              </article>

              <article className="infra-feature infra-copper">
                <div className="infra-symbol">✳</div>
                <span className="infra-number">04 / BUSINESS FIT</span>
                <h3>High ROI Industrial Assets</h3>
                <p>
                  Strategic positioning maximizes long-term capital appreciation and operating cost efficiency for multinational occupiers.
                </p>
                <a className="infra-link" href="#enquire">
                  Talk through your needs <Arrow diagonal />
                </a>
              </article>
            </div>
          </section>
        )}

        {/* MASTER PLAN - INTERACTIVE MULTI-PLAN VIEWER */}
        {sections.masterplan && <MasterPlanViewer plans={media.masterplanPlans} />}

        {/* LOCATION & CONNECTIVITY */}
        {sections.location && (
          <section className="location section-pad page-wrap" id="location">
            <div className="section-label">
              <span>04</span> / The Location
            </div>
            <div className="location-grid">
              <div className="location-copy">
                <p className="eyebrow">Location &amp; Multi-Modal Connectivity</p>
                <h2>
                  Connected to<br />
                  <em>your next move.</em>
                </h2>
                <p>
                  Immediate access to premier freight expressways, cargo rail terminals, and international air hubs ensures that your supply chain moves without friction.
                </p>
                <div className="location-ask">
                  <span className="pin-large">⌖</span>
                  <span>
                    <small>STRATEGIC LOCATION</small>
                    <strong>{site_info.address}</strong>
                  </span>
                </div>
                <a className="text-link" href="#enquire">
                  Ask about freight connectivity <Arrow diagonal />
                </a>
              </div>

              {media.locationImage?.src ? (
                <div
                  className="map-placeholder has-custom-image"
                  role="img"
                  aria-label="Strategic connectivity corridor map"
                >
                  <Image
                    src={media.locationImage.src}
                    alt={media.locationImage.alt || "Location & Connectivity Map"}
                    fill
                    sizes="(max-width: 900px) 100vw, 60vw"
                    style={{ objectFit: "contain", padding: "12px" }}
                  />
                  <span className="map-tag">MULTI-MODAL LOGISTICS CORRIDOR</span>
                </div>
              ) : (
                <div
                  className="map-placeholder"
                  role="img"
                  aria-label="Strategic connectivity corridor map"
                >
                  <div className="map-gridlines" />
                  <div className="map-route route-a" />
                  <div className="map-route route-b" />
                  <div className="map-pin">
                    <span>⌖</span>
                  </div>
                  <span className="map-tag">MULTI-MODAL LOGISTICS CORRIDOR</span>
                  <div className="map-legend">
                    <i /> Arterial Highway &amp; Freight Corridor Intersection
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* PROJECT GALLERY WITH PAGINATION & DYNAMIC CATEGORIES */}
        {sections.gallery && (
          <ProjectGallery
            images={media.gallery}
            categories={media.galleryCategories}
          />
        )}

        {/* TIMELINE / PHASES */}
        {sections.timeline && (
          <section className="timeline section-pad page-wrap" id="timeline">
            <div className="section-label">
              <span>05</span> / The Development
            </div>
            <div className="timeline-grid">
              <div className="timeline-heading">
                <p className="eyebrow">Progress, clearly communicated</p>
                <h2>
                  Every phase<br />
                  <em>with purpose.</em>
                </h2>
                <p>
                  Clear infrastructure milestones ensure predictable timelines for your plant setup, commissioning, and operational launch.
                </p>
              </div>
              <div className="timeline-list">
                {(content?.timeline?.length ? content.timeline : defaultContent.timeline).map((tm) => (
                  <div className="timeline-item" key={tm.id}>
                    <span className="timeline-dot" />
                    <small>{tm.phase}</small>
                    <h3>{tm.title}</h3>
                    <p>{tm.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FAQs */}
        {sections.faq && (
          <section className="faq section-pad" id="faqs">
            <div className="page-wrap faq-grid">
              <div className="faq-heading">
                <div className="section-label">
                  <span>06</span> / Useful to Know
                </div>
                <p className="eyebrow">Straight answers</p>
                <h2>
                  Good questions<br />
                  <em>come first.</em>
                </h2>
                <p>
                  Explore transparent answers on zoning, statutory approvals, and delivery timelines. Contact our advisory desk for specific queries.
                </p>
                <a className="text-link" href="#enquire">
                  Still have a question? <Arrow diagonal />
                </a>
              </div>
              <div className="faq-list">
                {(content?.faqs?.length ? content.faqs : defaultContent.faqs).map((faq, index) => (
                  <details className="faq-item" key={faq.id}>
                    <summary>
                      <span className="faq-num">0{index + 1}</span>
                      <span>{faq.question}</span>
                      <i aria-hidden="true" />
                    </summary>
                    <p>{faq.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* LEAD CAPTURE & ENQUIRY FORM */}
        {sections.enquire && (
          <section className="enquire section-pad" id="enquire">
            <div className="page-wrap enquire-grid">
              <div className="enquire-copy">
                <p className="eyebrow eyebrow-light">Start a conversation</p>
                <h2>
                  Let’s discuss<br />
                  your <em>space.</em>
                </h2>
                <p>
                  Share your business parameters with our industrial advisory team. We will present verified site specifications, layout configurations, and commercial pricing.
                </p>
                <div className="enquire-detail">
                  <span>01</span>
                  <span>Confidential and tailored corporate advisory.</span>
                </div>
                <div className="enquire-detail">
                  <span>02</span>
                  <span>Technical feasibility and master plan verification.</span>
                </div>
                <div className="enquire-contact">
                  <small>EXECUTIVE DESK DIRECT</small>
                  <strong>{site_info.phone}</strong>
                  <div style={{ marginTop: "4px", fontSize: "12px", color: "#cbd5e1" }}>
                    {site_info.email}
                  </div>
                </div>
              </div>

              <div className="form-panel">
                <div className="form-heading">
                  <span>PROJECT ALLOCATION ENQUIRY</span>
                  <small>
                    <b>*</b> Required fields
                  </small>
                </div>
                <EnquiryForm />
              </div>
            </div>
          </section>
        )}
      </main>

      {/* FOOTER */}
      <footer className="footer" id="privacy">
        <div className="page-wrap footer-top">
          <a href="#top" className="brand brand-footer" aria-label={`${site_info.brandName} Home`}>
            <div className="brand-logo-wrap">
              <Image
                src={media.logo.endsWith(".jpg") || media.logo.endsWith(".jpeg") ? "/images/maas-logo-white.svg" : media.logo}
                alt="MAAS Industrial Ventures"
                width={220}
                height={60}
                style={{ height: "42px", width: "auto" }}
              />
            </div>
          </a>
          <p>
            {site_info.brandName} — Engineering high-capacity industrial addresses for modern manufacturing and enterprise growth.
          </p>
          <a href="#top" className="back-top">
            Back to top ↑
          </a>
        </div>

        <div className="page-wrap footer-bottom">
          <span>
            © {new Date().getFullYear()} {site_info.brandName}. All rights reserved.
          </span>
          <div className="footer-legal">
            {social_links.linkedin && (
              <a href={social_links.linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
            )}
            {social_links.instagram && (
              <a href={social_links.instagram} target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
            )}
            {social_links.facebook && (
              <a href={social_links.facebook} target="_blank" rel="noopener noreferrer">
                Facebook
              </a>
            )}
            {social_links.twitter && (
              <a href={social_links.twitter} target="_blank" rel="noopener noreferrer">
                Twitter / X
              </a>
            )}
            {social_links.youtube && (
              <a href={social_links.youtube} target="_blank" rel="noopener noreferrer">
                YouTube
              </a>
            )}
            <a href="#privacy">Privacy Policy</a>
            <a href="#privacy">Terms of Service</a>
          </div>
        </div>
      </footer>

      {/* FLOATING ACTION BAR FOR HIGH AD CONVERSIONS */}
      <FloatingContact
        phone={site_info.phone}
        whatsapp={site_info.whatsapp}
        brochureUrl={site_info.brochureUrl}
      />

      {/* POPUP ENQUIRY MODAL (TRIGGERS FROM ANY CTA BUTTON ON PAGE) */}
      <EnquiryModal />
    </>
  );
}
