"use client";

import React from "react";
import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="editor-loading-skeleton">
        <span>Loading Content Studio Editor...</span>
      </div>
    ),
  }
);

interface RichMarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  onReadTimeCalculated?: (readTime: string) => void;
}

export default function RichMarkdownEditor({
  value,
  onChange,
  placeholder = "Write your article content using markdown...",
  onReadTimeCalculated,
}: RichMarkdownEditorProps) {
  // Compute word count and reading time
  const wordCount = (value.match(/\b\S+\b/g) || []).length;
  const charCount = value.length;
  const estimatedMin = Math.max(1, Math.ceil(wordCount / 200));
  const readTimeString = `${estimatedMin} min read`;

  return (
    <div className="rich-editor-container" data-color-mode="dark">
      <div className="editor-library-wrapper">
        <MDEditor
          value={value}
          onChange={(val) => onChange(val || "")}
          height={420}
          preview="live"
          textareaProps={{
            placeholder,
          }}
        />
      </div>

      {/* Editor Footer / Metadata Bar */}
      <div className="rich-editor-footer">
        <div className="editor-stats">
          <span className="stat-item">{wordCount} words</span>
          <span className="stat-dot">•</span>
          <span className="stat-item">{charCount} characters</span>
          <span className="stat-dot">•</span>
          <span className="stat-item stat-readtime">{readTimeString}</span>
        </div>

        {onReadTimeCalculated && (
          <button
            type="button"
            className="editor-sync-readtime-btn"
            onClick={() => onReadTimeCalculated(readTimeString)}
            title="Auto-fill Reading Time field in the form"
          >
            Apply &quot;{readTimeString}&quot; to form
          </button>
        )}
      </div>
    </div>
  );
}
