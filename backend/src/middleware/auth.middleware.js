// middleware/auth.middleware.js — JWT verification middleware
// feature: Decodes the Bearer token and attaches req.user for downstream use
import { verifyToken } from "../utils/jwt.utils.js";
import { sendError } from "../utils/response.utils.js";

/**
 * Middleware: verifyToken
 * Checks for a valid JWT in the Authorization header.
 * If valid, attaches decoded payload to req.user and calls next().
 * If missing or invalid, responds with 401 Unauthorized.
 *
 * Usage: router.get('/protected', verifyToken, controller)
 */
export const verifyTokenMiddleware = (req, res, next) => {
  try {
    // Extract token from "Authorization: Bearer <token>" header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(res, "Access denied. No token provided.", 401);
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    // Attach decoded payload to request for downstream middleware/controllers
    req.user = decoded; // { id, role, name, email }
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return sendError(res, "Token has expired. Please log in again.", 401);
    }
    return sendError(res, "Invalid token.", 401);
  }
};
