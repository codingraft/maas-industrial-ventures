"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { SiteSettings } from "@/lib/types";
import { LeadsTable } from "@/components/admin/LeadsTable";
import { SectionToggles } from "@/components/admin/SectionToggles";
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
      if (tab === "leads") {
        url.searchParams.delete("tab");
      } else {
        url.searchParams.set("tab", tab);
      }
      window.history.pushState({}, "", url.toString());
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

  async function updateSettingPart<K extends keyof SiteSettings>(
    key: K,
    value: SiteSettings[K]
  ) {
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: value }),
    });
    if (!res.ok) throw new Error("Failed to update setting");
    const data = await res.json();
    setSettings(data.settings);
  }

  const activeSectionsCount = Object.values(settings.sections).filter(Boolean).length;

  const tabLabels: Record<AdminTab, { title: string; category: string }> = {
    leads: { title: "Leads CRM & Inquiries", category: "Overview & CRM" },
    projects: { title: "Projects & Landmark Developments", category: "Portfolio & Media" },
    blogs: { title: "Insights & News Blog Studio", category: "Editorial & Content" },
    media_library: { title: "Digital Asset & Media Library", category: "Portfolio & Media" },
    media: { title: "Section Media & Gallery Studio", category: "Portfolio & Media" },
    content: { title: "Township Content, Verticals & Vision", category: "Editorial & Content" },
    sections: { title: "Homepage Section Controls", category: "Site Architecture" },
    contact: { title: "Contact Information & Social Channels", category: "Site Architecture" },
    tracking: { title: "Ad Pixels, GTM & Analytics", category: "Marketing & Intelligence" },
    seo: { title: "SEO, Meta Tags & Social Share Previews", category: "Marketing & Intelligence" },
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
        className={`admin-sidebar ${sidebarOpen ? "is-open" : ""} ${
          sidebarCollapsed ? "is-collapsed" : ""
        }`}
      >
        {/* Brand Header */}
        <div className="admin-sidebar-header">
          <a href="/admin" className="admin-sidebar-logo">
            <Image
              src="/images/maas-logo-white.svg"
              alt="MAAS Industrial Ventures"
              width={180}
              height={44}
              priority
              style={{ width: "auto", height: sidebarCollapsed ? "24px" : "34px", objectFit: "contain" }}
            />
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
          <div className="sidebar-group-label">Overview &amp; Leads</div>

          <button
            type="button"
            className={`sidebar-nav-item ${activeTab === "leads" ? "is-active" : ""}`}
            onClick={() => handleTabChange("leads")}
            title="Leads & CRM"
          >
            <span className="sidebar-item-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </span>
            <span className="sidebar-item-label">Leads &amp; CRM</span>
            {metrics.totalLeads > 0 && (
              <span className="sidebar-item-badge">{metrics.totalLeads}</span>
            )}
          </button>

          <div className="sidebar-group-label">Site Content &amp; Media</div>

          <button
            type="button"
            className={`sidebar-nav-item ${activeTab === "projects" ? "is-active" : ""}`}
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
            onClick={() => handleTabChange("blogs")}
            title="Insights & Blog"
          >
            <span className="sidebar-item-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                <path d="M6 6h10" />
                <path d="M6 10h10" />
              </svg>
            </span>
            <span className="sidebar-item-label">Insights &amp; Blog</span>
          </button>

          <button
            type="button"
            className={`sidebar-nav-item ${activeTab === "media_library" ? "is-active" : ""}`}
            onClick={() => handleTabChange("media_library")}
            title="Media Library"
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

          <button
            type="button"
            className={`sidebar-nav-item ${activeTab === "media" ? "is-active" : ""}`}
            onClick={() => handleTabChange("media")}
            title="Section Visuals Studio"
          >
            <span className="sidebar-item-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
            </span>
            <span className="sidebar-item-label">Section Visuals</span>
          </button>

          <button
            type="button"
            className={`sidebar-nav-item ${activeTab === "content" ? "is-active" : ""}`}
            onClick={() => handleTabChange("content")}
            title="Content & FAQs"
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
            <span className="sidebar-item-label">Content &amp; FAQs</span>
          </button>

          <button
            type="button"
            className={`sidebar-nav-item ${activeTab === "sections" ? "is-active" : ""}`}
            onClick={() => handleTabChange("sections")}
            title="Section Toggles"
          >
            <span className="sidebar-item-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="7" height="7" x="3" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="14" rx="1" />
                <rect width="7" height="7" x="3" y="14" rx="1" />
              </svg>
            </span>
            <span className="sidebar-item-label">Section Toggles</span>
            <span className="sidebar-item-count">{activeSectionsCount}/11</span>
          </button>

          <button
            type="button"
            className={`sidebar-nav-item ${activeTab === "contact" ? "is-active" : ""}`}
            onClick={() => handleTabChange("contact")}
            title="Contact & Social"
          >
            <span className="sidebar-item-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </span>
            <span className="sidebar-item-label">Contact &amp; Social</span>
          </button>

          <div className="sidebar-group-label">Marketing &amp; Ads</div>

          <button
            type="button"
            className={`sidebar-nav-item ${activeTab === "tracking" ? "is-active" : ""}`}
            onClick={() => handleTabChange("tracking")}
            title="Ad Pixels & Tags"
          >
            <span className="sidebar-item-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="6" r="6" />
                <circle cx="12" cy="2" r="2" />
              </svg>
            </span>
            <span className="sidebar-item-label">Ad Pixels &amp; Tags</span>
          </button>

          <button
            type="button"
            className={`sidebar-nav-item ${activeTab === "seo" ? "is-active" : ""}`}
            onClick={() => handleTabChange("seo")}
            title="SEO & Social Meta"
          >
            <span className="sidebar-item-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </span>
            <span className="sidebar-item-label">SEO &amp; Social Meta</span>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="admin-sidebar-footer">
          {/* Desktop Sidebar Collapse Toggle */}
          <button
            type="button"
            className="sidebar-collapse-toggle desktop-only"
            onClick={toggleSidebarCollapsed}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="13 17 18 12 13 7" />
                <polyline points="6 17 11 12 6 7" />
              </svg>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="11 17 6 12 11 7" />
                  <polyline points="18 17 13 12 18 7" />
                </svg>
                <span>Collapse Navigation</span>
              </>
            )}
          </button>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="sidebar-footer-link"
            title="View Live Website"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h6v6" />
              <path d="M10 14 21 3" />
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            </svg>
            <span>View Live Website</span>
          </a>

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
      <div className={`admin-main-wrap ${sidebarCollapsed ? "sidebar-is-collapsed" : ""}`}>
        {/* Minimal Top Header */}
        <header className="admin-minimal-topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="sidebar-toggle-btn mobile-only"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation sidebar"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </button>
            <div className="topbar-titles-wrap">
              <div className="topbar-breadcrumb">
                <span>Admin</span>
                <span style={{ margin: "0 6px", opacity: 0.5 }}>/</span>
                <span>{tabLabels[activeTab].category}</span>
                <span style={{ margin: "0 6px", opacity: 0.5 }}>/</span>
                <span style={{ color: "var(--admin-gold)" }}>{tabLabels[activeTab].title}</span>
              </div>
              <h1 className="topbar-title">{tabLabels[activeTab].title}</h1>
            </div>
          </div>

          <div className="topbar-actions">
            <div className="live-status-pill">
              <span className="status-dot-pulse" />
              <span className="status-full">System Live</span>
              <span className="status-short">Live</span>
            </div>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-minimal desktop-only"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h6v6" />
                <path d="M10 14 21 3" />
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              </svg>
              <span>View Website</span>
            </a>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="admin-main-content">
          {/* KPI Metric Strip */}
          <div className="minimal-stats-strip">
            <div
              className="minimal-stat-card"
              style={{ cursor: "pointer" }}
              onClick={() => handleTabChange("leads")}
              title="Click to view Leads CRM"
            >
              <span className="minimal-stat-num">{metrics.totalLeads}</span>
              <span className="minimal-stat-lbl">Total Enquiries</span>
            </div>

            <div
              className="minimal-stat-card"
              style={{ cursor: "pointer" }}
              onClick={() => handleTabChange("leads")}
              title="Click to view New Leads"
            >
              <span className="minimal-stat-num" style={{ color: "#60a5fa" }}>
                {metrics.newLeads}
              </span>
              <span className="minimal-stat-lbl">New Uncontacted</span>
            </div>

            <div
              className="minimal-stat-card"
              style={{ cursor: "pointer" }}
              onClick={() => handleTabChange("leads")}
              title="Click to view Today's Leads"
            >
              <span className="minimal-stat-num" style={{ color: "#fb923c" }}>
                {metrics.todayLeads}
              </span>
              <span className="minimal-stat-lbl">Past 24 Hours</span>
            </div>

            <div
              className="minimal-stat-card"
              style={{ cursor: "pointer" }}
              onClick={() => handleTabChange("sections")}
              title="Click to manage Section Controls"
            >
              <span className="minimal-stat-num" style={{ color: "var(--admin-gold)" }}>
                {activeSectionsCount}/11
              </span>
              <span className="minimal-stat-lbl">Active Sections</span>
            </div>
          </div>

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
                onUpdate={(next) => updateSettingPart("content", next)}
                onUpdateFull={async (patch) => {
                  const res = await fetch("/api/admin/settings", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(patch),
                  });
                  if (!res.ok) throw new Error("Failed to update settings");
                  const data = await res.json();
                  setSettings(data.settings);
                }}
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
                onUpdateSiteInfo={(next) => updateSettingPart("site_info", next)}
                onUpdateSocialLinks={(next) => updateSettingPart("social_links", next)}
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
                onUpdate={(next) => updateSettingPart("seo", next)}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
