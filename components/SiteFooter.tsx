import Link from "next/link";
import Image from "next/image";

interface SiteFooterProps {
  brandName?: string;
  logoSrc?: string;
  address?: string;
  phone?: string;
  email?: string;
  socialLinks?: {
    linkedin?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
    youtube?: string;
  };
}

export function SiteFooter({
  brandName = "MAAS INDUSTRIAL VENTURES",
  logoSrc = "/images/maas-logo-white.svg",
  address = "Bhojpur, Modinagar / Hapur–Modinagar Road, Uttar Pradesh",
  phone = "+91 98765 43210",
  email = "enquiry@maasventures.com",
  socialLinks = {},
}: SiteFooterProps) {
  const currentYear = new Date().getFullYear();

  const resolvedLogo =
    logoSrc.endsWith(".jpg") || logoSrc.endsWith(".jpeg")
      ? "/images/maas-logo-white.svg"
      : logoSrc || "/images/maas-logo-white.svg";

  return (
    <footer className="footer" id="footer" aria-label="Footer navigation">
      {/* Top Footer Section */}
      <div className="page-wrap footer-top-grid">
        <div className="footer-brand-col">
          <Link href="/" className="brand brand-footer" aria-label={`${brandName} Home`}>
            <div className="brand-logo-wrap">
              <Image
                src={resolvedLogo}
                alt={brandName}
                width={240}
                height={68}
                style={{ height: "46px", width: "auto" }}
                unoptimized={resolvedLogo.endsWith(".svg") || resolvedLogo.startsWith("data:")}
              />
            </div>
          </Link>
          <p className="footer-tagline">
            Developing Land. Building Opportunities. Creating thoughtfully planned industrial hubs and residential developments engineered for sustainable enterprise growth.
          </p>
          <div className="footer-contact-quick">
            <a href={`tel:${phone}`} className="footer-quick-link">
              <span className="quick-icon" aria-hidden="true">📞</span> {phone}
            </a>
            <a href={`mailto:${email}`} className="footer-quick-link">
              <span className="quick-icon" aria-hidden="true">✉️</span> {email}
            </a>
            <p className="footer-quick-address">
              <span className="quick-icon" aria-hidden="true">📍</span> {address}
            </p>
          </div>
        </div>

        <div className="footer-links-col">
          <h4 className="footer-col-title">Navigation</h4>
          <ul className="footer-nav-list">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/about">About MAAS</Link></li>
            <li><Link href="/projects">Development Projects</Link></li>
            <li><Link href="/gallery">Site Gallery</Link></li>
            <li><Link href="/blog">Research &amp; Insights</Link></li>
            <li><Link href="/contact">Contact Advisory</Link></li>
          </ul>
        </div>

        <div className="footer-links-col">
          <h4 className="footer-col-title">Active Projects</h4>
          <ul className="footer-nav-list">
            <li><Link href="/projects/gayatri-industrial-park">Gayatri Industrial Park</Link></li>
            <li><Link href="/projects/shri-balaji-industrial-park">Shri Balaji Industrial Park</Link></li>
            <li><Link href="/about#verticals">Industrial Plots</Link></li>
            <li><Link href="/about#verticals">Residential Developments</Link></li>
            <li><Link href="/contact">Book Site Inspection</Link></li>
          </ul>
        </div>

        <div className="footer-links-col">
          <h4 className="footer-col-title">Statutory &amp; Policies</h4>
          <ul className="footer-nav-list">
            <li><Link href="/blog/uttar-pradesh-msme-promotion-policy-2022-subsidies-benefits">UP MSME Policy 2022</Link></li>
            <li><Link href="/blog/delhi-meerut-expressway-industrial-corridor-growth">Delhi–Meerut Corridor</Link></li>
            <li><Link href="/blog/industrial-plot-buying-checklist-infrastructure-demarcation">Demarcation &amp; Approvals</Link></li>
            <li><Link href="/admin">Portal Login</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom Legal Bar */}
      <div className="page-wrap footer-bottom">
        <span>
          © {currentYear} {brandName} Pvt. Limited. All rights reserved.
        </span>
        <div className="footer-legal">
          {socialLinks.linkedin && (
            <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          )}
          {socialLinks.instagram && (
            <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
          )}
          {socialLinks.facebook && (
            <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer">
              Facebook
            </a>
          )}
          {socialLinks.twitter && (
            <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer">
              Twitter
            </a>
          )}
          <Link href="/contact">Legal Disclaimer</Link>
          <a href="#top" className="back-top">
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
