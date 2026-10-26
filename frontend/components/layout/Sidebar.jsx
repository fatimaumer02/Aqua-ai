"use client";

import Link from "next/link";
import {
  Droplets, LayoutDashboard, Map as MapIcon, Waves, ClipboardList,
  AlertTriangle, BarChart3, Sparkles, FileText, Users, Settings, X,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { getTheme } from "@/lib/theme";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Map View", icon: MapIcon, href: "/map-view" },
  { label: "Streams", icon: Waves, href: "/streams" },
  { label: "Observations", icon: ClipboardList, href: "/observations" },
  { label: "Alerts", icon: AlertTriangle, href: "/alerts" },
  { label: "Analytics", icon: BarChart3, href: "/analytics" },
  { label: "AI Insights", icon: Sparkles, href: "/ai-insights" },
  { label: "Reports", icon: FileText, href: "/reports" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export default function Sidebar({ active, mobileOpen, onClose }) {
  const { mode, accent } = useTheme();
  const t = getTheme(mode, accent);

  const content = (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 18px 16px" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: t.primary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Droplets size={16} color={mode === "dark" ? "#0B1417" : "#fff"} strokeWidth={2.4} />
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15.5, color: t.textPrimary, letterSpacing: "-0.01em" }}>
            AquaGuard <span style={{ color: t.primary }}>AI</span>
          </span>
        </Link>
        <button onClick={onClose} style={{ display: "flex", background: "none", border: "none", color: t.textSecondary, cursor: "pointer" }} aria-label="Close menu">
          <X size={18} />
        </button>
      </div>

      <nav style={{ flex: 1, padding: "4px 12px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 9,
                fontSize: 13.5, fontWeight: 500, textDecoration: "none",
                color: isActive ? t.primary : t.textSecondary,
                background: isActive ? t.primarySoft : "transparent",
              }}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: 14, borderTop: `1px solid ${t.borderSoft}`, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: t.primarySoft, border: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12.5, fontWeight: 600, color: t.primary, fontFamily: "var(--font-display)", flexShrink: 0 }}>
          AK
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 12.5, fontWeight: 600, color: t.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Ayesha Khan</p>
          <p style={{ margin: 0, fontSize: 11, color: t.textMuted }}>Citizen Scientist</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className="hidden lg:block"
        style={{ width: 220, flexShrink: 0, background: t.surface, borderRight: `1px solid ${t.border}`, position: "sticky", top: 0, height: "100vh" }}
      >
        {content}
      </aside>

      {mobileOpen && (
        <div onClick={onClose} className="lg:hidden" style={{ position: "fixed", inset: 0, zIndex: 49, background: "rgba(0,0,0,0.5)" }}>
          <aside
            onClick={(e) => e.stopPropagation()}
            style={{ width: 240, height: "100vh", background: t.surface, borderRight: `1px solid ${t.border}` }}
          >
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
