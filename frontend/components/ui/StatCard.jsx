import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatCard({ t, icon: Icon, label, value, unit, delta, deltaGood }) {
  return (
    <div
      style={{
        background: t.surface, border: `1px solid ${t.border}`, borderRadius: 14,
        padding: "18px 20px", display: "flex", flexDirection: "column", gap: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ color: t.textSecondary, fontSize: 13 }}>{label}</span>
        <div style={{ width: 30, height: 30, borderRadius: 9, background: t.primarySoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={15} color={t.primary} strokeWidth={2} />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 600, color: t.textPrimary, letterSpacing: "-0.02em" }}>{value}</span>
        {unit && <span style={{ fontSize: 13, color: t.textMuted, fontFamily: "var(--font-mono)" }}>{unit}</span>}
      </div>
      {delta && (
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12.5, color: deltaGood ? t.good : t.bad, fontFamily: "var(--font-mono)" }}>
          {deltaGood ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          {delta}
        </div>
      )}
    </div>
  );
}
