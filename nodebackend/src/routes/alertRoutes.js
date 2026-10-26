const express = require("express");
const router = express.Router();
const { listAlerts, getAlert, exportFhir } = require("../controllers/alertController");
const { reviewAlert, listReviewsForAlert } = require("../controllers/reviewController");

router.get("/", listAlerts);
router.get("/:id", getAlert);
router.post("/:id/fhir-export", exportFhir);
router.post("/:id/review", reviewAlert);
router.get("/:id/reviews", listReviewsForAlert);

module.exports = router;
