"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
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

  // Only override if it was the legacy mock factory photo from old seed data
  const isLegacyPhoto =
    logoSrc === "/images/hero-1.jpg" ||
    logoSrc === "/images/hero-2.jpg" ||
    logoSrc === "/images/overview.jpg";

  const resolvedLogo = isLegacyPhoto
    ? "/images/maas-logo-white.svg"
    : (logoSrc || "/images/maas-logo-white.svg");

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
    { label: "About", href: "/about", key: "overview" },
    { label: "Projects", href: "/projects", key: "projects" },
    { label: "Gallery", href: "/gallery", key: "gallery" },
    { label: "Blog", href: "/blog", key: "blog" },
    { label: "Contact", href: "/contact", key: "contact" },
  ];

  // Filter items based on active sections (if provided, otherwise show)
  const visibleNav = navItems.filter(
    (item) => sections[item.key] === undefined || sections[item.key] === true
  );

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      {/* <a href="/" className="brand" aria-label={`${brandName} Home`}> */}
      <Link href="/">
        <div className="brand-logo-wrap">
          <Image
            src={resolvedLogo}
            alt={`${brandName} Logo`}
            width={240}
            height={68}
            priority
            unoptimized={resolvedLogo.endsWith(".svg") || resolvedLogo.startsWith("data:")}
            className="brand-logo-img"
          />
        </div>
      </Link>
      {/* </a> */}

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
          <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
            {item.label}
          </Link>
        ))}
        {phone && (
          <a className="nav-phone" href={`tel:${phone}`} onClick={() => setMenuOpen(false)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "6px" }}>
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            {phone}
          </a>
        )}
        <button
          type="button"
          className="nav-cta"
          onClick={() => {
            setMenuOpen(false);
            if (typeof window !== "undefined") {
              window.dispatchEvent(
                new CustomEvent("open-enquiry-modal", {
                  detail: {
                    title: "Schedule Consultation & Site Visit",
                    requirement: "Industrial Land",
                  },
                })
              );
            }
          }}
          data-enquiry-trigger
          data-enquiry-title="Schedule Consultation & Site Visit"
        >
          Schedule Site Visit <Arrow diagonal />
        </button>
      </nav>
    </header>
  );
}
