"use client";

export interface UtmData {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_term: string;
  utm_content: string;
  gclid: string;
  fbclid: string;
}

const STORAGE_KEY = "maas_utm_data";

export function captureUtmParams(): UtmData {
  if (typeof window === "undefined") {
    return {
      utm_source: "",
      utm_medium: "",
      utm_campaign: "",
      utm_term: "",
      utm_content: "",
      gclid: "",
      fbclid: "",
    };
  }

  const urlParams = new URLSearchParams(window.location.search);
  const currentUtm: Partial<UtmData> = {};

  const keys: (keyof UtmData)[] = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "gclid",
    "fbclid",
  ];

  let hasNewData = false;
  for (const key of keys) {
    const val = urlParams.get(key);
    if (val) {
      currentUtm[key] = val;
      hasNewData = true;
    }
  }

  // Load existing stored data if any
  let stored: Partial<UtmData> = {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) stored = JSON.parse(raw);
  } catch {
    // Ignore storage parse errors
  }

  // Merge (new URL params overwrite existing)
  const merged: UtmData = {
    utm_source: currentUtm.utm_source || stored.utm_source || "",
    utm_medium: currentUtm.utm_medium || stored.utm_medium || "",
    utm_campaign: currentUtm.utm_campaign || stored.utm_campaign || "",
    utm_term: currentUtm.utm_term || stored.utm_term || "",
    utm_content: currentUtm.utm_content || stored.utm_content || "",
    gclid: currentUtm.gclid || stored.gclid || "",
    fbclid: currentUtm.fbclid || stored.fbclid || "",
  };

  if (hasNewData || !stored.utm_source) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    } catch {
      // Ignore storage errors
    }
  }

  return merged;
}

export function getCapturedUtm(): UtmData {
  if (typeof window === "undefined") {
    return {
      utm_source: "",
      utm_medium: "",
      utm_campaign: "",
      utm_term: "",
      utm_content: "",
      gclid: "",
      fbclid: "",
    };
  }

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Ignore
  }

  return captureUtmParams();
}
