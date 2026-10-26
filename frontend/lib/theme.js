export const ACCENTS = {
  teal: { label: "Teal", dark: "#2FBF9E", light: "#1B8A6F" },
  ocean: { label: "Ocean", dark: "#3E9DF0", light: "#1F6FC2" },
  violet: { label: "Violet", dark: "#9B7FE8", light: "#6E4FCB" },
  amber: { label: "Amber", dark: "#E0A64D", light: "#B4791C" },
};

const BASE = {
  dark: {
    bg: "#0B1417",
    surface: "#101B1F",
    surfaceRaised: "#152227",
    border: "#203136",
    borderSoft: "#182A2F",
    textPrimary: "#EAF3F0",
    textSecondary: "#9FBBB4",
    textMuted: "#5D7B76",
    good: "#5FBF8B",
    goodSoft: "rgba(95,191,139,0.14)",
    warn: "#E0A64D",
    warnSoft: "rgba(224,166,77,0.14)",
    bad: "#E2685A",
    badSoft: "rgba(226,104,90,0.14)",
    navBg: "rgba(11,20,23,0.85)",
  },
  light: {
    bg: "#F4F8F6",
    surface: "#FFFFFF",
    surfaceRaised: "#FFFFFF",
    border: "#DCE7E2",
    borderSoft: "#E7F0EC",
    textPrimary: "#0F211D",
    textSecondary: "#4E6D66",
    textMuted: "#84A199",
    good: "#2F8F5E",
    goodSoft: "rgba(47,143,94,0.1)",
    warn: "#B4791C",
    warnSoft: "rgba(180,121,28,0.1)",
    bad: "#C24437",
    badSoft: "rgba(194,68,55,0.1)",
    navBg: "rgba(244,248,246,0.85)",
  },
};

function hexToRgba(hex, alpha) {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getTheme(mode = "dark", accent = "teal") {
  const base = BASE[mode] || BASE.dark;
  const accentDef = ACCENTS[accent] || ACCENTS.teal;
  const primary = mode === "dark" ? accentDef.dark : accentDef.light;
  return {
    ...base,
    primary,
    primarySoft: hexToRgba(primary, mode === "dark" ? 0.14 : 0.09),
  };
}

export function riskColor(t, risk) {
  if (risk === "high") return t.bad;
  if (risk === "medium") return t.warn;
  return t.good;
}

export function riskSoft(t, risk) {
  if (risk === "high") return t.badSoft;
  if (risk === "medium") return t.warnSoft;
  return t.goodSoft;
}
