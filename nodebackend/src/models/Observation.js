/**
 * One citizen/sensor observation for a stream, plus the ML prediction
 * results attached to it once /predict has been called.
 *
 * Field names below match the Python ML service's ObservationInput EXACTLY
 * (snake_case, same names) - this is deliberate. Keeping the names identical
 * on both sides means no error-prone renaming/mapping in mlClient.js, and
 * it's easy to see at a glance that Node and Python agree on what a field
 * means. See app.py in the Python service for the authoritative definition.
 */

const mongoose = require("mongoose");

const observationSchema = new mongoose.Schema(
  {
    stream: { type: mongoose.Schema.Types.ObjectId, ref: "Stream", required: true },

    // --- Core sensor readings (required) ---
    ph: { type: Number, required: true },
    turbidity_ntu: { type: Number, required: true },
    dissolved_oxygen_mg_l: { type: Number, required: true },
    temperature_c: { type: Number, required: true },
    conductivity_us_cm: { type: Number, required: true },
    total_dissolved_solids_mg_l: { type: Number, required: true },
    nitrate_mg_l: { type: Number, required: true },
    phosphate_mg_l: { type: Number, required: true },
    rainfall_24h_mm: { type: Number, required: true },
    rainfall_72h_mm: { type: Number, required: true },

    // --- Optional extras ---
    air_temperature_c: { type: Number },
    recent_rainfall_flag: { type: Boolean, default: false },

    // --- Biodiversity ---
    biodiversity_condition: {
      type: String,
      enum: ["Degraded", "Unknown", "Intermediate", "Healthy"],
    },
    biodiversity_score: { type: Number },
    biodiversity_observation: {
      type: String,
      enum: ["Mayfly_Stonefly", "Mixed_Organisms", "No_Organisms_Observed", "Tolerant_Organisms", "Unknown", "Worms_Leeches"],
      default: "Unknown",
    },

    // --- Previous reading for this stream - filled in by observationController
    //     from this stream's last saved observation, NOT sent by the citizen ---
    previous_observation_available: { type: Boolean, default: false },
    previous_turbidity_ntu: { type: Number },
    previous_dissolved_oxygen_mg_l: { type: Number },

    // --- Other citizen observation fields ---
    weather_condition: {
      type: String,
      enum: ["Clear", "Heavy_Rain", "Light_Rain", "Overcast", "Partly_Cloudy", "Rain", "Unknown"],
      default: "Unknown",
    },
    visible_waste: {
      type: String,
      enum: ["Low", "Moderate", "Not_Observed", "Severe"],
      default: "Not_Observed",
    },
    water_color: {
      type: String,
      enum: ["Brown", "Clear", "Dark", "Green", "Slightly_Brown"],
      default: "Clear",
    },
    odor_observed: {
      type: String,
      enum: ["Mild", "Not_Observed", "Strong"],
      default: "Not_Observed",
    },
    foam_observed: {
      type: String,
      enum: ["Not_Observed", "Observed"],
      default: "Not_Observed",
    },
    algae_observed: {
      type: String,
      enum: ["Heavy", "Low", "Moderate", "Not_Observed"],
      default: "Not_Observed",
    },
    surface_condition: {
      type: String,
      enum: ["Clean", "Floating_Debris", "Foam", "Heavy_Waste", "Oil_Like_Surface"],
      default: "Clean",
    },
    observer_type: {
      type: String,
      enum: ["Citizen", "Environmental_Officer", "Researcher"],
      default: "Citizen",
    },

    // --- ML prediction results, filled in after calling the Python service ---
    risk_binary: { type: String, enum: ["At-risk", "Low-risk"] },
    risk_level: { type: String, enum: ["Low", "Medium", "High"] },
    severity_score: { type: Number },
    is_anomaly: { type: Boolean },
    anomaly_score: { type: Number },
    citizen_explanation: { type: String },
    alert_triggered: { type: Boolean, default: false },
    recommended_action: { type: String },
  },
  { timestamps: true }
);

// Fast lookup of recent readings per stream (used for the /trend call).
observationSchema.index({ stream: 1, createdAt: -1 });

module.exports = mongoose.model("Observation", observationSchema);
