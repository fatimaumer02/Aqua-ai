"use client";

import Link from "next/link";
import { Droplets, Sun, Moon, ArrowRight } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { getTheme } from "@/lib/theme";
import Flowline from "@/components/ui/Flowline";

const LINKS = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/models", label: "Models" },
  { href: "/solutions", label: "Solutions" },
];

export default function Navbar({ active }) {
  const { mode, accent, toggleMode } = useTheme();
  const t = getTheme(mode, accent);

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 30, background: t.navBg, backdropFilter: "blur(10px)", borderBottom: `1px solid ${t.border}` }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 62 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: t.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Droplets size={17} color={mode === "dark" ? "#0B1417" : "#fff"} strokeWidth={2.4} />
            </div>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 17, color: t.textPrimary, letterSpacing: "-0.01em" }}>
              AquaGuard <span style={{ color: t.primary }}>AI</span>
            </span>
          </Link>

          <nav className="hidden md:flex" style={{ display: "flex", alignItems: "center", gap: 22 }}>
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                style={{ fontSize: 13.5, color: active === l.href ? t.primary : t.textSecondary, textDecoration: "none", fontWeight: 500 }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={toggleMode}
              style={{ width: 34, height: 34, borderRadius: 9, border: `1px solid ${t.border}`, background: "transparent", color: t.textSecondary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              aria-label="Toggle theme"
            >
              {mode === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <Link href="/sign-in" style={{ fontSize: 13, color: t.textSecondary, fontWeight: 500, textDecoration: "none", padding: "8px 6px" }}>
              Sign in
            </Link>
            <Link
              href="/sign-up"
              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: mode === "dark" ? "#0B1417" : "#fff", background: t.primary, borderRadius: 9, padding: "9px 16px", textDecoration: "none" }}
            >
              Get started <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
      <Flowline t={t} />
    </header>
  );
}
