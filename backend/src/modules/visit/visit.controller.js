// modules/visit/visit.controller.js — Thin HTTP controllers for clinical visit endpoints
import * as visitService from "./visit.service.js";
import { sendSuccess } from "../../utils/response.utils.js";

/**
 * POST /api/v1/visits
 * Create a clinical visit record
 */
export const createVisit = async (req, res, next) => {
  try {
    const visit = await visitService.createVisit(req.body, req.user);
    return sendSuccess(res, visit, "Clinical visit created successfully", 201);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/visits
 * List clinical visits with filters and pagination
 */
export const getAllVisits = async (req, res, next) => {
  try {
    const result = await visitService.getAllVisits(req.user, req.query);
    return sendSuccess(res, result, "Clinical visits fetched successfully");
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/visits/:visitId
 * Get clinical visit by ID
 */
export const getVisitById = async (req, res, next) => {
  try {
    const { visitId } = req.params;
    const visit = await visitService.getVisitById(visitId, req.user);
    return sendSuccess(res, visit, "Clinical visit details fetched successfully");
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/visits/:visitId
 * Update clinical visit details (Open status only)
 */
export const updateVisit = async (req, res, next) => {
  try {
    const { visitId } = req.params;
    const updated = await visitService.updateVisit(visitId, req.body, req.user);
    return sendSuccess(res, updated, "Clinical visit updated successfully");
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/visits/:visitId/complete
 * Complete a clinical visit encounter
 */
export const completeVisit = async (req, res, next) => {
  try {
    const { visitId } = req.params;
    const completed = await visitService.completeVisit(visitId, req.body, req.user);
    return sendSuccess(res, completed, "Clinical visit encounter finalized successfully");
  } catch (err) {
    next(err);
  }
};
