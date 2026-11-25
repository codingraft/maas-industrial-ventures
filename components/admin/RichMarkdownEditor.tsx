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

const modes = [
  { id: "edit", label: "Edit" },
  { id: "live", label: "Split view" },
  { id: "preview", label: "Preview" },
] as const;

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
    const query = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const visibleMode = isMobile && previewMode === "live" ? "edit" : previewMode;

  // Compute word count and reading time
  const wordCount = (value.match(/\b\S+\b/g) || []).length;
  const charCount = value.length;
  const estimatedMin = Math.max(1, Math.ceil(wordCount / 200));
  const readTimeString = `${estimatedMin} min read`;

  return (
    <div className="rich-editor-container" data-color-mode="light">
      <div className="article-mode-toolbar">
        <strong>Article body</strong>
        <div className="article-mode-group" role="group" aria-label="Editor view">
          {modes.filter(mode => !isMobile || mode.id !== "live").map(mode => (
            <button key={mode.id} type="button" aria-pressed={visibleMode === mode.id}
              onClick={() => setPreviewMode(mode.id)}>
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      <div className="editor-library-wrapper">
        <MDEditor
          value={value}
          onChange={(val) => onChange(val || "")}
          height={height}
          preview={visibleMode}
          commandsFilter={(command, extra) => !extra || command.name === "fullscreen" ? command : false}
          textareaProps={{
            placeholder,
            "aria-label": "Article Markdown",
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
