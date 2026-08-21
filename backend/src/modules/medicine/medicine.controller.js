// modules/medicine/medicine.controller.js — HTTP controllers for medicine endpoints
import * as medicineService from "./medicine.service.js";
import { sendSuccess } from "../../utils/response.utils.js";

/**
 * POST /api/v1/medicines
 * Create a new medicine entry
 */
export const createMedicine = async (req, res, next) => {
  try {
    const medicine = await medicineService.createMedicine(req.body);
    return sendSuccess(res, medicine, "Medicine added to catalog successfully", 201);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/medicines
 * List and search medicines
 */
export const getAllMedicines = async (req, res, next) => {
  try {
    const result = await medicineService.getAllMedicines(req.query);
    return sendSuccess(res, result, "Medicine catalog fetched successfully");
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/medicines/:medicineId
 * Get medicine by ID
 */
export const getMedicineById = async (req, res, next) => {
  try {
    const { medicineId } = req.params;
    const medicine = await medicineService.getMedicineById(medicineId);
    return sendSuccess(res, medicine, "Medicine details fetched successfully");
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/medicines/:medicineId
 * Update medicine details
 */
export const updateMedicine = async (req, res, next) => {
  try {
    const { medicineId } = req.params;
    const updated = await medicineService.updateMedicine(medicineId, req.body);
    return sendSuccess(res, updated, "Medicine details updated successfully");
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/medicines/:medicineId/stock
 * Adjust medicine inventory stock
 */
export const updateMedicineStock = async (req, res, next) => {
  try {
    const { medicineId } = req.params;
    const { stockQuantity } = req.body;
    const updated = await medicineService.updateMedicineStock(medicineId, stockQuantity);
    return sendSuccess(res, updated, "Medicine stock updated successfully");
  } catch (err) {
    next(err);
  }
};
