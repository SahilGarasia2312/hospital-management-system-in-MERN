// modules/auth/auth.controller.js — Handles HTTP req/res, delegates to auth.service
// Controllers are thin: validate input → call service → send response
import { registerUser, loginUser, getMe } from "./auth.service.js";
import { sendSuccess } from "../../utils/response.utils.js";
import { BadRequestError } from "../../core/errors/index.js";

/**
 * POST /api/auth/register
 * Admin-only: Create a new user account
 */
export const register = async (req, res, next) => {
  try {
    const result = await registerUser(req.body);
    return sendSuccess(res, result, "User registered successfully", 201);
  } catch (err) {
    next(err); // Pass to global error handler
  }
};

/**
 * POST /api/auth/login
 * Public: Authenticate user and return JWT
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new BadRequestError("Email and password are required."));
    }

    const result = await loginUser(email, password);
    return sendSuccess(res, result, "Login successful");
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 * Protected: Returns current user's profile from JWT
 */
export const me = async (req, res, next) => {
  try {
    const user = await getMe(req.user.id);
    return sendSuccess(res, user, "User profile fetched");
  } catch (err) {
    next(err);
  }
};
