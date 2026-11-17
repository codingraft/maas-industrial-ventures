"use client";

import React from "react";

export interface TabOption<T extends string = string> {
  id: T;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface AdminTabsProps<T extends string = string> {
  tabs: TabOption<T>[];
  activeTab: T;
  onChange: (id: T) => void;
  className?: string;
}

export function AdminTabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  className = "",
}: AdminTabsProps<T>) {
  return (
    <div className={`admin-segmented-tabs ${className}`} role="tablist">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`admin-tab-pill ${isActive ? "is-active" : ""}`}
            onClick={() => onChange(tab.id)}
          >
            {tab.icon && <span className="tab-pill-icon">{tab.icon}</span>}
            <span className="tab-pill-label">{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`tab-pill-count ${isActive ? "is-active" : ""}`}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
