// modules/prescription/prescription.routes.js — Prescription workflow routes definition
import express from "express";
import * as prescriptionController from "./prescription.controller.js";
import { verifyTokenMiddleware } from "../../core/middleware/auth.middleware.js";
import { requireRole } from "../../core/middleware/role.middleware.js";
import { validateRequest } from "../../core/middleware/validation.middleware.js";
import {
  createPrescriptionValidation,
  dispensePrescriptionValidation,
  cancelPrescriptionValidation,
  prescriptionIdParamValidation,
  listPrescriptionsValidation,
} from "./prescription.validation.js";

const router = express.Router();

// All prescription routes require authentication
router.use(verifyTokenMiddleware);

// GET /api/v1/prescriptions — Admin + Doctor + Patient
router.get(
  "/",
  requireRole("admin", "doctor", "patient"),
  listPrescriptionsValidation,
  validateRequest,
  prescriptionController.getAllPrescriptions
);

// GET /api/v1/prescriptions/:prescriptionId — Admin + Doctor + Patient
router.get(
  "/:prescriptionId",
  requireRole("admin", "doctor", "patient"),
  prescriptionIdParamValidation,
  validateRequest,
  prescriptionController.getPrescriptionById
);

// POST /api/v1/prescriptions — Admin + Doctor
router.post(
  "/",
  requireRole("admin", "doctor"),
  createPrescriptionValidation,
  validateRequest,
  prescriptionController.createPrescription
);

// PATCH /api/v1/prescriptions/:prescriptionId/dispense — Admin only (Pharmacy)
router.patch(
  "/:prescriptionId/dispense",
  requireRole("admin"),
  prescriptionIdParamValidation,
  dispensePrescriptionValidation,
  validateRequest,
  prescriptionController.dispensePrescription
);

// PATCH /api/v1/prescriptions/:prescriptionId/cancel — Admin + Doctor
router.patch(
  "/:prescriptionId/cancel",
  requireRole("admin", "doctor"),
  prescriptionIdParamValidation,
  cancelPrescriptionValidation,
  validateRequest,
  prescriptionController.cancelPrescription
);

export default router;
