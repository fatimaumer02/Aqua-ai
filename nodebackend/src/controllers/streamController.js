const Stream = require("../models/Stream");

// GET /api/streams - list all streams (for Streams page + Map View)
async function listStreams(req, res) {
  const streams = await Stream.find().sort({ updatedAt: -1 });
  res.json(streams);
}

// GET /api/streams/:id - one stream's detail
async function getStream(req, res) {
  const stream = await Stream.findById(req.params.id);
  if (!stream) return res.status(404).json({ error: "Stream not found" });
  res.json(stream);
}

// POST /api/streams - create a new monitored stream
async function createStream(req, res) {
  const { name, region, latitude, longitude } = req.body;
  if (!name) return res.status(400).json({ error: "name is required" });

  const stream = await Stream.create({ name, region, latitude, longitude });
  res.status(201).json(stream);
}

module.exports = { listStreams, getStream, createStream };
