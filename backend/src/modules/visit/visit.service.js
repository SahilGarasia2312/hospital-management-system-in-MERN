// modules/visit/visit.service.js — Pure business logic for Clinical Visit / Encounter operations
import ClinicalVisit from "./visit.model.js";
import Doctor from "../doctor/doctor.model.js";
import Patient from "../patient/patient.model.js";
import Appointment from "../appointment/appointment.model.js";
import { VISIT_STATUS, APPOINTMENT_STATUS, ROLES, AUDIT_ACTIONS } from "../../config/constants.js";
import { NotFoundError, ConflictError, ForbiddenError, BadRequestError } from "../../core/errors/index.js";
import { createAuditLog } from "../audit/audit.service.js";

/**
 * Generates sequential numeric visitId safely.
 */
const generateVisitId = async () => {
  const result = await ClinicalVisit.aggregate([
    { $group: { _id: null, maxId: { $max: "$visitId" } } },
  ]);
  return result.length > 0 ? result[0].maxId + 1 : 1;
};

/**
 * Helper to resolve Doctor and Patient documents from numeric IDs.
 */
const resolveDoctorAndPatient = async (numericDoctorId, numericPatientId) => {
  const doctor = await Doctor.findOne({ doctorId: Number(numericDoctorId) });
  if (!doctor) {
    throw new NotFoundError("Doctor not found with provided doctorId.");
  }

  const patient = await Patient.findOne({ patientId: Number(numericPatientId) });
  if (!patient) {
    throw new NotFoundError("Patient not found with provided patientId.");
  }

  return { doctor, patient };
};

/**
 * Create a clinical visit record
 */
export const createVisit = async (data, requestingUser) => {
  if (requestingUser.role === ROLES.PATIENT) {
    throw new ForbiddenError("Patients cannot create clinical visit records.");
  }

  const {
    doctorId: numericDoctorId,
    patientId: numericPatientId,
    appointmentId: numericAppointmentId,
    symptoms,
    diagnosis,
    doctorNotes,
    vitals,
    prescriptions,
    followUpDate,
  } = data;

  const { doctor, patient } = await resolveDoctorAndPatient(numericDoctorId, numericPatientId);

  // Doctor ownership check
  if (requestingUser.role === ROLES.DOCTOR) {
    const userDoctor = await Doctor.findOne({ userId: requestingUser.id });
    if (!userDoctor || !userDoctor._id.equals(doctor._id)) {
      throw new ForbiddenError("Doctors can only create clinical visits for their own profile.");
    }
  }

  let linkedAppointment = null;
  if (numericAppointmentId) {
    linkedAppointment = await Appointment.findOne({ appointmentId: Number(numericAppointmentId) });
    if (!linkedAppointment) {
      throw new NotFoundError("Referenced appointment not found.");
    }

    if (
      !linkedAppointment.doctorId.equals(doctor._id) ||
      !linkedAppointment.patientId.equals(patient._id)
    ) {
      throw new BadRequestError("Referenced appointment doctor and patient must match clinical visit details.");
    }

    if (
      [APPOINTMENT_STATUS.CANCELLED, APPOINTMENT_STATUS.NO_SHOW].includes(linkedAppointment.status)
    ) {
      throw new BadRequestError(`Cannot create a clinical visit for an appointment that is '${linkedAppointment.status}'.`);
    }

    // Check if a visit already exists for this appointment
    const existingVisit = await ClinicalVisit.findOne({ appointmentId: linkedAppointment._id });
    if (existingVisit) {
      throw new ConflictError("A clinical visit encounter has already been created for this appointment.");
    }

    // Automatically transition appointment status to in_consultation if appropriate
    if (
      [APPOINTMENT_STATUS.SCHEDULED, APPOINTMENT_STATUS.CONFIRMED, APPOINTMENT_STATUS.CHECKED_IN].includes(
        linkedAppointment.status
      )
    ) {
      linkedAppointment.status = APPOINTMENT_STATUS.IN_CONSULTATION;
      await linkedAppointment.save();
    }
  }

  const visitId = await generateVisitId();

  const created = await ClinicalVisit.create({
    visitId,
    patientId: patient._id,
    doctorId: doctor._id,
    appointmentId: linkedAppointment ? linkedAppointment._id : null,
    symptoms,
    diagnosis: diagnosis || "",
    doctorNotes: doctorNotes || "",
    vitals: vitals || {},
    prescriptions: prescriptions || [],
    followUpDate: followUpDate ? new Date(followUpDate) : null,
    status: VISIT_STATUS.OPEN,
  });

  await createAuditLog({
    actor: { userId: requestingUser.id, role: requestingUser.role },
    action: AUDIT_ACTIONS.VISIT_CREATED,
    resource: { type: "visit", id: created.visitId },
    metadata: {
      patientId: patient.patientId,
      doctorId: doctor.doctorId,
      hasAppointment: !!linkedAppointment,
    },
  });

  return created;
};

