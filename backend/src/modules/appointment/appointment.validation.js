// modules/appointment/appointment.validation.js
import { body, param, query } from "express-validator";
import { APPOINTMENT_STATUS } from "../../config/constants.js";

export const appointmentIdParamValidation = [
  param("appointmentId")
    .isInt()
    .withMessage("Invalid appointmentId format. Must be a number.")
    .toInt(),
];

export const createAppointmentValidation = [
  body("doctorId")
    .notEmpty()
    .withMessage("Doctor ID is required")
    .isInt()
    .withMessage("Invalid doctorId format. Must be a numeric Doctor ID."),

  body("patientId")
    .notEmpty()
    .withMessage("Patient ID is required")
    .isInt()
    .withMessage("Invalid patientId format. Must be a numeric Patient ID."),

  body("appointmentDate")
    .notEmpty()
    .withMessage("Appointment date is required")
    .isISO8601()
    .withMessage("Appointment date must be a valid ISO 8601 date string"),

  body("durationMinutes")
    .optional()
    .isInt({ min: 15, max: 120 })
    .withMessage("Duration must be between 15 and 120 minutes"),

  body("reason")
    .isString()
    .withMessage("Reason must be a string")
    .trim()
    .notEmpty({ ignore_whitespace: true })
    .withMessage("Reason is required")
    .isLength({ min: 3, max: 500 })
    .withMessage("Reason must be between 3 and 500 characters"),

  body("notes")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("Notes must be a string")
    .trim(),
];

export const updateStatusValidation = [
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isString()
    .withMessage("Status must be a string")
    .isIn(Object.values(APPOINTMENT_STATUS))
    .withMessage("Invalid status value"),
];

export const cancelAppointmentValidation = [
  body("cancellationReason")
    .isString()
    .withMessage("Cancellation reason must be a string")
    .trim()
    .notEmpty({ ignore_whitespace: true })
    .withMessage("Cancellation reason is required")
    .isLength({ min: 3, max: 500 })
    .withMessage("Cancellation reason must be between 3 and 500 characters"),
];

export const listAppointmentsValidation = [
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
  query("status")
    .optional()
    .isIn(Object.values(APPOINTMENT_STATUS))
    .withMessage("Invalid status filter"),
  query("doctorId")
    .optional()
    .isInt()
    .withMessage("doctorId filter must be a numeric Doctor ID"),
  query("patientId")
    .optional()
    .isInt()
    .withMessage("patientId filter must be a numeric Patient ID"),
  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("startDate must be a valid ISO 8601 date string"),
  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("endDate must be a valid ISO 8601 date string"),
];
