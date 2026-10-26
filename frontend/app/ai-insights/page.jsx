"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Bot } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { getTheme, riskColor, riskSoft } from "@/lib/theme";
import { SHAP_FACTORS } from "@/lib/mockData"; // illustrative bars - real backend only returns a sentence, not per-feature %
import { fetchStreams, fetchObservations, streamToUi, observationToUi } from "@/lib/api";
import DashboardShell from "@/components/layout/DashboardShell";
import RiskBadge from "@/components/ui/RiskBadge";

function AIInsightsContent() {
  const { mode, accent } = useTheme();
  const t = getTheme(mode, accent);
  const searchParams = useSearchParams();
  const streamFromUrl = searchParams.get("stream");

  const [streams, setStreams] = useState([]);
  const [selectedId, setSelectedId] = useState(streamFromUrl || "");
  const [latestObservation, setLatestObservation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStreams()
      .then((data) => {
        const mapped = data.map(streamToUi);
        setStreams(mapped);
        setSelectedId((current) => current || mapped[0]?.id || "");
      })
      .catch((err) => console.error("Failed to load streams:", err))
      .finally(() => setLoading(false));
  }, []);

  // Whenever the selected stream changes, fetch its most recent observation
  // (that's where the real risk/anomaly/explanation data lives).
  useEffect(() => {
    if (!selectedId) return;
    fetchObservations(selectedId)
      .then((data) => setLatestObservation(data.length ? observationToUi(data[0]) : null))
      .catch((err) => console.error("Failed to load observations:", err));
  }, [selectedId]);

  const stream = useMemo(() => streams.find((s) => s.id === selectedId), [streams, selectedId]);
  const maxAbs = Math.max(...SHAP_FACTORS.map((f) => Math.abs(f.value)));

  const risk = latestObservation?.risk || stream?.risk || "low";

  return (
    <DashboardShell
      active="/ai-insights"
      title="AI Insights"
      subtitle="AI-powered explanations and recommendations"
      actions={
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="text-[12.5px] px-2.5 py-2 rounded-lg border"
          style={{ borderColor: t.border, background: t.surface, color: t.textPrimary }}
        >
          {streams.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} - {s.updated}
            </option>
          ))}
        </select>
      }
    >
      {loading ? (
        <p className="text-[13px]" style={{ color: t.textMuted }}>Loading...</p>
      ) : !stream ? (
        <p className="text-[13px]" style={{ color: t.textMuted }}>No streams yet - add one to see AI insights.</p>
      ) : (
      <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 mb-3.5">
        {/* Prediction Summary */}
        <div
          className="rounded-[14px] border p-5"
          style={{ background: t.surface, borderColor: t.border }}
        >
          <p
            className="text-[11.5px] font-mono m-0 mb-3.5 tracking-[0.03em]"
            style={{ color: t.textMuted }}
          >
            PREDICTION SUMMARY
          </p>
          {!latestObservation ? (
            <p className="text-[12.5px]" style={{ color: t.textMuted }}>
              No observations submitted for this stream yet.
            </p>
          ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[13px]" style={{ color: t.textSecondary }}>
                Risk Level
              </span>
              <RiskBadge t={t} risk={risk} size="lg" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px]" style={{ color: t.textSecondary }}>
                Anomaly Status
              </span>
              <span
                className="text-[15px] font-bold font-mono"
                style={{ color: latestObservation.isAnomaly ? t.warn : t.good }}
              >
                {latestObservation.isAnomaly ? "Detected" : "Normal"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px]" style={{ color: t.textSecondary }}>
                Biodiversity Signal
              </span>
              <span className="text-[13px] font-semibold" style={{ color: t.textPrimary }}>
                {latestObservation.biodiversity}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px]" style={{ color: t.textSecondary }}>
                Last Observed
              </span>
              <span className="text-[13px] font-semibold" style={{ color: t.textPrimary }}>
                {latestObservation.time}
              </span>
            </div>
          </div>
          )}
        </div>

        {/* SHAP Feature Contribution (illustrative) */}
        <div
          className="rounded-[14px] border p-5"
          style={{ background: t.surface, borderColor: t.border }}
        >
          <p
            className="text-[11.5px] font-mono m-0 mb-3.5 tracking-[0.03em]"
            style={{ color: t.textMuted }}
          >
            TYPICAL FEATURE CONTRIBUTION (ILLUSTRATIVE)
          </p>
          <div className="flex flex-col gap-2.5">
            {SHAP_FACTORS.map((f) => {
              const positive = f.value >= 0;
              const width = (Math.abs(f.value) / maxAbs) * 100;
              return (
                <div key={f.label}>
                  <div
                    className="flex justify-between text-xs mb-[3px]"
                    style={{ color: t.textSecondary }}
                  >
                    <span>{f.label}</span>
                    <span
                      className="font-mono font-semibold"
                      style={{ color: positive ? t.bad : t.good }}
                    >
                      {positive ? "+" : ""}
                      {f.value}%
                    </span>
                  </div>
                  <div
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ background: t.borderSoft }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${width}%`, background: positive ? t.bad : t.good }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Explanation - the real SHAP-derived sentence from the backend */}
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
        <div>
          <p className="m-0 mb-1 text-[13.5px] font-semibold" style={{ color: t.textPrimary }}>
            AI Explanation (Citizen-Friendly)
          </p>
          <p className="m-0 text-[13px] leading-relaxed" style={{ color: t.textSecondary }}>
            {latestObservation?.explanation ||
              "No explanation available yet - submit an observation for this stream to see the AI's reasoning here."}
          </p>
        </div>
      </div>
      </>
      )}
    </DashboardShell>
  );
}

export default function AIInsights() {
  return (
    <Suspense fallback={null}>
      <AIInsightsContent />
    </Suspense>
  );
}
