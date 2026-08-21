// modules/appointment/appointment.controller.js — Thin HTTP controllers for appointment endpoints
import * as appointmentService from "./appointment.service.js";
import { sendSuccess } from "../../utils/response.utils.js";

/**
 * POST /api/v1/appointments
 * Create a new appointment
 */
export const createAppointment = async (req, res, next) => {
  try {
    const appointment = await appointmentService.createAppointment(req.body, req.user);
    return sendSuccess(res, appointment, "Appointment booked successfully", 201);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/appointments
 * List appointments with filters and pagination
 */
export const getAllAppointments = async (req, res, next) => {
  try {
    const result = await appointmentService.getAllAppointments(req.user, req.query);
    return sendSuccess(res, result, "Appointments fetched successfully");
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/appointments/:appointmentId
 * Get appointment by ID
 */
export const getAppointmentById = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;
    const appointment = await appointmentService.getAppointmentById(appointmentId, req.user);
    return sendSuccess(res, appointment, "Appointment details fetched successfully");
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/appointments/:appointmentId/status
 * Transition appointment status
 */
export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;
    const updated = await appointmentService.updateAppointmentStatus(appointmentId, status, req.user);
    return sendSuccess(res, updated, `Appointment status updated to ${status}`);
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/appointments/:appointmentId/cancel
 * Cancel an appointment with a reason
 */
export const cancelAppointment = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;
    const { cancellationReason } = req.body;
    const cancelled = await appointmentService.cancelAppointment(appointmentId, cancellationReason, req.user);
    return sendSuccess(res, cancelled, "Appointment cancelled successfully");
  } catch (err) {
    next(err);
  }
};
