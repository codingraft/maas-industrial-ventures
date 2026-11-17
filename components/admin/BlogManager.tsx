"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { BlogPost } from "@/lib/types";
import { ToastContainer, ConfirmModal, ToastMessage } from "@/components/admin/AdminDialogs";
import { Pagination } from "@/components/ui/Pagination";
import { TableSkeleton } from "@/components/admin/ui/AdminSkeleton";
import { AdminBadge } from "@/components/admin/ui/AdminBadge";
import { AdminToolbar, AdminSearchInput } from "@/components/admin/ui/AdminToolbar";
import { AdminTabs, TabOption } from "@/components/admin/ui/AdminTabs";

const RichMarkdownEditor = dynamic(
  () => import("@/components/admin/RichMarkdownEditor"),
  {
    ssr: false,
    loading: () => (
      <div style={{ padding: "60px 20px", textAlign: "center", color: "var(--admin-text-muted)", background: "var(--admin-bg-card-subtle)", borderRadius: "8px" }}>
        Loading Content Studio Editor...
      </div>
    ),
  }
);

type BlogStudioTab = "writing" | "publishing";

const BLOG_STUDIO_TABS: TabOption<BlogStudioTab>[] = [
  { id: "writing", label: "1. Article Writing Canvas" },
  { id: "publishing", label: "2. Publishing, Cover & SEO" },
];

