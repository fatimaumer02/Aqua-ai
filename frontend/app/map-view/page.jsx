"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Minus, MapPin, ChevronRight } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { getTheme, riskColor, riskSoft } from "@/lib/theme";
import { fetchStreams, streamToUi, computeMapPositions } from "@/lib/api";
import DashboardShell from "@/components/layout/DashboardShell";
import RiskBadge from "@/components/ui/RiskBadge";

export default function MapView() {
  const { mode, accent } = useTheme();
  const t = getTheme(mode, accent);

  const [streams, setStreams] = useState([]);
  const [selected, setSelected] = useState(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    fetchStreams()
      .then((data) => {
        const positioned = computeMapPositions(data.map(streamToUi));
        setStreams(positioned);
        setSelected((current) => current || positioned[0] || null);
      })
      .catch((err) => console.error("Failed to load streams:", err));
  }, []);

  return (
    <DashboardShell
      active="/map-view"
      title="Map View"
      subtitle="Real-time stream health across the city"
    >
      <div className="grid grid-cols-1 items-start gap-3.5 lg:grid-cols-[2.2fr_1fr]">
        {/* Map panel */}
        <div
          className="rounded-[14px] border p-4"
          style={{
            background: t.surface,
            borderColor: t.border,
          }}
        >
          <div
            className="relative h-[460px] overflow-hidden rounded-[10px] border"
            style={{
              background: mode === "dark" ? "#0D1A1E" : "#EAF3EF",
              borderColor: t.borderSoft,
            }}
          >
            <div
              className="absolute inset-0 origin-center transform transition-transform duration-200 ease-in-out"
              style={{
                transform: `scale(${zoom})`,
              }}
            >
              <svg
                width="100%"
                height="100%"
                className="absolute inset-0"
              >
                <defs>
                  <pattern
                    id="mapgrid"
                    width="30"
                    height="30"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 30 0 L 0 0 0 30"
                      fill="none"
                      stroke={t.borderSoft}
                      strokeWidth="1"
                    />
                  </pattern>
                </defs>

                <rect
                  width="100%"
                  height="100%"
                  fill="url(#mapgrid)"
                />
              </svg>

              {streams.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelected(s)}
                  className="absolute flex cursor-pointer flex-col items-center border-none bg-transparent p-0"
                  style={{
                    left: `${s.x}%`,
                    top: `${s.y}%`,
                    transform: "translate(-50%,-100%)",
                  }}
                >
                  <MapPin
                    size={selected?.id === s.id ? 30 : 24}
                    color={riskColor(t, s.risk)}
                    fill={riskSoft(t, s.risk)}
                    strokeWidth={1.8}
                  />
                </button>
              ))}
            </div>

            {/* Zoom controls */}
            <div className="absolute bottom-3 right-3 flex flex-col gap-1.5">
              <button
                onClick={() =>
                  setZoom((z) =>
                    Math.min(2.5, +(z + 0.25).toFixed(2))
                  )
                }
                disabled={zoom >= 2.5}
                aria-label="Zoom in"
                className={`flex h-[30px] w-[30px] items-center justify-center rounded-lg border ${
                  zoom >= 2.5 ? "cursor-default" : "cursor-pointer"
                }`}
                style={{
                  background: t.surface,
                  borderColor: t.border,
                  color:
                    zoom >= 2.5 ? t.textMuted : t.textSecondary,
                }}
              >
                <Plus size={14} />
              </button>

              <button
                onClick={() =>
                  setZoom((z) =>
                    Math.max(0.6, +(z - 0.25).toFixed(2))
                  )
                }
                disabled={zoom <= 0.6}
                aria-label="Zoom out"
                className={`flex h-[30px] w-[30px] items-center justify-center rounded-lg border ${
                  zoom <= 0.6 ? "cursor-default" : "cursor-pointer"
                }`}
                style={{
                  background: t.surface,
                  borderColor: t.border,
                  color:
                    zoom <= 0.6 ? t.textMuted : t.textSecondary,
                }}
              >
                <Minus size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Side panel */}
        {selected && (
        <div
          className="rounded-[14px] border p-5"
          style={{
            background: t.surface,
            borderColor: t.border,
          }}
        >
          <div className="mb-1 flex items-center justify-between">
            <h3
              className="m-0 font-[family-name:var(--font-display)] text-base font-semibold"
              style={{
                color: t.textPrimary,
              }}
            >
              {selected.name}
            </h3>
          </div>

          <p
            className="m-0 mb-4 text-[12.5px]"
            style={{
              color: t.textSecondary,
            }}
          >
            {selected.location}
          </p>

          <div className="mb-2 flex flex-wrap gap-2">
            {["high", "medium", "low"].map((r) => (
              <div
                key={r}
                className="flex items-center gap-[5px] text-[11px]"
                style={{
                  color: t.textSecondary,
                }}
              >
                <span
                  className="h-[7px] w-[7px] rounded-full"
                  style={{
                    background: riskColor(t, r),
                  }}
                />

                {r === "high"
                  ? "High"
                  : r === "medium"
                    ? "Medium"
                    : "Low"}{" "}
                Risk
              </div>
            ))}
          </div>

          <div
            className="my-3 mb-4 rounded-[10px] border p-3.5"
            style={{
              background: riskSoft(t, selected.risk),
              borderColor: `${riskColor(t, selected.risk)}30`,
            }}
          >
            <div className="flex items-center justify-between">
              <RiskBadge
                t={t}
                risk={selected.risk}
                size="lg"
              />

              <span
                className="font-mono text-lg font-bold"
                style={{
                  color: riskColor(t, selected.risk),
                }}
              >
                {selected.score}%
              </span>
            </div>
          </div>

          <Link
            href={`/ai-insights?stream=${selected.id}`}
            className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-[9px] border-none py-2.5 text-[13px] font-semibold no-underline"
            style={{
              color: mode === "dark" ? "#0B1417" : "#fff",
              background: t.primary,
            }}
          >
            View Details
            <ChevronRight size={14} />
          </Link>

          <div
            className="mt-5 border-t pt-4"
            style={{
              borderColor: t.borderSoft,
            }}
          >
            <p
              className="m-0 mb-2.5 font-mono text-[11px]"
              style={{
                color: t.textMuted,
              }}
            >
              ALL STREAMS
            </p>

            <div className="flex max-h-[180px] flex-col gap-2 overflow-y-auto">
              {streams.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelected(s)}
                  className="flex cursor-pointer items-center justify-between border-none bg-transparent px-0 py-1 text-left"
                >
                  <span
                    className="text-xs"
                    style={{
                      color:
                        selected.id === s.id
                          ? t.primary
                          : t.textSecondary,
                      fontWeight:
                        selected.id === s.id ? 600 : 400,
                    }}
                  >
                    {s.name}
                  </span>

                  <span
                    className="h-[7px] w-[7px] shrink-0 rounded-full"
                    style={{
                      background: riskColor(t, s.risk),
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
        )}
      </div>
    </DashboardShell>
  );
}