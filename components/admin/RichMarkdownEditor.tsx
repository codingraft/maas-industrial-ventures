"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="editor-loading-skeleton" style={{ padding: "40px", textAlign: "center", color: "var(--admin-text-muted)" }}>
        <span>Loading Content Studio Editor...</span>
      </div>
    ),
  }
);

interface RichMarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  height?: number;
  onReadTimeCalculated?: (readTime: string) => void;
}

export default function RichMarkdownEditor({
  value,
  onChange,
  placeholder = "Write your comprehensive insights here using markdown...",
  height = 540,
  onReadTimeCalculated,
}: RichMarkdownEditorProps) {
  const [previewMode, setPreviewMode] = useState<"live" | "edit" | "preview">("live");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setPreviewMode("edit");
      } else {
        setPreviewMode("live");
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Compute word count and reading time
  const wordCount = (value.match(/\b\S+\b/g) || []).length;
  const charCount = value.length;
  const estimatedMin = Math.max(1, Math.ceil(wordCount / 200));
  const readTimeString = `${estimatedMin} min read`;

  return (
    <div className="rich-editor-container" data-color-mode="dark">
      {/* View Mode Switcher for responsive control */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <span style={{ fontSize: "11.5px", color: "var(--admin-text-dim)" }}>
          Markdown Formatting Studio
        </span>
        <div style={{ display: "inline-flex", background: "var(--admin-bg-card-subtle)", borderRadius: "6px", padding: "2px", border: "1px solid var(--admin-border-subtle)" }}>
          <button
            type="button"
            onClick={() => setPreviewMode("edit")}
            style={{
              padding: "3px 10px",
              fontSize: "11px",
              fontWeight: previewMode === "edit" ? 700 : 500,
              background: previewMode === "edit" ? "var(--admin-bg-elevated)" : "transparent",
              color: previewMode === "edit" ? "#fff" : "var(--admin-text-muted)",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            ✍️ Edit
          </button>
          {!isMobile && (
            <button
              type="button"
              onClick={() => setPreviewMode("live")}
              style={{
                padding: "3px 10px",
                fontSize: "11px",
                fontWeight: previewMode === "live" ? 700 : 500,
                background: previewMode === "live" ? "var(--admin-bg-elevated)" : "transparent",
                color: previewMode === "live" ? "#fff" : "var(--admin-text-muted)",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              ↔ Split Live
            </button>
          )}
          <button
            type="button"
            onClick={() => setPreviewMode("preview")}
            style={{
              padding: "3px 10px",
              fontSize: "11px",
              fontWeight: previewMode === "preview" ? 700 : 500,
              background: previewMode === "preview" ? "var(--admin-bg-elevated)" : "transparent",
              color: previewMode === "preview" ? "#fff" : "var(--admin-text-muted)",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            👁 Preview
          </button>
        </div>
      </div>

      <div className="editor-library-wrapper">
        <MDEditor
          value={value}
          onChange={(val) => onChange(val || "")}
          height={height}
          preview={previewMode}
          textareaProps={{
            placeholder,
          }}
        />
      </div>

      {/* Editor Footer / Metadata Bar */}
      <div className="rich-editor-footer" style={{ marginTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
        <div className="editor-stats" style={{ display: "flex", gap: "8px", fontSize: "11.5px", color: "var(--admin-text-muted)" }}>
          <span className="stat-item">{wordCount} words</span>
          <span className="stat-dot">•</span>
          <span className="stat-item">{charCount} characters</span>
          <span className="stat-dot">•</span>
          <span className="stat-item stat-readtime" style={{ color: "var(--admin-gold)", fontWeight: 600 }}>{readTimeString}</span>
        </div>

        {onReadTimeCalculated && (
          <button
            type="button"
            className="editor-sync-readtime-btn"
            onClick={() => onReadTimeCalculated(readTimeString)}
            title="Auto-fill Reading Time field in the form"
            style={{ fontSize: "11px", padding: "4px 10px", background: "transparent", border: "1px dashed var(--admin-border)", color: "var(--admin-gold)", borderRadius: "4px", cursor: "pointer" }}
          >
            Sync &quot;{readTimeString}&quot; with form
          </button>
        )}
      </div>
    </div>
  );
}
