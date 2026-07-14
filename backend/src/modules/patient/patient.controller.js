// modules/patient/patient.controller.js — HTTP layer for patient endpoints
import * as patientService from "./patient.service.js";
import { sendSuccess } from "../../utils/response.utils.js";

export const getAllPatients = async (req, res, next) => {
  try {
    // Pass req.user so service can scope results by role
    const patients = await patientService.getAllPatients(req.user);
    return sendSuccess(res, patients, "Patients fetched successfully");
  } catch (err) { next(err); }
};

export const getPatientById = async (req, res, next) => {
  try {
    const patient = await patientService.getPatientById(req.params.patientId);
    return sendSuccess(res, patient, "Patient fetched successfully");
  } catch (err) { next(err); }
};

export const createPatient = async (req, res, next) => {
  try {
    const patient = await patientService.createPatient(req.body);
    return sendSuccess(res, patient, "Patient added successfully", 201);
  } catch (err) { next(err); }
};

export const updatePatient = async (req, res, next) => {
  try {
    const patient = await patientService.updatePatient(req.params.patientId, req.body);
    return sendSuccess(res, patient, "Patient updated successfully");
  } catch (err) { next(err); }
};

export const deletePatient = async (req, res, next) => {
  try {
    await patientService.deletePatient(req.params.patientId);
    return sendSuccess(res, null, "Patient deleted successfully");
  } catch (err) { next(err); }
};

export const getPatientStats = async (req, res, next) => {
  try {
    const stats = await patientService.getPatientStats();
    return sendSuccess(res, stats, "Patient stats fetched");
  } catch (err) { next(err); }
};
