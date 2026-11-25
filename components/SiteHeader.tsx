"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const drawer = useRef<HTMLDivElement>(null);

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
    let ticking = false;
    const update = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 24);
          ticking = false;
        });
        ticking = true;
      }
    };
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
    if (!menuOpen) return;
    const panel = drawer.current;
    const trigger = menuButton.current;
    panel?.querySelector<HTMLButtonElement>("button")?.focus();
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuOpen(false);
      }
      if (e.key !== "Tab" || !panel) return;
      const controls = panel.querySelectorAll<HTMLElement>("a[href], button:not(:disabled)");
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
    function onResize() {
      if (window.innerWidth > 1024 && menuOpen) {
        setMenuOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
      if (document.activeElement === document.body || panel?.contains(document.activeElement)) trigger?.focus();
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
        <div className="site-header-inner">
          <Link href="/" className="brand-logo-link" aria-label={`${brandName} Home`}>
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
            ref={menuButton}
            aria-controls="mobile-navigation"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span />
            <span />
          </button>

          {/* Desktop Navigation */}
          <nav className="site-header-nav site-header-nav-desktop" aria-label="Main navigation">
            <div className="site-header-links">
              {visibleNav.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href || pathname?.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`site-header-link ${isActive ? "is-active" : ""}`}
                  >
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="site-header-actions">
              {phone && (
                <a className="nav-phone" href={`tel:${phone}`} title="Call Advisory Desk">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span>{phone}</span>
                </a>
              )}
              <button
                type="button"
                className="nav-cta"
                onClick={handleOpenConsultation}
                data-enquiry-trigger
                data-enquiry-title="Schedule Consultation & Site Visit"
              >
                <span>Schedule Site Visit</span>
                <Arrow diagonal />
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Full-Screen Mobile Navigation Drawer (Portaled directly to <body> for zero clipping) */}
      {mounted &&
        createPortal(
          <div
            id="mobile-navigation"
            ref={drawer}
            inert={!menuOpen}
            className={`mobile-nav-portal ${menuOpen ? "is-open" : ""}`}
            role="dialog"
            aria-modal={menuOpen || undefined}
            aria-label="Mobile Navigation Drawer"
          >
            <div className="mobile-nav-header">
              <Link href="/" onClick={() => setMenuOpen(false)} className="mobile-nav-brand">
                <Image
                  src={resolvedLogo}
                  alt={`${brandName} Logo`}
                  width={200}
                  height={56}
                  loading="lazy"
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
                {visibleNav.map((item, index) => {
                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname === item.href || pathname?.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`mobile-nav-link ${isActive ? "is-active" : ""}`}
                      onClick={() => setMenuOpen(false)}
                    >
                      <span className="mobile-nav-link-num">0{index + 1}</span>
                      <span className="mobile-nav-link-text">{item.label}</span>
                      <span className="mobile-nav-link-arrow">→</span>
                    </Link>
                  );
                })}
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
                <span>Schedule Site Visit</span>
                <Arrow diagonal />
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
