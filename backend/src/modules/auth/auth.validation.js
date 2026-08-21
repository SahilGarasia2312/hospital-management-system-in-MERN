// modules/auth/auth.validation.js
import { body } from "express-validator";
import { ROLES } from "../../config/constants.js";

export const loginValidation = [
  body("email")
    .isString()
    .withMessage("Email must be a string")
    .trim()
    .notEmpty({ ignore_whitespace: true })
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .toLowerCase(),
  
  body("password")
    .isString()
    .withMessage("Password must be a string")
    .notEmpty({ ignore_whitespace: true })
    .withMessage("Password is required"),

  body("website_hp")
    .optional()
    .custom((value) => {
      if (value && value.trim() !== "") {
        throw new Error("Automated bot submission detected by security filters.");
      }
      return true;
    })
];

export const registerValidation = [
  body("name")
    .isString()
    .withMessage("Name must be a string")
    .trim()
    .notEmpty({ ignore_whitespace: true })
    .withMessage("Name is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Name must be between 3 and 100 characters"),
    
  body("email")
    .isString()
    .withMessage("Email must be a string")
    .trim()
    .notEmpty({ ignore_whitespace: true })
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .toLowerCase(),
    
  body("password")
    .isString()
    .withMessage("Password must be a string")
    .notEmpty({ ignore_whitespace: true })
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
    
  body("role")
    .isString()
    .withMessage("Role must be a string")
    .notEmpty({ ignore_whitespace: true })
    .withMessage("Role is required")
    .isIn(Object.values(ROLES))
    .withMessage("Invalid role"),
    
  body("linkedId")
    .optional()
    .isMongoId()
    .withMessage("Invalid linkedId format"),
    
  body("linkedModel")
    .optional()
    .isIn(["Doctor", "Patient"])
    .withMessage("Invalid linkedModel")
];
