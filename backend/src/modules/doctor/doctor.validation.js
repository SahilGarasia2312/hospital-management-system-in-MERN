// modules/doctor/doctor.validation.js
import { body, param } from "express-validator";
import { SPECIALIZATIONS } from "../../config/constants.js";

export const doctorIdParamValidation = [
  param("doctorId")
    .isInt()
    .withMessage("Invalid doctorId format. Must be a number.")
    .toInt(), // Cries out to Int
];

export const createDoctorValidation = [
  body("name")
    .isString()
    .withMessage("Name must be a string")
    .trim()
    .notEmpty({ ignore_whitespace: true })
    .withMessage("Name is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Name must be between 3 and 100 characters"),

  body("specialization")
    .isString()
    .withMessage("Specialization must be a string")
    .notEmpty({ ignore_whitespace: true })
    .withMessage("Specialization is required")
    .isIn(SPECIALIZATIONS)
    .withMessage("Invalid specialization"),

  body("experience")
    .notEmpty()
    .withMessage("Experience is required")
    .isNumeric()
    .withMessage("Experience must be a number")
    .custom((val) => val >= 0)
    .withMessage("Experience cannot be negative"),

  body("phone")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("Phone must be a string")
    .trim(),

  body("email")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("Email must be a string")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .toLowerCase(),
];

export const updateDoctorValidation = [
  body("name")
    .optional()
    .isString()
    .withMessage("Name must be a string")
    .trim()
    .notEmpty({ ignore_whitespace: true })
    .withMessage("Name cannot be empty")
    .isLength({ min: 3, max: 100 })
    .withMessage("Name must be between 3 and 100 characters"),

  body("specialization")
    .optional()
    .isString()
    .withMessage("Specialization must be a string")
    .isIn(SPECIALIZATIONS)
    .withMessage("Invalid specialization"),

  body("experience")
    .optional()
    .isNumeric()
    .withMessage("Experience must be a number")
    .custom((val) => val >= 0)
    .withMessage("Experience cannot be negative"),

  body("phone")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("Phone must be a string")
    .trim(),

  body("email")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("Email must be a string")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .toLowerCase(),
];
