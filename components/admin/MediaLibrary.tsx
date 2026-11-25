"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import Image from "next/image";
import { MediaItem } from "@/lib/types";
import { uploadImage } from "@/lib/imageOptimizer";
import { ToastContainer, ConfirmModal, ToastMessage } from "@/components/admin/AdminDialogs";

export function MediaLibrary() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  // Search & Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [format, setFormat] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Overall Stats
  const [stats, setStats] = useState({
    totalCount: 0,
    totalBytes: 0,
    webpCount: 0,
    uploadsCount: 0,
  });

  // State for Uploading
  const [uploading, setUploading] = useState(false);

  // Lightbox Preview Modal
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);

  // In-app toasts & Confirm Dialog
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

  const loadMedia = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        q: search,
        category,
        format,
        sort,
      });

      const res = await fetch(`/api/admin/media?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load media assets");
      const data = await res.json();

      setItems(data.media || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.total || 0);
      if (data.stats) setStats(data.stats);
    } catch (err: unknown) {
      addToast("error", "Error", err instanceof Error ? err.message : "Failed to load media");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, category, format, sort]);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  // Upload handler with client-side WebP optimization
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    let successCount = 0;
    try {
      for (let i = 0; i < files.length; i++) {
        await uploadImage(files[i]);
        successCount++;
      }
      addToast(
        "success",
        "Upload Complete",
        `${successCount} asset${successCount > 1 ? "s" : ""} converted to WebP and uploaded successfully.`
      );
      loadMedia();
    } catch (err: unknown) {
      addToast("error", "Upload failed", err instanceof Error ? err.message : "Upload error");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  // Copy Link
  function handleCopyLink(url: string) {
    const fullUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    addToast("success", "Link Copied!", fullUrl);
  }

  // Delete Asset
  function promptDelete(item: MediaItem) {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Media Asset",
      message: `Are you sure you want to delete "${item.fileName}"? This cannot be undone if it is a local upload file.`,
      action: async () => {
        try {
          const res = await fetch("/api/admin/media", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: item.url }),
          });
          if (!res.ok) throw new Error("Failed to delete asset");
          addToast("success", "Asset Deleted", `Removed ${item.fileName}`);
          loadMedia();
        } catch (err: unknown) {
          addToast("error", "Delete error", err instanceof Error ? err.message : "Failed to delete");
        }
      },
    });
  }

  const formatSize = (bytes?: number) => {
    if (!bytes) return "—";
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
  };

  return (
    <div className="admin-media-library-page">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel="Delete Asset"
        isDanger
        onConfirm={() => {
          confirmDialog.action();
          setConfirmDialog((p) => ({ ...p, isOpen: false }));
        }}
        onCancel={() => setConfirmDialog((p) => ({ ...p, isOpen: false }))}
      />

      {/* 1. Header with Upload Action */}
      <div className="admin-studio-header" style={{ marginBottom: "20px" }}>
        <div>
          <h2>Media library</h2>
          <p className="admin-studio-desc">
            Find project photos and blueprints, see where they are used, or upload new files.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <label className="admin-btn admin-btn-primary media-upload-control">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>{uploading ? "Optimizing & Uploading…" : "Upload images"}</span>
            <input
              type="file"
              accept="image/*"
              multiple
              aria-label="Upload images"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {/* 2. Key Metrics Bar */}
      <div className="minimal-stats-strip" style={{ marginBottom: "24px" }}>
        <div className="minimal-stat-card">
          <span className="minimal-stat-num">{stats.totalCount}</span>
          <span className="minimal-stat-lbl">Total Media Assets</span>
        </div>
        <div className="minimal-stat-card">
          <span className="minimal-stat-num">
            {stats.webpCount}
          </span>
          <span className="minimal-stat-lbl">WebP Optimized Assets</span>
        </div>
        <div className="minimal-stat-card">
          <span className="minimal-stat-num">
            {formatSize(stats.totalBytes)}
          </span>
          <span className="minimal-stat-lbl">Upload Disk Storage</span>
        </div>
        <div className="minimal-stat-card">
          <span className="minimal-stat-num">{stats.uploadsCount}</span>
          <span className="minimal-stat-lbl">Custom User Uploads</span>
        </div>
      </div>

      {/* 3. Filtering & Search Toolbar */}
      <div className="media-toolbar-card">
        <div className="media-toolbar-row">
          {/* Search Box */}
          <div className="media-search-wrap">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="media-search-input" aria-label="Search media library"
              placeholder="Search assets by filename, alt text, or URL..."
              value={search}
              onChange={(e) => {
                startTransition(() => {
                  setSearch(e.target.value);
                  setPage(1);
                });
              }}
            />
            {search && (
              <button
                type="button"
                className="media-search-clear" aria-label="Clear media search"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
              >
                ✕
              </button>
            )}
          </div>

          <details className="media-filter-disclosure">
            <summary>Filters &amp; sorting{(category !== "all" || format !== "all") && " · Active"}</summary>
            <div className="media-filter-fields">
          {/* Category Filter */}
          <div className="media-filter-group">
            <label className="media-filter-label" htmlFor="media-Category">Category</label>
            <select id="media-Category"
              className="admin-select"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All Categories ({stats.totalCount})</option>
              <option value="uploads">Uploads Directory</option>
              <option value="hero">Hero Carousel &amp; Section Visuals</option>
              <option value="project">Projects Portfolio</option>
              <option value="blog">Insights &amp; Blog Posts</option>
              <option value="gallery">Gallery Photos</option>
              <option value="branding">Brand Logos</option>
            </select>
          </div>

          {/* Format Filter */}
          <div className="media-filter-group">
            <label className="media-filter-label" htmlFor="media-Format">Format</label>
            <select id="media-Format"
              className="admin-select"
              value={format}
              onChange={(e) => {
                setFormat(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All Formats</option>
              <option value="webp">WebP (Optimized)</option>
              <option value="png">PNG</option>
              <option value="jpg">JPG / JPEG</option>
              <option value="svg">SVG Vector</option>
            </select>
          </div>

          {/* Sort Filter */}
          <div className="media-filter-group">
            <label className="media-filter-label" htmlFor="media-Sort">Sort</label>
            <select id="media-Sort"
              className="admin-select"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name (A-Z)</option>
              <option value="size">Size (Largest)</option>
            </select>
          </div>

          {/* Per Page */}
          <div className="media-filter-group">
            <label className="media-filter-label" htmlFor="media-Per-Page">Per Page</label>
            <select id="media-Per-Page"
              className="admin-select"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
            >
              <option value="12">12</option>
              <option value="24">24</option>
              <option value="48">48</option>
            </select>
          </div>
            </div>
          </details>
        </div>
      </div>

      {/* 4. Asset Grid */}
      {loading ? (
        <div className="media-grid">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="media-card-skeleton" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="admin-empty-state" style={{ padding: "60px 20px" }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--admin-text-dim)" strokeWidth="1.5" style={{ marginBottom: "12px" }}>
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
          <h3>No media assets match your filters</h3>
          <p>Try clearing your search terms or upload new images using the button above.</p>
        </div>
      ) : (
        <div className="media-grid">
          {items.map((item) => (
            <div key={item.id} className="media-card">
              {/* Thumbnail Container */}
              <div className="media-card-thumb" onClick={() => setPreviewItem(item)}>
                <Image
                  src={item.url}
                  alt={item.alt || item.fileName}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
                  style={{ objectFit: "cover" }}
                />

                {/* Badges */}
                <span className={`media-format-badge format-${item.format}`}>
                  {item.format.toUpperCase()}
                </span>

                {item.usageCount && (item.usageCount ?? 0) > 0 ? (
                  <span className="media-usage-badge" title="Active references on site">
                    {item.usageCount} in use
                  </span>
                ) : null}

              </div>

              {/* Meta Info */}
              <div className="media-card-info">
                <div className="media-card-name" title={item.fileName}>
                  {item.fileName}
                </div>
                <div className="media-card-specs">
                  <span className="media-source-pill">{item.source}</span>
                  <span className="media-size-text">{formatSize(item.sizeBytes)}</span>
                </div>
              </div>
              <div className="media-file-actions">
                  <button
                    type="button"
                    className="media-card-action-btn"
                    title="Preview Full Size"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewItem(item);
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    className="media-card-action-btn"
                    title="Copy Image URL"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyLink(item.url);
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    className="media-card-action-btn btn-danger-action"
                    disabled={item.source !== "uploads" || (item.usageCount ?? 0) > 0}
                    title={item.usageCount ? "Remove references before deleting" : "Delete local upload"}
                    onClick={(e) => {
                      e.stopPropagation();
                      promptDelete(item);
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                  </button>
                </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. Pagination Bar */}
      {totalPages > 1 && (
        <div className="media-pagination-bar">
          <div className="media-pagination-info">
            Showing Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalCount} assets)
          </div>

          <div className="media-pagination-controls">
            <button
              type="button"
              className="admin-btn admin-btn-outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => {
              const pNum = idx + 1;
              if (
                pNum === 1 ||
                pNum === totalPages ||
                (pNum >= page - 2 && pNum <= page + 2)
              ) {
                return (
                  <button
                    key={pNum}
                    type="button"
                    className={`media-page-btn ${page === pNum ? "is-active" : ""}`}
                    onClick={() => setPage(pNum)}
                  >
                    {pNum}
                  </button>
                );
              }
              if (pNum === page - 3 || pNum === page + 3) {
                return <span key={pNum} className="media-page-ellipsis">…</span>;
              }
              return null;
            })}

            <button
              type="button"
              className="admin-btn admin-btn-outline"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* 6. Lightbox Preview Modal */}
      {previewItem && (
        <div className="media-lightbox-overlay" onClick={() => setPreviewItem(null)}>
          <div className="media-lightbox-card" onClick={(e) => e.stopPropagation()}>
            <div className="media-lightbox-header">
              <div>
                <h4 className="media-lightbox-title">{previewItem.fileName}</h4>
                <p className="media-lightbox-sub">{previewItem.url}</p>
              </div>
              <button
                type="button"
                className="media-picker-close-btn"
                onClick={() => setPreviewItem(null)}
              >
                ✕
              </button>
            </div>

            <div className="media-lightbox-view">
              <div style={{ position: "relative", width: "100%", height: "420px" }}>
                <Image
                  src={previewItem.url}
                  alt={previewItem.alt || previewItem.fileName}
                  fill
                  style={{ objectFit: "contain" }}
                  unoptimized={previewItem.url.endsWith(".svg") || previewItem.url.startsWith("data:")}
                />
              </div>
            </div>

            <div className="media-lightbox-details">
              <div className="media-lightbox-detail-col">
                <span className="media-detail-lbl">Format</span>
                <span className="media-detail-val">{previewItem.format.toUpperCase()}</span>
              </div>
              <div className="media-lightbox-detail-col">
                <span className="media-detail-lbl">File Size</span>
                <span className="media-detail-val">{formatSize(previewItem.sizeBytes)}</span>
              </div>
              <div className="media-lightbox-detail-col">
                <span className="media-detail-lbl">Source Section</span>
                <span className="media-detail-val">{previewItem.source}</span>
              </div>
              <div className="media-lightbox-detail-col">
                <span className="media-detail-lbl">Added Date</span>
                <span className="media-detail-val">{new Date(previewItem.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="media-lightbox-footer">
              <button
                type="button"
                className="admin-btn admin-btn-outline"
                onClick={() => handleCopyLink(previewItem.url)}
              >
                Copy Link to Clipboard
              </button>
              <a
                href={previewItem.url}
                target="_blank"
                rel="noopener noreferrer"
                className="admin-btn admin-btn-primary"
              >
                Open in Full Window ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
