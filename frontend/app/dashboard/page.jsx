"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { MapPin, AlertTriangle, Activity, Waves, Sparkles, ChevronRight, Download, Bot } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useTheme } from "@/context/ThemeContext";
import { getTheme, riskColor, riskSoft } from "@/lib/theme";
import { TREND_DATA } from "@/lib/mockData"; // no aggregate trend endpoint yet - stays illustrative
import { fetchStreams, fetchAlerts, fetchObservations, streamToUi, alertToUi, observationToUi } from "@/lib/api";
import { downloadJSON } from "@/lib/download";
import DashboardShell from "@/components/layout/DashboardShell";
import StatCard from "@/components/ui/StatCard";
import RiskBadge from "@/components/ui/RiskBadge";

export default function Dashboard() {
  const { mode, accent } = useTheme();
  const t = getTheme(mode, accent);

  const [streams, setStreams] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [observations, setObservations] = useState([]);

  useEffect(() => {
    fetchStreams().then((data) => setStreams(data.map(streamToUi))).catch((err) => console.error("Failed to load streams:", err));
    fetchAlerts().then((data) => setAlerts(data.map(alertToUi))).catch((err) => console.error("Failed to load alerts:", err));
    fetchObservations().then((data) => setObservations(data.map(observationToUi))).catch((err) => console.error("Failed to load observations:", err));
  }, []);

  const counts = useMemo(() => {
    const high = streams.filter((s) => s.risk === "high").length;
    const medium = streams.filter((s) => s.risk === "medium").length;
    const low = streams.filter((s) => s.risk === "low").length;
    return { high, medium, low, total: streams.length };
  }, [streams]);

  const pieData = [
    { name: "High", value: counts.high, color: t.bad },
    { name: "Medium", value: counts.medium, color: t.warn },
    { name: "Low", value: counts.low, color: t.good },
  ];

  const topAlert = streams.find((s) => s.risk === "high");

  function handleExport() {
    downloadJSON(`aquaguard-dashboard-report-${new Date().toISOString().slice(0, 10)}.json`, {
      generatedAt: new Date().toISOString(),
      overallHealth: { status: counts.high > 0 ? "HIGH RISK" : counts.medium > 0 ? "MEDIUM RISK" : "LOW RISK" },
      streamsMonitored: counts.total,
      riskBreakdown: counts,
      activeAlerts: alerts,
      recentObservations: observations,
    });
  }

  return (
    <DashboardShell
      active="/dashboard"
      title="Dashboard"
      subtitle="Welcome back, Ayesha - here's what's happening with our urban streams today."
      actions={
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 text-[12.5px] font-semibold border-none rounded-lg px-3.5 py-2 cursor-pointer"
          style={{ color: mode === "dark" ? "#0B1417" : "#fff", background: t.primary }}
        >
          <Download size={13} /> Export Report
        </button>
      }
    >
      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-4">
        <div
          className="rounded-[14px] border px-[18px] py-4"
          style={{ background: t.surface, borderColor: t.border }}
        >
          <p className="m-0 mb-2 text-[12.5px]" style={{ color: t.textSecondary }}>
            Overall Health
          </p>
          <p
            className="m-0 text-[22px] font-bold font-[family-name:var(--font-display)]"
            style={{ color: t.bad }}
          >
            HIGH RISK
          </p>
          <p
            className="mt-0.5 mb-0 text-xl font-semibold font-mono"
            style={{ color: t.textPrimary }}
          >
            86%
          </p>
        </div>
        <StatCard t={t} icon={Waves} label="Streams Monitored" value={counts.total} delta="Active streams" deltaGood />
        <StatCard t={t} icon={Activity} label="Observations Today" value="142" delta="+18% from yesterday" deltaGood />
        <StatCard t={t} icon={AlertTriangle} label="Active Alerts" value={alerts.length} delta="Requires attention" />
      </div>

      {/* Risk overview + Recent alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-3.5 mb-3.5">
        <div
          className="rounded-[14px] border p-5"
          style={{ background: t.surface, borderColor: t.border }}
        >
          <h3
            className="text-[15px] font-semibold m-0 mb-3.5 font-[family-name:var(--font-display)]"
            style={{ color: t.textPrimary }}
          >
            Risk Overview
          </h3>
          <div className="flex items-center gap-5 flex-wrap">
            <div className="w-[140px] h-[140px] relative shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={42} outerRadius={62} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className="text-xl font-bold font-[family-name:var(--font-display)]"
                  style={{ color: t.textPrimary }}
                >
                  {counts.total}
                </span>
                <span className="text-[10px]" style={{ color: t.textMuted }}>
                  Total
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {pieData.map((p) => (
                <div key={p.name} className="flex items-center gap-2 text-[12.5px]">
                  <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                  <span style={{ color: t.textSecondary }}>{p.name} Risk</span>
                  <span className="font-semibold font-mono" style={{ color: t.textPrimary }}>
                    {p.value} ({counts.total ? Math.round((p.value / counts.total) * 100) : 0}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className="rounded-[14px] border p-5"
          style={{ background: t.surface, borderColor: t.border }}
        >
          <h3
            className="text-[15px] font-semibold m-0 mb-3.5 font-[family-name:var(--font-display)]"
            style={{ color: t.textPrimary }}
          >
            Recent Alerts
          </h3>
          <div className="flex flex-col gap-3">
            {alerts.slice(0, 3).map((a) => (
              <div key={a.id} className="flex gap-2.5">
                <AlertTriangle
                  size={14}
                  color={riskColor(t, a.level)}
                  className="shrink-0 mt-0.5"
                />
                <div className="min-w-0">
                  <p className="m-0 text-[12.5px] font-semibold" style={{ color: t.textPrimary }}>
                    {a.stream}, {a.location}
                  </p>
                  <p className="mt-[1px] mb-0 text-[11.5px]" style={{ color: t.textSecondary }}>
                    {a.note}
                  </p>
                  <p
                    className="mt-[1px] mb-0 text-[10.5px] font-mono"
                    style={{ color: t.textMuted }}
                  >
                    {a.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/alerts"
            className="flex items-center gap-1 text-xs no-underline font-medium mt-3"
            style={{ color: t.primary }}
          >
            View All Alerts <ChevronRight size={12} />
          </Link>
        </div>
      </div>

      {/* Observations + trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 mb-3.5">
        <div
          className="rounded-[14px] border p-5"
          style={{ background: t.surface, borderColor: t.border }}
        >
          <div className="table-scroll">
            <h3
              className="text-[15px] font-semibold m-0 mb-3.5 font-[family-name:var(--font-display)]"
              style={{ color: t.textPrimary }}
            >
              Recent Observations
            </h3>
            <table className="w-full border-collapse min-w-[420px]">
              <thead>
                <tr className="text-left">
                  {["Stream", "Location", "Risk", "Time"].map((h) => (
                    <th
                      key={h}
                      className="text-[11px] font-medium pb-2 border-b"
                      style={{ color: t.textMuted, borderColor: t.borderSoft }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {observations.slice(0, 4).map((o) => (
                  <tr key={o.id}>
                    <td
                      className="py-[9px] text-[12.5px] font-medium border-b"
                      style={{ color: t.textPrimary, borderColor: t.borderSoft }}
                    >
                      {o.stream}
                    </td>
                    <td
                      className="py-[9px] text-xs border-b"
                      style={{ color: t.textSecondary, borderColor: t.borderSoft }}
                    >
                      {o.location}
                    </td>
                    <td className="py-[9px] border-b" style={{ borderColor: t.borderSoft }}>
                      <RiskBadge t={t} risk={o.risk} />
                    </td>
                    <td
                      className="py-[9px] text-[11.5px] font-mono border-b"
                      style={{ color: t.textMuted, borderColor: t.borderSoft }}
                    >
                      {o.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div
          className="rounded-[14px] border p-5"
          style={{ background: t.surface, borderColor: t.border }}
        >
          <h3
            className="text-[15px] font-semibold m-0 mb-1 font-[family-name:var(--font-display)]"
            style={{ color: t.textPrimary }}
          >
            Trend (48-72h)
          </h3>
          <div className="h-[200px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={TREND_DATA} margin={{ top: 10, right: 6, left: -18, bottom: 0 }}>
                <CartesianGrid stroke={t.borderSoft} vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fill: t.textMuted, fontSize: 11 }}
                  axisLine={{ stroke: t.border }}
                  tickLine={false}
                />
                <YAxis tick={{ fill: t.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: t.surfaceRaised,
                    border: `1px solid ${t.border}`,
                    borderRadius: 8,
                    fontSize: 12,
                    fontFamily: "var(--font-mono)",
                  }}
                  labelStyle={{ color: t.textPrimary }}
                />
                <Line type="monotone" dataKey="turbidity" stroke={t.bad} strokeWidth={2} dot={false} name="Turbidity" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Insight */}
      <div
        className="rounded-[14px] border p-5 flex gap-3.5 items-start"
        style={{ background: t.primarySoft, borderColor: `${t.primary}30` }}
      >
        <div
          className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
          style={{ background: t.surface }}
        >
          <Bot size={18} color={t.primary} />
        </div>
        <div className="min-w-0">
          <p className="m-0 mb-1 text-[13.5px] font-semibold" style={{ color: t.textPrimary }}>
            AI Insight of the Day
          </p>
          <p className="m-0 text-[13px] leading-relaxed" style={{ color: t.textSecondary }}>
            High turbidity and low dissolved oxygen are the main contributors to high risk in{" "}
            {topAlert?.name || "Ravi Stream"}.
          </p>
          <Link
            href="/ai-insights"
            className="inline-flex items-center gap-1 text-xs no-underline font-medium mt-2"
            style={{ color: t.primary }}
          >
            View Insights <ChevronRight size={12} />
          </Link>
        </div>
      </div>
    </DashboardShell>
  );
}