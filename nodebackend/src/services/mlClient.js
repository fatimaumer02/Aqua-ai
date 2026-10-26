/**
 * Thin wrapper around axios calls to the Python ML service.
 *
 * Field names in Observation.js match the Python service's ObservationInput
 * EXACTLY (see app.py) - so unlike before, there's no renaming/mapping here.
 * We just forward the observation fields as-is.
 */

const axios = require("axios");

const ML_API_URL = process.env.ML_API_URL || "http://localhost:8000";

const client = axios.create({
  baseURL: ML_API_URL,
  timeout: 15000, // SHAP can be slow on the first call
});

// Fields the Python /predict endpoint actually accepts (see ObservationInput
// in app.py). We whitelist these when building the payload so we never
// accidentally send Mongo-only fields like _id, stream, createdAt, etc.
const PREDICT_FIELDS = [
  "ph", "turbidity_ntu", "dissolved_oxygen_mg_l", "temperature_c",
  "conductivity_us_cm", "total_dissolved_solids_mg_l", "nitrate_mg_l",
  "phosphate_mg_l", "rainfall_24h_mm", "rainfall_72h_mm",
  "air_temperature_c", "recent_rainfall_flag",
  "biodiversity_condition", "biodiversity_score", "biodiversity_observation",
  "previous_observation_available", "previous_turbidity_ntu", "previous_dissolved_oxygen_mg_l",
  "weather_condition", "visible_waste", "water_color", "odor_observed",
  "foam_observed", "algae_observed", "surface_condition", "observer_type",
  "observation_timestamp",
];

async function getPrediction(observationData) {
  const payload = {};
  for (const field of PREDICT_FIELDS) {
    if (observationData[field] !== undefined && observationData[field] !== null) {
      payload[field] = observationData[field];
    }
  }

  // matches PredictionOutput in Python's app.py:
  // { risk_binary, risk_level, severity_score, is_anomaly, anomaly_score,
  //   citizen_explanation, alert_triggered, recommended_action }
  const { data } = await client.post("/predict", payload);
  return data;
}

async function checkHealth() {
  const { data } = await client.get("/health");
  return data;
}

module.exports = { getPrediction, checkHealth };
