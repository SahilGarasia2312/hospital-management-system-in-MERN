// utils/response.utils.js — Consistent API response shape helpers
// feature: All API responses follow the same structure — easier for frontend to handle

/**
 * Sends a successful JSON response.
 * Shape: { success: true, message, data }
 */
export const sendSuccess = (res, data = null, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Sends an error JSON response.
 * Shape: { success: false, message, errors? }
 */
export const sendError = (res, message = "Something went wrong", statusCode = 400, errors = null) => {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
};
