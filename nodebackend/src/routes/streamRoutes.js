const express = require("express");
const router = express.Router();
const { listStreams, getStream, createStream } = require("../controllers/streamController");
const { getStreamTrend } = require("../controllers/trendController");

router.get("/", listStreams);
router.post("/", createStream);
router.get("/:id", getStream);
router.get("/:id/trend", getStreamTrend);

module.exports = router;
