"use client";

import {
  Brain,
  ScanEye,
  ShieldCheck,
  GitCompare,
  Camera,
  ImageIcon,
  CheckCircle2,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { getTheme } from "@/lib/theme";
import WaterBackground from "@/components/three/WaterBackground";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const CORE = [
  {
    icon: Brain,
    name: "XGBoost",
    job: "Main stream-health / pollution-risk prediction",
    input:
      "pH, turbidity, oxygen, temperature, rainfall, previous readings, location",
    output: "Risk class or probability, e.g. 86% high risk",
  },
  {
    icon: ScanEye,
    name: "Isolation Forest",
    job: "Detects unusual or abnormal observations",
    input: "Recent water-quality and environmental measurements",
    output: "Normal vs anomaly, plus an anomaly score",
  },
  {
    icon: ShieldCheck,
    name: "SHAP",
    job: "Explains an individual XGBoost prediction",
    input: "The trained XGBoost model and one observation",
    output: "Feature contributions, e.g. turbidity +31%",
  },
];

const SUPPORT = [
  {
    icon: GitCompare,
    name: "Random Forest",
    tag: "Comparison",
    copy: "Baseline model trained on the same features as XGBoost, used to compare precision, recall and F1.",
  },
  {
    icon: Camera,
    name: "YOLO",
    tag: "Optional",
    copy: "Detects visible objects or signs - waste, algae - in citizen-uploaded stream photos. Use only with enough labelled images.",
  },
  {
    icon: ImageIcon,
    name: "CNN / Vision Transformer",
    tag: "Optional",
    copy: "Classifies a stream image into a predefined visual category, when the task is classification rather than detection.",
  },
];

export default function Models() {
  const { mode, accent } = useTheme();
  const t = getTheme(mode, accent);

  return (
    <div
      className="relative min-h-screen"
      style={{ background: t.bg }}
    >
      <WaterBackground mode={mode} />

      <div className="relative z-[1]">
        <Navbar active="/models" />

        {/* Hero */}
        <section className="mx-auto max-w-[780px] px-6 pb-11 pt-16 text-center">
          <h1
            className="mb-[14px] text-[clamp(28px,4vw,40px)] font-semibold tracking-[-0.02em]"
            style={{
              fontFamily: "var(--font-display)",
              color: t.textPrimary,
            }}
          >
            The models behind every prediction
          </h1>

          <p
            className="mx-auto max-w-[560px] text-[15.5px] leading-[1.65]"
            style={{ color: t.textSecondary }}
          >
            Three models form the core pipeline. Two more are optional, for
            teams with labelled image data.
          </p>
        </section>

        {/* Core Pipeline */}
        <section className="mx-auto max-w-[1000px] px-6 pb-5">
          <div className="mb-4 flex items-center gap-2">
            <CheckCircle2
              size={15}
              style={{ color: t.good }}
            />

            <span
              className="text-[12.5px] font-semibold"
              style={{
                color: t.good,
                fontFamily: "var(--font-mono)",
              }}
            >
              CORE PIPELINE
            </span>
          </div>

          <div className="mb-14 grid grid-cols-1 gap-4 md:grid-cols-3">
            {CORE.map((m) => {
              const Icon = m.icon;

              return (
                <div
                  key={m.name}
                  className="rounded-[14px] p-[22px]"
                  style={{
                    background: t.surface,
                    border: `1px solid ${t.border}`,
                  }}
                >
                  <div
                    className="mb-4 flex h-[38px] w-[38px] items-center justify-center rounded-[10px]"
                    style={{ background: t.primarySoft }}
                  >
                    <Icon
                      size={18}
                      style={{ color: t.primary }}
                    />
                  </div>

                  <h3
                    className="mb-[6px] text-base font-semibold"
                    style={{
                      fontFamily: "var(--font-display)",
                      color: t.textPrimary,
                    }}
                  >
                    {m.name}
                  </h3>

                  <p
                    className="mb-[14px] text-[13px] leading-[1.55]"
                    style={{ color: t.textSecondary }}
                  >
                    {m.job}
                  </p>

                  <div
                    className="flex flex-col gap-2 border-t pt-3"
                    style={{ borderColor: t.borderSoft }}
                  >
                    <div>
                      <p
                        className="mb-[2px] text-[10.5px]"
                        style={{
                          color: t.textMuted,
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        INPUT
                      </p>

                      <p
                        className="m-0 text-xs leading-[1.5]"
                        style={{ color: t.textSecondary }}
                      >
                        {m.input}
                      </p>
                    </div>

                    <div>
                      <p
                        className="mb-[2px] text-[10.5px]"
                        style={{
                          color: t.textMuted,
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        OUTPUT
                      </p>

                      <p
                        className="m-0 text-xs leading-[1.5]"
                        style={{ color: t.textPrimary }}
                      >
                        {m.output}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Comparison & Optional */}
        <section className="mx-auto max-w-[1000px] px-6 pb-[90px]">
          <div className="mb-4 flex items-center gap-2">
            <span
              className="h-[6px] w-[6px] rounded-full"
              style={{ background: t.textMuted }}
            />

            <span
              className="text-[12.5px] font-semibold"
              style={{
                color: t.textMuted,
                fontFamily: "var(--font-mono)",
              }}
            >
              COMPARISON &amp; OPTIONAL
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
            {SUPPORT.map((m) => {
              const Icon = m.icon;

              return (
                <div
                  key={m.name}
                  className="rounded-[14px] p-5"
                  style={{
                    background: t.surface,
                    border: `1px solid ${t.borderSoft}`,
                  }}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <Icon
                      size={18}
                      style={{ color: t.textSecondary }}
                    />

                    <span
                      className="rounded-[20px] px-[9px] py-[2px] text-[10px] font-semibold"
                      style={{
                        color: t.textMuted,
                        background: t.borderSoft,
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {m.tag.toUpperCase()}
                    </span>
                  </div>

                  <h3
                    className="mb-[6px] text-[15px] font-semibold"
                    style={{
                      fontFamily: "var(--font-display)",
                      color: t.textPrimary,
                    }}
                  >
                    {m.name}
                  </h3>

                  <p
                    className="m-0 text-[12.5px] leading-[1.55]"
                    style={{ color: t.textSecondary }}
                  >
                    {m.copy}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}
