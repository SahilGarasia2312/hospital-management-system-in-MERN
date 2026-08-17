// modules/patient/patient.service.js — Pure business logic for patient operations
import Patient from "./patient.model.js";
import Doctor from "../doctor/doctor.model.js";
import { NotFoundError } from "../../core/errors/index.js";

/**
 * Generates the next sequential patientId safely using aggregation.
 */
const generatePatientId = async () => {
  const result = await Patient.aggregate([{ $group: { _id: null, maxId: { $max: "$patientId" } } }]);
  return result.length > 0 ? result[0].maxId + 1 : 1;
};

/** Fetch all patients — admin sees all, doctor sees their own */
export const getAllPatients = async (requestingUser) => {
  if (requestingUser.role === "admin") {
    return Patient.find().populate("doctorId", "name specialization").sort({ createdAt: -1 });
  }
  if (requestingUser.role === "doctor") {
    // Find the Doctor document linked to this user
    const doctor = await Doctor.findOne({ userId: requestingUser.id });
    if (!doctor) return [];
    return Patient.find({ doctorId: doctor._id })
      .populate("doctorId", "name specialization")
      .sort({ createdAt: -1 });
  }
  // Patient role: find by userId
  return Patient.find({ userId: requestingUser.id })
    .populate("doctorId", "name specialization")
    .sort({ createdAt: -1 });
};

/** Fetch one patient by patientId */
export const getPatientById = async (patientId) => {
  const patient = await Patient.findOne({ patientId: Number(patientId) }).populate(
    "doctorId",
    "name specialization experience"
  );
  if (!patient) {
    throw new NotFoundError("Patient not found.");
  }
  return patient;
};

/** Create a patient under a specific doctor */
export const createPatient = async (data) => {
  const { doctorId: numericDoctorId, ...rest } = data;

  const doctor = await Doctor.findOne({ doctorId: Number(numericDoctorId) });
  if (!doctor) {
    throw new NotFoundError("Doctor not found.");
  }

  const patientId = await generatePatientId();
  return Patient.create({ ...rest, patientId, doctorId: doctor._id });
};

/** Update a patient record */
export const updatePatient = async (patientId, data) => {
  const patient = await Patient.findOneAndUpdate(
    { patientId: Number(patientId) },
    { $set: data },
    { new: true, runValidators: true }
  );
  if (!patient) {
    throw new NotFoundError("Patient not found.");
  }
  return patient;
};

/** Delete a patient */
export const deletePatient = async (patientId) => {
  const patient = await Patient.findOneAndDelete({ patientId: Number(patientId) });
  if (!patient) {
    throw new NotFoundError("Patient not found.");
  }
  return patient;
};

/** Stats for dashboard */
export const getPatientStats = async () => {
  const total = await Patient.countDocuments();
  const indoor = await Patient.countDocuments({ admissionStatus: "Indoor" });
  const outdoor = await Patient.countDocuments({ admissionStatus: "Outdoor" });
  return { total, indoor, outdoor };
};
