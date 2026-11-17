"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { MediaItem } from "@/lib/types";
import { uploadImage } from "@/lib/imageOptimizer";

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string, alt?: string) => void;
  currentUrl?: string;
  title?: string;
}

export function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  currentUrl,
  title = "Select Image from Media Library",
}: MediaPickerModalProps) {
  const [activeTab, setActiveTab] = useState<"library" | "upload" | "url">("library");
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState<string>(currentUrl || "");
  const [selectedAlt, setSelectedAlt] = useState<string>("");

  // Search & Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [format, setFormat] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Uploading state inside picker
  const [uploading, setUploading] = useState(false);
  const [directUrlInput, setDirectUrlInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: "16",
        q: search,
        category,
        format,
        sort: "newest",
      });
      const res = await fetch(`/api/admin/media?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load media");
      const data = await res.json();
      setItems(data.media || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.total || 0);
    } catch {
      setErrorMessage("Could not load media library. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, search, category, format]);

  useEffect(() => {
    if (isOpen) {
      setSelectedUrl(currentUrl || "");
      fetchMedia();
    }
  }, [isOpen, currentUrl, fetchMedia]);

  if (!isOpen) return null;

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMessage("");
    try {
      const url = await uploadImage(file);
      onSelect(url, file.name.replace(/\.[^/.]+$/, ""));
      onClose();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleConfirmSelect() {
    if (!selectedUrl) return;
    onSelect(selectedUrl, selectedAlt);
    onClose();
  }

  function handleDirectUrlSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!directUrlInput.trim()) return;
    onSelect(directUrlInput.trim());
    onClose();
  }

  return (
    <div className="media-picker-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="media-picker-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="media-picker-header">
          <div>
            <h3 className="media-picker-title">{title}</h3>
            <p className="media-picker-desc">Choose an existing optimized asset or upload a new one.</p>
          </div>
          <button type="button" className="media-picker-close-btn" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="media-picker-tabs">
          <button
            type="button"
            className={`media-picker-tab ${activeTab === "library" ? "is-active" : ""}`}
            onClick={() => setActiveTab("library")}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
            <span>Media Library ({totalCount})</span>
          </button>

          <button
            type="button"
            className={`media-picker-tab ${activeTab === "upload" ? "is-active" : ""}`}
            onClick={() => setActiveTab("upload")}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span>Upload New &amp; Convert WebP</span>
          </button>

          <button
            type="button"
            className={`media-picker-tab ${activeTab === "url" ? "is-active" : ""}`}
            onClick={() => setActiveTab("url")}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <span>Direct CDN / Image URL</span>
          </button>
        </div>

        {/* Tab 1: Library */}
        {activeTab === "library" && (
          <div className="media-picker-body">
            {/* Filter Bar */}
            <div className="media-picker-filters">
              <div className="media-picker-search">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search assets by filename or tag..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>

              <select
                className="media-picker-select"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All Categories</option>
                <option value="uploads">Uploads Directory</option>
                <option value="hero">Hero Slides &amp; Overview</option>
                <option value="project">Projects</option>
                <option value="blog">Blog Articles</option>
                <option value="gallery">Gallery Photos</option>
                <option value="branding">Brand Logos</option>
              </select>

              <select
                className="media-picker-select"
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

            {errorMessage && <div className="media-picker-error">{errorMessage}</div>}

            {/* Grid */}
            <div className="media-picker-grid">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="media-picker-skeleton" />
                ))
              ) : items.length === 0 ? (
                <div className="media-picker-empty">
                  <p>No matching media items found.</p>
                </div>
              ) : (
                items.map((item) => {
                  const isSelected = selectedUrl === item.url;
                  return (
                    <div
                      key={item.id}
                      className={`media-picker-card ${isSelected ? "is-selected" : ""}`}
                      onClick={() => {
                        setSelectedUrl(item.url);
                        setSelectedAlt(item.alt || item.fileName);
                      }}
                      onDoubleClick={() => {
                        onSelect(item.url, item.alt || item.fileName);
                        onClose();
                      }}
                    >
                      <div className="media-picker-card-thumb">
                        <Image
                          src={item.url}
                          alt={item.alt || item.fileName}
                          fill
                          sizes="(max-width: 640px) 50vw, 20vw"
                          style={{ objectFit: "cover" }}
                        />
                        <span className="media-picker-badge">{item.format.toUpperCase()}</span>
                        {isSelected && (
                          <div className="media-picker-check">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="media-picker-card-info">
                        <div className="media-picker-card-name" title={item.fileName}>
                          {item.fileName}
                        </div>
                        <div className="media-picker-card-meta">
                          <span>{item.source}</span>
                          {item.sizeBytes ? (
                            <span>{Math.round(item.sizeBytes / 1024)} KB</span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="media-picker-pagination">
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                <span>
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Upload New */}
        {activeTab === "upload" && (
          <div className="media-picker-upload-tab">
            <div className="media-picker-dropzone">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--admin-gold)" strokeWidth="1.8">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <h4>Upload &amp; Auto-Convert to WebP</h4>
              <p>Select any JPG, PNG, WebP, AVIF, or SVG. It will automatically compress and convert to WebP before uploading.</p>
              <label className="btn-gold" style={{ cursor: "pointer", display: "inline-flex" }}>
                {uploading ? "Compressing & Uploading…" : "Browse Local Files"}
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>
              {errorMessage && <div className="media-picker-error">{errorMessage}</div>}
            </div>
          </div>
        )}

        {/* Tab 3: Direct URL */}
        {activeTab === "url" && (
          <div className="media-picker-url-tab">
            <form onSubmit={handleDirectUrlSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="form-row">
                <label className="form-label">External Image URL / CDN Link</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="https://images.unsplash.com/... or https://res.cloudinary.com/..."
                  value={directUrlInput}
                  onChange={(e) => setDirectUrlInput(e.target.value)}
                  autoFocus
                />
              </div>
              {directUrlInput && (
                <div style={{ position: "relative", width: "100%", height: "200px", borderRadius: "8px", overflow: "hidden", background: "#0b110f" }}>
                  <Image src={directUrlInput} alt="Preview" fill style={{ objectFit: "contain" }} unoptimized />
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" className="btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn-gold" disabled={!directUrlInput.trim()}>
                  Use This URL
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Footer for Library Tab */}
        {activeTab === "library" && (
          <div className="media-picker-footer">
            <div className="media-picker-footer-preview">
              {selectedUrl ? (
                <>
                  <div className="media-picker-footer-thumb">
                    <Image src={selectedUrl} alt="Selected" width={38} height={38} style={{ objectFit: "cover", borderRadius: "4px" }} />
                  </div>
                  <span className="media-picker-footer-url" title={selectedUrl}>
                    {selectedUrl}
                  </span>
                </>
              ) : (
                <span style={{ fontSize: "12px", color: "var(--admin-text-dim)" }}>No asset selected</span>
              )}
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-gold"
                disabled={!selectedUrl}
                onClick={handleConfirmSelect}
              >
                Insert Selected Asset
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
