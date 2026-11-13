"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Arrow } from "@/components/ui/Arrow";

interface SiteHeaderProps {
  brandName?: string;
  logoSrc?: string;
  phone?: string;
  sections?: Record<string, boolean>;
}

export function SiteHeader({
  brandName = "MAAS INDUSTRIAL VENTURES",
  logoSrc = "/images/maas-logo-white.svg",
  phone = "+91 98765 43210",
  sections = {},
}: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // If a legacy jpeg was passed in from database, upgrade to the transparent SVG
  const resolvedLogo =
    logoSrc.endsWith(".jpg") || logoSrc.endsWith(".jpeg")
      ? "/images/maas-logo-white.svg"
      : logoSrc;

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);
    return () => document.body.classList.remove("menu-open");
  }, [menuOpen]);

  const navItems = [
    { label: "Overview", href: "#overview", key: "overview" },
    { label: "Infrastructure", href: "#infrastructure", key: "infrastructure" },
    { label: "Master Plan", href: "#master-plan", key: "masterplan" },
    { label: "Location", href: "#location", key: "location" },
    { label: "Gallery", href: "#gallery", key: "gallery" },
    { label: "Timeline", href: "#timeline", key: "timeline" },
    { label: "FAQs", href: "#faqs", key: "faq" },
  ];

  // Filter items based on active sections (if provided, otherwise show)
  const visibleNav = navItems.filter(
    (item) => sections[item.key] === undefined || sections[item.key] === true
  );

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <a href="#top" className="brand" aria-label={`${brandName} Home`}>
        <div className="brand-logo-wrap">
          <Image
            src={resolvedLogo}
            alt="MAAS Industrial Ventures Logo"
            width={240}
            height={68}
            priority
            className="brand-logo-img"
          />
        </div>
      </a>

      <button
        className="menu-toggle"
        aria-label={menuOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span />
        <span />
      </button>

      <nav className={menuOpen ? "nav-open" : ""} aria-label="Main navigation">
        {visibleNav.map((item) => (
          <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
            {item.label}
          </a>
        ))}
        {phone && (
          <a className="nav-phone" href={`tel:${phone}`} onClick={() => setMenuOpen(false)}>
            📞 {phone}
          </a>
        )}
        <a className="nav-cta" href="#enquire" onClick={() => setMenuOpen(false)}>
          Request Details <Arrow diagonal />
        </a>
      </nav>
    </header>
  );
}
