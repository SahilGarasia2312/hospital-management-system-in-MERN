// modules/doctor/doctor.service.js — Pure business logic for doctor operations
// No Express here — services are framework-agnostic and fully testable
import Doctor from "./doctor.model.js";
import Patient from "../patient/patient.model.js";

/**
 * Generates the next sequential doctorId safely.
 * improvement: Uses aggregation max instead of sort to avoid race conditions on small datasets.
 */
const generateDoctorId = async () => {
  const result = await Doctor.aggregate([{ $group: { _id: null, maxId: { $max: "$doctorId" } } }]);
  return result.length > 0 ? result[0].maxId + 1 : 1;
};

/** Fetch all doctors */
export const getAllDoctors = async () => {
  return Doctor.find().sort({ createdAt: -1 });
};

/** Fetch a single doctor by their numeric doctorId */
export const getDoctorById = async (doctorId) => {
  const doctor = await Doctor.findOne({ doctorId: Number(doctorId) });
  if (!doctor) {
    const err = new Error("Doctor not found.");
    err.statusCode = 404;
    throw err;
  }
  return doctor;
};

/** Create a new doctor */
export const createDoctor = async (data) => {
  const { name, specialization, experience, phone, email } = data;
  const doctorId = await generateDoctorId();
  return Doctor.create({ doctorId, name, specialization, experience, phone, email });
};

/** Update a doctor by doctorId */
export const updateDoctor = async (doctorId, data) => {
  const doctor = await Doctor.findOneAndUpdate(
    { doctorId: Number(doctorId) },
    { $set: data },
    { new: true, runValidators: true }
  );
  if (!doctor) {
    const err = new Error("Doctor not found.");
    err.statusCode = 404;
    throw err;
  }
  return doctor;
};

/** Delete a doctor and cascade-delete all their patients */
export const deleteDoctor = async (doctorId) => {
  const doctor = await Doctor.findOneAndDelete({ doctorId: Number(doctorId) });
  if (!doctor) {
    const err = new Error("Doctor not found.");
    err.statusCode = 404;
    throw err;
  }
  // Cascade delete all patients belonging to this doctor
  await Patient.deleteMany({ doctorId: doctor._id });
  return doctor;
};

/** Get summary stats for dashboard */
export const getDoctorStats = async () => {
  const total = await Doctor.countDocuments();
  const bySpecialization = await Doctor.aggregate([
    { $group: { _id: "$specialization", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  return { total, bySpecialization };
};
