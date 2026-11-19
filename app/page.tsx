import Image from "next/image";
import { EnquiryForm } from "@/components/EnquiryForm";
import { ProjectGallery } from "@/components/ProjectGallery";
import { MasterPlanViewer } from "@/components/MasterPlanViewer";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FloatingContact } from "@/components/FloatingContact";
import { HeroSlider } from "@/components/HeroSlider";
import { AboutOverview } from "@/components/AboutOverview";
import { ProjectsSection } from "@/components/ProjectsSection";
import { BlogPreviewSection } from "@/components/BlogPreviewSection";
import { FaqSection } from "@/components/FaqSection";
import { Arrow } from "@/components/ui/Arrow";
import { getAllSettings, getProjects, getBlogPosts, defaultContent } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [settings, projects, blogs] = await Promise.all([
    getAllSettings(),
    getProjects(true), // active projects only
    getBlogPosts(true), // published blogs only
  ]);

  const { site_info, sections, media, social_links, content, verticals, vision_mission } = settings;

  return (
    <>
      <SiteHeader
        brandName={site_info.brandName}
        logoSrc={media.logo}
        phone={site_info.phone}
        sections={sections}
      />

      <main id="top">
        {/* 1. HERO SECTION WITH OFFICIAL STRUCTURE & HIGHLIGHTS */}
        {sections.hero && (
          <HeroSlider
            slides={media.heroSlides}
            brandShortName={site_info.shortName}
            heroEyebrow={site_info.heroEyebrow}
            heroHeadline={site_info.heroHeadline}
            heroSubheadline={site_info.heroSubheadline}
            heroDescription={site_info.heroDescription}
            primaryBtnText={site_info.heroPrimaryBtnText || "Explore Our Projects"}
            secondaryBtnText={site_info.heroSecondaryBtnText || "Get in Touch"}
            locationText={site_info.locationHighlight || site_info.address}
            bottomHighlights={site_info.bottomHighlights}
          />
        )}

        {/* FACTS STRIP (Optional toggle) */}
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

        {/* 2. OVERVIEW (ABOUT US) & 4 DEVELOPMENT VERTICALS, VISION, MISSION, PHILOSOPHY */}
        {sections.overview && (
          <AboutOverview
            overviewHeadline={site_info.overviewHeadline}
            overviewParagraphs={site_info.overviewParagraphs}
            overviewEyebrow={site_info.overviewEyebrow}
            overviewCtaText={site_info.overviewCtaText}
            verticalsEyebrow={site_info.verticalsEyebrow}
            verticalsHeadline={site_info.verticalsHeadline}
            verticalsDescription={site_info.verticalsDescription}
            verticals={verticals}
            visionMission={vision_mission}
            overviewImage={media.overviewImage}
          />
        )}

        {/* 3. PROJECTS SECTION (MULTI-PROJECT PORTFOLIO) */}
        {sections.projects !== false && (
          <ProjectsSection
            projects={projects}
            eyebrow={site_info.projectsEyebrow}
            headline={site_info.projectsHeadline}
            description={site_info.projectsDescription}
          />
        )}

        {/* 4. GALLERY (REAL SITE PHOTOS & ILLUSTRATIVE RENDERS) */}
        {sections.gallery && (
          <ProjectGallery
            images={media.gallery}
            categories={media.galleryCategories}
            eyebrow={site_info.galleryEyebrow}
            headline={site_info.galleryHeadline}
            description={site_info.galleryDescription}
          />
        )}

        {/* OPTIONAL MASTER PLAN BLUEPRINTS */}
        {sections.masterplan && media.masterplanPlans && media.masterplanPlans.length > 0 && (
          <MasterPlanViewer
            plans={media.masterplanPlans}
          />
        )}

        {/* 5. BLOG / INSIGHTS & NEWS SECTION */}
        {sections.blog !== false && (
          <BlogPreviewSection
            posts={blogs}
            eyebrow={site_info.blogSectionEyebrow}
            headline={site_info.blogSectionHeadline}
            description={site_info.blogSectionDescription}
          />
        )}

        {/* 6. COMMON INQUIRIES / FAQS ACCORDION */}
        {sections.faq !== false && (
          <FaqSection
            faqs={content?.faqs?.length ? content.faqs : defaultContent.faqs}
            sectionNumber="06"
            phone={site_info?.phone}
            whatsapp={site_info?.whatsapp}
          />
        )}

        {/* 7. CONTACT / REQUEST DETAILS (ENQUIRY FORM, PHONE, EMAIL, WHATSAPP) */}
        {(sections.contact !== false || sections.enquire !== false) && (
          <section className="enquire section-pad" id="contact">
            <div className="page-wrap">
              <div className="section-label">
                <span>07</span> / Contact &amp; Request Details
              </div>
              <div className="enquire-grid">
                <div className="enquire-intro">
                  <p className="eyebrow">{site_info.contactEyebrow}</p>
                  <h2>{site_info.contactHeadline}</h2>
                  <p>{site_info.contactDescription}</p>

                  <div className="contact-info-cards">
                    <div className="contact-card">
                      <div className="contact-card-icon" aria-hidden="true">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                      </div>
                      <div className="contact-card-text">
                        <small>DIRECT PHONE CALL</small>
                        <a href={`tel:${site_info.phone}`} className="contact-link">
                          <strong>{site_info.phone}</strong>
                        </a>
                      </div>
                    </div>

                    <div className="contact-card">
                      <div className="contact-card-icon" aria-hidden="true">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                        </svg>
                      </div>
                      <div className="contact-card-text">
                        <small>WHATSAPP CONSULTATION</small>
                        <a
                          href={`https://wa.me/${site_info.whatsapp.replace(/\D/g, "")}?text=Hi,%20I%20am%20interested%20in%20MAAS%20Industrial%20Ventures%20plots`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="contact-link"
                        >
                          <strong>Chat on WhatsApp →</strong>
                        </a>
                      </div>
                    </div>

                    <div className="contact-card">
                      <div className="contact-card-icon" aria-hidden="true">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="20" height="16" x="2" y="4" rx="2" />
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                      </div>
                      <div className="contact-card-text">
                        <small>CORPORATE EMAIL</small>
                        <a href={`mailto:${site_info.email}`} className="contact-link">
                          <strong>{site_info.email}</strong>
                        </a>
                      </div>
                    </div>

                    <div className="contact-card">
                      <div className="contact-card-icon" aria-hidden="true">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                      </div>
                      <div className="contact-card-text">
                        <small>PRIMARY INVESTMENT CORRIDOR</small>
                        <strong>{site_info.address}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-panel" id="enquire">
                  <div className="form-heading">
                    <span>PROJECT ENQUIRY &amp; ALLOCATION FORM</span>
                    <small>
                      <b>*</b> Required fields
                    </small>
                  </div>
                  <EnquiryForm />
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* FOOTER */}
      <SiteFooter
        brandName={site_info.brandName}
        logoSrc={media.logo}
        address={site_info.address}
        phone={site_info.phone}
        email={site_info.email}
        socialLinks={social_links}
      />

      {/* FLOATING ACTION BAR FOR HIGH AD CONVERSIONS */}
      <FloatingContact
        phone={site_info.phone}
        whatsapp={site_info.whatsapp}
        brochureUrl={site_info.brochureUrl}
      />
    </>
  );
}
