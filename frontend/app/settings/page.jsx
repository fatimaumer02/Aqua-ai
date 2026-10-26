"use client";

import { useState } from "react";
import {
  User,
  Bell,
  Palette,
  ShieldCheck,
  KeyRound,
  Sun,
  Moon,
  Check,
} from "lucide-react";

import { useTheme } from "@/context/ThemeContext";
import { getTheme, ACCENTS } from "@/lib/theme";
import DashboardShell from "@/components/layout/DashboardShell";
import Field from "@/components/ui/Field";

// ==========================================
// SETTINGS TABS
// ==========================================
const TABS = [
  {
    key: "profile",
    label: "Profile",
    icon: User,
  },
  {
    key: "notifications",
    label: "Notifications",
    icon: Bell,
  },
  {
    key: "preferences",
    label: "Preferences",
    icon: Palette,
  },
  {
    key: "account",
    label: "Account",
    icon: ShieldCheck,
  },
  {
    key: "security",
    label: "Security",
    icon: KeyRound,
  },
];

export default function Settings() {
  // ==========================================
  // THEME
  // ==========================================
  const {
    mode,
    accent,
    setMode,
    setAccent,
  } = useTheme();

  const t = getTheme(mode, accent);

  // ==========================================
  // STATE
  // ==========================================
  const [tab, setTab] = useState("preferences");

  const [name, setName] =
    useState("Ayesha Khan");

  const [email, setEmail] =
    useState("ayesha.khan@email.com");

  const [editing, setEditing] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  // ==========================================
  // NOTIFICATION PREFERENCES
  // ==========================================
  const [notifPrefs, setNotifPrefs] =
    useState({
      "High-risk alerts": true,
      "Anomaly detections": true,
      "Weekly summary report": true,
      "Community replies": false,
    });

  // ==========================================
  // PROFILE EDIT / SAVE
  // ==========================================
  function handleEditToggle() {
    if (editing) {
      setSaved(true);

      setTimeout(
        () => setSaved(false),
        2500
      );
    }

    setEditing((v) => !v);
  }

  return (
    <DashboardShell
      active="/settings"
      title="Settings"
      subtitle="Manage your profile and preferences"
    >
      {/* ========================================
          MAIN SETTINGS LAYOUT
      ======================================== */}
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[220px_1fr]">

        {/* ======================================
            SETTINGS SIDEBAR / TABS
        ====================================== */}
        <div
          className="flex flex-col gap-0.5 rounded-[14px] border p-2"
          style={{
            background: t.surface,
            borderColor: t.border,
          }}
        >
          {TABS.map((tb) => (
            <button
              key={tb.key}
              onClick={() =>
                setTab(tb.key)
              }
              className="flex cursor-pointer items-center gap-[9px] rounded-[9px] border-none px-3 py-[9px] text-left text-[13px] font-medium"
              style={{
                color:
                  tab === tb.key
                    ? t.primary
                    : t.textSecondary,

                background:
                  tab === tb.key
                    ? t.primarySoft
                    : "transparent",
              }}
            >
              <tb.icon size={15} />
              {tb.label}
            </button>
          ))}
        </div>

        {/* ======================================
            SETTINGS CONTENT
        ====================================== */}
        <div
          className="rounded-[14px] border p-6"
          style={{
            background: t.surface,
            borderColor: t.border,
          }}
        >

          {/* ====================================
              PROFILE TAB
          ==================================== */}
          {tab === "profile" && (
            <div>
              {/* Profile Heading */}
              <h3
                className="mb-1 mt-0 font-[family-name:var(--font-display)] text-base font-semibold"
                style={{
                  color: t.textPrimary,
                }}
              >
                Profile Information
              </h3>

              {/* Profile Description */}
              <p
                className="mb-5 mt-0 text-[12.5px]"
                style={{
                  color: t.textSecondary,
                }}
              >
                Update your personal details.
              </p>

              {/* Profile Header */}
              <div className="mb-[22px] flex items-center gap-[14px]">

                {/* Avatar */}
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full font-[family-name:var(--font-display)] text-lg font-semibold"
                  style={{
                    background:
                      t.primarySoft,
                    color: t.primary,
                  }}
                >
                  AK
                </div>

                {/* User Details */}
                <div>
                  <p
                    className="m-0 text-sm font-semibold"
                    style={{
                      color:
                        t.textPrimary,
                    }}
                  >
                    {name}
                  </p>

                  <p
                    className="mt-0.5 mb-0 text-xs"
                    style={{
                      color: t.textMuted,
                    }}
                  >
                    Citizen Scientist
                  </p>
                </div>

                {/* Edit / Save Button */}
                <button
                  onClick={
                    handleEditToggle
                  }
                  className="ml-auto cursor-pointer rounded-lg px-3.5 py-[7px] text-xs font-semibold"
                  style={{
                    color: t.primary,
                    background:
                      "transparent",
                    border: `1px solid ${t.primary}40`,
                  }}
                >
                  {editing
                    ? "Save"
                    : "Edit Profile"}
                </button>
              </div>

              {/* Saved Message */}
              {saved && (
                <p
                  className="mb-[14px] mt-0 text-xs font-medium"
                  style={{
                    color: t.good,
                  }}
                >
                  Profile saved.
                </p>
              )}

              {/* Profile Fields */}
              <div className="flex max-w-[400px] flex-col gap-[14px]">

                {/* Name */}
                <Field
                  t={t}
                  icon={User}
                  type="text"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) =>
                    setName(
                      e.target.value
                    )
                  }
                  disabled={!editing}
                />

                {/* Email */}
                <Field
                  t={t}
                  icon={Bell}
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  disabled={!editing}
                />
              </div>
            </div>
          )}

          {/* ====================================
              PREFERENCES TAB
          ==================================== */}
          {tab === "preferences" && (
            <div>

              {/* Appearance Heading */}
              <h3
                className="mb-1 mt-0 font-[family-name:var(--font-display)] text-base font-semibold"
                style={{
                  color: t.textPrimary,
                }}
              >
                Appearance
              </h3>

              {/* Appearance Description */}
              <p
                className="mb-[22px] mt-0 text-[12.5px]"
                style={{
                  color: t.textSecondary,
                }}
              >
                Choose how AquaGuard AI
                looks for you.
              </p>

              {/* Theme Mode Label */}
              <p
                className="mb-2.5 mt-0 text-[12.5px] font-semibold"
                style={{
                  color: t.textPrimary,
                }}
              >
                Theme mode
              </p>

              {/* Theme Mode Buttons */}
              <div className="mb-[26px] flex gap-2.5">
                {[
                  {
                    key: "dark",
                    label: "Dark",
                    icon: Moon,
                  },
                  {
                    key: "light",
                    label: "Light",
                    icon: Sun,
                  },
                ].map((m) => (
                  <button
                    key={m.key}
                    onClick={() =>
                      setMode(m.key)
                    }
                    className="flex cursor-pointer items-center gap-2 rounded-[10px] px-5 py-3 text-[13px] font-semibold"
                    style={{
                      border: `1.5px solid ${
                        mode === m.key
                          ? t.primary
                          : t.border
                      }`,

                      background:
                        mode === m.key
                          ? t.primarySoft
                          : "transparent",

                      color:
                        mode === m.key
                          ? t.primary
                          : t.textSecondary,
                    }}
                  >
                    <m.icon size={15} />

                    {m.label}

                    {mode === m.key && (
                      <Check size={13} />
                    )}
                  </button>
                ))}
              </div>

              {/* Accent Color Heading */}
              <p
                className="mb-2.5 mt-0 text-[12.5px] font-semibold"
                style={{
                  color: t.textPrimary,
                }}
              >
                Accent color
              </p>

              {/* Accent Color Description */}
              <p
                className="mb-[14px] mt-0 text-xs"
                style={{
                  color: t.textMuted,
                }}
              >
                Applied across charts,
                buttons and highlights
                sitewide.
              </p>

              {/* Accent Color Options */}
              <div className="flex flex-wrap gap-3">
                {Object.entries(
                  ACCENTS
                ).map(([key, def]) => {
                  const swatch =
                    mode === "dark"
                      ? def.dark
                      : def.light;

                  const active =
                    accent === key;

                  return (
                    <button
                      key={key}
                      onClick={() =>
                        setAccent(key)
                      }
                      className="flex cursor-pointer flex-col items-center gap-2 rounded-xl px-4 py-3"
                      style={{
                        border: `1.5px solid ${
                          active
                            ? swatch
                            : t.border
                        }`,

                        background: active
                          ? `${swatch}1A`
                          : "transparent",
                      }}
                    >
                      {/* Accent Swatch */}
                      <span
                        className="flex h-[26px] w-[26px] items-center justify-center rounded-full"
                        style={{
                          background:
                            swatch,
                        }}
                      >
                        {active && (
                          <Check
                            size={13}
                            color="#fff"
                          />
                        )}
                      </span>

                      {/* Accent Name */}
                      <span
                        className="text-[11.5px] font-medium"
                        style={{
                          color: active
                            ? swatch
                            : t.textSecondary,
                        }}
                      >
                        {def.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ====================================
              NOTIFICATIONS TAB
          ==================================== */}
          {tab === "notifications" && (
            <div>

              {/* Notifications Heading */}
              <h3
                className="mb-1 mt-0 font-[family-name:var(--font-display)] text-base font-semibold"
                style={{
                  color: t.textPrimary,
                }}
              >
                Notifications
              </h3>

              {/* Notifications Description */}
              <p
                className="mb-5 mt-0 text-[12.5px]"
                style={{
                  color: t.textSecondary,
                }}
              >
                Choose what you want to be
                notified about.
              </p>

              {/* Notification Options */}
              <div className="flex flex-col gap-[14px]">
                {Object.keys(
                  notifPrefs
                ).map((n) => (
                  <div
                    key={n}
                    className="flex items-center justify-between border-b py-2.5"
                    style={{
                      borderBottomColor:
                        t.borderSoft,
                    }}
                  >
                    {/* Notification Name */}
                    <span
                      className="text-[13px]"
                      style={{
                        color:
                          t.textPrimary,
                      }}
                    >
                      {n}
                    </span>

                    {/* Toggle */}
                    <button
                      onClick={() =>
                        setNotifPrefs(
                          (prev) => ({
                            ...prev,
                            [n]:
                              !prev[n],
                          })
                        )
                      }
                      aria-label={`Toggle ${n}`}
                      aria-pressed={
                        notifPrefs[n]
                      }
                      className="relative h-[21px] w-[38px] cursor-pointer rounded-[20px] border-none p-0 transition-colors duration-150 ease-in-out"
                      style={{
                        background:
                          notifPrefs[n]
                            ? t.primary
                            : t.border,
                      }}
                    >
                      {/* Toggle Circle */}
                      <div
                        className="absolute top-[3px] h-[15px] w-[15px] rounded-full bg-white transition-[left] duration-150 ease-in-out"
                        style={{
                          left: notifPrefs[n]
                            ? 20
                            : 3,
                        }}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ====================================
              ACCOUNT / SECURITY TAB
          ==================================== */}
          {(tab === "account" ||
            tab === "security") && (
            <div>

              {/* Tab Heading */}
              <h3
                className="mb-1 mt-0 font-[family-name:var(--font-display)] text-base font-semibold"
                style={{
                  color: t.textPrimary,
                }}
              >
                {tab === "account"
                  ? "Account"
                  : "Security"}
              </h3>

              {/* Tab Description */}
              <p
                className="m-0 text-[12.5px]"
                style={{
                  color: t.textSecondary,
                }}
              >
                {tab === "account"
                  ? "Manage your account and data."
                  : "Password, two-factor authentication and login activity."}
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}

