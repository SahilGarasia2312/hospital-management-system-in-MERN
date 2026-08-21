import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import morgan from "morgan";
import mongoose from "mongoose";
import apiRoutes from "./routes/index.js";
import { errorHandler } from "./core/middleware/error.middleware.js";
import { requestIdMiddleware } from "./core/middleware/request-id.middleware.js";
import { config, validateEnv } from "./config/env.js";

// Validate environment on load
validateEnv();

const app = express();

// ─── 0. Request Correlation ID ───────────────────────────────────────────────
app.use(requestIdMiddleware);

// ─── 1. CORS & Preflight (MUST BE FIRST before Helmet & Rate Limiter) ─────────
const allowedOrigin = config.corsOrigin === "*" ? true : config.corsOrigin;
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.options("*", cors({ origin: allowedOrigin, credentials: true }));

// ─── 2. Security & HTTP Header Hardening (`helmet`) ──────────────────────────
app.use(helmet({ crossOriginResourcePolicy: false }));

// ─── 3. HTTP Request Logging & Telemetry (`morgan`) ──────────────────────────
app.use(morgan(config.isProduction ? "combined" : "dev"));

// ─── 4. Rate Limiting (Prevent Brute Force & DDoS) ───────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 200, // limit each IP to 200 requests per window
  message: { status: "error", message: "Too many requests from this IP, please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

// ─── 5. Body Parsing & NoSQL Injection Sanitization ──────────────────────────
app.use(express.json({ limit: "10kb" })); // prevent payload exhaustion attacks

// ─── 6. NoSQL Injection & Query Sanitization ─────────────────────────────────
app.use(mongoSanitize()); // strips out $ and . operators from req.body/query/params

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use("/api", apiRoutes);

// ─── Health (Liveness) Endpoint ───────────────────────────────────────────────
app.get("/api/health", (req, res) => res.status(200).json({
  status: "ok",
  service: "hpms-backend",
  environment: config.env,
  timestamp: new Date().toISOString()
}));

// ─── Readiness Endpoint (Checks DB Connection State) ─────────────────────────
app.get("/api/ready", (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const statusCode = isDbConnected ? 200 : 503;
  return res.status(statusCode).json({
    status: isDbConnected ? "ready" : "unhealthy",
    service: "hpms-backend",
    dbConnected: isDbConnected,
    timestamp: new Date().toISOString()
  });
});

app.get("/", (req, res) => res.status(200).json({
  message: "🚀 HPMS Enterprise Backend API is Live!",
  status: "active",
  dbConnected: mongoose.connection.readyState === 1,
  endpoints: ["/api/v1/auth", "/api/v1/doctors", "/api/v1/patients", "/api/health", "/api/ready"]
}));

// ─── Global Error Handler (must be last) ─────────────────────────────────────
app.use(errorHandler);

export default app;
