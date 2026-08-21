// modules/audit/audit.controller.js — HTTP controllers for audit endpoints
import * as auditService from "./audit.service.js";
import { sendSuccess } from "../../utils/response.utils.js";

/**
 * GET /api/v1/audit
 * List and filter system audit logs (Admin only)
 */
export const getAllAuditLogs = async (req, res, next) => {
  try {
    const result = await auditService.getAllAuditLogs(req.query);
    return sendSuccess(res, result, "Audit logs fetched successfully");
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/audit/:auditId
 * Get details for a single audit log entry (Admin only)
 */
export const getAuditLogById = async (req, res, next) => {
  try {
    const { auditId } = req.params;
    const auditLog = await auditService.getAuditLogById(auditId);
    return sendSuccess(res, auditLog, "Audit log entry fetched successfully");
  } catch (err) {
    next(err);
  }
};
