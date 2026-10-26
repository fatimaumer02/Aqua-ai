"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { getTheme } from "@/lib/theme";
import WaterBackground from "@/components/three/WaterBackground";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export default function DashboardShell({ active, title, subtitle, actions, children }) {
  const { mode, accent } = useTheme();
  const t = getTheme(mode, accent);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  // Every page that uses DashboardShell is a protected page - if there's
  // no logged-in user once the initial auth check finishes, bounce to
  // sign-in instead of showing the dashboard underneath.
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/sign-in");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div style={{ background: t.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: t.textMuted, fontSize: 13 }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ background: t.bg, minHeight: "100vh", position: "relative" }}>
      <WaterBackground mode={mode} />
      <div style={{ position: "relative", zIndex: 1, display: "flex" }}>
        <Sidebar active={active} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Topbar title={title} subtitle={subtitle} actions={actions} onMenuClick={() => setMobileOpen(true)} />
          <main className="px-3.5 sm:px-5 pt-5 pb-12">{children}</main>
        </div>
      </div>
    </div>
  );
}
