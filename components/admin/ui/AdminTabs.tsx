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
    <>
    <label className="admin-section-select">
      <span>Editor section</span>
      <select aria-label="Editor section" className="admin-select" value={activeTab}
        onChange={event => {
          const selected = tabs.find(tab => tab.id === event.target.value);
          if (selected) onChange(selected.id);
        }}>
        {tabs.map(tab => <option key={tab.id} value={tab.id}>
          {tab.label}{tab.count !== undefined ? ` (${tab.count})` : ""}
        </option>)}
      </select>
    </label>
    <div className={`admin-segmented-tabs ${className}`} role="tablist" aria-label="Editor section">
      {tabs.map((tab, index) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onKeyDown={event => {
              const destinations: Record<string, number> = {
                ArrowRight: (index + 1) % tabs.length,
                ArrowLeft: (index + tabs.length - 1) % tabs.length,
                Home: 0,
                End: tabs.length - 1,
              };
              const next = destinations[event.key];
              if (next === undefined) return;
              event.preventDefault();
              event.currentTarget.parentElement?.querySelectorAll("button")[next]?.focus();
              onChange(tabs[next].id);
            }}
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
    </>
  );
}
