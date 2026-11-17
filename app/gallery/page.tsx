import { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FloatingContact } from "@/components/FloatingContact";
import { ProjectGallery } from "@/components/ProjectGallery";
import { Arrow } from "@/components/ui/Arrow";
import { getAllSettings } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Site Progress & Infrastructure Gallery | MAAS Industrial Ventures",
  description:
    "Real site photographs and visual documentation of Gayatri Industrial Park (Bhojpur), Shri Balaji Industrial Park (Hapur), RCC internal roads, and industrial operations.",
  keywords: [
    "Gayatri Industrial Park photos",
    "Shri Balaji Industrial Park site pictures",
    "industrial plot demarcation photos",
    "MAAS Industrial Ventures gallery",
  ],
  alternates: {
    canonical: "https://maasventures.com/gallery",
  },
};

export default async function GalleryPage() {
  const settings = await getAllSettings();
  const { site_info, sections, media, social_links } = settings;

  return (
    <>
      <SiteHeader
        brandName={site_info.brandName}
        logoSrc={media.logo}
        phone={site_info.phone}
        sections={sections}
      />

      <main className="gallery-dedicated-page" id="top">
        {/* Gallery Dedicated Hero */}
        <section className="gallery-hero-section page-wrap">
          <div className="section-label">
            <span>01</span> / Visual Records &amp; Ground Evidence
          </div>
          <p className="eyebrow">{site_info.galleryEyebrow || "Project Visuals & Site Progress"}</p>
          <h1 className="gallery-hero-heading">
            {site_info.galleryHeadline || "Site Progress & Infrastructure Gallery."}
          </h1>
          <p className="gallery-hero-lead">
            {site_info.galleryDescription ||
              "Real site photographs and clearly identified visual records of Gayatri Industrial Park, Shri Balaji Industrial Park, engineered concrete road networks, and operational enterprise facilities."}
          </p>
        </section>

        {/* Full Gallery Component */}
        <section className="gallery-showcase-section">
          <ProjectGallery
            images={media.gallery}
            categories={media.galleryCategories}
            pageSize={9}
          />
        </section>

        {/* Guided Physical Site Visit Banner */}
        <section className="gallery-visit-banner page-wrap">
          <div className="visit-card">
            <div className="visit-copy">
              <span className="eyebrow">On-Ground Verification</span>
              <h2>Experience the Infrastructure Standards First-Hand.</h2>
              <p>
                We welcome investors, business owners, and manufacturing leaders to inspect completed plot corner demarcation, road cross-sections, and utility feeder connections in person.
              </p>
              <div className="visit-perks-row">
                <span className="visit-perk">✓ Accompanied by Site Engineers</span>
                <span className="visit-perk">✓ Physical Plot Boundary Walkthrough</span>
                <span className="visit-perk">✓ Subsidies &amp; Zoning Document Review</span>
              </div>
            </div>

            <div className="visit-actions">
              <button
                type="button"
                className="button button-gold"
                data-enquiry-trigger
                data-enquiry-title="Schedule In-Person Site Inspection"
                data-enquiry-req="Physical Site Inspection"
              >
                Schedule Site Inspection <Arrow diagonal />
              </button>
              <Link href="/contact" className="button button-outline-light">
                Direct Contact Desk <Arrow />
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
