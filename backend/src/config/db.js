// config/db.js — MongoDB connection module
import mongoose from "mongoose";

// improvement: Added retry logic so transient network blips don't cause a permanent 503.
// After MAX_RETRIES failures, process exits so Render restarts the container cleanly.
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

/**
 * Connects to MongoDB using the URI from environment variables.
 * Retries up to MAX_RETRIES times before exiting the process.
 * Exiting on total failure lets the host (Render/Railway) restart and recover automatically.
 */
export const connectDB = async (attempt = 1) => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // improvement: fail fast if Atlas is unreachable
      socketTimeoutMS: 45000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌ [Attempt ${attempt}/${MAX_RETRIES}] MongoDB connection failed: ${err.message}`);

    if (attempt < MAX_RETRIES) {
      // improvement: Wait before retrying to handle transient Atlas cold-start delays
      console.log(`⏳ Retrying in ${RETRY_DELAY_MS / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      return connectDB(attempt + 1);
    }

    // fix: Exit process on final failure so Render detects a crash and restarts — 
    // previously the server stayed up without a DB, causing every request to 503.
    console.error("❌ All DB connection attempts failed. Shutting down so host can restart the service.");
    console.error("⚠️ Check MONGO_URI in your Render dashboard → Environment Variables.");
    process.exit(1);
  }
};
