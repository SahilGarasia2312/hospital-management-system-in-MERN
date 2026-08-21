// modules/timeline/timeline.routes.js — Patient Timeline route definitions
import express from "express";
import * as timelineController from "./timeline.controller.js";
import { verifyTokenMiddleware } from "../../core/middleware/auth.middleware.js";
import { requireRole } from "../../core/middleware/role.middleware.js";
import { validateRequest } from "../../core/middleware/validation.middleware.js";
import { patientTimelineValidation } from "./timeline.validation.js";

const router = express.Router({ mergeParams: true });

router.use(verifyTokenMiddleware);

// GET /api/v1/patients/:patientId/timeline
router.get(
  "/",
  requireRole("admin", "doctor", "patient"),
  patientTimelineValidation,
  validateRequest,
  timelineController.getPatientTimeline
);

export default router;
