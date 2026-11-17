"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { BlogPost } from "@/lib/types";
import { ToastContainer, ConfirmModal, ToastMessage } from "@/components/admin/AdminDialogs";
import RichMarkdownEditor from "@/components/admin/RichMarkdownEditor";

export function BlogManager() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

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

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blogs");
      if (!res.ok) throw new Error("Failed to fetch blog posts");
      const data = await res.json();
      setBlogs(data.blogs || []);
    } catch (err: unknown) {
      addToast("error", "Error loading blogs", err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  function handleCreateNew() {
    const newPost: BlogPost = {
      id: `blog-${Date.now()}`,
      title: "",
      slug: "",
      category: "Industrial Insights",
      excerpt: "",
      content: "## Article Headline\n\nWrite your insights here. You can use markdown like **bold**, *italics*, and lists.",
      coverImage: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80",
      author: "MAAS Research Desk",
      readTime: "4 min read",
      publishedAt: new Date().toISOString().slice(0, 10),
      isFeatured: false,
      isPublished: true,
      metaTitle: "",
      metaDescription: "",
      keywords: [],
    };
    setEditingBlog(newPost);
    setIsModalOpen(true);
  }

  function handleEdit(post: BlogPost) {
    setEditingBlog({ ...post });
    setIsModalOpen(true);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editingBlog) return;

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

      setEditingBlog((prev) => (prev ? { ...prev, coverImage: data.url } : null));
      addToast("success", "Cover image uploaded successfully!");
    } catch (err: unknown) {
      addToast("error", "Upload error", err instanceof Error ? err.message : "Upload error");
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSave() {
    if (!editingBlog) return;
    if (!editingBlog.title.trim()) {
      addToast("error", "Validation error", "Article title is required.");
      return;
    }
    if (!editingBlog.excerpt.trim()) {
      addToast("error", "Validation error", "Article excerpt is required.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingBlog),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save article");
      }
      addToast("success", "Article published / saved successfully!");
      setIsModalOpen(false);
      setEditingBlog(null);
      fetchBlogs();
    } catch (err: unknown) {
      addToast("error", "Save failed", err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(id: string, title: string) {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Article?",
      message: `Are you sure you want to delete "${title}"? This cannot be undone.`,
      action: async () => {
        try {
          const res = await fetch(`/api/admin/blogs/${id}`, { method: "DELETE" });
          if (!res.ok) throw new Error("Delete failed");
          addToast("success", "Article deleted");
          fetchBlogs();
        } catch (err: unknown) {
          addToast("error", "Delete failed", err instanceof Error ? err.message : "Error");
        }
      },
    });
  }

  return (
    <div className="admin-blog-studio">
      <div className="admin-studio-header">
        <div>
          <h2>Insights, News &amp; SEO Blog Manager</h2>
          <p className="admin-studio-desc">
            Publish market insights, UP policy updates, and expressway connectivity reports to boost organic Google SEO traffic.
          </p>
        </div>
        <button type="button" className="admin-btn admin-btn-primary" onClick={handleCreateNew}>
          + Write New Article
        </button>
      </div>

      {loading ? (
        <div className="admin-loading-state">Loading articles...</div>
      ) : blogs.length === 0 ? (
        <div className="admin-empty-state">
          <p>No articles found. Click &quot;Write New Article&quot; to publish your first post.</p>
        </div>
      ) : (
        <div className="admin-blog-list">
          {blogs.map((b) => (
            <div key={b.id} className="admin-blog-row">
              <div className="abr-media">
                <Image
                  src={b.coverImage || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=400&q=80"}
                  alt={b.title}
                  width={140}
                  height={85}
                  className="abr-img"
                  style={{ objectFit: "cover", borderRadius: "6px" }}
                />
              </div>

              <div className="abr-content">
                <div className="abr-meta">
                  <span className="abr-cat">{b.category}</span>
                  <span className="abr-divider">•</span>
                  <span className="abr-date">{b.publishedAt}</span>
                  <span className="abr-divider">•</span>
                  <span className="abr-time">{b.readTime}</span>
                  <span className={`abr-status-pill ${b.isPublished ? "is-pub" : "is-draft"}`}>
                    {b.isPublished ? "Published" : "Draft"}
                  </span>
                </div>

                <h3 className="abr-title">{b.title}</h3>
                <p className="abr-excerpt">{b.excerpt}</p>
                <div className="abr-slug">Slug: /blog/{b.slug}</div>
              </div>

              <div className="abr-actions">
                <a
                  href={`/blog/${b.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="admin-btn admin-btn-outline"
                >
                  View
                </a>
                <button
                  type="button"
                  className="admin-btn admin-btn-outline"
                  onClick={() => handleEdit(b)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-danger"
                  onClick={() => handleDelete(b.id, b.title)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Create Modal */}
      {isModalOpen && editingBlog && (
        <div className="admin-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal-card admin-modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3>{editingBlog.title ? `Edit Article: ${editingBlog.title}` : "Write New Article"}</h3>
                <p className="admin-modal-subtitle">Craft executive real estate insights, policy reviews, and market trends.</p>
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

            <div className="admin-modal-body admin-form-grid">
              <div className="admin-field admin-field-full">
                <label>
                  <span>Article Title <span className="required-star">*</span></span>
                  <span className="label-hint">Shown in search engines and cards</span>
                </label>
                <input
                  type="text"
                  className="admin-input"
                  value={editingBlog.title}
                  onChange={(e) =>
                    setEditingBlog({
                      ...editingBlog,
                      title: e.target.value,
                      slug:
                        editingBlog.slug ||
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/(^-|-$)/g, ""),
                    })
                  }
                  placeholder="e.g. Uttar Pradesh MSME Promotion Policy 2022: Key Incentives"
                />
              </div>

              <div className="admin-field">
                <label>
                  <span>URL Slug <span className="required-star">*</span></span>
                  <span className="label-hint">/blog/{editingBlog.slug || "your-slug"}</span>
                </label>
                <input
                  type="text"
                  className="admin-input"
                  value={editingBlog.slug}
                  onChange={(e) =>
                    setEditingBlog({ ...editingBlog, slug: e.target.value })
                  }
                  placeholder="e.g. up-msme-promotion-policy-2022"
                />
              </div>

              <div className="admin-field">
                <label>Category</label>
                <input
                  type="text"
                  className="admin-input"
                  value={editingBlog.category}
                  onChange={(e) =>
                    setEditingBlog({ ...editingBlog, category: e.target.value })
                  }
                  placeholder="e.g. Policy & Subsidies, Connectivity, Market Insights"
                />
              </div>

              <div className="admin-field">
                <label>Author</label>
                <input
                  type="text"
                  className="admin-input"
                  value={editingBlog.author}
                  onChange={(e) =>
                    setEditingBlog({ ...editingBlog, author: e.target.value })
                  }
                  placeholder="e.g. MAAS Research Desk"
                />
              </div>

              <div className="admin-field admin-field-full">
                <label>
                  <span>Author Bio / Advisory Role (Optional)</span>
                  <span className="label-hint">Shown in author profile card at bottom of article</span>
                </label>
                <textarea
                  className="admin-textarea"
                  rows={2}
                  value={editingBlog.authorBio || ""}
                  onChange={(e) =>
                    setEditingBlog({ ...editingBlog, authorBio: e.target.value })
                  }
                  placeholder="e.g. Lead Land Acquisition & Infrastructure Advisory Specialist at MAAS Industrial Ventures."
                />
              </div>

              <div className="admin-field">
                <label>
                  <span>Reading Time</span>
                  <span className="label-hint">Estimated duration</span>
                </label>
                <input
                  type="text"
                  className="admin-input"
                  value={editingBlog.readTime}
                  onChange={(e) =>
                    setEditingBlog({ ...editingBlog, readTime: e.target.value })
                  }
                  placeholder="e.g. 4 min read"
                />
              </div>

              <div className="admin-field admin-field-full">
                <label>
                  <span>Short Excerpt / Meta Snippet <span className="required-star">*</span></span>
                  <span className="label-hint">Summary shown on cards and Google search previews</span>
                </label>
                <textarea
                  className="admin-textarea"
                  rows={2}
                  value={editingBlog.excerpt}
                  onChange={(e) =>
                    setEditingBlog({ ...editingBlog, excerpt: e.target.value })
                  }
                  placeholder="Concise summary shown on cards and Google search previews"
                />
              </div>

              {/* Rich Markdown & Content Studio */}
              <div className="admin-field admin-field-full">
                <label>
                  <span>Full Article Content (Rich Markdown)</span>
                  <span className="label-hint">Formatting toolbar • Live preview • Word counter</span>
                </label>
                <RichMarkdownEditor
                  value={editingBlog.content}
                  onChange={(val) => setEditingBlog({ ...editingBlog, content: val })}
                  onReadTimeCalculated={(time) => setEditingBlog({ ...editingBlog, readTime: time })}
                  placeholder="Write your comprehensive insights here..."
                />
              </div>

              {/* Cover Image Upload */}
              <div className="admin-field admin-field-full">
                <label>Cover Image (CDN / Cloudinary)</label>
                <div className="admin-image-upload-row">
                  <input
                    type="text"
                    className="admin-input"
                    value={editingBlog.coverImage}
                    onChange={(e) =>
                      setEditingBlog({ ...editingBlog, coverImage: e.target.value })
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
                {editingBlog.coverImage && (
                  <div className="admin-preview-thumbnail" style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "12px" }}>
                    <Image
                      src={editingBlog.coverImage}
                      alt="Cover Preview"
                      width={160}
                      height={90}
                      style={{ objectFit: "cover", borderRadius: "6px", border: "1px solid #1e293b" }}
                    />
                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                      <p style={{ margin: "0 0 4px", color: "#22c55e", fontWeight: 600 }}>✓ Image Connected</p>
                      <button
                        type="button"
                        onClick={() => setEditingBlog({ ...editingBlog, coverImage: "" })}
                        style={{ background: "transparent", border: "none", color: "#f87171", cursor: "pointer", padding: 0, fontSize: "11px", textDecoration: "underline" }}
                      >
                        Remove image
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="admin-field">
                <label>SEO Meta Title (Optional)</label>
                <input
                  type="text"
                  className="admin-input"
                  value={editingBlog.metaTitle || ""}
                  onChange={(e) =>
                    setEditingBlog({ ...editingBlog, metaTitle: e.target.value })
                  }
                  placeholder="Custom title tag for Google"
                />
              </div>

              <div className="admin-field">
                <label>Publish Status</label>
                <div style={{ marginTop: "10px", display: "flex", gap: "18px" }}>
                  <label style={{ fontSize: "13px", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", color: "#f1f5f9" }}>
                    <input
                      type="checkbox"
                      checked={editingBlog.isPublished}
                      onChange={(e) =>
                        setEditingBlog({ ...editingBlog, isPublished: e.target.checked })
                      }
                    />
                    Published Live
                  </label>
                  <label style={{ fontSize: "13px", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", color: "#f1f5f9" }}>
                    <input
                      type="checkbox"
                      checked={editingBlog.isFeatured}
                      onChange={(e) =>
                        setEditingBlog({ ...editingBlog, isFeatured: e.target.checked })
                      }
                    />
                    Featured on Home
                  </label>
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn-outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save & Publish Article"}
              </button>
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
