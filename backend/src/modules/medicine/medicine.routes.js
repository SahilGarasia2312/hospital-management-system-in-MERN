// modules/medicine/medicine.routes.js — Medicine catalog routes definition
import express from "express";
import * as medicineController from "./medicine.controller.js";
import { verifyTokenMiddleware } from "../../core/middleware/auth.middleware.js";
import { requireRole } from "../../core/middleware/role.middleware.js";
import { validateRequest } from "../../core/middleware/validation.middleware.js";
import {
  createMedicineValidation,
  updateMedicineValidation,
  updateStockValidation,
  medicineIdParamValidation,
  listMedicinesValidation,
} from "./medicine.validation.js";

const router = express.Router();

// All medicine routes require authentication
router.use(verifyTokenMiddleware);

// GET /api/v1/medicines — Admin + Doctor
router.get(
  "/",
  requireRole("admin", "doctor"),
  listMedicinesValidation,
  validateRequest,
  medicineController.getAllMedicines
);

// GET /api/v1/medicines/:medicineId — Admin + Doctor
router.get(
  "/:medicineId",
  requireRole("admin", "doctor"),
  medicineIdParamValidation,
  validateRequest,
  medicineController.getMedicineById
);

// POST /api/v1/medicines — Admin only
router.post(
  "/",
  requireRole("admin"),
  createMedicineValidation,
  validateRequest,
  medicineController.createMedicine
);

// PUT /api/v1/medicines/:medicineId — Admin only
router.put(
  "/:medicineId",
  requireRole("admin"),
  medicineIdParamValidation,
  updateMedicineValidation,
  validateRequest,
  medicineController.updateMedicine
);

// PATCH /api/v1/medicines/:medicineId/stock — Admin only
router.patch(
  "/:medicineId/stock",
  requireRole("admin"),
  medicineIdParamValidation,
  updateStockValidation,
  validateRequest,
  medicineController.updateMedicineStock
);

export default router;
