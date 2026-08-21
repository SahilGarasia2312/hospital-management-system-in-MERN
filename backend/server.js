// server.js — Fortified Enterprise Application Entry Point
import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "./src/config/db.js";
import { config } from "./src/config/env.js";
import app from "./src/app.js";

const PORT = config.port;
let server;

const startServer = async () => {
  try {
    await connectDB(); // wait for MongoDB before opening HTTP port
    server = app.listen(PORT, "0.0.0.0", () =>
      console.log(`🚀 HPMS Server running in [${config.env}] on http://0.0.0.0:${PORT}`)
    );
  } catch (err) {
    console.error("❌ Fatal startup error:", err.message);
    process.exit(1);
  }
};

// ─── Graceful Shutdown Handler ────────────────────────────────────────────────
const gracefulShutdown = (signal) => {
  console.log(`\n⚠️ ${signal} received. Initiating graceful shutdown...`);
  if (server) {
    server.close(async () => {
      console.log("🔒 HTTP server closed.");
      try {
        await mongoose.connection.close();
        console.log("📦 MongoDB connection closed cleanly.");
        process.exit(0);
      } catch (err) {
        console.error("❌ Error closing MongoDB connection:", err.message);
        process.exit(1);
      }
    });
  } else {
    process.exit(0);
  }
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

startServer();