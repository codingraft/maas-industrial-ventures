"use client";

import React from "react";

interface TableSkeletonProps {
  rows?: number;
  cols?: number;
}

export function TableSkeleton({ rows = 5, cols = 6 }: TableSkeletonProps) {
  return (
    <div className="admin-skeleton-table" aria-hidden="true">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="admin-skeleton-row">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <div
              key={cIdx}
              className="admin-skeleton-cell"
              style={{
                width: cIdx === 0 ? "14%" : cIdx === 1 ? "24%" : cIdx === cols - 1 ? "16%" : "18%",
              }}
            >
              <div
                className="admin-skeleton-bar"
                style={{
                  width: `${60 + ((rIdx + cIdx) % 4) * 10}%`,
                  height: cIdx === 0 ? "24px" : "16px",
                }}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="admin-skeleton-card" aria-hidden="true">
      <div className="admin-skeleton-bar" style={{ width: "35%", height: "14px", marginBottom: "12px" }} />
      <div className="admin-skeleton-bar" style={{ width: "70%", height: "22px", marginBottom: "16px" }} />
      <div className="admin-skeleton-bar" style={{ width: "100%", height: "40px", marginBottom: "12px" }} />
      <div className="admin-skeleton-bar" style={{ width: "50%", height: "14px" }} />
    </div>
  );
}
