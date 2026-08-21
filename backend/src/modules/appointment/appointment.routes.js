// modules/appointment/appointment.routes.js — Appointment routes definition
import express from "express";
import * as appointmentController from "./appointment.controller.js";
import { verifyTokenMiddleware } from "../../core/middleware/auth.middleware.js";
import { requireRole } from "../../core/middleware/role.middleware.js";
import { validateRequest } from "../../core/middleware/validation.middleware.js";
import {
  createAppointmentValidation,
  updateStatusValidation,
  cancelAppointmentValidation,
  appointmentIdParamValidation,
  listAppointmentsValidation,
} from "./appointment.validation.js";

const router = express.Router();

// All appointment routes require authentication
router.use(verifyTokenMiddleware);

// GET /api/v1/appointments — Admin (all), Doctor (own), Patient (self)
router.get(
  "/",
  requireRole("admin", "doctor", "patient"),
  listAppointmentsValidation,
  validateRequest,
  appointmentController.getAllAppointments
);

// GET /api/v1/appointments/:appointmentId
router.get(
  "/:appointmentId",
  requireRole("admin", "doctor", "patient"),
  appointmentIdParamValidation,
  validateRequest,
  appointmentController.getAppointmentById
);

// POST /api/v1/appointments
router.post(
  "/",
  requireRole("admin", "doctor", "patient"),
  createAppointmentValidation,
  validateRequest,
  appointmentController.createAppointment
);

// PATCH /api/v1/appointments/:appointmentId/status — Admin + Doctor
router.patch(
  "/:appointmentId/status",
  requireRole("admin", "doctor"),
  appointmentIdParamValidation,
  updateStatusValidation,
  validateRequest,
  appointmentController.updateAppointmentStatus
);

// PATCH /api/v1/appointments/:appointmentId/cancel — Admin, Doctor, Patient
router.patch(
  "/:appointmentId/cancel",
  requireRole("admin", "doctor", "patient"),
  appointmentIdParamValidation,
  cancelAppointmentValidation,
  validateRequest,
  appointmentController.cancelAppointment
);

export default router;
