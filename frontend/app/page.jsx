"use client";

import Link from "next/link";
import {
  Waves,
  ArrowRight,
  Brain,
  ScanEye,
  ShieldCheck,
  Camera,
  ClipboardList,
  MessageSquareWarning,
  UserCheck,
  ChevronRight,
} from "lucide-react";

import { useTheme } from "@/context/ThemeContext";
import { getTheme } from "@/lib/theme";
import WaterBackground from "@/components/three/WaterBackground";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const FLOW_STEPS = [
  { icon: Camera, label: "Citizen data" },
  { icon: ClipboardList, label: "Cleaning" },
  { icon: Brain, label: "ML prediction" },
  { icon: ScanEye, label: "Explanation" },
  { icon: MessageSquareWarning, label: "Alert" },
  { icon: UserCheck, label: "Expert review" },
];

const MODELS = [
  {
    icon: Brain,
    name: "XGBoost",
    role: "Core risk prediction",
    copy: "Turns pH, turbidity, oxygen, temperature and rainfall into a Low, Medium or High risk assessment.",
  },
  {
    icon: ScanEye,
    name: "Isolation Forest",
    role: "Early-warning anomaly detection",
    copy: "Flags a reading the moment it breaks from a stream's normal pattern, before it becomes obvious.",
  },
  {
    icon: ShieldCheck,
    name: "SHAP",
    role: "Explainable AI",
    copy: "Shows exactly which factors drove a prediction, so a reviewer can trust it or challenge it.",
  },
];

