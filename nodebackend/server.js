/**
 * Entry point. Run with: npm run dev (or npm start)
 */

require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 4001;

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`AquaGuard Node backend running on http://localhost:${PORT}`);
    console.log(`Expecting ML service at ${process.env.ML_API_URL || "http://localhost:8000"}`);
  });
}

start();
