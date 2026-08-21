// modules/audit/audit.routes.js — Enterprise audit log routes definition
import express from "express";
import * as auditController from "./audit.controller.js";
import { verifyTokenMiddleware } from "../../core/middleware/auth.middleware.js";
import { requireRole } from "../../core/middleware/role.middleware.js";
import { validateRequest } from "../../core/middleware/validation.middleware.js";
import { listAuditLogsValidation, auditIdParamValidation } from "./audit.validation.js";

const router = express.Router();

// Strict security: All audit routes require authentication and are ADMIN ONLY
router.use(verifyTokenMiddleware);
router.use(requireRole("admin"));

// GET /api/v1/audit — List and filter audit logs
router.get(
  "/",
  listAuditLogsValidation,
  validateRequest,
  auditController.getAllAuditLogs
);

// GET /api/v1/audit/:auditId — View specific audit log entry
router.get(
  "/:auditId",
  auditIdParamValidation,
  validateRequest,
  auditController.getAuditLogById
);

export default router;
