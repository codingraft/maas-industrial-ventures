"use client";

import React from "react";

interface AdminToolbarProps {
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function AdminToolbar({
  children,
  actions,
  className = "",
}: AdminToolbarProps) {
  return (
    <div className={`admin-toolbar-wrap ${className}`}>
      <div className="admin-toolbar-group">{children}</div>
      {actions && <div className="admin-toolbar-actions">{actions}</div>}
    </div>
  );
}

interface AdminSearchInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export function AdminSearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
}: AdminSearchInputProps) {
  return (
    <div className={`admin-search-input-wrap ${className}`}>
      <svg
        className="admin-search-icon"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        type="text"
        className="admin-search-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          type="button"
          className="admin-search-clear"
          onClick={() => onChange("")}
          aria-label="Clear search"
        >
          &times;
        </button>
      )}
    </div>
  );
}
