"use client";

import {
  Camera, ClipboardList, Brain, ScanEye, MessageSquareWarning, UserCheck, Info,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { getTheme } from "@/lib/theme";
import WaterBackground from "@/components/three/WaterBackground";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const STEPS = [
  { icon: Camera, title: "Data preprocessing", who: "Citizens & sensors", copy: "Clean missing values, remove duplicates, check impossible readings, and prepare useful features from raw observations." },
  { icon: Brain, title: "XGBoost prediction", who: "Core model", copy: "Predicts the stream's environmental risk from prepared features - pH, turbidity, oxygen, temperature, rainfall and location." },
  { icon: ScanEye, title: "Isolation Forest check", who: "Anomaly detection", copy: "Checks whether the current observation is unusually different from normal patterns for that stream." },
  { icon: ClipboardList, title: "SHAP explanation", who: "Explainable AI", copy: "Explains which features pushed the XGBoost prediction higher or lower, in plain, reviewable terms." },
  { icon: MessageSquareWarning, title: "Alert rules", who: "Automated", copy: "Creates an alert when risk or anomaly score reaches a chosen threshold." },
  { icon: UserCheck, title: "Human review", who: "Expert reviewer", copy: "An expert checks the evidence and confirms, rejects, or requests another observation before any action is taken." },
];

export default function HowItWorks() {
  const { mode, accent } = useTheme();
  const t = getTheme(mode, accent);

  return (
    <div className="min-h-screen relative" style={{ background: t.bg }}>
      <WaterBackground mode={mode} />
      <div className="relative z-10">
        <Navbar active="/how-it-works" />

        {/* Hero */}
        <section className="max-w-[780px] mx-auto px-6 pt-16 pb-10 text-center">
          <h1
            className="font-[family-name:var(--font-display)] font-semibold m-0 mb-3.5"
            style={{ fontSize: "clamp(28px, 4vw, 40px)", color: t.textPrimary, letterSpacing: "-0.02em" }}
          >
            From a noisy reading to a verified alert
          </h1>
          <p
            className="text-[15.5px] leading-[1.65] max-w-[560px] mx-auto"
            style={{ color: t.textSecondary }}
          >
            Six steps turn a single citizen observation into an explainable, expert-reviewed risk assessment.
          </p>
        </section>

        {/* Steps */}
        <section className="max-w-[900px] mx-auto px-6 pb-16">
          <div className="flex flex-col">
            {STEPS.map((s, i) => (
              <div key={s.title} className="flex gap-5">
                <div className="flex flex-col items-center w-[46px]">
                  <div
                    className="w-10 h-10 rounded-[11px] flex items-center justify-center shrink-0"
                    style={{ background: t.primarySoft }}
                  >
                    <s.icon size={18} color={t.primary} />
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="w-[1.5px] flex-1 my-1.5" style={{ background: t.border }} />
                  )}
                </div>
                <div className="pb-8">
                  <div className="flex items-center gap-2 mb-1">
                    <h3
                      className="font-[family-name:var(--font-display)] text-base font-semibold m-0"
                      style={{ color: t.textPrimary }}
                    >
                      {s.title}
                    </h3>
                    <span
                      className="text-[10.5px] font-mono px-2 py-0.5 rounded-[20px]"
                      style={{ color: t.primary, background: t.primarySoft }}
                    >
                      {s.who}
                    </span>
                  </div>
                  <p
                    className="text-[13.5px] leading-relaxed m-0 max-w-[480px]"
                    style={{ color: t.textSecondary }}
                  >
                    {s.copy}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Worked example */}
        <section className="max-w-[900px] mx-auto px-6 pb-16">
          <div
            className="rounded-2xl border p-7"
            style={{ background: t.surface, borderColor: t.border }}
          >
            <p
              className="text-[11.5px] font-mono m-0 mb-4 tracking-[0.03em]"
              style={{ color: t.textMuted }}
            >
              WORKED EXAMPLE
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <p className="text-xs m-0 mb-1.5" style={{ color: t.textMuted }}>
                  Input reading
                </p>
                <p
                  className="text-[13px] leading-[1.7] m-0 font-mono"
                  style={{ color: t.textPrimary }}
                >
                  pH 6.2 · high turbidity
                  <br />
                  low dissolved oxygen
                  <br />
                  high temperature · recent rainfall
                </p>
              </div>
              <div>
                <p className="text-xs m-0 mb-1.5" style={{ color: t.textMuted }}>
                  XGBoost + Isolation Forest
                </p>
                <p className="text-[13px] font-semibold m-0 mb-1" style={{ color: t.bad }}>
                  High risk - 86%
                </p>
                <p className="text-[12.5px] m-0" style={{ color: t.textSecondary }}>
                  Flagged as anomalous
                </p>
              </div>
              <div>
                <p className="text-xs m-0 mb-1.5" style={{ color: t.textMuted }}>
                  SHAP explanation
                </p>
                <p
                  className="text-[12.5px] leading-[1.7] m-0"
                  style={{ color: t.textSecondary }}
                >
                  Turbidity +31% · Oxygen +25%
                  <br />
                  Temperature +16% · Rainfall +9%
                </p>
              </div>
            </div>
            <div
              className="mt-[18px] pt-[18px] border-t flex items-center gap-2"
              style={{ borderColor: t.borderSoft }}
            >
              <div className="w-[7px] h-[7px] rounded-full shrink-0" style={{ background: t.bad }} />
              <p className="text-[13px] m-0" style={{ color: t.textPrimary }}>
                "High environmental risk detected. Expert verification recommended."
              </p>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="max-w-[900px] mx-auto px-6 pb-[90px]">
          <div
            className="rounded-[14px] border p-5 flex gap-3"
            style={{ background: t.warnSoft, borderColor: `${t.warn}30` }}
          >
            <Info size={17} color={t.warn} className="shrink-0 mt-px" />
            <div>
              <p className="text-[13.5px] font-semibold m-0 mb-1" style={{ color: t.textPrimary }}>
                What AquaGuard AI does not claim
              </p>
              <p className="text-[13px] leading-relaxed m-0" style={{ color: t.textSecondary }}>
                The model does not prove pollution, replace environmental experts, or diagnose human
                disease. Every output is labeled as a predicted environmental risk or an AI-supported
                assessment, and every high-risk case is routed to a human for verification.
              </p>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}