// modules/auth/auth.routes.js — Auth route definitions
import express from "express";
import { register, login, me } from "./auth.controller.js";
import { verifyTokenMiddleware } from "../../middleware/auth.middleware.js";
import { requireRole } from "../../middleware/role.middleware.js";

const router = express.Router();

// POST /api/auth/login — Public
router.post("/login", login);

// POST /api/auth/register — Admin only
router.post(
  "/register",
  verifyTokenMiddleware,
  requireRole("admin"),
  register
);

// GET /api/auth/me — Any authenticated user
router.get("/me", verifyTokenMiddleware, me);

export default router;
