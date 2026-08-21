// modules/timeline/timeline.validation.js — Request validation rules for Patient Timeline
import { param, query } from "express-validator";

export const patientTimelineValidation = [
  param("patientId")
    .isInt({ min: 1 })
    .withMessage("Invalid patientId format. Must be a positive integer.")
    .toInt(),

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

  query("eventType")
    .optional()
    .isIn(["appointment", "visit", "prescription"])
    .withMessage("Invalid eventType filter. Allowed values: appointment, visit, prescription"),

  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("startDate must be a valid ISO8601 date string"),

  query("from")
    .optional()
    .isISO8601()
    .withMessage("from date must be a valid ISO8601 date string"),

  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("endDate must be a valid ISO8601 date string"),

  query("to")
    .optional()
    .isISO8601()
    .withMessage("to date must be a valid ISO8601 date string"),
];