/**
 * List & filter clinical visits with pagination and role-based ownership scoping
 */
export const getAllVisits = async (requestingUser, queryParams = {}) => {
  const page = Math.max(1, parseInt(queryParams.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(queryParams.limit) || 10));
  const skip = (page - 1) * limit;

  const filter = {};

  // Role-based data scoping
  if (requestingUser.role === ROLES.DOCTOR) {
    const doctor = await Doctor.findOne({ userId: requestingUser.id });
    if (!doctor) {
      return { items: [], pagination: { total: 0, page, limit, totalPages: 0, hasNextPage: false, hasPrevPage: false } };
    }
    filter.doctorId = doctor._id;
  } else if (requestingUser.role === ROLES.PATIENT) {
    const patient = await Patient.findOne({ userId: requestingUser.id });
    if (!patient) {
      return { items: [], pagination: { total: 0, page, limit, totalPages: 0, hasNextPage: false, hasPrevPage: false } };
    }
    filter.patientId = patient._id;
  }

  // Additional filters
  if (queryParams.status) {
    filter.status = queryParams.status;
  }

  if (queryParams.doctorId && requestingUser.role === ROLES.ADMIN) {
    const doctor = await Doctor.findOne({ doctorId: Number(queryParams.doctorId) });
    if (doctor) filter.doctorId = doctor._id;
    else filter.doctorId = null;
  }

  if (queryParams.patientId && (requestingUser.role === ROLES.ADMIN || requestingUser.role === ROLES.DOCTOR)) {
    const patient = await Patient.findOne({ patientId: Number(queryParams.patientId) });
    if (patient) filter.patientId = patient._id;
    else filter.patientId = null;
  }

  if (queryParams.startDate || queryParams.endDate) {
    filter.createdAt = {};
    if (queryParams.startDate) filter.createdAt.$gte = new Date(queryParams.startDate);
    if (queryParams.endDate) filter.createdAt.$lte = new Date(queryParams.endDate);
  }

  const total = await ClinicalVisit.countDocuments(filter);
  const items = await ClinicalVisit.find(filter)
    .populate("doctorId", "doctorId name specialization phone email")
    .populate("patientId", "patientId name age gender contact disease")
    .populate("appointmentId", "appointmentId appointmentDate status reason")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    items,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

/**
 * Get single clinical visit record by numeric visitId
 */
export const getVisitById = async (visitId, requestingUser) => {
  const visit = await ClinicalVisit.findOne({ visitId: Number(visitId) })
    .populate("doctorId", "doctorId name specialization phone email userId")
    .populate("patientId", "patientId name age gender contact disease userId")
    .populate("appointmentId", "appointmentId appointmentDate status reason");

  if (!visit) {
    throw new NotFoundError("Clinical visit not found.");
  }

  // Scoping check
  if (requestingUser.role === ROLES.DOCTOR) {
    const doctor = await Doctor.findOne({ userId: requestingUser.id });
    if (!doctor || !visit.doctorId._id.equals(doctor._id)) {
      throw new ForbiddenError("Access denied. You are not the assigned doctor for this visit.");
    }
  } else if (requestingUser.role === ROLES.PATIENT) {
    const patient = await Patient.findOne({ userId: requestingUser.id });
    if (!patient || !visit.patientId._id.equals(patient._id)) {
      throw new ForbiddenError("Access denied. You are not authorized to view this visit record.");
    }
  }

  return visit;
};

/**
 * Update clinical visit details (Open visits only)
 */
export const updateVisit = async (visitId, data, requestingUser) => {
  if (requestingUser.role === ROLES.PATIENT) {
    throw new ForbiddenError("Patients cannot modify clinical visit records.");
  }

  const visit = await ClinicalVisit.findOne({ visitId: Number(visitId) });
  if (!visit) {
    throw new NotFoundError("Clinical visit not found.");
  }

  // Ownership check
  if (requestingUser.role === ROLES.DOCTOR) {
    const doctor = await Doctor.findOne({ userId: requestingUser.id });
    if (!doctor || !visit.doctorId.equals(doctor._id)) {
      throw new ForbiddenError("Access denied. Only the assigned doctor can modify this visit.");
    }
  }

  // Immutability check
  if (visit.status === VISIT_STATUS.COMPLETED) {
    throw new BadRequestError("Completed clinical visits cannot be modified.");
  }

  const allowedFields = ["symptoms", "diagnosis", "doctorNotes", "vitals", "prescriptions", "followUpDate"];
  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      if (field === "followUpDate" && data[field]) {
        visit[field] = new Date(data[field]);
      } else {
        visit[field] = data[field];
      }
    }
  });

  await visit.save();

  return visit.populate([
    { path: "doctorId", select: "doctorId name specialization" },
    { path: "patientId", select: "patientId name" },
    { path: "appointmentId", select: "appointmentId status" },
  ]);
};

