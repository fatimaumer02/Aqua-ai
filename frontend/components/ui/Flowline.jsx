export default function Flowline({ t, width = 1200 }) {
  return (
    <svg
      viewBox={`0 0 ${width} 28`}
      preserveAspectRatio="none"
      style={{ display: "block", width: "100%", height: 20 }}
    >
      <path
        d={`M0 14 C ${width * 0.12} 2, ${width * 0.22} 26, ${width * 0.35} 14 S ${width * 0.55} 2, ${width * 0.65} 14 S ${width * 0.85} 26, ${width} 14`}
        fill="none"
        stroke={t.border}
        strokeWidth="1.5"
      />
      <path
        d={`M0 14 C ${width * 0.12} 2, ${width * 0.22} 26, ${width * 0.35} 14 S ${width * 0.55} 2, ${width * 0.65} 14 S ${width * 0.85} 26, ${width} 14`}
        fill="none"
        stroke={t.primary}
        strokeWidth="1.5"
        strokeDasharray="14 340"
        strokeLinecap="round"
      >
        <animate attributeName="stroke-dashoffset" from="0" to="-354" dur="6s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}
