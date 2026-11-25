"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ProjectItem } from "@/lib/types";
import { ToastContainer, ConfirmModal, ToastMessage } from "@/components/admin/AdminDialogs";
import { Pagination } from "@/components/ui/Pagination";
import { CardSkeleton } from "@/components/admin/ui/AdminSkeleton";
import { AdminBadge } from "@/components/admin/ui/AdminBadge";
import { AdminToolbar, AdminSearchInput } from "@/components/admin/ui/AdminToolbar";
import { AdminTabs, TabOption } from "@/components/admin/ui/AdminTabs";
import { uploadImage } from "@/lib/imageOptimizer";
import { ProjectGalleryField } from "./ProjectGalleryField";
import { MediaPickerModal } from "@/components/admin/MediaPickerModal";

type ProjectStudioTab = "general" | "specs" | "media";

const PROJECT_STUDIO_TABS: TabOption<ProjectStudioTab>[] = [
  { id: "general", label: "1. General & Location" },
  { id: "specs", label: "2. Specs & Narrative" },
  { id: "media", label: "3. Media & Subsidies" },
];

export function ProjectsManager() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [studioTab, setStudioTab] = useState<ProjectStudioTab>("general");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Pagination & Filtering state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // In-app dialogs
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    action: () => {},
  });

  function addToast(type: "success" | "error" | "info", title: string, message?: string) {
    const id = "toast-" + Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }

  function dismissToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  // 300ms Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchProjects = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", pageSize.toString());
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (status && status !== "all") params.set("status", status);

      const res = await fetch(`/api/admin/projects?${params.toString()}`, { signal });
      if (!res.ok) throw new Error("Failed to fetch projects");
      const data = await res.json();
      const fetchedProjects = data.projects || [];
      setProjects(fetchedProjects);
      if (data.pagination) {
        setPagination(data.pagination);
      }
    } catch (err: unknown) {
      if ((err as Error)?.name === "AbortError") return;
      addToast("error", "Error loading projects", err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch, status]);

  useEffect(() => {
    const controller = new AbortController();
    fetchProjects(controller.signal);
    return () => controller.abort();
  }, [fetchProjects]);

  // Deep-link query check on mount
  useEffect(() => {
    if (typeof window === "undefined" || projects.length === 0) return;
    const urlParams = new URLSearchParams(window.location.search);
    const editSlug = urlParams.get("edit");
    const actionParam = urlParams.get("action");
    if (actionParam === "create") {
      setEditingProject((prev) => {
        if (prev) return prev;
        return {
          id: `proj-${Date.now()}`,
          title: "",
          slug: "",
          tagline: "Planned Industrial Park",
          location: "",
          addressShort: "",
          shortDescription: "",
          fullDescription: "",
          plotSizes: "From 500 Sq. Yards",
          roadWidth: "45–52 ft Heavy-Duty Concrete Roads",
          connectivity: ["Direct Expressway Corridor Access"],
          features: ["Completed plot demarcation", "Concrete roads", "24/7 Gated Security"],
          subsidiesInfo: "",
          status: "Active Plots Available",
          coverImage: "https://images.unsplash.com/photo-1758304481470-e575d1d44efa?auto=format&fit=crop&w=1200&q=80",
          galleryImages: [],
          brochureUrl: "",
          order: projects.length + 1,
          isActive: true,
        };
      });
      setStudioTab("general");
    } else if (editSlug) {
      const match = projects.find(
        (p: ProjectItem) => p.slug === editSlug || p.id === editSlug
      );
      if (match) {
        setEditingProject((prev) => prev || { ...match });
        setStudioTab("general");
      }
    }
  }, [projects]);

  function handleCreateNew(updateUrl = true) {
    const newProj: ProjectItem = {
      id: `proj-${Date.now()}`,
      title: "",
      slug: "",
      tagline: "Planned Industrial Park",
      location: "",
      addressShort: "",
      shortDescription: "",
      fullDescription: "",
      plotSizes: "From 500 Sq. Yards",
      roadWidth: "45–52 ft Heavy-Duty Concrete Roads",
      connectivity: ["Direct Expressway Corridor Access"],
      features: ["Completed plot demarcation", "Concrete roads", "24/7 Gated Security"],
      subsidiesInfo: "",
      status: "Active Plots Available",
      coverImage: "https://images.unsplash.com/photo-1758304481470-e575d1d44efa?auto=format&fit=crop&w=1200&q=80",
      galleryImages: [],
      brochureUrl: "",
      order: projects.length + 1,
      isActive: true,
    };
    setEditingProject(newProj);
    setStudioTab("general");

    if (updateUrl && typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("action", "create");
      url.searchParams.delete("edit");
      window.history.pushState({}, "", url.toString());
    }
  }

  function handleEdit(proj: ProjectItem, updateUrl = true) {
    setEditingProject({ ...proj });
    setStudioTab("general");

    if (updateUrl && typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("edit", proj.slug || proj.id);
      url.searchParams.delete("action");
      window.history.pushState({}, "", url.toString());
    }
  }

  function handleCloseStudio() {
    setEditingProject(null);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("edit");
      url.searchParams.delete("action");
      window.history.pushState({}, "", url.toString());
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editingProject) return;

    setUploadingImage(true);
    try {
      const url = await uploadImage(file);
      setEditingProject((prev) => (prev ? { ...prev, coverImage: url } : null));
      addToast("success", "Cover image uploaded & converted to WebP successfully!");
    } catch (err: unknown) {
      addToast("error", "Upload error", err instanceof Error ? err.message : "Upload error");
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSave() {
    if (!editingProject) return;
    if (!editingProject.title.trim()) {
      addToast("error", "Validation error", "Project title is required.");
      setStudioTab("general");
      return;
    }
    if (!editingProject.location.trim()) {
      addToast("error", "Validation error", "Project location address is required.");
      setStudioTab("general");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingProject),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save project");
      }
      addToast("success", "Project saved successfully!");
      handleCloseStudio();
      fetchProjects();
    } catch (err: unknown) {
      addToast("error", "Save failed", err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(id: string, title: string) {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Project?",
      message: `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      action: async () => {
        try {
          const res = await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
          if (!res.ok) throw new Error("Delete failed");
          addToast("success", "Project deleted");
          fetchProjects();
        } catch (err: unknown) {
          addToast("error", "Delete failed", err instanceof Error ? err.message : "Error");
        }
      },
    });
  }

  // =========================================================================
  // VIEW MODE 1: FULL-PAGE PROJECT STUDIO
  // =========================================================================
  if (editingProject) {
    return (
      <div className="admin-full-studio">
        {/* Sticky Executive Action Topbar */}
        <div className="studio-sticky-header">
          <div className="studio-header-left">
            <button
              type="button"
              className="studio-back-btn"
              onClick={handleCloseStudio}
              title="Return to Projects Catalog"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span>Back to Catalog</span>
            </button>

            <div className="studio-header-titles">
              <div className="studio-breadcrumb">
                Projects Portfolio / {editingProject.title ? "Edit Development" : "New Development"}
              </div>
              <h2 className="studio-main-title">
                {editingProject.title || "Untitled Project"}
              </h2>
            </div>
          </div>

          <div className="studio-header-actions desktop-only">
            <AdminBadge variant={editingProject.isActive ? "success" : "neutral"} dot>
              {editingProject.isActive ? "Live on Site" : "Draft Mode"}
            </AdminBadge>

            <button
              type="button"
              className="admin-btn admin-btn-outline"
              onClick={handleCloseStudio}
            >
              Discard Changes
            </button>

            <button
              type="button"
              className="admin-btn admin-btn-primary"
              onClick={handleSave}
              disabled={saving}
              style={{ minWidth: "160px" }}
            >
              {saving ? "Saving Changes…" : "✓ Save Project Changes"}
            </button>
          </div>
        </div>

        {/* Studio Segmented Step Tabs */}
        <div style={{ marginBottom: "20px" }}>
          <AdminTabs
            tabs={PROJECT_STUDIO_TABS}
            activeTab={studioTab}
            onChange={(tabId) => setStudioTab(tabId)}
          />
        </div>

        {/* Responsive 2-Column Studio Grid */}
        <div className="studio-layout-grid">
          {/* Main Form Area (Left) */}
          <div className="studio-main-col">
            <div className="studio-card">
              {/* TAB 1: GENERAL & LOCATION */}
              {studioTab === "general" && (
                <div>
                  <div className="studio-card-header">
                    <h3 className="studio-card-title">General Project Identity &amp; Location</h3>
                    <p className="studio-card-desc">Define the development title, web identifier (slug), tagline, and geographic location.</p>
                  </div>

                  <div className="admin-form-grid">
                    <div className="admin-field admin-field-full">
                      <label>
                        <span>Project Title <span className="required-star">*</span></span>
                        <span className="label-hint">e.g. Gayatri Industrial Park</span>
                      </label>
                      <input
                        type="text"
                        className="admin-input"
                        value={editingProject.title}
                        onChange={(e) =>
                          setEditingProject({
                            ...editingProject,
                            title: e.target.value,
                            slug:
                              editingProject.slug ||
                              e.target.value
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, "-")
                                .replace(/(^-|-$)/g, ""),
                          })
                        }
                        placeholder="e.g. Shri Balaji Industrial Park"
                      />
                    </div>

                    <div className="admin-field">
                      <label>
                        <span>URL Slug <span className="required-star">*</span></span>
                        <span className="label-hint">/projects/{editingProject.slug || "slug"}</span>
                      </label>
                      <input
                        type="text"
                        className="admin-input"
                        value={editingProject.slug}
                        onChange={(e) =>
                          setEditingProject({ ...editingProject, slug: e.target.value })
                        }
                        placeholder="e.g. shri-balaji-industrial-park"
                      />
                    </div>

                    <div className="admin-field">
                      <label>
                        <span>Tagline / Subheading</span>
                        <span className="label-hint">Displayed under title</span>
                      </label>
                      <input
                        type="text"
                        className="admin-input"
                        value={editingProject.tagline || ""}
                        onChange={(e) =>
                          setEditingProject({ ...editingProject, tagline: e.target.value })
                        }
                        placeholder="e.g. Planned Industrial Park with UP MSME Policy Benefits"
                      />
                    </div>

                    <div className="admin-field admin-field-full">
                      <label>
                        <span>Full Location Address <span className="required-star">*</span></span>
                        <span className="label-hint">Exact physical address</span>
                      </label>
                      <input
                        type="text"
                        className="admin-input"
                        value={editingProject.location}
                        onChange={(e) =>
                          setEditingProject({ ...editingProject, location: e.target.value })
                        }
                        placeholder="e.g. Sarawa Bus Stand, Hapur-Modinagar Rd, Ghaziabad, Uttar Pradesh"
                      />
                    </div>

                    <div className="admin-field">
                      <label>
                        <span>Short Location Display</span>
                        <span className="label-hint">For cards &amp; map badges</span>
                      </label>
                      <input
                        type="text"
                        className="admin-input"
                        value={editingProject.addressShort || ""}
                        onChange={(e) =>
                          setEditingProject({ ...editingProject, addressShort: e.target.value })
                        }
                        placeholder="e.g. Bhojpur, Modinagar (Ghaziabad)"
                      />
                    </div>

                    <div className="admin-field">
                      <label>
                        <span>Development Status Badge</span>
                        <span className="label-hint">Public availability indicator</span>
                      </label>
                      <select
                        className="admin-select"
                        value={editingProject.status}
                        onChange={(e) =>
                          setEditingProject({
                            ...editingProject,
                            status: e.target.value as ProjectItem["status"],
                          })
                        }
                      >
                        <option value="Active Plots Available">Active Plots Available</option>
                        <option value="Under Development">Under Development</option>
                        <option value="Ready for Possession">Ready for Possession</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SPECS & NARRATIVE */}
              {studioTab === "specs" && (
                <div>
                  <div className="studio-card-header">
                    <h3 className="studio-card-title">Specifications, Sizing &amp; Descriptions</h3>
                    <p className="studio-card-desc">Configure plot sizing options, heavy-duty internal road widths, and project summaries.</p>
                  </div>

                  <div className="admin-form-grid">
                    <div className="admin-field">
                      <label>
                        <span>Plot Sizes Typology</span>
                        <span className="label-hint">Available area options</span>
                      </label>
                      <input
                        type="text"
                        className="admin-input"
                        value={editingProject.plotSizes}
                        onChange={(e) =>
                          setEditingProject({ ...editingProject, plotSizes: e.target.value })
                        }
                        placeholder="e.g. 500 to 3,000 Sq. Yards"
                      />
                    </div>

                    <div className="admin-field">
                      <label>
                        <span>Internal Road Width</span>
                        <span className="label-hint">Transit &amp; load capacity</span>
                      </label>
                      <input
                        type="text"
                        className="admin-input"
                        value={editingProject.roadWidth}
                        onChange={(e) =>
                          setEditingProject({ ...editingProject, roadWidth: e.target.value })
                        }
                        placeholder="e.g. 45–52 ft. Heavy-Duty RCC Roads"
                      />
                    </div>

                    <div className="admin-field admin-field-full">
                      <label>
                        <span>Short Description (Website Card Summary)</span>
                        <span className="label-hint">Displayed on homepage project cards</span>
                      </label>
                      <textarea
                        className="admin-textarea"
                        rows={2}
                        value={editingProject.shortDescription}
                        onChange={(e) =>
                          setEditingProject({ ...editingProject, shortDescription: e.target.value })
                        }
                        placeholder="An industrial development project designed for entrepreneurs, manufacturers, factories, and investors."
                      />
                    </div>

                    <div className="admin-field admin-field-full">
                      <label>
                        <span>Full Narrative Description</span>
                        <span className="label-hint">Detailed overview shown on the project page</span>
                      </label>
                      <textarea
                        className="admin-textarea"
                        rows={5}
                        value={editingProject.fullDescription}
                        onChange={(e) =>
                          setEditingProject({ ...editingProject, fullDescription: e.target.value })
                        }
                        placeholder="Provide detailed information regarding site topography, boundary demarcation, power substation access, and industrial utility planning..."
                      />
                    </div>

                    <div className="admin-field admin-field-full">
                      <label>
                        <span>Delivered Infrastructure Features</span>
                        <span className="label-hint">One feature per line · Rendered as verified checklist on project page</span>
                      </label>
                      <textarea
                        className="admin-textarea"
                        rows={4}
                        value={(editingProject.features || []).join("\n")}
                        onChange={(e) =>
                          setEditingProject({
                            ...editingProject,
                            features: e.target.value
                              .split("\n")
                              .map((line) => line.trim())
                              .filter(Boolean),
                          })
                        }
                        placeholder={`Completed clear plot demarcation for rapid site handover\nEngineered RCC internal road infrastructure\nPlanned amenities for industrial workforce & operations\nHigh-uptime electrical lines & utility drainage network`}
                      />
                      <small style={{ fontSize: "11px", color: "var(--admin-text-muted)", marginTop: "4px", display: "block" }}>
                        {(editingProject.features || []).length} active feature items configured
                      </small>
                    </div>

                    <div className="admin-field admin-field-full">
                      <label>
                        <span>Strategic Freight &amp; Transit Connectivity</span>
                        <span className="label-hint">One route / corridor per line · Rendered in connectivity milestone cards</span>
                      </label>
                      <textarea
                        className="admin-textarea"
                        rows={4}
                        value={(editingProject.connectivity || []).join("\n")}
                        onChange={(e) =>
                          setEditingProject({
                            ...editingProject,
                            connectivity: e.target.value
                              .split("\n")
                              .map((line) => line.trim())
                              .filter(Boolean),
                          })
                        }
                        placeholder={`Direct access on Hapur–Modinagar Road corridor\n12 km from Delhi–Meerut Expressway (DME) Interchange\n18 km from Ghaziabad Railway Freight & Inland Container Terminal\nSeamless multi-axle heavy freight carrier navigation`}
                      />
                      <small style={{ fontSize: "11px", color: "var(--admin-text-muted)", marginTop: "4px", display: "block" }}>
                        {(editingProject.connectivity || []).length} connectivity routes configured
                      </small>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: MEDIA & SUBSIDIES */}
              {studioTab === "media" && (
                <div>
                  <div className="studio-card-header">
                    <h3 className="studio-card-title">Media, Government Incentives &amp; Downloads</h3>
                    <p className="studio-card-desc">Upload primary development imagery, specify UP MSME promotion policy subsidies, and link brochures.</p>
                  </div>

                  <div className="admin-form-grid">
                    <div className="admin-field admin-field-full">
                      <label>
                        <span>Cover Image (CDN / Cloudinary URL)</span>
                        <span className="label-hint">High-resolution banner photo</span>
                      </label>
                      <div className="admin-image-upload-row">
                        <input
                          type="text"
                          className="admin-input"
                          value={editingProject.coverImage}
                          onChange={(e) =>
                            setEditingProject({ ...editingProject, coverImage: e.target.value })
                          }
                          placeholder="https://images.unsplash.com/..."
                        />
                        <label className="admin-btn admin-btn-outline admin-upload-btn">
                          {uploadingImage ? "Uploading..." : "Upload File"}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            disabled={uploadingImage}
                            style={{ display: "none" }}
                          />
                        </label>
                        <button
                          type="button"
                          className="admin-btn admin-btn-outline"
                          onClick={() => setMediaPickerOpen(true)}
                          title="Choose from Media Library"
                        >
                          Media Library
                        </button>
                      </div>

                      {editingProject.coverImage && (
                        <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "12px" }}>
                          <Image
                            src={editingProject.coverImage}
                            alt="Cover Preview"
                            width={160}
                            height={95}
                            style={{ objectFit: "cover", borderRadius: "6px", border: "1px solid var(--admin-border)" }}
                          />
                          <div style={{ fontSize: "12px", color: "var(--admin-text-muted)" }}>
                            <span style={{ color: "var(--admin-success)", fontWeight: 600 }}>✓ Media Linked</span>
                            <div style={{ fontSize: "11px", marginTop: "4px" }}>Aspect ratio optimal for project cards and banners</div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="admin-field admin-field-full">
                      <label>
                        <span>UP MSME Promotion Policy 2022 Subsidies Notice</span>
                        <span className="label-hint">Government investment incentives</span>
                      </label>
                      <textarea
                        className="admin-textarea"
                        rows={3}
                        value={editingProject.subsidiesInfo || ""}
                        onChange={(e) =>
                          setEditingProject({ ...editingProject, subsidiesInfo: e.target.value })
                        }
                        placeholder="e.g. Potential investment benefits under Uttar Pradesh MSME Promotion Policy 2022: eligible capital investment subsidies, stamp duty exemptions, and MSME financial support schemes."
                      />
                    </div>

                    <div className="admin-field admin-field-full">
                      <label>
                        <span>Project Brochure URL</span>
                        <span className="label-hint">Direct link to downloadable PDF masterplan brochure</span>
                      </label>
                      <input
                        type="text"
                        className="admin-input"
                        value={editingProject.brochureUrl || ""}
                        onChange={(e) =>
                          setEditingProject({ ...editingProject, brochureUrl: e.target.value })
                        }
                        placeholder="https://... (PDF download link)"
                      />
                    </div>

                    <ProjectGalleryField
                      images={editingProject.galleryImages || []}
                      onChange={galleryImages => setEditingProject(project => project && ({ ...project, galleryImages }))}
                    />
                  </div>
                </div>
              )}

              {/* Step Navigation Bar */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--admin-border-subtle)" }}>
                <div>
                  {studioTab !== "general" && (
                    <button
                      type="button"
                      className="admin-btn admin-btn-outline"
                      onClick={() => {
                        if (studioTab === "media") setStudioTab("specs");
                        else if (studioTab === "specs") setStudioTab("general");
                      }}
                    >
                      ← Previous Section
                    </button>
                  )}
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  {studioTab !== "media" ? (
                    <button
                      type="button"
                      className="admin-btn admin-btn-secondary"
                      onClick={() => {
                        if (studioTab === "general") setStudioTab("specs");
                        else if (studioTab === "specs") setStudioTab("media");
                      }}
                    >
                      Next Step →
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="admin-btn admin-btn-primary"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? "Saving Changes…" : "✓ Save & Publish Project"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Project Card Preview & Visibility (Desktop) */}
          <div className="studio-sidebar-col">
            {/* Live Interactive Card Preview */}
            <div className="studio-preview-box">
              <div className="studio-preview-label">
                <span className="studio-preview-badge">Live Card Preview</span>
                <span style={{ fontSize: "11px", color: "var(--admin-text-muted)" }}>Updates as you type</span>
              </div>

              <div className="live-card-preview-shell">
                <div className="live-card-preview-media">
                  {editingProject.coverImage ? (
                    <Image
                      src={editingProject.coverImage}
                      alt={editingProject.title || "Project Preview"}
                      fill
                      sizes="340px"
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontSize: "12px" }}>
                      No image uploaded
                    </div>
                  )}
                  <span
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      background: editingProject.isActive ? "rgba(34, 197, 94, 0.9)" : "rgba(100, 116, 139, 0.9)",
                      color: "#fff",
                      fontSize: "10px",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "4px",
                    }}
                  >
                    {editingProject.status || "Status"}
                  </span>
                </div>

                <div className="live-card-preview-body">
                  <div className="live-card-eyebrow">
                    📍 {editingProject.addressShort || editingProject.location || "Location not set"}
                  </div>
                  <h4 className="live-card-title">
                    {editingProject.title || "Project Title"}
                  </h4>
                  <p className="live-card-tagline">
                    {editingProject.shortDescription || editingProject.tagline || "Project overview will appear here..."}
                  </p>

                  <div className="live-card-specs-strip">
                    <div className="live-card-spec-item">
                      <small>Plot Configurations</small>
                      <strong>{editingProject.plotSizes || "From 500 Sq. Yds"}</strong>
                    </div>
                    <div className="live-card-spec-item">
                      <small>Road Width</small>
                      <strong>{editingProject.roadWidth || "RCC Roads"}</strong>
                    </div>
                  </div>

                  {editingProject.subsidiesInfo && (
                    <div className="live-card-subsidies-pill">
                      <strong>INCENTIVES:</strong> {editingProject.subsidiesInfo}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                    <div
                      style={{
                        flex: 1,
                        background: "#d4af37",
                        color: "#080b12",
                        textAlign: "center",
                        padding: "8px 10px",
                        borderRadius: "4px",
                        fontSize: "11.5px",
                        fontWeight: 700,
                      }}
                    >
                      Explore Project ↗
                    </div>
                    <div
                      style={{
                        flex: 1,
                        border: "1px solid #cbd5e1",
                        color: "#334155",
                        textAlign: "center",
                        padding: "8px 10px",
                        borderRadius: "4px",
                        fontSize: "11.5px",
                        fontWeight: 600,
                      }}
                    >
                      Site Visit →
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Publishing Controls Card */}
            <div className="studio-card">
              <h4 style={{ margin: "0 0 14px", fontSize: "14px", fontWeight: 700, color: "var(--admin-text-main)" }}>
                Publishing &amp; Sort Order
              </h4>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "13px" }}>
                  <input
                    type="checkbox"
                    checked={editingProject.isActive}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, isActive: e.target.checked })
                    }
                  />
                  <span>Published &amp; Live on Website</span>
                </label>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "12.5px", color: "var(--admin-text-muted)" }}>Display Sort Order:</span>
                  <input
                    type="number"
                    style={{ width: "70px", padding: "6px 8px" }}
                    className="admin-input"
                    value={editingProject.order}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        order: Number(e.target.value) || 1,
                      })
                    }
                  />
                </div>

                {editingProject.slug && (
                  <a
                    href={`/projects/${editingProject.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="admin-btn admin-btn-outline"
                    style={{ textAlign: "center", textDecoration: "none", marginTop: "6px" }}
                  >
                    View Public Page ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sticky Bottom Floating Action Dock */}
        <div className="mobile-studio-actions">
          <button
            type="button"
            className="admin-btn admin-btn-outline"
            onClick={handleCloseStudio}
          >
            Discard
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save Project"}
          </button>
        </div>

        {/* Media Picker Modal */}
        <MediaPickerModal
          isOpen={mediaPickerOpen}
          onClose={() => setMediaPickerOpen(false)}
          currentUrl={editingProject.coverImage}
          title="Select Project Cover from Media Library"
          onSelect={(url) => {
            setEditingProject((prev) => (prev ? { ...prev, coverImage: url } : null));
            addToast("success", "Cover image selected from Media Library!");
          }}
        />

        {/* In-app toasts */}
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    );
  }

  // =========================================================================
  // VIEW MODE 2: PROJECTS CATALOG & LISTING
  // =========================================================================
  return (
    <div className="admin-projects-studio">
      <div className="admin-studio-header">
        <div>
          <h2>Project portfolio</h2>
          <p className="admin-studio-desc">
            Manage project details, photos, brochures and availability.
          </p>
        </div>
        <button
          type="button"
          className="admin-btn admin-btn-primary"
          onClick={() => handleCreateNew(true)}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Add project</span>
        </button>
      </div>

      {/* Standardized Search & Filter Toolbar */}
      <AdminToolbar>
        <AdminSearchInput
          placeholder="Search projects by title, location, or specs..."
          value={search}
          onChange={(val) => setSearch(val)}
        />

        <select
          className="admin-select"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by Development Status"
        >
          <option value="all">All Development Statuses</option>
          <option value="Active Plots Available">Active Plots Available</option>
          <option value="Under Development">Under Development</option>
          <option value="Ready for Possession">Ready for Possession</option>
        </select>

        <select
          className="admin-select"
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setPage(1);
          }}
          aria-label="Projects per page"
        >
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
          <option value={50}>50 per page</option>
        </select>
      </AdminToolbar>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: "20px" }}>
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : projects.length === 0 ? (
        <div className="admin-empty-state">
          <p>No projects found. Click &quot;Add New Project&quot; to create your first development.</p>
        </div>
      ) : (
        <div className="admin-projects-grid">
          {projects.map((proj) => (
            <div key={proj.id} className="admin-project-card">
              <div className="apc-media">
                <Image
                  src={proj.coverImage || "https://images.unsplash.com/photo-1758304481470-e575d1d44efa?auto=format&fit=crop&w=600&q=80"}
                  alt={proj.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 360px"
                  className="apc-img"
                />
                <span className={`apc-status-pill ${proj.isActive ? "is-active" : "is-inactive"}`}>
                  {proj.isActive ? proj.status : "Draft / Inactive"}
                </span>
              </div>

              <div className="apc-body">
                <div className="apc-meta">
                  <span className="apc-order">#{proj.order}</span>
                  <span className="apc-loc">📍 {proj.addressShort || proj.location}</span>
                </div>

                <h3 className="apc-title">{proj.title}</h3>
                <p className="apc-tagline">{proj.tagline}</p>
                <p className="apc-desc">{proj.shortDescription}</p>

                <div className="apc-specs">
                  <div>
                    <small>Plot Sizes</small>
                    <strong>{proj.plotSizes}</strong>
                  </div>
                  <div>
                    <small>Road Width</small>
                    <strong>{proj.roadWidth}</strong>
                  </div>
                </div>

                {proj.subsidiesInfo && (
                  <div className="apc-subsidies">
                    <span>★ {proj.subsidiesInfo}</span>
                  </div>
                )}

                <div className="apc-actions">
                  <button
                    type="button"
                    className="admin-btn admin-btn-outline"
                    onClick={() => handleEdit(proj, true)}
                  >
                    Edit Details
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn-danger"
                    onClick={() => handleDelete(proj.id, proj.title)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Backend Pagination */}
      {!loading && projects.length > 0 && pagination.totalPages > 1 && (
        <div style={{ marginTop: "24px" }}>
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={(p) => setPage(p)}
            totalItems={pagination.total}
            pageSize={pagination.limit}
          />
        </div>
      )}

      {/* Dialogs */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        isDanger={true}
        onConfirm={async () => {
          await confirmDialog.action();
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