/**
 * Finalize/Complete a clinical visit encounter
 */
export const completeVisit = async (visitId, data = {}, requestingUser) => {
  if (requestingUser.role === ROLES.PATIENT) {
    throw new ForbiddenError("Patients cannot complete clinical visits.");
  }

  const visit = await ClinicalVisit.findOne({ visitId: Number(visitId) });
  if (!visit) {
    throw new NotFoundError("Clinical visit not found.");
  }

  // Ownership check
  if (requestingUser.role === ROLES.DOCTOR) {
    const doctor = await Doctor.findOne({ userId: requestingUser.id });
    if (!doctor || !visit.doctorId.equals(doctor._id)) {
      throw new ForbiddenError("Access denied. Only the assigned doctor can complete this visit.");
    }
  }

  if (visit.status === VISIT_STATUS.COMPLETED) {
    throw new BadRequestError("Clinical visit encounter is already completed.");
  }

  const diagnosisToUse = data.diagnosis || visit.diagnosis;
  if (!diagnosisToUse || diagnosisToUse.trim().length === 0) {
    throw new BadRequestError("A valid diagnosis is required before completing a clinical visit.");
  }

  visit.diagnosis = diagnosisToUse.trim();
  if (data.doctorNotes) visit.doctorNotes = data.doctorNotes;
  if (data.prescriptions) visit.prescriptions = data.prescriptions;

  visit.status = VISIT_STATUS.COMPLETED;
  visit.completedAt = new Date();

  await visit.save();

  // Cascade complete linked appointment if present
  if (visit.appointmentId) {
    const appointment = await Appointment.findById(visit.appointmentId);
    if (appointment && appointment.status !== APPOINTMENT_STATUS.COMPLETED) {
      appointment.status = APPOINTMENT_STATUS.COMPLETED;
      await appointment.save();
    }
  }

  await createAuditLog({
    actor: { userId: requestingUser.id, role: requestingUser.role },
    action: AUDIT_ACTIONS.VISIT_COMPLETED,
    resource: { type: "visit", id: visit.visitId },
    metadata: {
      diagnosis: visit.diagnosis,
      completedAt: visit.completedAt,
    },
  });

  return visit.populate([
    { path: "doctorId", select: "doctorId name specialization" },
    { path: "patientId", select: "patientId name" },
    { path: "appointmentId", select: "appointmentId status" },
  ]);
};
