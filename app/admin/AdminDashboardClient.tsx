"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { SiteSettings } from "@/lib/types";
import { LeadsTable } from "@/components/admin/LeadsTable";
import { SectionToggles, sectionDefinitions } from "@/components/admin/SectionToggles";
import { ContentManager } from "@/components/admin/ContentManager";
import { ContactSocialForm } from "@/components/admin/ContactSocialForm";
import { TrackingConfig } from "@/components/admin/TrackingConfig";
import { SeoManager } from "@/components/admin/SeoManager";
import { TableSkeleton, CardSkeleton } from "@/components/admin/ui/AdminSkeleton";

// Dynamically code-split heavy studio managers so initial /admin leads page load is lightweight
const ProjectsManager = dynamic(
  () => import("@/components/admin/ProjectsManager").then((m) => m.ProjectsManager),
  {
    ssr: false,
    loading: () => <CardSkeleton />,
  }
);

const BlogManager = dynamic(
  () => import("@/components/admin/BlogManager").then((m) => m.BlogManager),
  {
    ssr: false,
    loading: () => <TableSkeleton rows={6} cols={5} />,
  }
);

const SectionImageManager = dynamic(
  () => import("@/components/admin/SectionImageManager").then((m) => m.SectionImageManager),
  {
    ssr: false,
    loading: () => <CardSkeleton />,
  }
);

const MediaLibrary = dynamic(
  () => import("@/components/admin/MediaLibrary").then((m) => m.MediaLibrary),
  {
    ssr: false,
    loading: () => <CardSkeleton />,
  }
);

export type AdminTab =
  | "leads"
  | "projects"
  | "blogs"
  | "media_library"
  | "media"
  | "content"
  | "sections"
  | "contact"
  | "tracking"
  | "seo";

const VALID_TABS: AdminTab[] = [
  "leads",
  "projects",
  "blogs",
  "media_library",
  "media",
  "content",
  "sections",
  "contact",
  "tracking",
  "seo",
];

interface AdminDashboardClientProps {
  initialSettings: SiteSettings;
  metrics: {
    totalLeads: number;
    newLeads: number;
    todayLeads: number;
  };
}

