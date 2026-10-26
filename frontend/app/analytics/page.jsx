"use client";

import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useTheme } from "@/context/ThemeContext";
import { getTheme } from "@/lib/theme";
import { TREND_DATA } from "@/lib/mockData"; // no aggregate trend endpoint yet - stays illustrative
import { fetchStreams, streamToUi } from "@/lib/api";
import DashboardShell from "@/components/layout/DashboardShell";

export default function Analytics() {
  const { mode, accent } = useTheme();
  const t = getTheme(mode, accent);
  const [streamFilter, setStreamFilter] = useState("All Streams");
  const [range, setRange] = useState("Last 7 Days");
  const [streams, setStreams] = useState([]);

  useEffect(() => {
    fetchStreams()
      .then((data) => setStreams(data.map(streamToUi)))
      .catch((err) => console.error("Failed to load streams:", err));
  }, []);

  const counts = {
    high: streams.filter((s) => s.risk === "high").length,
    medium: streams.filter((s) => s.risk === "medium").length,
    low: streams.filter((s) => s.risk === "low").length,
  };
  const pieData = [
    { name: "High", value: counts.high, color: t.bad },
    { name: "Medium", value: counts.medium, color: t.warn },
    { name: "Low", value: counts.low, color: t.good },
  ];

  // Illustrative until a real aggregate-stats endpoint exists on the backend.
  const stats = [
    { label: "Avg pH", value: "6.8" },
    { label: "Avg DO (mg/L)", value: "4.2" },
    { label: "Avg Turbidity (NTU)", value: "78" },
    { label: "Avg Temperature (°C)", value: "29.4" },
    { label: "Biodiversity Score", value: "0.42" },
  ];

  return (
    <DashboardShell
      active="/analytics"
      title="Analytics"
      subtitle="Explore trends and patterns"
      actions={
        <div className="flex gap-2">
          <select
            value={streamFilter}
            onChange={(e) => setStreamFilter(e.target.value)}
            className="text-[12.5px] px-2.5 py-2 rounded-lg border"
            style={{ borderColor: t.border, background: t.surface, color: t.textPrimary }}
          >
            <option>All Streams</option>
            {streams.map((s) => (
              <option key={s.id}>{s.name}</option>
            ))}
          </select>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="text-[12.5px] px-2.5 py-2 rounded-lg border"
            style={{ borderColor: t.border, background: t.surface, color: t.textPrimary }}
          >
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
          </select>
        </div>
      }
    >
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border px-4 py-3.5"
            style={{ background: t.surface, borderColor: t.border }}
          >
            <p className="m-0 mb-1.5 text-[11.5px]" style={{ color: t.textSecondary }}>
              {s.label}
            </p>
            <p
              className="m-0 text-xl font-semibold font-[family-name:var(--font-display)]"
              style={{ color: t.textPrimary }}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-3.5">
        {/* Parameter Trends */}
        <div
          className="rounded-[14px] border p-5"
          style={{ background: t.surface, borderColor: t.border }}
        >
          <h3
            className="text-[15px] font-semibold m-0 mb-3.5 font-[family-name:var(--font-display)]"
            style={{ color: t.textPrimary }}
          >
            Parameter Trends
          </h3>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={TREND_DATA} margin={{ top: 6, right: 10, left: -12, bottom: 0 }}>
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
                <Legend wrapperStyle={{ fontSize: 11.5 }} />
                <Line type="monotone" dataKey="ph" name="pH" stroke={t.primary} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="oxygen" name="DO" stroke={t.chartBlue} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="turbidity" name="Turbidity" stroke={t.warn} strokeWidth={2} dot={false} />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  name="Temperature"
                  stroke={t.chartPurple}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution */}
        <div
          className="rounded-[14px] border p-5"
          style={{ background: t.surface, borderColor: t.border }}
        >
          <h3
            className="text-[15px] font-semibold m-0 mb-3.5 font-[family-name:var(--font-display)]"
            style={{ color: t.textPrimary }}
          >
            Risk Distribution
          </h3>
          <div className="flex flex-col items-center gap-4">
            <div className="w-[150px] h-[150px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={44} outerRadius={66} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className="text-[22px] font-bold font-[family-name:var(--font-display)]"
                  style={{ color: t.textPrimary }}
                >
                  {streams.length}
                </span>
                <span className="text-[10px]" style={{ color: t.textMuted }}>
                  Total
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2 w-full">
              {pieData.map((p) => (
                <div key={p.name} className="flex items-center gap-2 text-[12.5px]">
                  <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                  <span style={{ color: t.textSecondary }}>{p.name}</span>
                  <span
                    className="ml-auto font-semibold font-mono"
                    style={{ color: t.textPrimary }}
                  >
                    {p.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}