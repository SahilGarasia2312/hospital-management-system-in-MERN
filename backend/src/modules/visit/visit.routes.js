// modules/visit/visit.routes.js — Clinical Visit routes definition
import express from "express";
import * as visitController from "./visit.controller.js";
import { verifyTokenMiddleware } from "../../core/middleware/auth.middleware.js";
import { requireRole } from "../../core/middleware/role.middleware.js";
import { validateRequest } from "../../core/middleware/validation.middleware.js";
import {
  createVisitValidation,
  updateVisitValidation,
  visitIdParamValidation,
  listVisitsValidation,
} from "./visit.validation.js";

const router = express.Router();

// All visit routes require authentication
router.use(verifyTokenMiddleware);

// GET /api/v1/visits — Admin (all), Doctor (own), Patient (self)
router.get(
  "/",
  requireRole("admin", "doctor", "patient"),
  listVisitsValidation,
  validateRequest,
  visitController.getAllVisits
);

// GET /api/v1/visits/:visitId
router.get(
  "/:visitId",
  requireRole("admin", "doctor", "patient"),
  visitIdParamValidation,
  validateRequest,
  visitController.getVisitById
);

// POST /api/v1/visits — Admin + Doctor only
router.post(
  "/",
  requireRole("admin", "doctor"),
  createVisitValidation,
  validateRequest,
  visitController.createVisit
);

// PATCH /api/v1/visits/:visitId — Admin + Doctor only
router.patch(
  "/:visitId",
  requireRole("admin", "doctor"),
  visitIdParamValidation,
  updateVisitValidation,
  validateRequest,
  visitController.updateVisit
);

// PATCH /api/v1/visits/:visitId/complete — Admin + Doctor only
router.patch(
  "/:visitId/complete",
  requireRole("admin", "doctor"),
  visitIdParamValidation,
  validateRequest,
  visitController.completeVisit
);

export default router;
