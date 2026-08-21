// modules/prescription/prescription.validation.js — Request validation rules for prescriptions
import { body, param, query } from "express-validator";
import { PRESCRIPTION_STATUS } from "../../config/constants.js";

export const prescriptionIdParamValidation = [
  param("prescriptionId")
    .isInt()
    .withMessage("Invalid prescriptionId format. Must be a number.")
    .toInt(),
];

export const createPrescriptionValidation = [
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

  body("visitId")
    .optional({ checkFalsy: true })
    .isInt()
    .withMessage("Invalid visitId format. Must be a numeric Visit ID."),

  body("notes")
    .optional()
    .isString()
    .withMessage("Notes must be a string")
    .trim(),

  body("items")
    .isArray({ min: 1 })
    .withMessage("Prescription must contain at least one medicine item"),

  body("items.*.medicineId")
    .notEmpty()
    .withMessage("Medicine ID is required for prescription item")
    .isInt()
    .withMessage("Invalid medicineId format in prescription item"),

  body("items.*.dosage")
    .notEmpty()
    .isString()
    .trim()
    .withMessage("Dosage is required for prescription item"),

  body("items.*.frequency")
    .notEmpty()
    .isString()
    .trim()
    .withMessage("Frequency is required for prescription item"),

  body("items.*.duration")
    .notEmpty()
    .isString()
    .trim()
    .withMessage("Duration is required for prescription item"),

  body("items.*.quantityPrescribed")
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage("Quantity prescribed must be at least 1"),

  body("items.*.instructions")
    .optional()
    .isString()
    .trim(),
];

export const dispensePrescriptionValidation = [
  body("dispenseItems")
    .optional()
    .isArray()
    .withMessage("dispenseItems must be an array"),

  body("dispenseItems.*.medicineId")
    .optional()
    .isInt()
    .withMessage("Invalid medicineId format in dispense item"),

  body("dispenseItems.*.quantityToDispense")
    .optional()
    .isInt({ min: 1 })
    .withMessage("quantityToDispense must be a positive integer"),
];

export const cancelPrescriptionValidation = [
  body("cancellationReason")
    .isString()
    .withMessage("Cancellation reason must be a string")
    .trim()
    .notEmpty({ ignore_whitespace: true })
    .withMessage("Cancellation reason is required")
    .isLength({ min: 3, max: 500 })
    .withMessage("Cancellation reason must be between 3 and 500 characters"),
];

export const listPrescriptionsValidation = [
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
    .isIn(Object.values(PRESCRIPTION_STATUS))
    .withMessage("Invalid status filter"),

  query("doctorId")
    .optional()
    .isInt()
    .withMessage("doctorId filter must be a numeric Doctor ID"),

  query("patientId")
    .optional()
    .isInt()
    .withMessage("patientId filter must be a numeric Patient ID"),
];
