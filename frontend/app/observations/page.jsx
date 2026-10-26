"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Droplet, Thermometer, Waves, Pencil, Trash2, Check, X } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { getTheme, riskColor } from "@/lib/theme";
import { fetchObservations, fetchStreams, observationToUi } from "@/lib/api";
import { BIO_CONDITIONS } from "@/lib/mockData";
import DashboardShell from "@/components/layout/DashboardShell";
import RiskBadge from "@/components/ui/RiskBadge";

const TABS = ["All", "My Observations", "Pending Review"];

const STATUS_COLOR = {
  Submitted: "good",
  "Under Review": "warn",
  Approved: "good",
  Draft: "warn",
  Processing: "warn",
};

const STATUS_OPTIONS = ["Submitted", "Under Review", "Approved", "Draft"];
const RISK_OPTIONS = ["low", "medium", "high"];

// Edits/deletes are local-only for now (the backend doesn't have PATCH/DELETE
// endpoints for observations yet) - they overlay on top of the real fetched
// list so the table still feels editable without losing real submissions.
const EDITS_KEY = "aquaguard-observations-edits";
const DELETED_KEY = "aquaguard-observations-deleted";

function loadMap(key) {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
function saveMap(key, value) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}
function loadDeletedIds() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(DELETED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function Observations() {
  const { mode, accent } = useTheme();
  const t = getTheme(mode, accent);
  const [tab, setTab] = useState("All");
  const [observations, setObservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ stream: "", biodiversity: "", risk: "", status: "" });
  const [allStreamNames, setAllStreamNames] = useState([]);

  useEffect(() => {
    fetchStreams()
      .then((data) => setAllStreamNames(data.map((s) => s.name)))
      .catch((err) => console.error("Failed to load streams:", err));
  }, []);

  // Fetch real observations, then apply local-only edits/deletes on top.
  useEffect(() => {
    fetchObservations()
      .then((data) => {
        const edits = loadMap(EDITS_KEY);
        const deleted = loadDeletedIds();
        let combined = data.map(observationToUi).filter((o) => !deleted.includes(o.id));
        combined = combined.map((o) => (edits[o.id] ? { ...o, ...edits[o.id] } : o));
        setObservations(combined);
      })
      .catch((err) => console.error("Failed to load observations:", err))
      .finally(() => setLoading(false));
  }, []);

  const rows = tab === "Pending Review" ? observations.filter((o) => o.status === "Under Review") : observations;

  function startEdit(o) {
    setEditingId(o.id);
    setEditForm({ stream: o.stream, biodiversity: o.biodiversity, risk: o.risk, status: o.status });
  }

  function cancelEdit() {
    setEditingId(null);
  }

  function saveEdit(id) {
    const patch = { ...editForm };

    const edits = loadMap(EDITS_KEY);
    edits[id] = { ...(edits[id] || {}), ...patch };
    saveMap(EDITS_KEY, edits);

    setObservations((list) => list.map((o) => (o.id === id ? { ...o, ...patch } : o)));
    setEditingId(null);
  }

  function handleDelete(id) {
    if (!window.confirm("Delete this observation? This can't be undone.")) return;

    const deleted = loadDeletedIds();
    if (!deleted.includes(id)) saveMap(DELETED_KEY, [...deleted, id]);

    const edits = loadMap(EDITS_KEY);
    if (edits[id]) {
      delete edits[id];
      saveMap(EDITS_KEY, edits);
    }

    setObservations((list) => list.filter((o) => o.id !== id));
    if (editingId === id) setEditingId(null);
  }

  return (
    <DashboardShell
      active="/observations"
      title="Observations"
      subtitle="View and manage citizen observations"
      actions={
        <Link
          href="/observations/add"
          style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: mode === "dark" ? "#0B1417" : "#fff", background: t.primary, borderRadius: 8, padding: "8px 14px", textDecoration: "none" }}
        >
          <Plus size={13} /> New Observation
        </Link>
      }
    >
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 14, padding: 20 }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
          {TABS.map((tb) => (
            <button
              key={tb}
              onClick={() => setTab(tb)}
              style={{
                fontSize: 12.5, fontWeight: 500, padding: "7px 14px", borderRadius: 8, cursor: "pointer",
                border: `1px solid ${tab === tb ? t.primary : t.border}`,
                background: tab === tb ? t.primarySoft : "transparent",
                color: tab === tb ? t.primary : t.textSecondary,
              }}
            >
              {tb}
            </button>
          ))}
        </div>

        <div className="table-scroll">
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
            <thead>
              <tr style={{ textAlign: "left" }}>
                {["Stream", "Parameters", "Biodiversity", "Risk", "Time", "Status", "Actions"].map((h) => (
                  <th key={h} style={{ fontSize: 11.5, color: t.textMuted, fontWeight: 500, paddingBottom: 10, borderBottom: `1px solid ${t.borderSoft}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "24px 0", textAlign: "center", fontSize: 13, color: t.textMuted }}>No observations in this view yet.</td>
                </tr>
              ) : rows.map((o) => {
                const isEditing = editingId === o.id;
                return (
                  <tr key={o.id}>
                    <td style={{ padding: "10px 0", fontSize: 13, color: t.textPrimary, fontWeight: 500, borderBottom: `1px solid ${t.borderSoft}` }}>
                      {isEditing ? (
                        <select
                          value={editForm.stream}
                          onChange={(e) => setEditForm((f) => ({ ...f, stream: e.target.value }))}
                          style={{ fontSize: 12.5, padding: "6px 8px", borderRadius: 6, border: `1px solid ${t.border}`, background: t.surfaceRaised, color: t.textPrimary, maxWidth: 160 }}
                        >
                          {[...new Set([o.stream, ...allStreamNames])].map((name) => <option key={name} value={name}>{name}</option>)}
                        </select>
                      ) : o.stream}
                    </td>
                    <td style={{ padding: "10px 0", borderBottom: `1px solid ${t.borderSoft}` }}>
                      <div style={{ display: "flex", gap: 6, color: t.textMuted }}>
                        <Droplet size={13} /> <Thermometer size={13} /> <Waves size={13} />
                      </div>
                    </td>
                    <td style={{ padding: "10px 0", fontSize: 12.5, color: t.textSecondary, borderBottom: `1px solid ${t.borderSoft}` }}>
                      {isEditing ? (
                        <select
                          value={editForm.biodiversity}
                          onChange={(e) => setEditForm((f) => ({ ...f, biodiversity: e.target.value }))}
                          style={{ fontSize: 12.5, padding: "6px 8px", borderRadius: 6, border: `1px solid ${t.border}`, background: t.surfaceRaised, color: t.textPrimary }}
                        >
                          {BIO_CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      ) : o.biodiversity}
                    </td>
                    <td style={{ padding: "10px 0", borderBottom: `1px solid ${t.borderSoft}` }}>
                      {isEditing ? (
                        <select
                          value={editForm.risk}
                          onChange={(e) => setEditForm((f) => ({ ...f, risk: e.target.value }))}
                          style={{ fontSize: 12.5, padding: "6px 8px", borderRadius: 6, border: `1px solid ${t.border}`, background: t.surfaceRaised, color: t.textPrimary }}
                        >
                          {RISK_OPTIONS.map((r) => <option key={r} value={r}>{r[0].toUpperCase() + r.slice(1)}</option>)}
                        </select>
                      ) : <RiskBadge t={t} risk={o.risk} />}
                    </td>
                    <td style={{ padding: "10px 0", fontSize: 11.5, color: t.textMuted, fontFamily: "var(--font-mono)", borderBottom: `1px solid ${t.borderSoft}` }}>{o.time}</td>
                    <td style={{ padding: "10px 0", borderBottom: `1px solid ${t.borderSoft}` }}>
                      {isEditing ? (
                        <select
                          value={editForm.status}
                          onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                          style={{ fontSize: 12.5, padding: "6px 8px", borderRadius: 6, border: `1px solid ${t.border}`, background: t.surfaceRaised, color: t.textPrimary }}
                        >
                          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      ) : (
                        <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, color: t[STATUS_COLOR[o.status]], background: t[STATUS_COLOR[o.status] + "Soft"] }}>
                          {o.status}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "10px 0", borderBottom: `1px solid ${t.borderSoft}` }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => saveEdit(o.id)}
                              aria-label="Save changes"
                              style={{ width: 26, height: 26, borderRadius: 7, border: "none", background: t.good, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                            >
                              <Check size={13} />
                            </button>
                            <button
                              onClick={cancelEdit}
                              aria-label="Cancel editing"
                              style={{ width: 26, height: 26, borderRadius: 7, border: `1px solid ${t.border}`, background: "transparent", color: t.textSecondary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                            >
                              <X size={13} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(o)}
                              aria-label="Edit observation"
                              style={{ width: 26, height: 26, borderRadius: 7, border: `1px solid ${t.border}`, background: "transparent", color: t.textSecondary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                            >
                              <Pencil size={12} />
                            </button>
                            <button
                              onClick={() => handleDelete(o.id)}
                              aria-label="Delete observation"
                              style={{ width: 26, height: 26, borderRadius: 7, border: `1px solid ${t.bad}40`, background: "transparent", color: t.bad, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                            >
                              <Trash2 size={12} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}