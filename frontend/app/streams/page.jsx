"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
  X,
} from "lucide-react";

import { useTheme } from "@/context/ThemeContext";
import { getTheme } from "@/lib/theme";
import { fetchStreams, streamToUi } from "@/lib/api";

import DashboardShell from "@/components/layout/DashboardShell";
import RiskBadge from "@/components/ui/RiskBadge";

function TrendIcon({ trend, t }) {
  if (trend === "up") {
    return <TrendingUp size={13} color={t.bad} />;
  }

  if (trend === "down") {
    return <TrendingDown size={13} color={t.good} />;
  }

  return <Minus size={13} color={t.textMuted} />;
}

function StreamsContent() {
  const { mode, accent } = useTheme();
  const t = getTheme(mode, accent);
  const searchParams = useSearchParams();

  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchStreams()
      .then((data) => setStreams(data.map(streamToUi)))
      .catch((err) => console.error("Failed to load streams:", err))
      .finally(() => setLoading(false));
  }, []);

  // Read the ?q= parameter from the Topbar quick-search.
  // This keeps the search query when navigating between pages.
  useEffect(() => {
    const q = searchParams.get("q");

    if (q) {
      setQuery(q);
    }
  }, [searchParams]);

  // Filter streams by name.
  const filtered = streams.filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <DashboardShell
      active="/streams"
      title="Streams"
      subtitle="Manage and explore all monitored streams"
      actions={
        <Link
          href="/streams/add"
          className="flex items-center gap-[6px] rounded-lg px-[14px] py-2 text-[12.5px] font-semibold no-underline"
          style={{
            color: mode === "dark" ? "#0B1417" : "#fff",
            background: t.primary,
          }}
        >
          <Plus size={13} />
          Add Stream
        </Link>
      }
    >
      {/* Main streams container */}
      <div
        className="rounded-[14px] border p-5"
        style={{
          background: t.surface,
          borderColor: t.border,
        }}
      >
        {/* Search bar */}
        <div
          className="mb-[18px] flex h-[38px] max-w-[320px] items-center gap-2.5 rounded-[9px] border px-3"
          style={{
            background: t.surfaceRaised,
            borderColor: t.border,
          }}
        >
          <Search size={14} color={t.textMuted} />

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search streams..."
            className="flex-1 border-none bg-transparent text-[13px] outline-none"
            style={{
              color: t.textPrimary,
            }}
          />

          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="flex cursor-pointer border-none bg-transparent p-0"
              style={{
                color: t.textMuted,
              }}
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Responsive table wrapper */}
        <div className="table-scroll">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr className="text-left">
                {[
                  "Stream Name",
                  "Location",
                  "Risk Level",
                  "Trend",
                  "Last Updated",
                ].map((h) => (
                  <th
                    key={h}
                    className="border-b pb-2.5 text-[11.5px] font-medium"
                    style={{
                      color: t.textMuted,
                      borderColor: t.borderSoft,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-[13px]" style={{ color: t.textMuted }}>
                    Loading streams...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                /* Empty search state */
                <tr>
                  <td
                    colSpan={5}
                    className="py-6 text-center text-[13px]"
                    style={{
                      color: t.textMuted,
                    }}
                  >
                    {streams.length === 0 ? "No streams yet - add one to get started." : `No streams match "${query}"`}
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id}>
                    {/* Stream name */}
                    <td
                      className="border-b py-[13px] text-[13px] font-medium"
                      style={{
                        color: t.textPrimary,
                        borderColor: t.borderSoft,
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin size={13} color={t.textMuted} />
                        {s.name}
                      </div>
                    </td>

                    {/* Location */}
                    <td
                      className="border-b py-[13px] text-[12.5px]"
                      style={{
                        color: t.textSecondary,
                        borderColor: t.borderSoft,
                      }}
                    >
                      {s.location}
                    </td>

                    {/* Risk level */}
                    <td
                      className="border-b py-[13px]"
                      style={{
                        borderColor: t.borderSoft,
                      }}
                    >
                      <RiskBadge t={t} risk={s.risk} />
                    </td>

                    {/* Trend */}
                    <td
                      className="border-b py-[13px]"
                      style={{
                        borderColor: t.borderSoft,
                      }}
                    >
                      <TrendIcon trend={s.trend} t={t} />
                    </td>

                    {/* Last updated */}
                    <td
                      className="border-b py-[13px] font-mono text-[11.5px]"
                      style={{
                        color: t.textMuted,
                        borderColor: t.borderSoft,
                      }}
                    >
                      {s.updated}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}

export default function Streams() {
  return (
    <Suspense fallback={null}>
      <StreamsContent />
    </Suspense>
  );
}
