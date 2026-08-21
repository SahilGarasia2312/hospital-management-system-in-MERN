// modules/audit/audit.validation.js — Request validation rules for Audit log endpoints
import { param, query } from "express-validator";
import { AUDIT_ACTIONS } from "../../config/constants.js";

export const auditIdParamValidation = [
  param("auditId")
    .isInt()
    .withMessage("Invalid auditId format. Must be a number.")
    .toInt(),
];

export const listAuditLogsValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer")
    .toInt(),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100")
    .toInt(),

  query("action")
    .optional()
    .isIn(Object.values(AUDIT_ACTIONS))
    .withMessage("Invalid audit action filter"),

  query("resourceType")
    .optional()
    .isString()
    .trim(),

  query("actorId")
    .optional()
    .isMongoId()
    .withMessage("actorId must be a valid Mongo ObjectId"),

  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("startDate must be a valid ISO8601 date string"),

  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("endDate must be a valid ISO8601 date string"),
];
