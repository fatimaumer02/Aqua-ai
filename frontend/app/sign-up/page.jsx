"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {Droplets, Sun, Moon, Mail, Lock, User, ArrowRight, Eye, EyeOff, Camera, UserCheck, LayoutDashboard, Loader2,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { getTheme } from "@/lib/theme";
import { useAuth } from "@/context/AuthContext";

import WaterBackground from "@/components/three/WaterBackground";
import Flowline from "@/components/ui/Flowline";
import Field from "@/components/ui/Field";

export default function SignUp() {
  // ==========================================
  // THEME
  // ==========================================

  const { mode, accent, toggleMode } = useTheme();
  const t = getTheme(mode, accent);

  const router = useRouter();
  const { signUp } = useAuth();

  // ==========================================
  // FORM STATE
  // ==========================================

  const [role, setRole] = useState("citizen");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [authError, setAuthError] = useState("");

  // ==========================================
  // FORM SUBMIT
  // ==========================================

  async function handleSubmit() {
    const e = {};

    if (!name.trim()) {
      e.name = "Enter your name";
    }

    if (!email.trim()) {
      e.email = "Enter your email";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      e.email = "Enter a valid email";
    }

    if (!password) {
      e.password = "Create a password";
    } else if (password.length < 8) {
      e.password = "Use at least 8 characters";
    }

    setErrors(e);
    setAuthError("");

    if (Object.keys(e).length === 0) {
      try {
        await signUp({ name: name.trim(), email: email.trim(), password, role });
        setSubmitted(true);
      } catch (err) {
        setAuthError(err.message || "Could not create account. Is the backend running?");
      }
    }
  }

  // ==========================================
  // REDIRECT AFTER SIGN UP
  // ==========================================

  useEffect(() => {
    if (!submitted) return;

    const timer = setTimeout(() => {
      router.push("/dashboard");
    }, 1200);

    return () => clearTimeout(timer);
  }, [submitted, router]);

  // ==========================================
  // COMPONENT
  // ==========================================

  return (
    <div
      className="relative min-h-screen"
      style={{
        background: t.bg,
      }}
    >
      {/* ======================================
          WATER BACKGROUND
      ====================================== */}

      <WaterBackground mode={mode} />

      {/* ======================================
          MAIN PAGE WRAPPER
      ====================================== */}

      <div
        className="
          relative
          z-[1]
          flex
          min-h-screen
          flex-col
        "
      >
        {/* ====================================
            TOP NAVIGATION
        ==================================== */}

        <div
          className="
            flex
            items-center
            justify-between
            px-6
            py-5
          "
        >
          {/* ==================================
              LOGO
          ================================== */}

          <Link
            href="/"
            className="
              flex
              items-center
              gap-2.5
              no-underline
            "
          >
            <div
              className="
                flex
                h-[30px]
                w-[30px]
                items-center
                justify-center
                rounded-lg
              "
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

            <span
              className="
                text-[15.5px]
                font-semibold
                font-[family-name:var(--font-display)]
              "
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

          {/* ==================================
              THEME TOGGLE
          ================================== */}

          <button
            onClick={toggleMode}
            aria-label="Toggle theme"
            className="
              flex
              h-[34px]
              w-[34px]
              cursor-pointer
              items-center
              justify-center
              rounded-[9px]
              border
              bg-transparent
            "
            style={{
              borderColor: t.border,
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

        {/* ====================================
            CENTER CONTENT
        ==================================== */}

        <div
          className="
            flex
            flex-1
            items-center
            justify-center
            px-6
            pb-[60px]
            pt-5
          "
        >
          {/* ==================================
              SIGN UP CARD WRAPPER
          ================================== */}

          <div className="w-full max-w-[400px]">

            {/* ==================================
                SIGN UP CARD
            ================================== */}

            <div
              className="
                rounded-[18px]
                border
                px-7
                py-[30px]
              "
              style={{
                background: t.surface,
                borderColor: t.border,
              }}
            >
              {/* =================================
                  FLOWLINE
              ================================= */}

              <Flowline
                t={t}
                width={600}
              />

              {/* =================================
                  HEADING
              ================================= */}

              <h1
                className="
                  mt-[18px]
                  mb-1
                  text-[22px]
                  font-semibold
                  tracking-[-0.01em]
                  font-[family-name:var(--font-display)]
                "
                style={{
                  color: t.textPrimary,
                }}
              >
                Create your account
              </h1>

              {/* =================================
                  DESCRIPTION
              ================================= */}

              <p
                className="
                  mb-[22px]
                  text-[13px]
                "
                style={{
                  color: t.textSecondary,
                }}
              >
                Join AquaGuard AI as a citizen
                contributor or an expert reviewer.
              </p>

              {/* =================================
                  SUCCESS STATE
              ================================= */}

              {submitted ? (

                <div
                  className="
                    rounded-[10px]
                    border
                    p-[18px]
                    text-center
                  "
                  style={{
                    background:
                      t.primarySoft,

                    borderColor:
                      `${t.primary}30`,
                  }}
                >
                  {/* ===============================
                      SUCCESS MESSAGE
                  =============================== */}

                  <p
                    className="
                      mb-1
                      text-[13.5px]
                      font-medium
                    "
                    style={{
                      color: t.primary,
                    }}
                  >
                    Account created as{" "}
                    {role === "citizen"
                      ? "citizen contributor"
                      : "expert reviewer"}
                  </p>

                  {/* ===============================
                      REDIRECT MESSAGE
                  =============================== */}

                  <div
                    className="
                      mb-3
                      flex
                      items-center
                      justify-center
                      gap-2
                    "
                  >
                    <Loader2
                      size={14}
                      color={t.primary}
                      className="spin"
                    />

                    <p
                      className="m-0 text-[12.5px]"
                      style={{
                        color:
                          t.textSecondary,
                      }}
                    >
                      Redirecting to your dashboard...
                    </p>
                  </div>

                  {/* ===============================
                      DASHBOARD LINK
                  =============================== */}

                  <Link
                    href="/dashboard"
                    className="
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-lg
                      px-4
                      py-2
                      text-[12.5px]
                      font-semibold
                      no-underline
                    "
                    style={{
                      color:
                        mode === "dark"
                          ? "#0B1417"
                          : "#fff",

                      background:
                        t.primary,
                    }}
                  >
                    <LayoutDashboard size={13} />

                    Go to dashboard now
                  </Link>
                </div>

              ) : (

                <>
                  {/* =================================
                      ROLE SELECTION
                  ================================= */}

                  <div
                    className="
                      mb-[18px]
                      grid
                      grid-cols-2
                      gap-2
                    "
                  >
                    {[
                      {
                        key: "citizen",
                        icon: Camera,
                        label: "Citizen",
                        sub: "Report observations",
                      },
                      {
                        key: "expert",
                        icon: UserCheck,
                        label: "Expert",
                        sub: "Review alerts",
                      },
                    ].map((r) => (

                      <button
                        key={r.key}
                        onClick={() =>
                          setRole(r.key)
                        }
                        className="
                          flex
                          cursor-pointer
                          flex-col
                          items-center
                          gap-1.5
                          rounded-xl
                          px-2.5
                          py-3.5
                        "
                        style={{
                          border:
                            `1.5px solid ${
                              role === r.key
                                ? t.primary
                                : t.border
                            }`,

                          background:
                            role === r.key
                              ? t.primarySoft
                              : "transparent",
                        }}
                      >
                        {/* ==========================
                            ROLE ICON
                        ========================== */}

                        <r.icon
                          size={17}
                          color={
                            role === r.key
                              ? t.primary
                              : t.textMuted
                          }
                        />

                        {/* ==========================
                            ROLE NAME
                        ========================== */}

                        <span
                          className="
                            text-[13px]
                            font-semibold
                          "
                          style={{
                            color:
                              role === r.key
                                ? t.primary
                                : t.textPrimary,
                          }}
                        >
                          {r.label}
                        </span>

                        {/* ==========================
                            ROLE DESCRIPTION
                        ========================== */}

                        <span
                          className="text-[10.5px]"
                          style={{
                            color:
                              t.textMuted,
                          }}
                        >
                          {r.sub}
                        </span>
                      </button>

                    ))}
                  </div>

                  {/* =================================
                      FORM FIELDS
                  ================================= */}

                  <div
                    className="
                      flex
                      flex-col
                      gap-3.5
                    "
                  >
                    {/* Full Name */}

                    <Field
                      t={t}
                      icon={User}
                      type="text"
                      placeholder="Full name"
                      value={name}
                      onChange={(e) =>
                        setName(e.target.value)
                      }
                      error={errors.name}
                    />

                    {/* Email */}

                    <Field
                      t={t}
                      icon={Mail}
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
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
                      placeholder="Create a password"
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
                          className="
                            flex
                            cursor-pointer
                            border-none
                            bg-transparent
                          "
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
                            <Eye
                              size={15}
                            />
                          )}
                        </button>
                      }
                    />
                  </div>

                  {/* =================================
                      AUTH ERROR
                  ================================= */}

                  {authError && (
                    <p
                      className="mt-[14px] mb-0 text-[12.5px] font-medium"
                      style={{ color: t.bad }}
                    >
                      {authError}
                    </p>
                  )}

                  {/* =================================
                      CREATE ACCOUNT BUTTON
                  ================================= */}

                  <button
                    onClick={handleSubmit}
                    className="
                      mt-[22px]
                      flex
                      w-full
                      cursor-pointer
                      items-center
                      justify-center
                      gap-[7px]
                      rounded-[10px]
                      border-none
                      p-3
                      text-[14px]
                      font-semibold
                    "
                    style={{
                      color:
                        mode === "dark"
                          ? "#0B1417"
                          : "#fff",

                      background:
                        t.primary,
                    }}
                  >
                    Create account

                    <ArrowRight
                      size={15}
                    />
                  </button>
                </>
              )}

              {/* =================================
                  SIGN IN LINK
              ================================= */}

              <p
                className="
                  mt-[22px]
                  text-center
                  text-[12.5px]
                "
                style={{
                  color: t.textSecondary,
                }}
              >
                Already have an account?{" "}

                <Link
                  href="/sign-in"
                  className="
                    font-medium
                    no-underline
                  "
                  style={{
                    color: t.primary,
                  }}
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

