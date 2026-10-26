export default function Field({ t, icon: Icon, type, placeholder, value, onChange, error, rightSlot, disabled }) {
  return (
    <div>
      <div style={{
        display: "flex", alignItems: "center", gap: 10, background: disabled ? t.border + "20" : t.surfaceRaised,
        border: `1px solid ${error ? t.bad : t.border}`, borderRadius: 10, padding: "0 14px", height: 44,
        opacity: disabled ? 0.65 : 1,
      }}>
        <Icon size={16} color={t.textMuted} />
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: t.textPrimary, fontSize: 13.5, fontFamily: "var(--font-body)", height: "100%", cursor: disabled ? "not-allowed" : "text" }}
        />
        {rightSlot}
      </div>
      {error && <p style={{ fontSize: 11.5, color: t.bad, margin: "5px 0 0" }}>{error}</p>}
    </div>
  );
}
