const mongoose = require("mongoose");
const Alert = require("../models/Alert");
const Review = require("../models/Review");

// POST /api/alerts/:id/review
// Body: { expertName, decision: "confirmed"|"rejected"|"more_info_requested", notes }
// Section 13 - Human-in-the-Loop: an expert confirms, rejects, or asks for
// another observation on a high-risk/anomaly alert.
async function reviewAlert(req, res) {
  const { id } = req.params;
  const { expertName, decision, notes } = req.body;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid alert id" });
  }
  if (!expertName || !decision) {
    return res.status(400).json({ error: "expertName and decision are required" });
  }
  const validDecisions = ["confirmed", "rejected", "more_info_requested"];
  if (!validDecisions.includes(decision)) {
    return res.status(400).json({ error: `decision must be one of: ${validDecisions.join(", ")}` });
  }

  const alert = await Alert.findById(id);
  if (!alert) return res.status(404).json({ error: "Alert not found" });

  const review = await Review.create({ alert: alert._id, expertName, decision, notes });

  alert.status = decision;
  await alert.save();

  res.status(201).json({ alert, review });
}

// GET /api/alerts/:id/reviews - review history for one alert
async function listReviewsForAlert(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid alert id" });
  }
  const reviews = await Review.find({ alert: id }).sort({ createdAt: -1 });
  res.json(reviews);
}

module.exports = { reviewAlert, listReviewsForAlert };
