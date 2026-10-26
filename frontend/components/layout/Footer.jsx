"use client";

import { Github } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { getTheme } from "@/lib/theme";

export default function Footer() {
  const { mode, accent } = useTheme();
  const t = getTheme(mode, accent);

  return (
    <footer style={{ borderTop: `1px solid ${t.border}`, padding: "24px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <span style={{ fontSize: 12.5, color: t.textMuted }}>
          AquaGuard AI - AI-supported environmental assessment, not a diagnostic authority. Every high-risk case is reviewed by a human expert.
        </span>
        <Github size={16} color={t.textMuted} />
      </div>
    </footer>
  );
}
