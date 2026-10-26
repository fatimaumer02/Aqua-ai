"use client";

// Lightweight localStorage-backed persistence for data added through the
// Add Stream / Add Observation / Generate Report wizards, so submissions
// actually survive navigation instead of resetting on every page load.
// Swap for real API calls once the Node/Express + MongoDB backend is ready.

export function getLocalList(key) {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addLocalItem(key, item) {
  if (typeof window === "undefined") return;
  const list = getLocalList(key);
  window.localStorage.setItem(key, JSON.stringify([item, ...list]));
}

export const STORAGE_KEYS = {
  streams: "aquaguard-streams-added",
  observations: "aquaguard-observations-added",
  reports: "aquaguard-reports-added",
};
