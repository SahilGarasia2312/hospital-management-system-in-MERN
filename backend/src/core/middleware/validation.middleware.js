// core/middleware/validation.middleware.js
import { validationResult } from "express-validator";
import { BadRequestError } from "../errors/index.js";

/**
 * Reusable middleware to intercept express-validator results.
 * If errors exist, formats them and throws a BadRequestError
 * matching the existing application error contract.
 */
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error("❌ [VALIDATION FAILED] Body:", JSON.stringify(req.body, null, 2));
    console.error("❌ [VALIDATION ERRORS]:", JSON.stringify(errors.array(), null, 2));

    // Extract error messages, including path for better field-level info if msg is generic
    const messages = errors.array().map((err) => {
      // Avoid prefixing if the message already seems descriptive enough or if path is missing
      return err.type === "field" && !err.msg.toLowerCase().includes(err.path.toLowerCase())
        ? `${err.path}: ${err.msg}`
        : err.msg;
    });

    const summaryMessage =
      messages.length > 0
        ? `Validation failed: ${messages.join(". ")}`
        : "Validation failed";

    const error = new BadRequestError(summaryMessage);
    error.errors = messages;
    return next(error);
  }
  
  next();
};
