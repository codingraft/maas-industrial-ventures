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

type ProjectModalTab = "general" | "specs" | "media";

const PROJECT_MODAL_TABS: TabOption<ProjectModalTab>[] = [
  { id: "general", label: "General & Location" },
  { id: "specs", label: "Specs & Narrative" },
  { id: "media", label: "Media & Subsidies" },
];

export function ProjectsManager() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<ProjectModalTab>("general");
  const [uploadingImage, setUploadingImage] = useState(false);

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
      setProjects(data.projects || []);
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

  function handleCreateNew() {
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
    setModalTab("general");
    setIsModalOpen(true);
  }

  function handleEdit(proj: ProjectItem) {
    setEditingProject({ ...proj });
    setModalTab("general");
    setIsModalOpen(true);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editingProject) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");

      setEditingProject((prev) => (prev ? { ...prev, coverImage: data.url } : null));
      addToast("success", "Cover image uploaded successfully!");
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
      setModalTab("general");
      return;
    }
    if (!editingProject.location.trim()) {
      addToast("error", "Validation error", "Project location is required.");
      setModalTab("general");
      return;
    }

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
      setIsModalOpen(false);
      setEditingProject(null);
      fetchProjects();
    } catch (err: unknown) {
      addToast("error", "Save failed", err instanceof Error ? err.message : "Save failed");
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

  return (
    <div className="admin-projects-studio">
      <div className="admin-studio-header">
        <div>
          <h2>Projects &amp; Landmark Developments Manager</h2>
          <p className="admin-studio-desc">
            Manage active industrial hubs, plotted developments, specifications, UP MSME Policy subsidies, and brochures.
          </p>
        </div>
        <button
          type="button"
          className="admin-btn admin-btn-primary"
          onClick={handleCreateNew}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Add New Project</span>
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
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
                  sizes="300px"
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
                    onClick={() => handleEdit(proj)}
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

      {/* Tabbed Edit / Create Modal */}
      {isModalOpen && editingProject && (
        <div className="admin-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal-card admin-modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3>{editingProject.title ? `Edit: ${editingProject.title}` : "Create New Project"}</h3>
                <p className="admin-modal-subtitle">Configure plot sizing, connectivity, infrastructure specs, and incentives.</p>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Segmented Modal Tabs */}
            <div style={{ padding: "0 24px", marginTop: "12px" }}>
              <AdminTabs
                tabs={PROJECT_MODAL_TABS}
                activeTab={modalTab}
                onChange={(tabId) => setModalTab(tabId)}
              />
            </div>

            <div className="admin-modal-body admin-form-grid" style={{ maxHeight: "60vh", overflowY: "auto" }}>
              {/* TAB 1: GENERAL & LOCATION */}
              {modalTab === "general" && (
                <>
                  <div className="admin-field admin-field-full">
                    <label>Project Title *</label>
                    <input
                      type="text"
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
                      placeholder="e.g. Gayatri Industrial Park"
                    />
                  </div>

                  <div className="admin-field">
                    <label>Slug (URL Identifier) *</label>
                    <input
                      type="text"
                      value={editingProject.slug}
                      onChange={(e) =>
                        setEditingProject({ ...editingProject, slug: e.target.value })
                      }
                      placeholder="e.g. gayatri-industrial-park"
                    />
                  </div>

                  <div className="admin-field">
                    <label>Tagline / Subhead</label>
                    <input
                      type="text"
                      value={editingProject.tagline || ""}
                      onChange={(e) =>
                        setEditingProject({ ...editingProject, tagline: e.target.value })
                      }
                      placeholder="e.g. Gated Industrial & Warehousing Hub"
                    />
                  </div>

                  <div className="admin-field admin-field-full">
                    <label>Full Location Address *</label>
                    <input
                      type="text"
                      value={editingProject.location}
                      onChange={(e) =>
                        setEditingProject({ ...editingProject, location: e.target.value })
                      }
                      placeholder="e.g. Bhojpur, Modinagar (Ghaziabad district), Uttar Pradesh"
                    />
                  </div>

                  <div className="admin-field">
                    <label>Short Location Display</label>
                    <input
                      type="text"
                      value={editingProject.addressShort || ""}
                      onChange={(e) =>
                        setEditingProject({ ...editingProject, addressShort: e.target.value })
                      }
                      placeholder="e.g. Bhojpur, Modinagar (Ghaziabad)"
                    />
                  </div>

                  <div className="admin-field">
                    <label>Status Badge</label>
                    <select
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

                  <div className="admin-field admin-field-full">
                    <label>Display Order &amp; Published Status</label>
                    <div style={{ display: "flex", gap: "20px", alignItems: "center", marginTop: "4px" }}>
                      <label style={{ fontSize: "13px", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={editingProject.isActive}
                          onChange={(e) =>
                            setEditingProject({ ...editingProject, isActive: e.target.checked })
                          }
                        />
                        <span>Published / Live on Website</span>
                      </label>
                      <label style={{ fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span>Sort Order:</span>
                        <input
                          type="number"
                          style={{ width: "70px", padding: "4px 8px" }}
                          value={editingProject.order}
                          onChange={(e) =>
                            setEditingProject({
                              ...editingProject,
                              order: Number(e.target.value) || 1,
                            })
                          }
                        />
                      </label>
                    </div>
                  </div>
                </>
              )}

              {/* TAB 2: SPECS & NARRATIVE */}
              {modalTab === "specs" && (
                <>
                  <div className="admin-field">
                    <label>Plot Sizes Typology</label>
                    <input
                      type="text"
                      value={editingProject.plotSizes}
                      onChange={(e) =>
                        setEditingProject({ ...editingProject, plotSizes: e.target.value })
                      }
                      placeholder="e.g. Starting from 500 Sq. Yards or 500 to 3,000 Sq. Yards"
                    />
                  </div>

                  <div className="admin-field">
                    <label>Road Width &amp; Construction</label>
                    <input
                      type="text"
                      value={editingProject.roadWidth}
                      onChange={(e) =>
                        setEditingProject({ ...editingProject, roadWidth: e.target.value })
                      }
                      placeholder="e.g. 45–52 ft. Heavy-Duty Concrete Roads"
                    />
                  </div>

                  <div className="admin-field admin-field-full">
                    <label>Short Description (Homepage Card Summary)</label>
                    <textarea
                      rows={2}
                      value={editingProject.shortDescription}
                      onChange={(e) =>
                        setEditingProject({ ...editingProject, shortDescription: e.target.value })
                      }
                      placeholder="Summary shown on project cards across the website"
                    />
                  </div>

                  <div className="admin-field admin-field-full">
                    <label>Full Narrative Description</label>
                    <textarea
                      rows={5}
                      value={editingProject.fullDescription}
                      onChange={(e) =>
                        setEditingProject({ ...editingProject, fullDescription: e.target.value })
                      }
                      placeholder="Comprehensive project narrative and industrial scope"
                    />
                  </div>
                </>
              )}

              {/* TAB 3: MEDIA & SUBSIDIES */}
              {modalTab === "media" && (
                <>
                  <div className="admin-field admin-field-full">
                    <label>Cover Image (CDN / Cloudinary)</label>
                    <div className="admin-image-upload-row">
                      <input
                        type="text"
                        value={editingProject.coverImage}
                        onChange={(e) =>
                          setEditingProject({ ...editingProject, coverImage: e.target.value })
                        }
                        placeholder="https://..."
                      />
                      <label className="admin-btn admin-btn-outline admin-upload-btn">
                        {uploadingImage ? "Uploading..." : "Upload New File"}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          disabled={uploadingImage}
                          style={{ display: "none" }}
                        />
                      </label>
                    </div>
                    {editingProject.coverImage && (
                      <div className="admin-preview-thumbnail" style={{ marginTop: "10px" }}>
                        <Image
                          src={editingProject.coverImage}
                          alt="Project Preview"
                          width={240}
                          height={130}
                          style={{ objectFit: "cover", borderRadius: "6px" }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="admin-field admin-field-full">
                    <label>Government Policy Subsidies / Incentives Note</label>
                    <textarea
                      rows={3}
                      value={editingProject.subsidiesInfo || ""}
                      onChange={(e) =>
                        setEditingProject({ ...editingProject, subsidiesInfo: e.target.value })
                      }
                      placeholder="e.g. Potential investment benefits under Uttar Pradesh MSME Promotion Policy 2022: eligible capital investment subsidies, stamp duty exemptions..."
                    />
                  </div>

                  <div className="admin-field admin-field-full">
                    <label>Brochure URL (PDF download link)</label>
                    <input
                      type="text"
                      value={editingProject.brochureUrl || ""}
                      onChange={(e) =>
                        setEditingProject({ ...editingProject, brochureUrl: e.target.value })
                      }
                      placeholder="https://... (PDF link)"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="admin-modal-footer">
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                {modalTab !== "general" && (
                  <button
                    type="button"
                    className="admin-btn admin-btn-outline"
                    onClick={() => {
                      if (modalTab === "media") setModalTab("specs");
                      else if (modalTab === "specs") setModalTab("general");
                    }}
                  >
                    ← Previous Step
                  </button>
                )}
                {modalTab !== "media" && (
                  <button
                    type="button"
                    className="admin-btn admin-btn-secondary"
                    onClick={() => {
                      if (modalTab === "general") setModalTab("specs");
                      else if (modalTab === "specs") setModalTab("media");
                    }}
                  >
                    Next Step →
                  </button>
                )}
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  className="admin-btn admin-btn-outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="button" className="admin-btn admin-btn-primary" onClick={handleSave}>
                  Save Project Changes
                </button>
              </div>
            </div>
          </div>
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
