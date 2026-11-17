import { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FloatingContact } from "@/components/FloatingContact";
import { EnquiryForm } from "@/components/EnquiryForm";
import { FaqSection } from "@/components/FaqSection";
import { getAllSettings, defaultContent } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact & Project Allocation Desk | MAAS Industrial Ventures",
  description:
    "Direct contact desk for plot availability, physical site inspections, master plan blueprints, and UP MSME policy subsidy documentation at MAAS Industrial Ventures.",
  keywords: [
    "Contact MAAS Industrial Ventures",
    "industrial plot inquiry Modinagar",
    "site visit industrial park Hapur",
    "MAAS phone number email",
  ],
  alternates: {
    canonical: "https://maasventures.com/contact",
  },
};

export default async function ContactPage() {
  const settings = await getAllSettings();
  const { site_info, sections, media, social_links, content } = settings;

  const cleanWaNumber = (num: string) => {
    const digits = num.replace(/\D/g, "");
    if (digits.length === 10) return "91" + digits;
    return digits;
  };

  const waLink = `https://wa.me/${cleanWaNumber(site_info.whatsapp)}?text=${encodeURIComponent(
    "Hello MAAS Industrial Ventures, I am interested in exploring industrial land opportunities and scheduling a site inspection."
  )}`;

  return (
    <>
      <SiteHeader
        brandName={site_info.brandName}
        logoSrc={media.logo}
        phone={site_info.phone}
        sections={sections}
      />

      <main className="contact-dedicated-page" id="top">
        {/* Contact Hero Header */}
        <section className="contact-hero-section page-wrap">
          <div className="section-label">
            <span>01</span> / Direct Contact &amp; Consultations
          </div>
          <p className="eyebrow">{site_info.contactEyebrow || "Inbound Project Allocation Desk"}</p>
          <h1 className="contact-hero-heading">
            {site_info.contactHeadline || "Get in Touch & Request Details."}
          </h1>
          <p className="contact-hero-lead">
            {site_info.contactDescription ||
              "Connect with MAAS Industrial Ventures to explore plot availability, schedule physical site visits at Gayatri or Shri Balaji Industrial Park, or request government policy subsidy documentation."}
          </p>
        </section>

        {/* Contact Grid (Cards on Left + Form on Right) */}
        <section className="contact-main-section page-wrap" id="contact">
          <div className="contact-page-grid">
            {/* Left Contact Coordinates Column */}
            <div className="contact-details-col">
              <h2 className="contact-col-title">Corporate Headquarters &amp; Allocation Desk</h2>
              <p className="contact-col-intro">
                Our executive advisory desk assists manufacturers, logistics operators, and real estate investors with verified statutory documentation and tailored space configurations.
              </p>

              <div className="contact-cards-stack">
                {/* Phone Card */}
                <div className="contact-feature-card">
                  <div className="card-icon-badge" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                  <div className="card-detail-info">
                    <small>DIRECT TELEPHONE</small>
                    <a href={`tel:${site_info.phone}`} className="card-action-link">
                      <strong>{site_info.phone}</strong>
                    </a>
                    <span>Direct line to senior project managers</span>
                  </div>
                </div>

                {/* WhatsApp Card */}
                <div className="contact-feature-card">
                  <div className="card-icon-badge icon-whatsapp" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 6.46 17.5 2 12.04 2M12.05 20.16C10.57 20.16 9.12 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.68 12.05 3.68C14.25 3.68 16.32 4.54 17.88 6.1C19.44 7.66 20.3 9.72 20.3 11.92C20.29 16.46 16.6 20.16 12.05 20.16Z" />
                    </svg>
                  </div>
                  <div className="card-detail-info">
                    <small>WHATSAPP CONSULTATION</small>
                    <a href={waLink} target="_blank" rel="noopener noreferrer" className="card-action-link">
                      <strong>Chat Directly on WhatsApp →</strong>
                    </a>
                    <span>Instant document sharing &amp; location pin</span>
                  </div>
                </div>

                {/* Email Card */}
                <div className="contact-feature-card">
                  <div className="card-icon-badge" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </div>
                  <div className="card-detail-info">
                    <small>CORPORATE EMAIL</small>
                    <a href={`mailto:${site_info.email}`} className="card-action-link">
                      <strong>{site_info.email}</strong>
                    </a>
                    <span>Technical dossiers &amp; statutory inquiries</span>
                  </div>
                </div>

                {/* Address Card */}
                <div className="contact-feature-card">
                  <div className="card-icon-badge" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div className="card-detail-info">
                    <small>DEVELOPMENT CORRIDOR</small>
                    <strong>{site_info.address}</strong>
                    <span>Bhojpur, Modinagar &amp; Hapur–Modinagar Road</span>
                  </div>
                </div>
              </div>

              {/* Advisory Desk Guarantee */}
              <div className="desk-guarantee-box">
                <span className="guarantee-icon" aria-hidden="true">⏱️</span>
                <div>
                  <strong>Fast-Track Consultation Response</strong>
                  <p>Inbound plot requirement submissions are assigned to a dedicated project engineer within 2 business hours.</p>
                </div>
              </div>
            </div>

            {/* Right Allocation Form Card */}
            <div className="contact-form-col">
              <div className="contact-form-panel">
                <div className="panel-heading">
                  <span className="panel-title">Project Enquiry &amp; Allocation Form</span>
                  <small className="panel-req-note"><b>*</b> Required fields</small>
                </div>
                <EnquiryForm />
              </div>
            </div>
          </div>
        </section>

        {/* Common FAQ Accordion Section */}
        <section className="contact-faq-wrap">
          <FaqSection
            faqs={content?.faqs?.length ? content.faqs : defaultContent.faqs}
            sectionNumber="02"
            headline="Common Statutory &amp; Space Inquiries."
            description="Clear answers to plot allocation, road specifications, and state subsidy guidelines."
          />
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
