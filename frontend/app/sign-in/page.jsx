"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {Droplets, Sun, Moon, Mail, Lock, ArrowRight, Eye, EyeOff, LayoutDashboard, Loader2,
} from "lucide-react";

import { useTheme } from "@/context/ThemeContext";
import { getTheme } from "@/lib/theme";
import { useAuth } from "@/context/AuthContext";

import WaterBackground from "@/components/three/WaterBackground";
import Flowline from "@/components/ui/Flowline";
import Field from "@/components/ui/Field";

export default function SignIn() {
  // ==========================================
  // THEME
  // ==========================================
  const { mode, accent, toggleMode } = useTheme();
  const t = getTheme(mode, accent);

  // ==========================================
  // ROUTER
  // ==========================================
  const router = useRouter();
  const { signIn } = useAuth();

  // ==========================================
  // FORM STATE
  // ==========================================
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Password visibility
  const [showPw, setShowPw] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState({});

  // Successful submission state
  const [submitted, setSubmitted] =
    useState(false);

  // Real sign-in error from the backend (wrong password, etc.)
  const [authError, setAuthError] = useState("");

  // Forgot password message
  const [forgotMsg, setForgotMsg] =
    useState(false);

  // ==========================================
  // HANDLE SIGN IN
  // ==========================================
  async function handleSubmit() {
    const e = {};

    if (!email.trim()) {
      e.email = "Enter your email";
    } else if (
      !/^\S+@\S+\.\S+$/.test(email)
    ) {
      e.email = "Enter a valid email";
    }

    if (!password) {
      e.password = "Enter your password";
    }

    setErrors(e);
    setAuthError("");

    if (Object.keys(e).length === 0) {
      try {
        await signIn({ email, password });
        setSubmitted(true);
      } catch (err) {
        setAuthError(err.message || "Could not sign in. Is the backend running?");
      }
    }
  }

  // ==========================================
  // AUTO REDIRECT AFTER SUCCESSFUL SIGN IN
  // ==========================================
  useEffect(() => {
    if (!submitted) return;

    const timer = setTimeout(() => {
      router.push("/dashboard");
    }, 1200);

    return () => clearTimeout(timer);
  }, [submitted, router]);
  return (
    // ==========================================
    // PAGE WRAPPER
    // ==========================================
    <div
      className="relative min-h-screen"
      style={{
        background: t.bg,
      }}
    >
      {/* ========================================
          WATER BACKGROUND
      ======================================== */}
      <WaterBackground mode={mode} />

      {/* ========================================
          MAIN PAGE CONTENT
      ======================================== */}
      <div className="relative z-[1] flex min-h-screen flex-col">

        {/* ======================================
            TOP HEADER
        ====================================== */}
        <div className="flex items-center justify-between px-6 py-5">

          {/* ====================================
              LOGO
          ==================================== */}
          <Link
            href="/"
            className="flex items-center gap-2.5 no-underline"
          >
            {/* Logo Icon */}
            <div
              className="flex h-[30px] w-[30px] items-center justify-center rounded-lg"
              style={{
                background: t.primary,
              }}
            >
              <Droplets
                size={15}
                color={
                  mode === "dark"
                    ? "#0B1417"
                    : "#fff"
                }
                strokeWidth={2.4}
              />
            </div>

            {/* Logo Text */}
            <span
              className="font-[family-name:var(--font-display)] text-[15.5px] font-semibold"
              style={{
                color: t.textPrimary,
              }}
            >
              AquaGuard{" "}
              <span
                style={{
                  color: t.primary,
                }}
              >
                AI
              </span>
            </span>
          </Link>

          {/* ====================================
              THEME TOGGLE
          ==================================== */}
          <button
            onClick={toggleMode}
            aria-label="Toggle theme"
            className="flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-[9px] border"
            style={{
              borderColor: t.border,
              background: "transparent",
              color: t.textSecondary,
            }}
          >
            {mode === "dark" ? (
              <Sun size={15} />
            ) : (
              <Moon size={15} />
            )}
          </button>
        </div>

        {/* ======================================
            CENTER CONTENT
        ====================================== */}
        <div className="flex flex-1 items-center justify-center px-6 pb-[60px] pt-5">

          {/* Sign In Container */}
          <div className="w-full max-w-[380px]">

            {/* ==================================
                SIGN IN CARD
            ================================== */}
            <div
              className="rounded-[18px] border px-7 py-[30px]"
              style={{
                background: t.surface,
                borderColor: t.border,
              }}
            >

              {/* =================================
                  FLOWLINE DECORATION
              ================================= */}
              <Flowline
                t={t}
                width={600}
              />

              {/* =================================
                  HEADING
              ================================= */}
              <h1
                className="mb-1 mt-[18px] font-[family-name:var(--font-display)] text-[22px] font-semibold tracking-[-0.01em]"
                style={{
                  color: t.textPrimary,
                }}
              >
                Welcome back
              </h1>

              {/* =================================
                  DESCRIPTION
              ================================= */}
              <p
                className="mb-[26px] mt-0 text-[13px]"
                style={{
                  color: t.textSecondary,
                }}
              >
                Sign in to review stream alerts
                and observations.
              </p>

              {/* =================================
                  SUCCESS / REDIRECT STATE
              ================================= */}
              {submitted ? (
                <div
                  className="rounded-[10px] border p-[18px] text-center"
                  style={{
                    background:
                      t.primarySoft,
                    borderColor: `${t.primary}30`,
                  }}
                >
                  {/* Redirecting Message */}
                  <div className="mb-2.5 flex items-center justify-center gap-2">

                    <Loader2
                      size={15}
                      color={t.primary}
                      className="spin"
                    />

                    <p
                      className="m-0 text-[13.5px] font-medium"
                      style={{
                        color: t.primary,
                      }}
                    >
                      Signed in - redirecting
                      to your dashboard...
                    </p>
                  </div>

                  {/* Go To Dashboard */}
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-[12.5px] font-semibold no-underline"
                    style={{
                      color:
                        mode === "dark"
                          ? "#0B1417"
                          : "#fff",
                      background:
                        t.primary,
                    }}
                  >
                    <LayoutDashboard
                      size={13}
                    />
                    Go to dashboard now
                  </Link>
                </div>
              ) : (
                <>
                  {/* =================================
                      FORM FIELDS
                  ================================= */}
                  <div className="flex flex-col gap-[14px]">

                    {/* Email */}
                    <Field
                      t={t}
                      icon={Mail}
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) =>
                        setEmail(
                          e.target.value
                        )
                      }
                      error={errors.email}
                    />

                    {/* Password */}
                    <Field
                      t={t}
                      icon={Lock}
                      type={
                        showPw
                          ? "text"
                          : "password"
                      }
                      placeholder="Password"
                      value={password}
                      onChange={(e) =>
                        setPassword(
                          e.target.value
                        )
                      }
                      error={errors.password}
                      rightSlot={
                        <button
                          onClick={() =>
                            setShowPw(
                              !showPw
                            )
                          }
                          aria-label="Toggle password visibility"
                          className="flex cursor-pointer border-none bg-transparent p-0"
                          style={{
                            color:
                              t.textMuted,
                          }}
                        >
                          {showPw ? (
                            <EyeOff
                              size={15}
                            />
                          ) : (
                            <Eye size={15} />
                          )}
                        </button>
                      }
                    />
                  </div>

                  {/* =================================
                      FORGOT PASSWORD
                  ================================= */}
                  <div className="my-[10px] mb-[22px] flex justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        setForgotMsg(true)
                      }
                      className="cursor-pointer border-none bg-transparent p-0 text-[12.5px] font-medium"
                      style={{
                        color: t.primary,
                      }}
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* =================================
                      FORGOT PASSWORD MESSAGE
                  ================================= */}
                  {forgotMsg && (
                    <p
                      className="-mt-[14px] mb-[18px] text-right text-xs"
                      style={{
                        color:
                          t.textSecondary,
                      }}
                    >
                      Password reset isn't
                      connected to a backend yet
                      - wire this to your auth API.
                    </p>
                  )}

                  {/* =================================
                      AUTH ERROR
                  ================================= */}
                  {authError && (
                    <p
                      className="-mt-[8px] mb-[14px] text-[12.5px] font-medium"
                      style={{ color: t.bad }}
                    >
                      {authError}
                    </p>
                  )}

                  {/* =================================
                      SIGN IN BUTTON
                  ================================= */}
                  <button
                    onClick={handleSubmit}
                    className="flex w-full cursor-pointer items-center justify-center gap-[7px] rounded-[10px] border-none px-3 py-3 text-sm font-semibold"
                    style={{
                      color:
                        mode === "dark"
                          ? "#0B1417"
                          : "#fff",
                      background:
                        t.primary,
                    }}
                  >
                    Sign in
                    <ArrowRight size={15} />
                  </button>
                </>
              )}

              {/* =================================
                  SIGN UP LINK
              ================================= */}
              <p
                className="mt-[22px] mb-0 text-center text-[12.5px]"
                style={{
                  color: t.textSecondary,
                }}
              >
                Don't have an account?{" "}
                <Link
                  href="/sign-up"
                  className="font-medium no-underline"
                  style={{
                    color: t.primary,
                  }}
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

