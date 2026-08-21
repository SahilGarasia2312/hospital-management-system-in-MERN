// modules/prescription/prescription.controller.js — HTTP controllers for prescription endpoints
import * as prescriptionService from "./prescription.service.js";
import { sendSuccess } from "../../utils/response.utils.js";

/**
 * POST /api/v1/prescriptions
 * Issue a new prescription
 */
export const createPrescription = async (req, res, next) => {
  try {
    const prescription = await prescriptionService.createPrescription(req.body, req.user);
    return sendSuccess(res, prescription, "Prescription issued successfully", 201);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/prescriptions
 * List and filter prescriptions
 */
export const getAllPrescriptions = async (req, res, next) => {
  try {
    const result = await prescriptionService.getAllPrescriptions(req.user, req.query);
    return sendSuccess(res, result, "Prescriptions fetched successfully");
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/prescriptions/:prescriptionId
 * Get prescription details
 */
export const getPrescriptionById = async (req, res, next) => {
  try {
    const { prescriptionId } = req.params;
    const prescription = await prescriptionService.getPrescriptionById(prescriptionId, req.user);
    return sendSuccess(res, prescription, "Prescription details fetched successfully");
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/prescriptions/:prescriptionId/dispense
 * Dispense prescription items & deduct inventory
 */
export const dispensePrescription = async (req, res, next) => {
  try {
    const { prescriptionId } = req.params;
    const updated = await prescriptionService.dispensePrescription(prescriptionId, req.body, req.user);
    return sendSuccess(res, updated, "Prescription dispensed successfully");
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/prescriptions/:prescriptionId/cancel
 * Cancel an unfulfilled prescription
 */
export const cancelPrescription = async (req, res, next) => {
  try {
    const { prescriptionId } = req.params;
    const { cancellationReason } = req.body;
    const updated = await prescriptionService.cancelPrescription(prescriptionId, cancellationReason, req.user);
    return sendSuccess(res, updated, "Prescription cancelled successfully");
  } catch (err) {
    next(err);
  }
};
