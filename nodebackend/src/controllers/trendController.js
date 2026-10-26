const mongoose = require("mongoose");
const Observation = require("../models/Observation");

const HISTORY_SIZE = 10;
const CHANGE_THRESHOLD_PCT = 0.10; // how much a reading has to move to count as "worsening"/"improving"

// GET /api/streams/:id/trend
// Simple rolling-average early-warning trend, computed directly from
// MongoDB history - no ML model needed for this (matches the doc's
// "lightweight trend module", Section 6.5-6.8).
async function getStreamTrend(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid stream id" });
  }

  const recent = await Observation.find({ stream: id })
    .sort({ createdAt: -1 })
    .limit(HISTORY_SIZE);

  if (recent.length < 2) {
    return res.json({
      direction: "unknown",
      message: "Not enough recent history to estimate a trend yet.",
    });
  }

  // oldest first
  const readings = recent.slice().reverse();

  const turbidityChange = pctChange(readings.map((r) => r.turbidity_ntu));
  const oxygenChange = pctChange(readings.map((r) => r.dissolved_oxygen_mg_l));

  let worsening = 0;
  let improving = 0;

  if (turbidityChange > CHANGE_THRESHOLD_PCT) worsening++;
  else if (turbidityChange < -CHANGE_THRESHOLD_PCT) improving++;

  if (oxygenChange < -CHANGE_THRESHOLD_PCT) worsening++;
  else if (oxygenChange > CHANGE_THRESHOLD_PCT) improving++;

  let direction = "stable";
  if (worsening >= 1 && worsening >= improving) direction = "worsening";
  else if (improving >= 1 && improving > worsening) direction = "improving";

  const latestRiskLevel = readings[readings.length - 1].risk_level || "Unknown";
  const message =
    direction === "worsening"
      ? `Current risk is ${latestRiskLevel} and trending upward; possible higher risk within 48-72h.`
      : direction === "improving"
      ? `Current risk is ${latestRiskLevel} and conditions appear to be improving.`
      : `Current risk is ${latestRiskLevel} and conditions appear stable.`;

  res.json({ direction, message, horizon_hours: 60 });
}

function pctChange(values) {
  if (values.length < 2) return 0;
  const mid = Math.floor(values.length / 2) || 1;
  const earlier = values.slice(0, mid);
  const later = values.slice(mid).length ? values.slice(mid) : values.slice(-1);
  const earlierMean = earlier.reduce((a, b) => a + b, 0) / earlier.length;
  const laterMean = later.reduce((a, b) => a + b, 0) / later.length;
  if (earlierMean === 0) return 0;
  return (laterMean - earlierMean) / Math.abs(earlierMean);
}

module.exports = { getStreamTrend };
