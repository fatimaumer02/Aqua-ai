/**
 * A monitored stream/location. Citizens submit observations against a stream.
 */

const mongoose = require("mongoose");

const streamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    region: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    // Denormalized "last known" fields, updated whenever a new observation
    // comes in - lets the Streams list page render fast without joining.
    lastRiskLevel: { type: String, enum: ["Low", "Medium", "High"], default: null },
    lastRiskProbability: { type: Number, default: null },
    lastObservedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Stream", streamSchema);
