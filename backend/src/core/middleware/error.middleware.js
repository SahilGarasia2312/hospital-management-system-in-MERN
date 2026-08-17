// middleware/error.middleware.js — Global Express error handler
// feature: Catches all unhandled errors thrown via next(err) and returns consistent JSON
import { AppError } from "../errors/index.js";
/**
 * Global error handler middleware.
 * Must be registered LAST in Express (after all routes).
 * Catches errors passed via next(err) from any route or middleware.
 *
 * Usage in server.js:
 *   app.use(errorHandler); // <- must be last
 */
export const errorHandler = (err, req, res, next) => {
  console.error(`❌ [${new Date().toISOString()}] ${err.stack || err.message}`);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: "Validation failed", errors: messages });
  }

  // Mongoose duplicate key error (e.g. unique email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `Duplicate value: ${field} already exists.`,
    });
  }

  // JWT errors (fallback, should be caught in middleware)
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ success: false, message: "Invalid token." });
  }

  // Application operational errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }

  // Default: Internal server error (hide sensitive details)
  return res.status(500).json({ success: false, message: "Internal server error" });
};
