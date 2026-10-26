"use client";

import { useState, useEffect } from "react";
import { CheckCheck, AlertTriangle, ScanEye, TrendingUp, Check } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { getTheme, riskColor } from "@/lib/theme";
import { fetchAlerts, alertToUi } from "@/lib/api";
import DashboardShell from "@/components/layout/DashboardShell";

const TABS = ["All", "High Risk", "Medium Risk", "Anomaly"];
const TYPE_ICON = { "High Risk": AlertTriangle, "Medium Risk": AlertTriangle, Anomaly: ScanEye, Trend: TrendingUp };

export default function Alerts() {
  const { mode, accent } = useTheme();
  const t = getTheme(mode, accent);
  const [tab, setTab] = useState("All");
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts()
      .then((data) => setAlerts(data.map((a) => ({ ...alertToUi(a), read: false }))))
      .catch((err) => console.error("Failed to load alerts:", err))
      .finally(() => setLoading(false));
  }, []);

  const rows = tab === "All" ? alerts : alerts.filter((a) => a.type === tab);
  const counts = {
    All: alerts.length,
    "High Risk": alerts.filter((a) => a.type === "High Risk").length,
    "Medium Risk": alerts.filter((a) => a.type === "Medium Risk").length,
    Anomaly: alerts.filter((a) => a.type === "Anomaly").length,
  };
  const unreadCount = alerts.filter((a) => !a.read).length;

  function markAllRead() {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  }

  function toggleRead(id) {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: !a.read } : a)));
  }

  return (
    <DashboardShell
      active="/alerts"
      title="Alerts"
      subtitle="High risk and anomaly alerts"
      actions={
        <button
          onClick={markAllRead}
          disabled={unreadCount === 0}
          className={`flex items-center gap-1.5 text-[12.5px] font-semibold border rounded-lg px-3.5 py-2 ${
            unreadCount === 0 ? "cursor-default opacity-60" : "cursor-pointer opacity-100"
          }`}
          style={{
            color: unreadCount === 0 ? t.textMuted : t.textSecondary,
            borderColor: t.border,
            background: "transparent",
          }}
        >
          <CheckCheck size={13} /> Mark all as read
        </button>
      }
    >
      {/* Tabs */}
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {TABS.map((tb) => (
          <button
            key={tb}
            onClick={() => setTab(tb)}
            className="flex items-center gap-1.5 text-[12.5px] font-medium px-3.5 py-[7px] rounded-lg cursor-pointer border"
            style={{
              borderColor: tab === tb ? t.primary : t.border,
              background: tab === tb ? t.primarySoft : "transparent",
              color: tab === tb ? t.primary : t.textSecondary,
            }}
          >
            {tb}{" "}
            <span className="text-[10.5px] font-mono opacity-80">({counts[tb]})</span>
          </button>
        ))}
      </div>

      {/* Alert list */}
      <div className="flex flex-col gap-2.5">
        {loading && (
          <p className="text-[12.5px]" style={{ color: t.textMuted }}>Loading alerts...</p>
        )}
        {!loading && rows.length === 0 && (
          <p className="text-[12.5px]" style={{ color: t.textMuted }}>No alerts in this category.</p>
        )}
        {rows.map((a) => {
          const Icon = TYPE_ICON[a.type];
          return (
            <div
              key={a.id}
              className="rounded-[14px] border p-[18px] flex gap-3.5 items-start flex-wrap"
              style={{
                background: t.surface,
                borderColor: t.border,
                opacity: a.read ? 0.6 : 1,
              }}
            >
              <div
                className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
                style={{ background: `${riskColor(t, a.level)}1A` }}
              >
                <Icon size={17} color={riskColor(t, a.level)} />
              </div>

              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-2 flex-wrap mb-[3px]">
                  <span className="text-[13.5px] font-semibold" style={{ color: t.textPrimary }}>
                    {a.stream}, {a.location}
                  </span>
                  <span className="text-[10.5px] font-mono" style={{ color: t.textMuted }}>
                    {a.time}
                  </span>
                  {!a.read && (
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: t.primary }}
                    />
                  )}
                </div>
                <p className="m-0 text-[12.5px]" style={{ color: t.textSecondary }}>
                  {a.note}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className="text-[11px] font-semibold font-mono px-[11px] py-[3px] rounded-[20px]"
                  style={{
                    color: riskColor(t, a.level),
                    background: `${riskColor(t, a.level)}1A`,
                  }}
                >
                  {a.type}
                </span>
                <button
                  onClick={() => toggleRead(a.id)}
                  className="flex items-center gap-1 text-[11px] rounded-[7px] px-[9px] py-1 cursor-pointer border bg-transparent"
                  style={{ color: t.textSecondary, borderColor: t.border }}
                >
                  <Check size={11} /> {a.read ? "Unread" : "Read"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardShell>
  );
}