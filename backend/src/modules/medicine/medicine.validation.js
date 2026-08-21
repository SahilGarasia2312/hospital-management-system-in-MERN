// modules/medicine/medicine.validation.js — Request validation rules for medicine catalog
import { body, param, query } from "express-validator";
import { DOSAGE_FORMS } from "../../config/constants.js";

export const medicineIdParamValidation = [
  param("medicineId")
    .isInt()
    .withMessage("Invalid medicineId format. Must be a number.")
    .toInt(),
];

export const createMedicineValidation = [
  body("name")
    .isString()
    .withMessage("Medicine name must be a string")
    .trim()
    .notEmpty({ ignore_whitespace: true })
    .withMessage("Medicine name is required")
    .isLength({ min: 2, max: 150 })
    .withMessage("Medicine name must be between 2 and 150 characters"),

  body("genericName")
    .optional()
    .isString()
    .withMessage("Generic name must be a string")
    .trim(),

  body("dosageForm")
    .notEmpty()
    .withMessage("Dosage form is required")
    .isIn(DOSAGE_FORMS)
    .withMessage("Invalid dosage form"),

  body("strength")
    .isString()
    .withMessage("Strength must be a string")
    .trim()
    .notEmpty({ ignore_whitespace: true })
    .withMessage("Strength is required"),

  body("manufacturer")
    .optional()
    .isString()
    .withMessage("Manufacturer must be a string")
    .trim(),

  body("unitPrice")
    .notEmpty()
    .withMessage("Unit price is required")
    .isFloat({ min: 0 })
    .withMessage("Unit price must be a non-negative number")
    .toFloat(),

  body("stockQuantity")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock quantity must be a non-negative integer")
    .toInt(),

  body("reorderLevel")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Reorder level must be a non-negative integer")
    .toInt(),
];

export const updateMedicineValidation = [
  body().custom((value) => {
    if (Object.keys(value).length === 0) {
      throw new Error("Update payload cannot be empty");
    }
    return true;
  }),

  body("name")
    .optional()
    .isString()
    .withMessage("Medicine name must be a string")
    .trim()
    .notEmpty({ ignore_whitespace: true })
    .withMessage("Medicine name cannot be empty"),

  body("genericName")
    .optional()
    .isString()
    .withMessage("Generic name must be a string")
    .trim(),

  body("dosageForm")
    .optional()
    .isIn(DOSAGE_FORMS)
    .withMessage("Invalid dosage form"),

  body("strength")
    .optional()
    .isString()
    .withMessage("Strength must be a string")
    .trim()
    .notEmpty({ ignore_whitespace: true })
    .withMessage("Strength cannot be empty"),

  body("manufacturer")
    .optional()
    .isString()
    .withMessage("Manufacturer must be a string")
    .trim(),

  body("unitPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Unit price must be a non-negative number")
    .toFloat(),

  body("stockQuantity")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock quantity must be a non-negative integer")
    .toInt(),

  body("reorderLevel")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Reorder level must be a non-negative integer")
    .toInt(),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),

  body("medicineId").not().exists().withMessage("Cannot update protected field: medicineId"),
];

export const updateStockValidation = [
  body("stockQuantity")
    .notEmpty()
    .withMessage("Stock quantity is required")
    .isInt({ min: 0 })
    .withMessage("Stock quantity must be a non-negative integer")
    .toInt(),
];

export const listMedicinesValidation = [
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

  query("search")
    .optional()
    .isString()
    .withMessage("Search query must be a string")
    .trim(),

  query("dosageForm")
    .optional()
    .isIn(DOSAGE_FORMS)
    .withMessage("Invalid dosageForm filter"),

  query("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive filter must be a boolean")
    .toBoolean(),
];
