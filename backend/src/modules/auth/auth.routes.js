// modules/auth/auth.routes.js — Auth route definitions
import express from "express";
import { register, login, me } from "./auth.controller.js";
import { verifyTokenMiddleware } from "../../core/middleware/auth.middleware.js";
import { requireRole } from "../../core/middleware/role.middleware.js";
import { loginValidation, registerValidation } from "./auth.validation.js";
import { validateRequest } from "../../core/middleware/validation.middleware.js";

const router = express.Router();

// POST /api/auth/login — Public
router.post("/login", loginValidation, validateRequest, login);

// POST /api/auth/register — Admin only
router.post(
  "/register",
  verifyTokenMiddleware,
  requireRole("admin"),
  registerValidation,
  validateRequest,
  register
);

// GET /api/auth/me — Any authenticated user
router.get("/me", verifyTokenMiddleware, me);

export default router;
