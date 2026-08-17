import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import morgan from "morgan";
import mongoose from "mongoose";
import authRoutes from "./modules/auth/auth.routes.js";
import doctorRoutes from "./modules/doctor/doctor.routes.js";
import patientRoutes from "./modules/patient/patient.routes.js";
import { errorHandler } from "./core/middleware/error.middleware.js";

const app = express();

// ─── 1. CORS & Preflight (MUST BE FIRST before Helmet & Rate Limiter) ─────────
app.use(cors({ origin: true, credentials: true }));
app.options("*", cors({ origin: true, credentials: true }));

// ─── 2. Security & HTTP Header Hardening (`helmet`) ──────────────────────────
app.use(helmet({ crossOriginResourcePolicy: false }));

// ─── 3. HTTP Request Logging & Telemetry (`morgan`) ──────────────────────────
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

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

// ─── 5. NoSQL Injection & Query Sanitization ─────────────────────────────────
app.use(mongoSanitize()); // strips out $ and . operators from req.body/query/params

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use("/api/auth",     authRoutes);
app.use("/api/doctors",  doctorRoutes);
app.use("/api/patients", patientRoutes);

// Health check & API Root
app.get("/api/health", (req, res) => res.status(200).json({ 
  status: "ok", 
  dbConnected: mongoose.connection.readyState === 1,
  timestamp: new Date() 
}));
app.get("/", (req, res) => res.status(200).json({ 
  message: "🚀 HPMS Enterprise Backend API is Live & Connected to MongoDB Atlas!", 
  status: "active",
  dbConnected: mongoose.connection.readyState === 1,
  endpoints: ["/api/auth", "/api/doctors", "/api/patients", "/api/health"]
}));

// ─── Global Error Handler (must be last) ─────────────────────────────────────
app.use(errorHandler);

export default app;
