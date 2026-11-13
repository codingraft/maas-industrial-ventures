"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application runtime error:", error);
  }, [error]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#05070c",
      color: "#f1f5f9",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      textAlign: "center",
      position: "relative",
    }}>
      <div style={{ marginBottom: "32px" }}>
        <Image
          src="/images/maas-logo-white.svg"
          alt="MAAS Industrial Ventures"
          width={220}
          height={50}
          priority
          style={{ width: "auto", height: "42px", objectFit: "contain" }}
        />
      </div>

      <div style={{
        maxWidth: "520px",
        background: "rgba(17, 22, 37, 0.8)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "16px",
        padding: "40px 32px",
        boxShadow: "0 24px 60px rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(12px)",
      }}>
        <div style={{
          width: "56px",
          height: "56px",
          margin: "0 auto 20px",
          borderRadius: "50%",
          background: "rgba(239, 68, 68, 0.12)",
          border: "1px solid rgba(239, 68, 68, 0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ef4444",
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>

        <h1 style={{ fontSize: "22px", fontWeight: "700", margin: "0 0 10px", color: "#f8fafc" }}>
          Temporary Service Notice
        </h1>
        <p style={{ fontSize: "14px", color: "#94a3b8", lineHeight: "1.6", margin: "0 0 24px" }}>
          We encountered an unexpected condition while rendering this page. Our systems remain secure and our team has been notified.
        </p>

        {error.digest && (
          <div style={{
            background: "#090c15",
            padding: "8px 12px",
            borderRadius: "6px",
            fontSize: "12px",
            color: "#64748b",
            fontFamily: "monospace",
            marginBottom: "24px",
            wordBreak: "break-all",
          }}>
            Digest: {error.digest}
          </div>
        )}

        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              background: "#d4af37",
              color: "#0c101c",
              border: "none",
              padding: "12px 24px",
              borderRadius: "6px",
              fontSize: "13.5px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "background 0.15s",
            }}
          >
            Try Again
          </button>
          <Link
            href="/"
            style={{
              background: "rgba(255, 255, 255, 0.06)",
              color: "#f1f5f9",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              padding: "12px 24px",
              borderRadius: "6px",
              fontSize: "13.5px",
              fontWeight: "600",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
