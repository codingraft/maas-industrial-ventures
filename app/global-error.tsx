"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Root application error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{
        margin: 0,
        padding: 0,
        background: "#05070c",
        color: "#f1f5f9",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{
          maxWidth: "480px",
          textAlign: "center",
          padding: "32px",
          background: "#0c101c",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "12px",
        }}>
          <h2 style={{ fontSize: "20px", color: "#f8fafc", margin: "0 0 12px" }}>
            Critical Service Exception
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.5", margin: "0 0 24px" }}>
            A core application exception occurred. Please reload to restore session continuity.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              background: "#d4af37",
              color: "#0c101c",
              border: "none",
              padding: "10px 22px",
              borderRadius: "6px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Reload Platform
          </button>
        </div>
      </body>
    </html>
  );
}
