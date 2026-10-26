/**
 * Connects to MongoDB using the URI from .env.
 * Called once when the server starts (see server.js).
 */

const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error("MONGO_URI is not set in .env - cannot start without a database.");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected:", mongoose.connection.name);
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
