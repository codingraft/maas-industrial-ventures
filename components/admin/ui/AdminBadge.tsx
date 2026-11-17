"use client";

import React from "react";

export type AdminBadgeVariant = "success" | "warning" | "danger" | "info" | "gold" | "neutral";

interface AdminBadgeProps {
  variant?: AdminBadgeVariant;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}

export function AdminBadge({
  variant = "neutral",
  children,
  dot = false,
  className = "",
}: AdminBadgeProps) {
  return (
    <span className={`admin-badge admin-badge-${variant} ${className}`}>
      {dot && <span className="admin-badge-dot" aria-hidden="true" />}
      {children}
    </span>
  );
}