export function AdminDashboardClient({
  initialSettings,
  metrics,
}: AdminDashboardClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>("leads");
  const [settings, setSettings] = useState(initialSettings);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const drawer = useRef<HTMLElement>(null);
  const openButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!sidebarOpen) return;
    const panel = drawer.current;
    const trigger = openButton.current;
    const media = window.matchMedia("(max-width: 900px)");
    const closeOnDesktop = () => { if (!media.matches) setSidebarOpen(false); };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel?.querySelector<HTMLButtonElement>(".admin-sidebar-close")?.focus();
    media.addEventListener("change", closeOnDesktop);
    return () => {
      media.removeEventListener("change", closeOnDesktop);
      document.body.style.overflow = previousOverflow;
      trigger?.focus({ preventScroll: true });
    };
  }, [sidebarOpen]);

  // Sync active tab with URL query parameter & browser history
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab") as AdminTab | null;
    if (tabParam && VALID_TABS.includes(tabParam)) {
      setActiveTab(tabParam);
    }

    const savedCollapsed = localStorage.getItem("maas_admin_sidebar_collapsed");
    if (savedCollapsed === "true") {
      setSidebarCollapsed(true);
    }

    const handlePopState = () => {
      const currentParams = new URLSearchParams(window.location.search);
      const currentTab = currentParams.get("tab") as AdminTab | null;
      if (currentTab && VALID_TABS.includes(currentTab)) {
        setActiveTab(currentTab);
      } else {
        setActiveTab("leads");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function handleTabChange(tab: AdminTab) {
    setActiveTab(tab);
    setSidebarOpen(false);

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("edit");
      url.searchParams.delete("action");
      if (tab === "leads") {
        url.searchParams.delete("tab");
      } else {
        url.searchParams.set("tab", tab);
      }
      if (url.href !== window.location.href) window.history.pushState({}, "", url.toString());
      document.querySelector(".admin-main-wrap")?.scrollTo(0, 0);
      window.scrollTo(0, 0);
    }
  }

  function toggleSidebarCollapsed() {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("maas_admin_sidebar_collapsed", String(next));
      return next;
    });
  }

  async function handleLogout() {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch {
      router.push("/admin/login");
    }
  }

  async function updateSettings(patch: Partial<SiteSettings>) {
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error("Failed to update setting");
    const data = await res.json();
    setSettings(data.settings);
  }

  function updateSettingPart<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    return updateSettings({ [key]: value });
  }

  const activeSectionsCount = sectionDefinitions.filter(({ key }) => settings.sections[key]).length;

  const tabLabels: Record<AdminTab, { title: string; category: string; description: string; icon: string }> = {
    leads: {
      title: "Leads & Inquiries",
      category: "Operations",
      description: "Manage incoming buyer enquiries, lead qualification stages, and follow-ups.",
      icon: "👥",
    },
    projects: {
      title: "Projects Portfolio",
      category: "Operations",
      description: "Manage industrial township developments, master specifications, and brochures.",
      icon: "🏗️",
    },
    blogs: {
      title: "Blog & Insights",
      category: "Operations",
      description: "Publish market updates, investment guides, and SEO-optimized articles.",
      icon: "📰",
    },
    media_library: {
      title: "Media Library",
      category: "Operations",
      description: "Centralized storage for all uploaded banners, project photos, and blueprints.",
      icon: "📁",
    },
    content: {
      title: "Page Content & Copy",
      category: "Website Content",
      description: "Edit headline copy, core propositions, development verticals, and FAQs.",
      icon: "✍️",
    },
    media: {
      title: "Visuals & Blueprints",
      category: "Website Content",
      description: "Configure homepage hero carousel slides, section photos, and gallery categories.",
      icon: "🖼️",
    },
    sections: {
      title: "Section Toggles",
      category: "Website Content",
      description: "Turn homepage sections on or off to customize the live layout.",
      icon: "⚡",
    },
    contact: {
      title: "Company & Contact",
      category: "Configuration",
      description: "Update official contact details, physical office location, and social media channels.",
      icon: "📞",
    },
    seo: {
      title: "SEO & Social Share",
      category: "Configuration",
      description: "Configure search engine titles, meta descriptions, and OpenGraph preview cards.",
      icon: "🔍",
    },
    tracking: {
      title: "Analytics & Pixels",
      category: "Configuration",
      description: "Manage Google Tag Manager, Meta Pixel, and conversion tracking IDs.",
      icon: "📊",
    },
  };

  return (
    <div className="admin-app-layout">
      {/* Backdrop for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Left-Side Navigation Sidebar */}
      <aside
        id="admin-navigation" ref={drawer}
        aria-label="Admin navigation" role={sidebarOpen ? "dialog" : undefined} aria-modal={sidebarOpen || undefined}
        onKeyDown={event => {
          if (!sidebarOpen) return;
          if (event.key === "Escape") setSidebarOpen(false);
          if (event.key !== "Tab") return;
          const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("a[href], button")).filter(el => el.offsetWidth > 0);
          const first = controls[0], last = controls[controls.length - 1];
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
          if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        }}
        className={`admin-sidebar ${sidebarOpen ? "is-open" : ""} ${
          sidebarCollapsed && !sidebarOpen ? "is-collapsed" : ""
        }`}
      >
        {/* Brand Header */}
        <div className="admin-sidebar-header">
          <a href="/admin" className="admin-sidebar-logo" title="MAAS Admin Dashboard">
            {sidebarCollapsed && !sidebarOpen ? (
              <div className="admin-sidebar-collapsed-monogram" aria-label="MAAS">
                M
              </div>
            ) : (
              <Image
                src="/images/maas-logo-white.svg"
                alt="MAAS Industrial Ventures"
                width={170}
                height={38}
                priority
                style={{ width: "auto", height: "30px", objectFit: "contain" }}
              />
            )}
          </a>
          <button
            type="button"
            className="admin-sidebar-close mobile-only"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="admin-sidebar-nav">
          {/* Group 1: Operations */}
          <div className="sidebar-group-label">Operations</div>

          <button
            type="button"
            className={`sidebar-nav-item ${activeTab === "leads" ? "is-active" : ""}`}
            aria-current={activeTab === "leads" ? "page" : undefined}
            onClick={() => handleTabChange("leads")}
            title="Leads & Inquiries CRM"
          >
            <span className="sidebar-item-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </span>
            <span className="sidebar-item-label">Leads &amp; Inquiries</span>
            {metrics.totalLeads > 0 && (
              <span className="sidebar-item-badge">{metrics.totalLeads}</span>
            )}
          </button>

          <button
            type="button"
            className={`sidebar-nav-item ${activeTab === "projects" ? "is-active" : ""}`}
            aria-current={activeTab === "projects" ? "page" : undefined}
            onClick={() => handleTabChange("projects")}
            title="Projects Portfolio"
          >
            <span className="sidebar-item-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18" />
                <path d="M5 21V7l8-4v18" />
                <path d="M19 21V11l-6-3" />
                <path d="M9 9h1" />
                <path d="M9 13h1" />
                <path d="M9 17h1" />
              </svg>
            </span>
            <span className="sidebar-item-label">Projects Portfolio</span>
          </button>

          <button
            type="button"
            className={`sidebar-nav-item ${activeTab === "blogs" ? "is-active" : ""}`}
            aria-current={activeTab === "blogs" ? "page" : undefined}
            onClick={() => handleTabChange("blogs")}
            title="Blog & Insights"
          >
            <span className="sidebar-item-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                <path d="M6 6h10" />
                <path d="M6 10h10" />
              </svg>
            </span>
            <span className="sidebar-item-label">Blog &amp; Insights</span>
          </button>

          <button
            type="button"
            className={`sidebar-nav-item ${activeTab === "media_library" ? "is-active" : ""}`}
            aria-current={activeTab === "media_library" ? "page" : undefined}
            onClick={() => handleTabChange("media_library")}
            title="Media Asset Library"
          >
            <span className="sidebar-item-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
            </span>
            <span className="sidebar-item-label">Media Library</span>
          </button>

          {/* Group 2: Website Content */}
          <div className="sidebar-group-label" style={{ marginTop: "14px" }}>Website Content</div>

          <button
            type="button"
            className={`sidebar-nav-item ${activeTab === "content" ? "is-active" : ""}`}
            aria-current={activeTab === "content" ? "page" : undefined}
            onClick={() => handleTabChange("content")}
            title="Page Content & Headings"
          >
            <span className="sidebar-item-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </span>
            <span className="sidebar-item-label">Page Content &amp; Copy</span>
          </button>

          <button
            type="button"
            className={`sidebar-nav-item ${activeTab === "media" ? "is-active" : ""}`}
            aria-current={activeTab === "media" ? "page" : undefined}
            onClick={() => handleTabChange("media")}
            title="Visuals & Blueprints Studio"
          >
            <span className="sidebar-item-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </span>
            <span className="sidebar-item-label">Visuals &amp; Blueprints</span>
          </button>

          <button
            type="button"
            className={`sidebar-nav-item ${activeTab === "sections" ? "is-active" : ""}`}
            aria-current={activeTab === "sections" ? "page" : undefined}
            onClick={() => handleTabChange("sections")}
            title="Section Toggles"
          >
            <span className="sidebar-item-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="12" x="3" y="6" rx="6" ry="6" />
                <circle cx="9" cy="12" r="3" />
              </svg>
            </span>
            <span className="sidebar-item-label">Section Toggles</span>
            <span className="sidebar-item-count">{activeSectionsCount}/{sectionDefinitions.length}</span>
          </button>

          {/* Group 3: Configuration */}
          <div className="sidebar-group-label" style={{ marginTop: "14px" }}>Configuration</div>

          <button
            type="button"
            className={`sidebar-nav-item ${activeTab === "contact" ? "is-active" : ""}`}
            aria-current={activeTab === "contact" ? "page" : undefined}
            onClick={() => handleTabChange("contact")}
            title="Company & Contact"
          >
            <span className="sidebar-item-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </span>
            <span className="sidebar-item-label">Company &amp; Contact</span>
          </button>

          <button
            type="button"
            className={`sidebar-nav-item ${activeTab === "seo" ? "is-active" : ""}`}
            aria-current={activeTab === "seo" ? "page" : undefined}
            onClick={() => handleTabChange("seo")}
            title="SEO & Social Meta"
          >
            <span className="sidebar-item-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </span>
            <span className="sidebar-item-label">SEO &amp; Social Share</span>
          </button>

          <button
            type="button"
            className={`sidebar-nav-item ${activeTab === "tracking" ? "is-active" : ""}`}
            aria-current={activeTab === "tracking" ? "page" : undefined}
            onClick={() => handleTabChange("tracking")}
            title="Analytics & Ad Pixels"
          >
            <span className="sidebar-item-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </span>
            <span className="sidebar-item-label">Analytics &amp; Pixels</span>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="admin-sidebar-footer">
          <div className="sidebar-user-card">
            <div className="sidebar-user-avatar">AD</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">Administrator</div>
              <div className="sidebar-user-role">MAAS Ventures</div>
            </div>
            <button
              type="button"
              className="sidebar-logout-btn"
              onClick={handleLogout}
              title="Sign Out"
              aria-label="Sign Out"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" x2="9" y1="12" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div inert={sidebarOpen} className={`admin-main-wrap ${sidebarCollapsed ? "sidebar-is-collapsed" : ""}`}>
        {/* Sleek Executive Topbar */}
        <header className="admin-minimal-topbar">
          <div className="topbar-left">
            {/* Mobile Drawer Toggle */}
            <button
              type="button"
              className="sidebar-toggle-btn mobile-only"
              onClick={() => setSidebarOpen(true)}
              ref={openButton} aria-expanded={sidebarOpen} aria-controls="admin-navigation"
              aria-label="Open navigation sidebar"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </button>

            {/* Desktop Sidebar Collapse Toggle */}
            <button
              type="button"
              className="sidebar-collapse-toggle-btn desktop-only"
              onClick={toggleSidebarCollapsed}
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
              </svg>
            </button>

            {/* Clean Breadcrumb Hierarchy */}
            <nav className="topbar-breadcrumb-nav" aria-label="Breadcrumb">
              <span className="breadcrumb-root">Admin</span>
              <span className="breadcrumb-separator" aria-hidden="true">/</span>
              <span className="breadcrumb-category">{tabLabels[activeTab].category}</span>
              <span className="breadcrumb-separator" aria-hidden="true">/</span>
              <div className="breadcrumb-active-chip">
                <span className="active-chip-title">{tabLabels[activeTab].title}</span>
              </div>
            </nav>
          </div>

          <div className="topbar-actions">
            {/* Direct Link to Live Site */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="topbar-link-btn"
              title="Open public website in new tab"
            >
              <span>View Website</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h6v6" />
                <path d="M10 14 21 3" />
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              </svg>
            </a>

            {/* Quick Sign Out Action */}
            <button
              type="button"
              className="topbar-action-icon-btn desktop-only"
              onClick={handleLogout}
              title="Sign Out of Admin"
              aria-label="Sign Out"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" x2="9" y1="12" y2="12" />
              </svg>
            </button>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="admin-main-content">
          {/* KPI Metric Strip - Focused on the Leads & Inquiries Dashboard */}
          {activeTab === "leads" && (
            <section className="inbox-overview" aria-labelledby="inbox-title">
              <div className="inbox-masthead">
                <div>
                  <h1 id="inbox-title">Enquiry inbox</h1>
                  <p>Review buyer enquiries and follow up with interested businesses.</p>
                </div>
              </div>
            <div className="minimal-stats-strip">
              <div
                className="minimal-stat-card"
                title="Total Enquiries received across all channels"
              >
                <span className="minimal-stat-num">{metrics.totalLeads}</span>
                <span className="minimal-stat-lbl">Total Enquiries</span>
              </div>

              <div
                className="minimal-stat-card"
                title="New Uncontacted buyer leads"
              >
                <span className="minimal-stat-num">
                  {metrics.newLeads}
                </span>
                <span className="minimal-stat-lbl">New Uncontacted</span>
              </div>

              <div
                className="minimal-stat-card"
                title="Leads submitted in the past 24 hours"
              >
                <span className="minimal-stat-num">
                  {metrics.todayLeads}
                </span>
                <span className="minimal-stat-lbl">Past 24 Hours</span>
              </div>

              <button type="button"
                className="minimal-stat-card stats-link"
                onClick={() => handleTabChange("sections")}
                title="Click to manage Section Controls"
              >
                <span className="minimal-stat-num">
                  {activeSectionsCount}/{sectionDefinitions.length}
                </span>
                <span className="minimal-stat-lbl">Active Sections</span>
              </button>
            </div>
            </section>
          )}

          {/* Active Tab Panel */}
          <div className="admin-tab-body">
            {activeTab === "leads" && <LeadsTable />}

            {activeTab === "projects" && <ProjectsManager />}

            {activeTab === "blogs" && <BlogManager />}

            {activeTab === "media_library" && <MediaLibrary />}

            {activeTab === "media" && (
              <SectionImageManager
                initialMedia={settings.media}
                onUpdate={(next) => updateSettingPart("media", next)}
              />
            )}

            {activeTab === "content" && (
              <ContentManager
                settings={settings}
                onUpdate={updateSettings}
              />
            )}

            {activeTab === "sections" && (
              <SectionToggles
                initialSections={settings.sections}
                onUpdate={(next) => updateSettingPart("sections", next)}
              />
            )}

            {activeTab === "contact" && (
              <ContactSocialForm
                initialSiteInfo={settings.site_info}
                initialSocialLinks={settings.social_links}
                onUpdate={updateSettings}
              />
            )}

            {activeTab === "tracking" && (
              <TrackingConfig
                initialTracking={settings.tracking}
                onUpdate={(next) => updateSettingPart("tracking", next)}
              />
            )}

            {activeTab === "seo" && (
              <SeoManager
                initialSeo={settings.seo}
                media={settings.media}
                onUpdate={(next) => updateSettingPart("seo", next)}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
