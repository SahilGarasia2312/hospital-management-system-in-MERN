// config/env.js — Environment Configuration & Validation Layer
import "dotenv/config";

const isProduction = process.env.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test";

/**
 * Validates critical environment variables required to run HPMS safely.
 * Fails early during boot if required production configurations are missing.
 */
export const validateEnv = () => {
  const missing = [];

  if (!process.env.MONGO_URI) {
    missing.push("MONGO_URI");
  }

  if (isProduction && (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes("change_in_production"))) {
    missing.push("JWT_SECRET (must be set and not use default placeholder in production)");
  }

  if (missing.length > 0) {
    console.error("❌ CRITICAL ENVIRONMENT CONFIGURATION ERROR:");
    console.error(`The following required environment variable(s) are missing or invalid: ${missing.join(", ")}`);
    if (isProduction) {
      console.error("Aborting startup due to missing production environment configuration.");
      process.exit(1);
    } else {
      console.warn("⚠️ Running in development mode with incomplete configuration.");
    }
  }
};

export const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT, 10) || 8000,
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/hpms",
  jwtSecret: process.env.JWT_SECRET || "dev_jwt_secret_key_change_in_production_12345",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  corsOrigin: process.env.CORS_ORIGIN || "*",
  isProduction,
  isTest,
};