export default function Home() {
  const { mode, accent } = useTheme();
  const t = getTheme(mode, accent);

  return (
    <div
      className="relative min-h-screen"
      style={{ background: t.bg }}
    >
      <WaterBackground mode={mode} />

      <div className="relative z-[1]">
        <Navbar active="/" />

        {/* Hero Section */}
        <section className="mx-auto max-w-[1180px] px-6 pb-14 pt-[72px] text-center">
          {/* Badge */}
          <div
            className="mb-[26px] inline-flex items-center gap-[7px] rounded-[20px] px-[14px] py-1.5 font-mono text-[12px] font-medium"
            style={{
              color: t.primary,
              background: t.primarySoft,
            }}
          >
            <Waves size={13} />
            AI-supported environmental monitoring
          </div>

          {/* Main Heading */}
          <h1
            className="mb-5 text-[clamp(32px,5vw,52px)] font-semibold leading-[1.12] tracking-[-0.02em]"
            style={{
              fontFamily: "var(--font-display)",
              color: t.textPrimary,
            }}
          >
            Urban streams can't speak.
            <br />
            <span style={{ color: t.primary }}>
              AquaGuard AI listens.
            </span>
          </h1>

          {/* Description */}
          <p
            className="mx-auto mb-[34px] max-w-[640px] text-[16.5px] leading-[1.65]"
            style={{
              color: t.textSecondary,
            }}
          >
            Citizen and environmental observations become explainable
            stream-health risk assessments and early warnings - helping
            communities and experts catch freshwater problems earlier.
          </p>

          {/* Hero Actions */}
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/sign-up"
              className="flex items-center gap-[7px] rounded-[10px] px-[22px] py-3 text-[14px] font-semibold no-underline"
              style={{
                color: mode === "dark" ? "#0B1417" : "#fff",
                background: t.primary,
              }}
            >
              <Camera size={15} />
              Report a stream
            </Link>

            <Link
              href="/sign-in"
              className="flex items-center gap-[7px] rounded-[10px] border px-[22px] py-3 text-[14px] font-semibold no-underline"
              style={{
                color: t.textPrimary,
                borderColor: t.border,
              }}
            >
              Sign in as expert
              <ChevronRight size={14} />
            </Link>
          </div>
        </section>

        {/* Process Flow Section */}
        <section className="mx-auto max-w-[1180px] px-6 pb-16">
          <div
            className="rounded-2xl border px-6 py-7 sm:px-6"
            style={{
              background: t.surface,
              borderColor: t.border,
            }}
          >
            {/* Flow Label */}
            <p
              className="mb-[22px] text-center font-mono text-[11.5px] tracking-[0.03em]"
              style={{
                color: t.textMuted,
              }}
            >
              DATA → CLEANING → ML PREDICTION → EXPLANATION → ALERT → HUMAN
              REVIEW
            </p>

            {/* Flow Steps */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              {FLOW_STEPS.map((s, i) => (
                <div
                  key={s.label}
                  className="flex min-w-[90px] flex-1 items-center gap-3"
                >
                  <div className="flex flex-1 flex-col items-center gap-2">
                    {/* Icon */}
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-[11px]"
                      style={{
                        background: t.primarySoft,
                      }}
                    >
                      <s.icon
                        size={18}
                        color={t.primary}
                      />
                    </div>

                    {/* Label */}
                    <span
                      className="text-center text-[12px] font-medium"
                      style={{
                        color: t.textSecondary,
                      }}
                    >
                      {s.label}
                    </span>
                  </div>

                  {/* Arrow */}
                  {i < FLOW_STEPS.length - 1 && (
                    <ArrowRight
                      size={14}
                      color={t.textMuted}
                      className="hidden shrink-0 sm:block"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section className="mx-auto max-w-[900px] px-6 pb-[72px] text-center">
          <h2
            className="mb-[14px] text-[26px] font-semibold"
            style={{
              fontFamily: "var(--font-display)",
              color: t.textPrimary,
            }}
          >
            Professional monitoring can't be everywhere
          </h2>

          <p
            className="mx-auto max-w-[640px] text-[15.5px] leading-[1.7]"
            style={{
              color: t.textSecondary,
            }}
          >
            Sewage, runoff, waste, turbidity, low oxygen and temperature
            stress affect urban streams constantly - but continuous
            professional coverage doesn't scale. Citizens can fill the gap,
            though their observations are often incomplete or hard to interpret
            alone. AquaGuard AI turns that raw, noisy input into something a
            reviewer can act on.
          </p>
        </section>

        {/* Models Section */}
        <section className="mx-auto max-w-[1180px] px-6 pb-20">
          <h2
            className="mb-10 text-center text-2xl font-semibold"
            style={{
              fontFamily: "var(--font-display)",
              color: t.textPrimary,
            }}
          >
            Three models, one clear answer
          </h2>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
            {MODELS.map((m) => (
              <div
                key={m.name}
                className="rounded-[14px] border p-[22px]"
                style={{
                  background: t.surface,
                  borderColor: t.border,
                }}
              >
                {/* Model Icon */}
                <div
                  className="mb-4 flex h-[38px] w-[38px] items-center justify-center rounded-[10px]"
                  style={{
                    background: t.primarySoft,
                  }}
                >
                  <m.icon
                    size={18}
                    color={t.primary}
                  />
                </div>

                {/* Model Name */}
                <h3
                  className="mb-1 text-base font-semibold"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: t.textPrimary,
                  }}
                >
                  {m.name}
                </h3>

                {/* Model Role */}
                <p
                  className="mb-2.5 font-mono text-[12px] font-medium"
                  style={{
                    color: t.primary,
                  }}
                >
                  {m.role}
                </p>

                {/* Model Description */}
                <p
                  className="text-[13.5px] leading-[1.6]"
                  style={{
                    color: t.textSecondary,
                  }}
                >
                  {m.copy}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* User Type Section */}
        <section className="mx-auto max-w-[1180px] px-6 pb-[90px]">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
            {/* Citizen Card */}
            <div
              className="rounded-2xl border p-7"
              style={{
                background: t.surface,
                borderColor: t.border,
              }}
            >
              <Camera
                size={20}
                color={t.primary}
              />

              <h3
                className="mb-1.5 mt-[14px] text-lg font-semibold"
                style={{
                  fontFamily: "var(--font-display)",
                  color: t.textPrimary,
                }}
              >
                I'm reporting a stream
              </h3>

              <p
                className="mb-[18px] text-[13.5px] leading-[1.6]"
                style={{
                  color: t.textSecondary,
                }}
              >
                Submit a photo or reading from a stream near you. No account
                needed to get started.
              </p>

              <Link
                href="/sign-up"
                className="inline-flex items-center gap-1.5 rounded-[9px] px-[18px] py-2.5 text-[13.5px] font-semibold no-underline"
                style={{
                  color: mode === "dark" ? "#0B1417" : "#fff",
                  background: t.primary,
                }}
              >
                Report now
                <ArrowRight size={13} />
              </Link>
            </div>

            {/* Expert Card */}
            <div
              className="rounded-2xl border p-7"
              style={{
                background: t.surface,
                borderColor: t.border,
              }}
            >
              <UserCheck
                size={20}
                color={t.primary}
              />

              <h3
                className="mb-1.5 mt-[14px] text-lg font-semibold"
                style={{
                  fontFamily: "var(--font-display)",
                  color: t.textPrimary,
                }}
              >
                I'm an expert reviewer
              </h3>

              <p
                className="mb-[18px] text-[13.5px] leading-[1.6]"
                style={{
                  color: t.textSecondary,
                }}
              >
                Sign in to confirm, reject or request more data on high-risk
                predictions.
              </p>

              <Link
                href="/sign-in"
                className="inline-flex items-center gap-1.5 rounded-[9px] border px-[18px] py-2.5 text-[13.5px] font-semibold no-underline"
                style={{
                  color: t.textPrimary,
                  borderColor: t.border,
                }}
              >
                Sign in
                <ChevronRight size={13} />
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}

