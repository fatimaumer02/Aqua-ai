/**
 * Created automatically whenever an observation's prediction crosses the
 * alert threshold (high risk / anomaly / worsening trend). Feeds the
 * "Alerts" page and the expert review workflow (Section 13 of the doc).
 */

const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
  {
    observation: { type: mongoose.Schema.Types.ObjectId, ref: "Observation", required: true },
    stream: { type: mongoose.Schema.Types.ObjectId, ref: "Stream", required: true },

    riskLevel: { type: String, enum: ["Low", "Medium", "High"], required: true },
    severityScore: { type: Number, required: true }, // from the ML service's severity_score
    reason: { type: String }, // e.g. "High risk", "Medium risk", "Anomaly detected"

    status: {
      type: String,
      enum: ["pending", "confirmed", "rejected", "more_info_requested"],
      default: "pending",
    },

    // Filled in once someone clicks "Export observation" (Section 6.13)
    fhirExport: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Alert", alertSchema);
