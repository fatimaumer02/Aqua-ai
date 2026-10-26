// Shared mock data referenced across dashboard, map, streams, observations,
// alerts, analytics and AI insights pages, so every page stays in sync.
// Swap these for real API calls once the Node/Express + MongoDB backend is ready.

export const STREAMS = [
  { id: "ravi", name: "Ravi Stream", location: "Sector 4, Lahore", risk: "high", score: 86, trend: "up", updated: "10 min ago", x: 34, y: 26 },
  { id: "nullah-lai", name: "Nullah Lai", location: "City Center, Lahore", risk: "high", score: 79, trend: "up", updated: "25 min ago", x: 58, y: 20 },
  { id: "korang", name: "Korang River", location: "North Zone, Lahore", risk: "medium", score: 58, trend: "down", updated: "1 hr ago", x: 46, y: 48 },
  { id: "hudiara", name: "Hudiara Drain", location: "East Zone, Lahore", risk: "low", score: 91, trend: "flat", updated: "2 hr ago", x: 72, y: 58 },
  { id: "deg-nullah", name: "Deg Nullah", location: "West Zone, Lahore", risk: "medium", score: 61, trend: "down", updated: "3 hr ago", x: 22, y: 64 },
  { id: "sunyara", name: "Sunyara Nullah", location: "South Zone, Lahore", risk: "low", score: 88, trend: "flat", updated: "4 hr ago", x: 62, y: 78 },
];

export const ALERTS = [
  { id: 1, stream: "Ravi Stream", location: "Sector 4", level: "high", type: "High Risk", note: "High environmental risk detected", time: "10 min ago" },
  { id: 2, stream: "Nullah Lai", location: "City Center", level: "medium", type: "Anomaly", note: "Anomaly detected in observations", time: "25 min ago" },
  { id: 3, stream: "Korang River", location: "North Zone", level: "medium", type: "Trend", note: "Risk increasing over next 48-72h", time: "1 hr ago" },
  { id: 4, stream: "Hudiara Drain", location: "East Zone", level: "high", type: "High Risk", note: "High environmental risk detected", time: "2 hr ago" },
];

export const OBSERVATIONS = [
  { id: 1, stream: "Ravi Stream", location: "Sector 4, Lahore", biodiversity: "Degraded", risk: "high", time: "10 min ago", status: "Submitted" },
  { id: 2, stream: "Nullah Lai", location: "City Center, Lahore", biodiversity: "Degraded", risk: "high", time: "25 min ago", status: "Submitted" },
  { id: 3, stream: "Korang River", location: "North Zone, Lahore", biodiversity: "Moderate", risk: "medium", time: "1 hr ago", status: "Under Review" },
  { id: 4, stream: "Hudiara Drain", location: "East Zone, Lahore", biodiversity: "Healthy", risk: "low", time: "2 hr ago", status: "Approved" },
  { id: 5, stream: "Deg Nullah", location: "West Zone, Lahore", biodiversity: "Moderate", risk: "medium", time: "3 hr ago", status: "Submitted" },
];

export const TREND_DATA = [
  { day: "Mon", ph: 7.2, oxygen: 8.1, turbidity: 18, temperature: 24 },
  { day: "Tue", ph: 7.1, oxygen: 7.8, turbidity: 22, temperature: 25 },
  { day: "Wed", ph: 6.9, oxygen: 7.3, turbidity: 26, temperature: 26 },
  { day: "Thu", ph: 6.5, oxygen: 6.1, turbidity: 41, temperature: 28 },
  { day: "Fri", ph: 6.2, oxygen: 5.2, turbidity: 58, temperature: 29 },
  { day: "Sat", ph: 6.4, oxygen: 5.9, turbidity: 47, temperature: 28 },
  { day: "Sun", ph: 6.8, oxygen: 6.8, turbidity: 33, temperature: 27 },
];

export const SHAP_FACTORS = [
  { label: "Turbidity", value: 31 },
  { label: "Dissolved oxygen", value: 25 },
  { label: "Temperature", value: 16 },
  { label: "Rainfall", value: 9 },
  { label: "pH", value: 6 },
  { label: "Biodiversity signal", value: -5 },
];

export const REPORTS = [
  { name: "Weekly Report", range: "Jun 3 - Jun 10, 2026", date: "Jun 10, 2026" },
  { name: "Monthly Report", range: "May 2026", date: "Jun 1, 2026" },
  { name: "Quarterly Report", range: "Q1 2026", date: "Apr 1, 2026" },
];

