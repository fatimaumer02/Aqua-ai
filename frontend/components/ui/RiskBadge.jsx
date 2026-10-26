import { riskColor, riskSoft } from "@/lib/theme";
import { riskLabel } from "@/lib/mockData";

export default function RiskBadge({ t, risk, size = "sm" }) {
  const fontSize = size === "sm" ? 11 : 12.5;
  const padding = size === "sm" ? "2px 9px" : "4px 12px";
  return (
    <span
      style={{
        fontSize, fontWeight: 600, color: riskColor(t, risk), background: riskSoft(t, risk),
        padding, borderRadius: 20, fontFamily: "var(--font-mono)", whiteSpace: "nowrap",
      }}
    >
      {riskLabel(risk)}
    </span>
  );
}
