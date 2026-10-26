const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const streamRoutes = require("./routes/streamRoutes");
const observationRoutes = require("./routes/observationRoutes");
const alertRoutes = require("./routes/alertRoutes");
const authRoutes = require("./routes/authRoutes");
const mlClient = require("./services/mlClient");

const app = express();

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || "http://localhost:3000" }));
app.use(express.json());
app.use(morgan("dev")); // logs each request to the console - handy while wiring up the frontend

app.use("/api/auth", authRoutes);
app.use("/api/streams", streamRoutes);
app.use("/api/observations", observationRoutes);
app.use("/api/alerts", alertRoutes);

// GET /api/health - confirms this server AND the Python ML service are both reachable
app.get("/api/health", async (req, res) => {
  let mlStatus;
  try {
    mlStatus = await mlClient.checkHealth();
  } catch (err) {
    mlStatus = { status: "unreachable", error: err.message };
  }
  res.json({ status: "ok", mlService: mlStatus });
});

// Catch-all 404
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Basic error handler - so an unexpected exception returns JSON, not an HTML crash page
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = app;
