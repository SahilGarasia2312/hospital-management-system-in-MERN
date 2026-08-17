// middleware/role.middleware.js — Role-Based Access Control (RBAC) middleware
// feature: Factory function that returns middleware to guard routes by user role
import { sendError } from "../../utils/response.utils.js";

/**
 * Middleware factory: requireRole
 * Returns an Express middleware that checks if req.user.role is in the allowed roles.
 * Must be used AFTER verifyTokenMiddleware (requires req.user to be set).
 *
 * Usage:
 *   router.delete('/doctors/:id', verifyToken, requireRole('admin'), controller)
 *   router.get('/patients',       verifyToken, requireRole('admin', 'doctor'), controller)
 *
 * @param {...string} roles - Allowed roles (e.g. 'admin', 'doctor', 'patient')
 * @returns Express middleware function
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    // req.user is set by verifyTokenMiddleware
    if (!req.user) {
      return sendError(res, "Authentication required.", 401);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. Required role: [${roles.join(", ")}]. Your role: ${req.user.role}`,
        403
      );
    }

    next();
  };
};
