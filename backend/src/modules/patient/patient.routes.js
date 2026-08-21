// modules/patient/patient.routes.js — Route definitions with role-based access
import express from "express";
import * as patientController from "./patient.controller.js";
import { verifyTokenMiddleware } from "../../core/middleware/auth.middleware.js";
import { requireRole } from "../../core/middleware/role.middleware.js";
import { validateRequest } from "../../core/middleware/validation.middleware.js";
import {
  createPatientValidation,
  updatePatientValidation,
  patientIdParamValidation,
} from "./patient.validation.js";

const router = express.Router();

// All patient routes require authentication
router.use(verifyTokenMiddleware);

// GET /api/patients/stats — Admin only
router.get("/stats", requireRole("admin"), patientController.getPatientStats);

// GET /api/patients — Admin (all), Doctor (own), Patient (self) — scoped in service
router.get("/", requireRole("admin", "doctor", "patient"), patientController.getAllPatients);

// GET /api/patients/:patientId — Admin + Doctor
router.get(
  "/:patientId",
  requireRole("admin", "doctor", "patient"),
  patientIdParamValidation,
  validateRequest,
  patientController.getPatientById
);

// POST /api/patients — Admin + Doctor
router.post(
  "/",
  requireRole("admin", "doctor"),
  createPatientValidation,
  validateRequest,
  patientController.createPatient
);

// PUT /api/patients/:patientId — Admin + Doctor
router.put(
  "/:patientId",
  requireRole("admin", "doctor"),
  patientIdParamValidation,
  updatePatientValidation,
  validateRequest,
  patientController.updatePatient
);

// DELETE /api/patients/:patientId — Admin only
router.delete(
  "/:patientId",
  requireRole("admin"),
  patientIdParamValidation,
  validateRequest,
  patientController.deletePatient
);

export default router;
