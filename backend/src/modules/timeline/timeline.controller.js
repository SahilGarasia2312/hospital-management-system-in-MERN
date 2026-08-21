// modules/timeline/timeline.controller.js — HTTP controller for Patient Medical Record Timeline
import * as timelineService from "./timeline.service.js";
import { sendSuccess } from "../../utils/response.utils.js";

/**
 * GET /api/v1/patients/:patientId/timeline
 * Fetch normalized longitudinal medical record timeline for a patient
 */
export const getPatientTimeline = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const result = await timelineService.getPatientTimeline(patientId, req.user, req.query);
    return sendSuccess(res, result, "Patient medical record timeline fetched successfully");
  } catch (err) {
    next(err);
  }
};
