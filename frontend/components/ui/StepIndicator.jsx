import { Check } from "lucide-react";

export default function StepIndicator({ t, steps, current }) {
  return (
    <div className="flex items-center flex-wrap gap-y-2">
      {steps.map((label, i) => {
        const stepNum = i + 1;
        const isDone = stepNum < current;
        const isActive = stepNum === current;
        return (
          <div key={label} className="flex items-center">
            <div className="flex items-center gap-2">
              <span
                style={{
                  width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)",
                  background: isDone ? t.good : isActive ? t.primary : t.borderSoft,
                  color: isDone || isActive ? "#fff" : t.textMuted,
                }}
              >
                {isDone ? <Check size={13} /> : stepNum}
              </span>
              <span
                className="hidden sm:inline"
                style={{
                  fontSize: 12.5, fontWeight: isActive ? 600 : 500,
                  color: isActive ? t.primary : isDone ? t.textPrimary : t.textMuted,
                }}
              >
                {label}
              </span>
            </div>
            {stepNum < steps.length && (
              <div style={{ width: 24, height: 1.5, background: stepNum < current ? t.good : t.border, margin: "0 10px" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
