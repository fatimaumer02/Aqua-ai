// Central place for every call to the Node.js backend.
// Swaps out lib/mockData.js + lib/localStore.js as the real data source.
//
// Set NEXT_PUBLIC_API_URL in .env.local (defaults to localhost:5000 for dev).
// The frontend NEVER talks to the Python service (port 8000) directly -
// only to Node, which calls Python behind the scenes.

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function request(path, options = {}) {
  const token = typeof window !== "undefined" ? window.localStorage.getItem("aquaguard_token") : null;

  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  return res.json();
}

// ============================================================
// Streams
// ============================================================

export function fetchStreams() {
  return request("/api/streams");
}

export function fetchStream(id) {
  return request(`/api/streams/${id}`);
}

export function fetchStreamTrend(id) {
  return request(`/api/streams/${id}/trend`);
}

export function createStream(data) {
  return request("/api/streams", { method: "POST", body: JSON.stringify(data) });
}

// ============================================================
// Observations
// ============================================================

export function fetchObservations(streamId) {
  const qs = streamId ? `?streamId=${streamId}` : "";
  return request(`/api/observations${qs}`);
}

export function createObservation(data) {
  return request("/api/observations", { method: "POST", body: JSON.stringify(data) });
}

// ============================================================
// Alerts
// ============================================================

export function fetchAlerts(status) {
  const qs = status ? `?status=${status}` : "";
  return request(`/api/alerts${qs}`);
}

export function fetchAlert(id) {
  return request(`/api/alerts/${id}`);
}

export function reviewAlert(id, data) {
  return request(`/api/alerts/${id}/review`, { method: "POST", body: JSON.stringify(data) });
}

export function exportFhir(id) {
  return request(`/api/alerts/${id}/fhir-export`, { method: "POST" });
}

// ============================================================
// Adapters — turn real backend shapes into the shape the existing
// UI components already expect (so page JSX doesn't need rewriting).
// ============================================================

// Backend risk_level is "Low"/"Medium"/"High" -> UI expects lowercase.
export function toUiRisk(riskLevel) {
  if (!riskLevel) return "low";
  return riskLevel.toLowerCase();
}

// Spreads streams across the map view's 0-100 x/y percentage grid,
// based on real lat/lng (min-max normalized across the given streams).
export function computeMapPositions(streams) {
  const lats = streams.map((s) => s.latitude).filter((v) => typeof v === "number");
  const lngs = streams.map((s) => s.longitude).filter((v) => typeof v === "number");
  const latMin = Math.min(...lats, 0), latMax = Math.max(...lats, 1);
  const lngMin = Math.min(...lngs, 0), lngMax = Math.max(...lngs, 1);

  return streams.map((s, i) => {
    const hasCoords = typeof s.latitude === "number" && typeof s.longitude === "number";
    const x = hasCoords && lngMax !== lngMin
      ? 15 + ((s.longitude - lngMin) / (lngMax - lngMin)) * 70
      : 20 + (i * 13) % 60;
    const y = hasCoords && latMax !== latMin
      ? 15 + ((latMax - s.latitude) / (latMax - latMin)) * 70 // invert: higher lat = up
      : 20 + (i * 17) % 60;
    return { ...s, x: Math.round(x), y: Math.round(y) };
  });
}

// Maps a Node Stream document -> the shape STREAMS mock items had
// (id, name, location, risk, score, trend, updated).
export function streamToUi(stream) {
  return {
    id: stream._id,
    name: stream.name,
    location: [stream.region].filter(Boolean).join(", ") || "-",
    risk: toUiRisk(stream.lastRiskLevel),
    score: stream.lastRiskLevel === "Low" ? 85 : stream.lastRiskLevel === "Medium" ? 55 : 25,
    trend: "flat", // real trend comes from GET /api/streams/:id/trend, per-stream
    updated: stream.lastObservedAt ? timeAgo(stream.lastObservedAt) : "No data yet",
    latitude: stream.latitude,
    longitude: stream.longitude,
  };
}

