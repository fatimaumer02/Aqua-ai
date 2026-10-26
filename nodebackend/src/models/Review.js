/**
 * An expert's decision on an alert (Section 13 - Human-in-the-Loop).
 * Kept separate from Alert so an alert can accumulate a history of
 * review actions if needed later.
 */

const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    alert: { type: mongoose.Schema.Types.ObjectId, ref: "Alert", required: true },
    expertName: { type: String, required: true },
    decision: {
      type: String,
      enum: ["confirmed", "rejected", "more_info_requested"],
      required: true,
    },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
