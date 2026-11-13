"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin dashboard exception:", error);
  }, [error]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#090c15",
      color: "#f1f5f9",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    }}>
      <div style={{
        maxWidth: "480px",
        width: "100%",
        background: "#111625",
        border: "1px solid #1a2235",
        borderRadius: "12px",
        padding: "32px",
        textAlign: "center",
      }}>
        <div style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          background: "rgba(239, 68, 68, 0.15)",
          color: "#ef4444",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px",
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <h2 style={{ fontSize: "18px", fontWeight: "700", margin: "0 0 8px", color: "#f8fafc" }}>
          Admin Console Error
        </h2>
        <p style={{ fontSize: "13px", color: "#94a3b8", lineHeight: "1.5", margin: "0 0 20px" }}>
          A runtime error occurred in the administration console. You can safely retry or reload the console.
        </p>

        {error.digest && (
          <p style={{
            fontSize: "11px",
            color: "#64748b",
            background: "#0b0f1a",
            padding: "6px 10px",
            borderRadius: "4px",
            fontFamily: "monospace",
            marginBottom: "20px",
          }}>
            Digest: {error.digest}
          </p>
        )}

        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              background: "#d4af37",
              color: "#0c101c",
              border: "none",
              padding: "9px 18px",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Retry Console
          </button>
          <Link
            href="/admin"
            style={{
              background: "rgba(255, 255, 255, 0.06)",
              color: "#f1f5f9",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              padding: "9px 18px",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            Reload Admin
          </Link>
        </div>
      </div>
    </div>
  );
}
