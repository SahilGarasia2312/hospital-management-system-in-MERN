// core/middleware/request-id.middleware.js — Request Correlation ID Middleware
import { randomUUID } from "crypto";

/**
 * Attaches a unique correlation ID to every incoming HTTP request.
 * Uses existing 'x-request-id' header if provided by client/proxy or generates a UUIDv4.
 */
export const requestIdMiddleware = (req, res, next) => {
  const requestId = req.headers["x-request-id"] || randomUUID();
  req.id = requestId;
  res.setHeader("x-request-id", requestId);
  next();
};
