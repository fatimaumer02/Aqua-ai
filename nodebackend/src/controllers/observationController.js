const mongoose = require("mongoose");
const Observation = require("../models/Observation");
const Stream = require("../models/Stream");
const Alert = require("../models/Alert");
const mlClient = require("../services/mlClient");

// POST /api/observations
// Main entry point: citizen/sensor submits a reading -> we look up the
// stream's last reading (for the "previous_*" trend fields) -> call the
// ML service for prediction -> save everything -> auto-create an Alert if
// the result crosses the threshold -> return the full result to the frontend.
async function createObservation(req, res) {
  const { streamId, ...observationFields } = req.body;

  if (!streamId || !mongoose.isValidObjectId(streamId)) {
    return res.status(400).json({ error: "Valid streamId is required" });
  }

  const stream = await Stream.findById(streamId);
  if (!stream) return res.status(404).json({ error: "Stream not found" });

  // Required core sensor fields - the ML service also validates, but failing
  // fast here avoids an unnecessary network call.
  const required = [
    "ph", "turbidity_ntu", "dissolved_oxygen_mg_l", "temperature_c",
    "conductivity_us_cm", "total_dissolved_solids_mg_l", "nitrate_mg_l",
    "phosphate_mg_l", "rainfall_24h_mm", "rainfall_72h_mm",
  ];
  const missing = required.filter((f) => observationFields[f] === undefined);
  if (missing.length > 0) {
    return res.status(400).json({ error: `Missing required fields: ${missing.join(", ")}` });
  }

  // --- Look up this stream's last observation for the "previous_*" trend fields ---
  // (the citizen never sends these - we fill them in from history automatically)
  const lastObservation = await Observation.findOne({ stream: stream._id }).sort({ createdAt: -1 });

  if (lastObservation) {
    observationFields.previous_observation_available = true;
    observationFields.previous_turbidity_ntu = lastObservation.turbidity_ntu;
    observationFields.previous_dissolved_oxygen_mg_l = lastObservation.dissolved_oxygen_mg_l;
  } else {
    observationFields.previous_observation_available = false;
  }

  let prediction;
  try {
    prediction = await mlClient.getPrediction(observationFields);
  } catch (err) {
    // ML service down/unreachable - still save the raw observation so no
    // citizen data is lost, but leave prediction fields empty. The
    // frontend can show "prediction pending" and you can re-run it later.
    console.error("ML /predict call failed:", err.message);

    const observation = await Observation.create({ stream: stream._id, ...observationFields });

    return res.status(202).json({
      observation,
      warning: "Saved, but the ML service could not be reached - prediction not yet available.",
    });
  }

  const observation = await Observation.create({
    stream: stream._id,
    ...observationFields,
    risk_binary: prediction.risk_binary,
    risk_level: prediction.risk_level,
    severity_score: prediction.severity_score,
    is_anomaly: prediction.is_anomaly,
    anomaly_score: prediction.anomaly_score,
    citizen_explanation: prediction.citizen_explanation,
    alert_triggered: prediction.alert_triggered,
    recommended_action: prediction.recommended_action,
  });

  // Keep the stream's "last known" fields fresh for fast list rendering.
  stream.lastRiskLevel = prediction.risk_level;
  stream.lastObservedAt = observation.createdAt;
  await stream.save();

  let alert = null;
  if (prediction.alert_triggered) {
    const reasonParts = [];
    if (prediction.risk_level === "High") reasonParts.push("High risk");
    if (prediction.risk_level === "Medium") reasonParts.push("Medium risk");
    if (prediction.is_anomaly) reasonParts.push("Anomaly detected");

    alert = await Alert.create({
      observation: observation._id,
      stream: stream._id,
      riskLevel: prediction.risk_level,
      severityScore: prediction.severity_score,
      reason: reasonParts.join(", ") || "Threshold exceeded",
    });
  }

  res.status(201).json({ observation, alert });
}

// GET /api/observations?streamId=... - list observations, optionally filtered by stream
async function listObservations(req, res) {
  const { streamId } = req.query;
  const filter = {};
  if (streamId) {
    if (!mongoose.isValidObjectId(streamId)) {
      return res.status(400).json({ error: "Invalid streamId" });
    }
    filter.stream = streamId;
  }

  const observations = await Observation.find(filter).sort({ createdAt: -1 }).limit(200);
  res.json(observations);
}

module.exports = { createObservation, listObservations };
