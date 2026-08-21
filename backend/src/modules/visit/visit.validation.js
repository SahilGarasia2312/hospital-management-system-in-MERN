// modules/visit/visit.validation.js
import { body, param, query } from "express-validator";
import { VISIT_STATUS } from "../../config/constants.js";

export const visitIdParamValidation = [
  param("visitId")
    .isInt()
    .withMessage("Invalid visitId format. Must be a number.")
    .toInt(),
];

export const createVisitValidation = [
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

  body("appointmentId")
    .optional({ checkFalsy: true })
    .isInt()
    .withMessage("Invalid appointmentId format. Must be a numeric Appointment ID."),

  body("symptoms")
    .isString()
    .withMessage("Symptoms must be a string")
    .trim()
    .notEmpty({ ignore_whitespace: true })
    .withMessage("Symptoms description is required")
    .isLength({ min: 3, max: 1000 })
    .withMessage("Symptoms must be between 3 and 1000 characters"),

  body("diagnosis")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("Diagnosis must be a string")
    .trim(),

  body("doctorNotes")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("Doctor notes must be a string")
    .trim(),

  body("vitals").optional().isObject().withMessage("Vitals must be an object"),
  body("vitals.bloodPressure").optional().isString().withMessage("Blood pressure must be a string"),
  body("vitals.heartRate").optional().isNumeric().withMessage("Heart rate must be a number"),
  body("vitals.temperature").optional().isNumeric().withMessage("Temperature must be a number"),
  body("vitals.weight").optional().isNumeric().withMessage("Weight must be a number"),
  body("vitals.height").optional().isNumeric().withMessage("Height must be a number"),
  body("vitals.oxygenSaturation").optional().isNumeric().withMessage("Oxygen saturation must be a number"),

  body("prescriptions").optional().isArray().withMessage("Prescriptions must be an array"),
  body("prescriptions.*.medicineName").notEmpty().isString().trim().withMessage("Medicine name is required for prescription item"),
  body("prescriptions.*.dosage").notEmpty().isString().trim().withMessage("Dosage is required for prescription item"),
  body("prescriptions.*.frequency").notEmpty().isString().trim().withMessage("Frequency is required for prescription item"),
  body("prescriptions.*.duration").notEmpty().isString().trim().withMessage("Duration is required for prescription item"),

  body("followUpDate")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("Follow-up date must be a valid ISO 8601 date string"),
];

export const updateVisitValidation = [
  body().custom((value) => {
    if (Object.keys(value).length === 0) {
      throw new Error("Update payload cannot be empty");
    }
    return true;
  }),

  body("symptoms")
    .optional()
    .isString()
    .withMessage("Symptoms must be a string")
    .trim()
    .notEmpty({ ignore_whitespace: true })
    .withMessage("Symptoms cannot be empty"),

  body("diagnosis")
    .optional()
    .isString()
    .withMessage("Diagnosis must be a string")
    .trim(),

  body("doctorNotes")
    .optional()
    .isString()
    .withMessage("Doctor notes must be a string")
    .trim(),

  body("vitals").optional().isObject().withMessage("Vitals must be an object"),
  body("vitals.bloodPressure").optional().isString().withMessage("Blood pressure must be a string"),
  body("vitals.heartRate").optional().isNumeric().withMessage("Heart rate must be a number"),
  body("vitals.temperature").optional().isNumeric().withMessage("Temperature must be a number"),
  body("vitals.weight").optional().isNumeric().withMessage("Weight must be a number"),
  body("vitals.height").optional().isNumeric().withMessage("Height must be a number"),
  body("vitals.oxygenSaturation").optional().isNumeric().withMessage("Oxygen saturation must be a number"),

  body("prescriptions").optional().isArray().withMessage("Prescriptions must be an array"),
  body("prescriptions.*.medicineName").notEmpty().isString().trim().withMessage("Medicine name is required for prescription item"),
  body("prescriptions.*.dosage").notEmpty().isString().trim().withMessage("Dosage is required for prescription item"),
  body("prescriptions.*.frequency").notEmpty().isString().trim().withMessage("Frequency is required for prescription item"),
  body("prescriptions.*.duration").notEmpty().isString().trim().withMessage("Duration is required for prescription item"),

  body("followUpDate")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("Follow-up date must be a valid ISO 8601 date string"),

  // Block mutating protected fields
  body("visitId").not().exists().withMessage("Cannot update protected field: visitId"),
  body("patientId").not().exists().withMessage("Cannot update protected field: patientId"),
  body("doctorId").not().exists().withMessage("Cannot update protected field: doctorId"),
  body("appointmentId").not().exists().withMessage("Cannot update protected field: appointmentId"),
  body("status").not().exists().withMessage("Cannot update protected field: status (use /complete endpoint)"),
  body("completedAt").not().exists().withMessage("Cannot update protected field: completedAt"),
];

export const listVisitsValidation = [
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
    .isIn(Object.values(VISIT_STATUS))
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
