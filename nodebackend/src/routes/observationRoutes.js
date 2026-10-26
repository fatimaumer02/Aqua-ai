const express = require("express");
const router = express.Router();
const { createObservation, listObservations } = require("../controllers/observationController");

router.post("/", createObservation);
router.get("/", listObservations);

module.exports = router;