// Maps a Node Alert document (populated with .stream and .observation)
// -> the shape ALERTS mock items had (id, stream, location, level, type, note, time).
export function alertToUi(alert) {
  return {
    id: alert._id,
    stream: alert.stream?.name || "Unknown stream",
    location: alert.stream?.region || "-",
    level: toUiRisk(alert.riskLevel),
    type: alert.reason?.includes("Anomaly") ? "Anomaly" : `${alert.riskLevel} Risk`,
    note: alert.reason || "Threshold exceeded",
    time: timeAgo(alert.createdAt),
    status: alert.status,
    raw: alert, // keep the full record around for the review screen
  };
}

// Maps a Node Observation document -> the shape OBSERVATIONS mock items had.
export function observationToUi(obs) {
  return {
    id: obs._id,
    stream: obs.stream?.name || obs.stream, // populated or raw id
    location: obs.stream?.region || "-",
    biodiversity: obs.biodiversity_condition || "Unknown",
    risk: toUiRisk(obs.risk_level),
    time: timeAgo(obs.createdAt),
    status: obs.risk_level ? "Submitted" : "Processing",
    isAnomaly: obs.is_anomaly,
    explanation: obs.citizen_explanation,
  };
}

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} day ago`;
}

// ============================================================
// Add Observation form -> real backend payload
// ============================================================
// Converts the Add Observation wizard's UI state (wq, organism,
// bioCondition, bioScore, weather, obsInfo) into the exact field names
// and enum values the Python model expects (see app.py ObservationInput).

const ORGANISM_TO_BIODIVERSITY_OBSERVATION = {
  mayfly: "Mayfly_Stonefly",
  tolerant: "Tolerant_Organisms",
  worms: "Worms_Leeches",
  mixed: "Mixed_Organisms",
  none: "No_Organisms_Observed",
  unknown: "Unknown",
};

const BIO_CONDITION_TO_BACKEND = {
  Healthy: "Healthy",
  Moderate: "Intermediate", // UI says "Moderate", model was trained on "Intermediate"
  Degraded: "Degraded",
};

const WEATHER_CONDITION_TO_BACKEND = {
  Sunny: "Clear",
  Cloudy: "Partly_Cloudy",
  Rain: "Rain",
  Overcast: "Overcast",
  Storm: "Heavy_Rain",
};

const OBSERVER_TYPE_TO_BACKEND = {
  Citizen: "Citizen",
  Expert: "Environmental_Officer",
  Researcher: "Researcher",
};

export function buildObservationPayload({ streamId, wq, organism, bioCondition, bioScore, weather, obsInfo }) {
  const num = (v) => (v === "" || v === undefined || v === null ? undefined : parseFloat(v));

  return {
    streamId,

    // --- Water quality (required) ---
    ph: num(wq.ph),
    turbidity_ntu: num(wq.turbidity),
    dissolved_oxygen_mg_l: num(wq.oxygen),
    temperature_c: num(wq.temperature),
    conductivity_us_cm: num(wq.conductivity),
    total_dissolved_solids_mg_l: num(wq.tds),
    nitrate_mg_l: num(wq.nitrate),
    phosphate_mg_l: num(wq.phosphate),

    // --- Weather ---
    rainfall_24h_mm: num(weather.rain24) ?? 0,
    rainfall_72h_mm: num(weather.rain72) ?? 0,
    air_temperature_c: num(weather.airTemp),
    recent_rainfall_flag: weather.recentRain === "Yes",
    weather_condition: WEATHER_CONDITION_TO_BACKEND[weather.condition] || "Unknown",

    // --- Biodiversity ---
    biodiversity_observation: ORGANISM_TO_BIODIVERSITY_OBSERVATION[organism] || "Unknown",
    biodiversity_condition: BIO_CONDITION_TO_BACKEND[bioCondition] || "Unknown",
    biodiversity_score: bioScore,

    // --- Observation info ---
    observer_type: OBSERVER_TYPE_TO_BACKEND[obsInfo.observerType] || "Citizen",
    observation_timestamp: obsInfo.datetime ? new Date(obsInfo.datetime).toISOString() : undefined,
  };
}