export const REPORT_TYPES = [
  { key: "weekly", name: "Weekly Report", copy: "Overview of stream health for the past 7 days" },
  { key: "monthly", name: "Monthly Report", copy: "Detailed monthly analytics and trend analysis" },
  { key: "quarterly", name: "Quarterly Report", copy: "Quarterly summary and trend comparisons" },
  { key: "annual", name: "Annual Report", copy: "Yearly report with full year comparisons" },
];

export const COMMUNITY_POSTS = [
  { id: 1, author: "Ali Race", time: "2 hrs ago", body: "Observed high algae growth at Korang River. Water looks greenish near the bridge.", likes: 12, comments: 5, image: true },
  { id: 2, author: "Sara Malik", time: "5 hrs ago", body: "Did anyone notice the change in water smell after the rainfall this week?", likes: 6, comments: 3, image: false },
];

export function riskLabel(risk) {
  if (risk === "high") return "High";
  if (risk === "medium") return "Medium";
  return "Low";
}

// Option lists for the Add Stream / Add Observation / Generate Report wizards.
export const STREAM_TYPES = ["Urban River", "Drain", "Nullah", "Canal", "Seasonal Stream"];
export const WATER_SOURCES = ["Rainfall, Urban Runoff", "Groundwater", "Glacial Melt", "Mixed Sources"];
export const FLOW_TYPES = ["Perennial", "Seasonal", "Intermittent"];
export const LAND_USE_OPTIONS = ["Urban", "Agricultural", "Industrial", "Mixed"];
export const POLLUTION_LEVELS = ["Low", "Medium", "High"];
export const OBSERVER_TYPES = ["Citizen", "Expert", "Researcher"];
export const BIO_CONDITIONS = ["Healthy", "Moderate", "Degraded"];
export const MACROINVERTEBRATES = [
  "Mayfly / Stonefly", "Caddisfly", "Tolerant Species", "Worms / Leeches",
  "Snails", "Crabs / Shrimps", "Aquatic Plants", "Algae",
];
export const REPORT_TYPE_OPTIONS = [
  { key: "summary", name: "Summary Report", copy: "Overview of stream health and key insights." },
  { key: "risk", name: "Risk Analysis Report", copy: "Detailed risk assessment and trend analysis." },
  { key: "compliance", name: "Compliance Report", copy: "Regulatory compliance and standard metrics." },
  { key: "custom", name: "Custom Report", copy: "Build a custom report with selected data." },
];

// Rough, illustrative thresholds for water-quality parameter badges shown in
// the Add Observation wizard - not a scientific/regulatory classification.
export function classifyParam(key, value) {
  const v = parseFloat(value);
  if (Number.isNaN(v)) return null;
  switch (key) {
    case "ph":
      if (v < 6.5) return { label: "Slightly Acidic", level: "warn" };
      if (v > 8.5) return { label: "Alkaline", level: "bad" };
      return { label: "Neutral", level: "good" };
    case "turbidity":
      if (v < 25) return { label: "Low", level: "good" };
      if (v < 60) return { label: "Medium", level: "warn" };
      return { label: "High", level: "bad" };
    case "oxygen":
      if (v < 4) return { label: "Low", level: "bad" };
      if (v < 6) return { label: "Moderate", level: "warn" };
      return { label: "Good", level: "good" };
    case "temperature":
      if (v < 25) return { label: "Normal", level: "good" };
      return { label: "High", level: "bad" };
    case "conductivity":
      if (v < 500) return { label: "Normal", level: "good" };
      if (v < 1000) return { label: "Medium", level: "warn" };
      return { label: "High", level: "bad" };
    case "tds":
      if (v < 300) return { label: "Normal", level: "good" };
      if (v < 600) return { label: "Medium", level: "warn" };
      return { label: "High", level: "bad" };
    case "nitrate":
      if (v < 2) return { label: "Normal", level: "good" };
      if (v < 5) return { label: "Elevated", level: "warn" };
      return { label: "High", level: "bad" };
    case "phosphate":
      if (v < 0.2) return { label: "Normal", level: "good" };
      if (v < 0.5) return { label: "Elevated", level: "warn" };
      return { label: "High", level: "bad" };
    default:
      return null;
  }
}
