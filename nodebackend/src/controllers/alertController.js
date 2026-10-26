const mongoose = require("mongoose");
const Alert = require("../models/Alert");

// GET /api/alerts?status=pending - list alerts (Alerts page)
async function listAlerts(req, res) {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const alerts = await Alert.find(filter)
    .populate("observation")
    .populate("stream")
    .sort({ createdAt: -1 });

  res.json(alerts);
}

// GET /api/alerts/:id - one alert with full detail (for the review screen)
async function getAlert(req, res) {
  const alert = await Alert.findById(req.params.id).populate("observation").populate("stream");
  if (!alert) return res.status(404).json({ error: "Alert not found" });
  res.json(alert);
}

// POST /api/alerts/:id/fhir-export
// Builds a minimal FHIR-style JSON record for an alert. This is pure
// JSON-shaping - no ML involved, so it's done directly in Node rather
// than calling out to the Python service (see doc Section 6.11-6.13).
async function exportFhir(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid alert id" });
  }

  const alert = await Alert.findById(id);
  if (!alert) return res.status(404).json({ error: "Alert not found" });

  const fhirRecord = {
    resourceType: "Observation",
    status: "final",
    id: String(alert._id),
    code: { text: "AquaGuard environmental risk observation" },
    valueString: `${alert.riskLevel} environmental risk (severity score ${alert.severityScore.toFixed(2)})`,
    interpretation: [{ text: "Expert verification recommended" }],
    effectiveDateTime: new Date().toISOString(),
  };

  alert.fhirExport = fhirRecord;
  await alert.save();

  res.json(fhirRecord);
}

module.exports = { listAlerts, getAlert, exportFhir };
