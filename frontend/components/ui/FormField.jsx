export function TextInput({ t, label, required, error, ...props }) {
  return (
    <div>
      <label style={{ fontSize: 12, color: t.textSecondary, display: "block", marginBottom: 5, fontWeight: 500 }}>
        {label} {required && <span style={{ color: t.bad }}>*</span>}
      </label>
      <input
        {...props}
        style={{ width: "100%", background: t.surfaceRaised, border: `1px solid ${error ? t.bad : t.border}`, borderRadius: 8, padding: "9px 11px", color: t.textPrimary, fontSize: 13, outline: "none" }}
      />
      {error && <p style={{ fontSize: 11, color: t.bad, margin: "4px 0 0" }}>{error}</p>}
    </div>
  );
}

export function SelectInput({ t, label, required, error, children, ...props }) {
  return (
    <div>
      <label style={{ fontSize: 12, color: t.textSecondary, display: "block", marginBottom: 5, fontWeight: 500 }}>
        {label} {required && <span style={{ color: t.bad }}>*</span>}
      </label>
      <select
        {...props}
        style={{ width: "100%", background: t.surfaceRaised, border: `1px solid ${error ? t.bad : t.border}`, borderRadius: 8, padding: "9px 11px", color: t.textPrimary, fontSize: 13, outline: "none" }}
      >
        {children}
      </select>
      {error && <p style={{ fontSize: 11, color: t.bad, margin: "4px 0 0" }}>{error}</p>}
    </div>
  );
}

export function TextArea({ t, label, maxLength, value, ...props }) {
  return (
    <div>
      <label style={{ fontSize: 12, color: t.textSecondary, display: "block", marginBottom: 5, fontWeight: 500 }}>{label}</label>
      <textarea
        value={value}
        maxLength={maxLength}
        {...props}
        style={{ width: "100%", background: t.surfaceRaised, border: `1px solid ${t.border}`, borderRadius: 8, padding: "9px 11px", color: t.textPrimary, fontSize: 13, outline: "none", resize: "vertical", fontFamily: "var(--font-body)" }}
      />
      {maxLength && <p style={{ fontSize: 10.5, color: t.textMuted, margin: "3px 0 0", textAlign: "right" }}>{(value || "").length}/{maxLength}</p>}
    </div>
  );
}

export function StepFooter({ t, mode, onBack, onNext, backLabel = "Previous", nextLabel = "Next", nextIcon: NextIcon, submitting }) {
  return (
    <div className="flex items-center justify-between mt-6 pt-5" style={{ borderTop: `1px solid ${t.borderSoft}` }}>
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          style={{ fontSize: 12.5, fontWeight: 500, color: t.textSecondary, background: "transparent", border: `1px solid ${t.border}`, borderRadius: 8, padding: "9px 16px", cursor: "pointer" }}
        >
          ← {backLabel}
        </button>
      ) : <span />}
      <button
        type={onNext ? "button" : "submit"}
        onClick={onNext}
        disabled={submitting}
        style={{
          display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600,
          color: mode === "dark" ? "#0B1417" : "#fff", background: t.primary, border: "none", borderRadius: 8,
          padding: "9px 18px", cursor: submitting ? "default" : "pointer", opacity: submitting ? 0.7 : 1,
        }}
      >
        {nextLabel} {NextIcon && <NextIcon size={14} />}
      </button>
    </div>
  );
}
