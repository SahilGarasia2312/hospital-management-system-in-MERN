// modules/patient/patient.validation.js
import { body, param } from "express-validator";
import { ADMISSION_STATUS } from "../../config/constants.js";

export const patientIdParamValidation = [
  param("patientId")
    .isInt()
    .withMessage("Invalid patientId format. Must be a number.")
    .toInt(),
];

export const createPatientValidation = [
  body("doctorId")
    .notEmpty()
    .withMessage("Doctor ID is required")
    .isInt()
    .withMessage("Invalid doctorId format. Must be a number."),

  body("name")
    .isString()
    .withMessage("Name must be a string")
    .trim()
    .notEmpty({ ignore_whitespace: true })
    .withMessage("Name is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Name must be between 3 and 100 characters"),

  body("age")
    .optional()
    .isNumeric()
    .withMessage("Age must be a number")
    .custom((val) => val >= 0)
    .withMessage("Age cannot be negative"),

  body("gender")
    .optional()
    .isString()
    .withMessage("Gender must be a string")
    .isIn(["Male", "Female", "Other"])
    .withMessage("Invalid gender"),

  body("contact")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("Contact must be a string")
    .trim(),

  body("disease")
    .isString()
    .withMessage("Disease must be a string")
    .trim()
    .notEmpty({ ignore_whitespace: true })
    .withMessage("Disease is required"),

  body("symptoms")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("Symptoms must be a string"),

  body("medicinePrescribed")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("Medicine Prescribed must be a string"),

  body("admissionStatus")
    .isString()
    .withMessage("Admission status must be a string")
    .notEmpty({ ignore_whitespace: true })
    .withMessage("Admission status is required")
    .isIn(Object.values(ADMISSION_STATUS))
    .withMessage("Invalid admission status"),

  body("admittedDate")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("Admitted date must be a string"),

  body("releasingDate")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("Releasing date must be a string"),

  body("releasingSummary")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("Releasing summary must be a string"),
];

export const updatePatientValidation = [
  // Reject empty payload entirely
  body().custom((value) => {
    if (Object.keys(value).length === 0) {
      throw new Error("Update payload cannot be empty");
    }
    return true;
  }),

  // Optional fields for update
  body("name")
    .optional()
    .isString()
    .withMessage("Name must be a string")
    .trim()
    .notEmpty({ ignore_whitespace: true })
    .withMessage("Name cannot be empty")
    .isLength({ min: 3, max: 100 })
    .withMessage("Name must be between 3 and 100 characters"),

  body("age")
    .optional()
    .isNumeric()
    .withMessage("Age must be a number")
    .custom((val) => val >= 0)
    .withMessage("Age cannot be negative"),

  body("gender")
    .optional()
    .isString()
    .withMessage("Gender must be a string")
    .isIn(["Male", "Female", "Other"])
    .withMessage("Invalid gender"),

  body("contact")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("Contact must be a string")
    .trim(),

  body("disease")
    .optional()
    .isString()
    .withMessage("Disease must be a string")
    .trim()
    .notEmpty({ ignore_whitespace: true })
    .withMessage("Disease cannot be empty"),

  body("symptoms")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("Symptoms must be a string"),

  body("medicinePrescribed")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("Medicine Prescribed must be a string"),

  body("admissionStatus")
    .optional()
    .isString()
    .withMessage("Admission status must be a string")
    .isIn(Object.values(ADMISSION_STATUS))
    .withMessage("Invalid admission status"),

  body("admittedDate")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("Admitted date must be a string"),

  body("releasingDate")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("Releasing date must be a string"),

  body("releasingSummary")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("Releasing summary must be a string"),

  // Protect against updating restricted fields explicitly (if someone tries)
  body("userId")
    .not()
    .exists()
    .withMessage("Cannot update protected field: userId"),
  body("patientId")
    .not()
    .exists()
    .withMessage("Cannot update protected field: patientId"),
  body("doctorId")
    .not()
    .exists()
    .withMessage("Cannot update protected field: doctorId"),
];
