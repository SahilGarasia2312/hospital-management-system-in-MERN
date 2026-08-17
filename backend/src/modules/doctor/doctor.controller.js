// modules/doctor/doctor.controller.js — HTTP layer for doctor endpoints
import * as doctorService from "./doctor.service.js";
import { sendSuccess, sendError } from "../../utils/response.utils.js";

export const getAllDoctors = async (req, res, next) => {
  try {
    const doctors = await doctorService.getAllDoctors();
    return sendSuccess(res, doctors, "Doctors fetched successfully");
  } catch (err) { next(err); }
};

export const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await doctorService.getDoctorById(req.params.doctorId);
    return sendSuccess(res, doctor, "Doctor fetched successfully");
  } catch (err) { next(err); }
};

export const createDoctor = async (req, res, next) => {
  try {
    const doctor = await doctorService.createDoctor(req.body);
    return sendSuccess(res, doctor, "Doctor added successfully", 201);
  } catch (err) { next(err); }
};

export const updateDoctor = async (req, res, next) => {
  try {
    const doctor = await doctorService.updateDoctor(req.params.doctorId, req.body);
    return sendSuccess(res, doctor, "Doctor updated successfully");
  } catch (err) { next(err); }
};

export const deleteDoctor = async (req, res, next) => {
  try {
    await doctorService.deleteDoctor(req.params.doctorId);
    return sendSuccess(res, null, "Doctor and associated patients deleted successfully");
  } catch (err) { next(err); }
};

export const getDoctorStats = async (req, res, next) => {
  try {
    const stats = await doctorService.getDoctorStats();
    return sendSuccess(res, stats, "Doctor stats fetched");
  } catch (err) { next(err); }
};
