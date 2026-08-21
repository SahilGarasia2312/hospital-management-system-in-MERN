// modules/audit/audit.service.js — Business logic for audit record creation & query execution
import AuditLog from "./audit.model.js";
import { NotFoundError } from "../../core/errors/index.js";

/**
 * Generates sequential numeric auditId safely.
 */
const generateAuditId = async () => {
  const result = await AuditLog.aggregate([
    { $group: { _id: null, maxId: { $max: "$auditId" } } },
  ]);
  return result.length > 0 ? result[0].maxId + 1 : 1;
};

/**
 * Recursively sanitizes metadata by stripping sensitive keys
 */
export const sanitizeMetadata = (obj) => {
  if (!obj || typeof obj !== "object") return obj;

  const SENSITIVE_KEYS = ["password", "token", "authorization", "secret", "creditcard"];
  const sanitized = Array.isArray(obj) ? [] : {};

  for (const key of Object.keys(obj)) {
    if (SENSITIVE_KEYS.some((s) => key.toLowerCase().includes(s))) {
      continue; // Skip sensitive key
    }

    const value = obj[key];
    if (value && typeof value === "object" && !(value instanceof Date)) {
      sanitized[key] = sanitizeMetadata(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

/**
 * Creates an immutable audit record safely.
 * Non-blocking: Audit log failure logs to stderr but does not fail the primary workflow.
 */
export const createAuditLog = async ({ actor, action, resource, metadata = {}, ipAddress = null }) => {
  try {
    if (!action || !resource || !resource.type || resource.id === undefined) {
      console.warn("⚠️ [AUDIT WARNING]: Missing required fields for audit log generation.");
      return null;
    }

    const cleanMetadata = sanitizeMetadata(metadata);
    const auditId = await generateAuditId();

    return await AuditLog.create({
      auditId,
      actor: {
        userId: actor?.userId || actor?.id || null,
        role: actor?.role || "system",
      },
      action,
      resource: {
        type: String(resource.type),
        id: String(resource.id),
      },
      metadata: cleanMetadata,
      ipAddress: ipAddress || null,
    });
  } catch (err) {
    // Non-blocking log failure guard to prevent audit storage glitches from failing clinical workflows
    console.error(`❌ [AUDIT LOG FAILURE]: Failed to persist audit record for action '${action}':`, err.message);
    return null;
  }
};

/**
 * List audit logs with pagination & filtering (Admin only)
 */
export const getAllAuditLogs = async (queryParams = {}) => {
  const page = Math.max(1, parseInt(queryParams.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(queryParams.limit) || 20));
  const skip = (page - 1) * limit;

  const filter = {};

  if (queryParams.action) {
    filter.action = queryParams.action;
  }

  if (queryParams.resourceType) {
    filter["resource.type"] = queryParams.resourceType;
  }

  if (queryParams.actorId) {
    filter["actor.userId"] = queryParams.actorId;
  }

  if (queryParams.startDate || queryParams.endDate) {
    filter.createdAt = {};
    if (queryParams.startDate) {
      filter.createdAt.$gte = new Date(queryParams.startDate);
    }
    if (queryParams.endDate) {
      filter.createdAt.$lte = new Date(queryParams.endDate);
    }
  }

  const total = await AuditLog.countDocuments(filter);
  const items = await AuditLog.find(filter)
    .populate("actor.userId", "name email role")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    items,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

/**
 * Get a single audit log entry by numeric auditId
 */
export const getAuditLogById = async (auditId) => {
  const auditLog = await AuditLog.findOne({ auditId: Number(auditId) })
    .populate("actor.userId", "name email role");

  if (!auditLog) {
    throw new NotFoundError("Audit log entry not found.");
  }

  return auditLog;
};