export function BlogManager() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [studioTab, setStudioTab] = useState<BlogStudioTab>("writing");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  // Pagination & Filtering state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [categories, setCategories] = useState<string[]>([]);
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

  const fetchBlogs = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", pageSize.toString());
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (category && category !== "all") params.set("category", category);

      const res = await fetch(`/api/admin/blogs?${params.toString()}`, { signal });
      if (!res.ok) throw new Error("Failed to fetch blog posts");
      const data = await res.json();
      const fetchedBlogs = data.blogs || [];
      setBlogs(fetchedBlogs);

      if (data.pagination) {
        setPagination(data.pagination);
      }

      setCategories((prev) => {
        const newCats = Array.from(
          new Set([...prev, ...fetchedBlogs.map((b: BlogPost) => b.category)])
        ).filter(Boolean);
        return newCats;
      });
    } catch (err: unknown) {
      if ((err as Error)?.name === "AbortError") return;
      addToast("error", "Error loading blogs", err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch, category]);

  useEffect(() => {
    const controller = new AbortController();
    fetchBlogs(controller.signal);
    return () => controller.abort();
  }, [fetchBlogs]);

  // Deep link check on mount
  useEffect(() => {
    if (typeof window === "undefined" || blogs.length === 0) return;
    const urlParams = new URLSearchParams(window.location.search);
    const editSlug = urlParams.get("edit");
    const actionParam = urlParams.get("action");
    if (actionParam === "create") {
      setEditingBlog((prev) => {
        if (prev) return prev;
        return {
          id: `blog-${Date.now()}`,
          title: "",
          slug: "",
          category: "Policy & Subsidies",
          excerpt: "",
          content: "## Article Headline\n\nWrite your insights here. You can format with **bold**, *italics*, bullet points, and tables.",
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
      });
      setStudioTab("writing");
    } else if (editSlug) {
      const match = blogs.find(
        (b: BlogPost) => b.slug === editSlug || b.id === editSlug
      );
      if (match) {
        setEditingBlog((prev) => prev || { ...match });
        setStudioTab("writing");
      }
    }
  }, [blogs]);

  function handleCreateNew(updateUrl = true) {
    const newPost: BlogPost = {
      id: `blog-${Date.now()}`,
      title: "",
      slug: "",
      category: "Policy & Subsidies",
      excerpt: "",
      content: "## Article Headline\n\nWrite your insights here. You can format with **bold**, *italics*, bullet points, and tables.",
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
    setStudioTab("writing");

    if (updateUrl && typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("action", "create");
      url.searchParams.delete("edit");
      window.history.pushState({}, "", url.toString());
    }
  }

  async function handleEdit(post: BlogPost, updateUrl = true) {
    let target = post;
    if (!post.content) {
      try {
        const res = await fetch(`/api/admin/blogs/${post.slug || post.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.blog) {
            target = data.blog;
          }
        }
      } catch (err) {
        console.error("Failed to fetch full blog post content:", err);
      }
    }

    setEditingBlog({ ...target });
    setStudioTab("writing");

    if (updateUrl && typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("edit", target.slug || target.id);
      url.searchParams.delete("action");
      window.history.pushState({}, "", url.toString());
    }
  }

  function handleCloseStudio() {
    setEditingBlog(null);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("edit");
      url.searchParams.delete("action");
      window.history.pushState({}, "", url.toString());
    }
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
      setStudioTab("writing");
      return;
    }
    if (!editingBlog.excerpt.trim()) {
      addToast("error", "Validation error", "Article excerpt is required.");
      setStudioTab("publishing");
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
      handleCloseStudio();
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

  // =========================================================================
  // VIEW MODE 1: FULL-PAGE BLOG EDITORIAL STUDIO
  // =========================================================================
  if (editingBlog) {
    const wordCount = (editingBlog.content?.match(/\b\S+\b/g) || []).length;
    const excerptLen = editingBlog.excerpt?.length || 0;
    const isExcerptOptimal = excerptLen >= 120 && excerptLen <= 165;

    return (
      <div className="admin-full-studio">
        {/* Sticky Executive Action Topbar */}
        <div className="studio-sticky-header">
          <div className="studio-header-left">
            <button
              type="button"
              className="studio-back-btn"
              onClick={handleCloseStudio}
              title="Return to Articles Hub"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span>Back to Articles</span>
            </button>

            <div className="studio-header-titles">
              <div className="studio-breadcrumb">
                Insights Studio / {editingBlog.title ? "Edit Article" : "New Article"}
              </div>
              <h2 className="studio-main-title">
                {editingBlog.title || "Untitled Article"}
              </h2>
            </div>
          </div>

          <div className="studio-header-actions desktop-only">
            <span style={{ fontSize: "12px", color: "var(--admin-text-muted)", marginRight: "4px" }}>
              {wordCount} words • {editingBlog.readTime}
            </span>

            <AdminBadge variant={editingBlog.isPublished ? "success" : "neutral"} dot>
              {editingBlog.isPublished ? "Published Live" : "Draft"}
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
              {saving ? "Saving Changes…" : "✓ Save & Publish"}
            </button>
          </div>
        </div>

        {/* Studio Segmented Step Tabs */}
        <div style={{ marginBottom: "20px" }}>
          <AdminTabs
            tabs={BLOG_STUDIO_TABS}
            activeTab={studioTab}
            onChange={(tabId) => setStudioTab(tabId)}
          />
        </div>

        {/* STUDIO PANE 1: EDITORIAL WRITING CANVAS */}
        {studioTab === "writing" && (
          <div className="studio-card" style={{ padding: "28px" }}>
            <div style={{ marginBottom: "16px" }}>
              <input
                type="text"
                className="editorial-title-input"
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
                placeholder="Enter Article Headline..."
              />
              <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", fontSize: "12px", color: "var(--admin-text-dim)" }}>
                <span>Category: <strong style={{ color: "var(--admin-gold)" }}>{editingBlog.category}</strong></span>
                <span>•</span>
                <span>Author: <strong style={{ color: "var(--admin-text-main)" }}>{editingBlog.author}</strong></span>
                <span>•</span>
                <span>Slug: <code>/blog/{editingBlog.slug || "slug"}</code></span>
              </div>
            </div>

            {/* Full-width Responsive Markdown Editor */}
            <RichMarkdownEditor
              value={editingBlog.content}
              height={580}
              onChange={(val) => setEditingBlog({ ...editingBlog, content: val })}
              onReadTimeCalculated={(time) => setEditingBlog({ ...editingBlog, readTime: time })}
              placeholder="Write your comprehensive insights here..."
            />

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setStudioTab("publishing")}
              >
                Proceed to Publishing &amp; SEO →
              </button>
            </div>
          </div>
        )}

        {/* STUDIO PANE 2: PUBLISHING, COVER & SEO */}
        {studioTab === "publishing" && (
          <div className="studio-layout-grid">
            {/* Left: Metadata and Publishing Form */}
            <div className="studio-main-col">
              <div className="studio-card">
                <div className="studio-card-header">
                  <h3 className="studio-card-title">Article Metadata &amp; Cover Imagery</h3>
                  <p className="studio-card-desc">Configure publishing categories, custom slugs, cover banner images, and author profiles.</p>
                </div>

                <div className="admin-form-grid">
                  <div className="admin-field">
                    <label>
                      <span>URL Slug Identifier <span className="required-star">*</span></span>
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
                    <label>
                      <span>Editorial Category</span>
                      <span className="label-hint">Group topic filter</span>
                    </label>
                    <input
                      type="text"
                      className="admin-input"
                      value={editingBlog.category}
                      onChange={(e) =>
                        setEditingBlog({ ...editingBlog, category: e.target.value })
                      }
                      placeholder="e.g. Policy & Subsidies, Market Insights"
                    />
                  </div>

                  <div className="admin-field">
                    <label>
                      <span>Author Name</span>
                      <span className="label-hint">Byline display</span>
                    </label>
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

                  <div className="admin-field">
                    <label>
                      <span>Estimated Reading Time</span>
                      <span className="label-hint">e.g. 4 min read</span>
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
                      <span>Author Bio / Advisory Role (Optional)</span>
                      <span className="label-hint">Appears in author profile card at bottom of article</span>
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

                  <div className="admin-field admin-field-full">
                    <label style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Short Excerpt / Meta Snippet <span className="required-star">*</span></span>
                      <span style={{ fontSize: "11px", color: isExcerptOptimal ? "var(--admin-success)" : "var(--admin-text-muted)" }}>
                        {excerptLen}/160 chars {isExcerptOptimal ? "✓ Optimal SEO" : ""}
                      </span>
                    </label>
                    <textarea
                      className="admin-textarea"
                      rows={3}
                      value={editingBlog.excerpt}
                      onChange={(e) =>
                        setEditingBlog({ ...editingBlog, excerpt: e.target.value })
                      }
                      placeholder="Concise summary shown on blog cards and in Google search previews"
                    />
                  </div>

                  {/* Cover Image Upload */}
                  <div className="admin-field admin-field-full">
                    <label>
                      <span>Cover Image (CDN / Cloudinary URL)</span>
                      <span className="label-hint">High-resolution banner photo</span>
                    </label>
                    <div className="admin-image-upload-row">
                      <input
                        type="text"
                        className="admin-input"
                        value={editingBlog.coverImage}
                        onChange={(e) =>
                          setEditingBlog({ ...editingBlog, coverImage: e.target.value })
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
                    </div>

                    {editingBlog.coverImage && (
                      <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "12px" }}>
                        <Image
                          src={editingBlog.coverImage}
                          alt="Cover Preview"
                          width={160}
                          height={90}
                          style={{ objectFit: "cover", borderRadius: "6px", border: "1px solid var(--admin-border)" }}
                        />
                        <div style={{ fontSize: "12px", color: "var(--admin-text-muted)" }}>
                          <span style={{ color: "var(--admin-success)", fontWeight: 600 }}>✓ Cover Connected</span>
                          <div style={{ fontSize: "11px", marginTop: "4px" }}>Displays at top of article and in shared social previews</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--admin-border-subtle)" }}>
                  <button
                    type="button"
                    className="admin-btn admin-btn-outline"
                    onClick={() => setStudioTab("writing")}
                  >
                    ← Back to Writing Canvas
                  </button>

                  <button
                    type="button"
                    className="admin-btn admin-btn-primary"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? "Saving Changes…" : "✓ Save & Publish Article"}
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Live SERP Snippet & Visibility Controls */}
            <div className="studio-sidebar-col">
              {/* Google SERP Snippet Preview */}
              <div className="studio-card">
                <h4 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>🔍 Google Search Preview</span>
                </h4>

                <div className="serp-card" style={{ background: "#0b0f1a", padding: "14px", borderRadius: "8px", border: "1px solid var(--admin-border)" }}>
                  <div className="serp-url-row" style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "12px" }}>🌐</span>
                    <span style={{ fontSize: "11.5px", color: "var(--admin-text-dim)" }}>
                      maasventures.com &rsaquo; blog &rsaquo; {editingBlog.slug || "your-slug"}
                    </span>
                  </div>
                  <div style={{ fontSize: "15px", fontWeight: 600, color: "#60a5fa", lineHeight: 1.3, marginBottom: "4px" }}>
                    {editingBlog.metaTitle || editingBlog.title || "Article Headline"}
                  </div>
                  <div style={{ fontSize: "12px", color: "#94a3b8", lineHeight: 1.45 }}>
                    {editingBlog.excerpt || "Article snippet will be extracted here for search result descriptions..."}
                  </div>
                </div>

                <div style={{ marginTop: "16px" }}>
                  <label className="label-hint" style={{ display: "block", marginBottom: "4px" }}>
                    Custom SEO Meta Title (Optional)
                  </label>
                  <input
                    type="text"
                    className="admin-input"
                    value={editingBlog.metaTitle || ""}
                    onChange={(e) =>
                      setEditingBlog({ ...editingBlog, metaTitle: e.target.value })
                    }
                    placeholder="Custom Title for Google SERP"
                  />
                </div>
              </div>

              {/* Publishing Controls Card */}
              <div className="studio-card">
                <h4 style={{ margin: "0 0 14px", fontSize: "14px", fontWeight: 700, color: "#fff" }}>
                  Visibility &amp; Promotion
                </h4>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "13px" }}>
                    <input
                      type="checkbox"
                      checked={editingBlog.isPublished}
                      onChange={(e) =>
                        setEditingBlog({ ...editingBlog, isPublished: e.target.checked })
                      }
                    />
                    <span>Published Live on Website</span>
                  </label>

                  <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "13px" }}>
                    <input
                      type="checkbox"
                      checked={editingBlog.isFeatured}
                      onChange={(e) =>
                        setEditingBlog({ ...editingBlog, isFeatured: e.target.checked })
                      }
                    />
                    <span>Featured on Homepage Strip</span>
                  </label>

                  {editingBlog.slug && (
                    <a
                      href={`/blog/${editingBlog.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="admin-btn admin-btn-outline"
                      style={{ textAlign: "center", textDecoration: "none", marginTop: "6px" }}
                    >
                      View Live Article ↗
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

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
            {saving ? "Saving…" : "Save Article"}
          </button>
        </div>

        {/* In-app toasts */}
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    );
  }

  // =========================================================================
  // VIEW MODE 2: BLOG CATALOG & LISTING
  // =========================================================================
  return (
    <div className="admin-blog-studio">
      <div className="admin-studio-header">
        <div>
          <h2>Insights, News &amp; SEO Blog Manager</h2>
          <p className="admin-studio-desc">
            Publish market insights, UP policy updates, and expressway connectivity reports to boost organic Google SEO traffic.
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
          <span>Write New Article</span>
        </button>
      </div>

      {/* Standardized Search & Filter Toolbar */}
      <AdminToolbar>
        <AdminSearchInput
          placeholder="Search articles by title, excerpt, or category..."
          value={search}
          onChange={(val) => setSearch(val)}
        />

        {categories.length > 0 && (
          <select
            className="admin-select"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            aria-label="Filter by Category"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}

        <select
          className="admin-select"
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setPage(1);
          }}
          aria-label="Articles per page"
        >
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
          <option value={50}>50 per page</option>
        </select>
      </AdminToolbar>

      {loading ? (
        <TableSkeleton rows={pageSize > 10 ? 10 : pageSize} cols={5} />
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
                  src={b.coverImage || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80"}
                  alt={b.title}
                  width={320}
                  height={180}
                  className="abr-img"
                  style={{ objectFit: "cover" }}
                />
              </div>

              <div className="abr-content">
                <div className="abr-meta">
                  <AdminBadge variant="gold">{b.category}</AdminBadge>
                  <span className="abr-divider">•</span>
                  <span className="abr-date">{b.publishedAt}</span>
                  <span className="abr-divider">•</span>
                  <span className="abr-time">{b.readTime}</span>
                  <AdminBadge variant={b.isPublished ? "success" : "neutral"} dot>
                    {b.isPublished ? "Published" : "Draft"}
                  </AdminBadge>
                  {b.isFeatured && (
                    <AdminBadge variant="info">Featured</AdminBadge>
                  )}
                </div>

                <h3 className="abr-title">{b.title}</h3>
                <p className="abr-excerpt">{b.excerpt}</p>
                <div className="abr-slug" style={{ color: "var(--admin-text-dim)", fontSize: "11.5px" }}>
                  Slug: <code style={{ color: "var(--admin-gold)" }}>/blog/{b.slug}</code>
                </div>
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
                  onClick={() => handleEdit(b, true)}
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

      {/* Backend Pagination */}
      {!loading && blogs.length > 0 && pagination.totalPages > 1 && (
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
