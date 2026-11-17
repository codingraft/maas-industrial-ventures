"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);

  // Only override if it was the legacy mock factory photo from old seed data
  const isLegacyPhoto =
    logoSrc === "/images/hero-1.jpg" ||
    logoSrc === "/images/hero-2.jpg" ||
    logoSrc === "/images/overview.jpg";

  const resolvedLogo = isLegacyPhoto
    ? "/images/maas-logo-white.svg"
    : (logoSrc || "/images/maas-logo-white.svg");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      document.body.classList.add("menu-open");
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.classList.remove("menu-open");
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.classList.remove("menu-open");
    };
  }, [menuOpen]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && menuOpen) {
        setMenuOpen(false);
      }
    }
    function onResize() {
      if (window.innerWidth > 768 && menuOpen) {
        setMenuOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
    };
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

  const handleOpenConsultation = () => {
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
  };

  return (
    <>
      <header className={`site-header ${scrolled ? "is-scrolled" : ""} ${menuOpen ? "menu-open" : ""}`}>
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

        {/* Mobile Hamburger Trigger */}
        <button
          className="menu-toggle"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span />
          <span />
        </button>

        {/* Desktop Navigation */}
        <nav className="site-header-nav site-header-nav-desktop" aria-label="Main navigation">
          {visibleNav.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
          {phone && (
            <a className="nav-phone" href={`tel:${phone}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "6px" }}>
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              {phone}
            </a>
          )}
          <button
            type="button"
            className="nav-cta"
            onClick={handleOpenConsultation}
            data-enquiry-trigger
            data-enquiry-title="Schedule Consultation & Site Visit"
          >
            Schedule Site Visit <Arrow diagonal />
          </button>
        </nav>
      </header>

      {/* Full-Screen Mobile Navigation Drawer (Portaled directly to <body> for zero clipping) */}
      {mounted &&
        createPortal(
          <div
            className={`mobile-nav-portal ${menuOpen ? "is-open" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Drawer"
          >
            <div className="mobile-nav-header">
              <Link href="/" onClick={() => setMenuOpen(false)} className="mobile-nav-brand">
                <Image
                  src={resolvedLogo}
                  alt={`${brandName} Logo`}
                  width={200}
                  height={56}
                  priority
                  unoptimized={resolvedLogo.endsWith(".svg") || resolvedLogo.startsWith("data:")}
                  className="brand-logo-img"
                />
              </Link>
              <button
                className="mobile-nav-close-btn"
                onClick={() => setMenuOpen(false)}
                aria-label="Close navigation"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="mobile-nav-body">
              <div className="mobile-nav-links">
                {visibleNav.map((item, index) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="mobile-nav-link"
                    onClick={() => setMenuOpen(false)}
                  >
                    <span className="mobile-nav-link-num">0{index + 1}</span>
                    <span className="mobile-nav-link-text">{item.label}</span>
                    <span className="mobile-nav-link-arrow">→</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="mobile-nav-footer">
              {phone && (
                <a className="mobile-nav-phone" href={`tel:${phone}`} onClick={() => setMenuOpen(false)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span>{phone}</span>
                </a>
              )}

              <button
                type="button"
                className="mobile-nav-cta"
                onClick={handleOpenConsultation}
                data-enquiry-trigger
                data-enquiry-title="Schedule Consultation & Site Visit"
              >
                Schedule Site Visit <Arrow diagonal />
              </button>

              <div className="mobile-nav-brand-footer">
                <span className="mobile-nav-brand-name">{brandName}</span>
                <span className="mobile-nav-brand-desc">Industrial Parks & Plotted Infrastructure</span>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
