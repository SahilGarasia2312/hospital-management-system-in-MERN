// modules/doctor/doctor.routes.js — Route definitions with middleware chain
import express from "express";
import * as doctorController from "./doctor.controller.js";
import { verifyTokenMiddleware } from "../../core/middleware/auth.middleware.js";
import { requireRole } from "../../core/middleware/role.middleware.js";
import { validateRequest } from "../../core/middleware/validation.middleware.js";
import {
  createDoctorValidation,
  updateDoctorValidation,
  doctorIdParamValidation,
} from "./doctor.validation.js";

const router = express.Router();

// All doctor routes require authentication
router.use(verifyTokenMiddleware);

// GET /api/doctors/stats — Admin only
router.get("/stats", requireRole("admin"), doctorController.getDoctorStats);

// GET /api/doctors — Admin + Doctor
router.get("/", requireRole("admin", "doctor"), doctorController.getAllDoctors);

// GET /api/doctors/:doctorId — Admin + Doctor
router.get(
  "/:doctorId",
  requireRole("admin", "doctor"),
  doctorIdParamValidation,
  validateRequest,
  doctorController.getDoctorById
);

// POST /api/doctors — Admin only
router.post(
  "/",
  requireRole("admin"),
  createDoctorValidation,
  validateRequest,
  doctorController.createDoctor
);

// PUT /api/doctors/:doctorId — Admin only
router.put(
  "/:doctorId",
  requireRole("admin"),
  doctorIdParamValidation,
  updateDoctorValidation,
  validateRequest,
  doctorController.updateDoctor
);

// DELETE /api/doctors/:doctorId — Admin only (cascades to patients)
router.delete(
  "/:doctorId",
  requireRole("admin"),
  doctorIdParamValidation,
  validateRequest,
  doctorController.deleteDoctor
);

export default router;
