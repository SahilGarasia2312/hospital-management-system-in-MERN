// modules/timeline/timeline.service.js — Pure business logic for Patient Medical Record Timeline (Patient 360°)
import Patient from "../patient/patient.model.js";
import Doctor from "../doctor/doctor.model.js";
import Appointment from "../appointment/appointment.model.js";
import ClinicalVisit from "../visit/visit.model.js";
import Prescription from "../prescription/prescription.model.js";
import { ROLES } from "../../config/constants.js";
import { NotFoundError, ForbiddenError } from "../../core/errors/index.js";

/**
 * Normalizes an Appointment record into standard timeline event format.
 */
const normalizeAppointment = (appointment) => ({
  eventType: "appointment",
  eventId: appointment.appointmentId,
  occurredAt: appointment.appointmentDate,
  status: appointment.status,
  summary: {
    doctorId: appointment.doctorId?.doctorId || null,
    doctorName: appointment.doctorId?.name || null,
    specialization: appointment.doctorId?.specialization || null,
    appointmentDate: appointment.appointmentDate,
    durationMinutes: appointment.durationMinutes,
    reason: appointment.reason,
    notes: appointment.notes || "",
    cancellationReason: appointment.cancellationReason || "",
  },
});

/**
 * Normalizes a ClinicalVisit record into standard timeline event format.
 */
const normalizeVisit = (visit) => ({
  eventType: "visit",
  eventId: visit.visitId,
  occurredAt: visit.completedAt || visit.createdAt,
  status: visit.status,
  summary: {
    doctorId: visit.doctorId?.doctorId || null,
    doctorName: visit.doctorId?.name || null,
    symptoms: visit.symptoms,
    diagnosis: visit.diagnosis || "",
    doctorNotes: visit.doctorNotes || "",
    vitals: visit.vitals || {},
    prescriptionsCount: visit.prescriptions ? visit.prescriptions.length : 0,
    followUpDate: visit.followUpDate || null,
  },
});

/**
 * Normalizes a Prescription record into standard timeline event format.
 */
const normalizePrescription = (prescription) => ({
  eventType: "prescription",
  eventId: prescription.prescriptionId,
  occurredAt: prescription.dispensedAt || prescription.createdAt,
  status: prescription.status,
  summary: {
    doctorId: prescription.doctorId?.doctorId || null,
    doctorName: prescription.doctorId?.name || null,
    itemCount: prescription.items ? prescription.items.length : 0,
    items: (prescription.items || []).map((item) => ({
      medicineName: item.medicineName,
      strength: item.strength,
      dosageForm: item.dosageForm,
      dosage: item.dosage,
      frequency: item.frequency,
      duration: item.duration,
      quantityPrescribed: item.quantityPrescribed,
      quantityDispensed: item.quantityDispensed,
    })),
    dispensedAt: prescription.dispensedAt || null,
    cancellationReason: prescription.cancellationReason || "",
  },
});

/**
 * Generates unified Patient 360° longitudinal medical timeline with authorization & bounded pagination.
 */
export const getPatientTimeline = async (patientId, requestingUser, queryParams = {}) => {
  // 1. Resolve Patient
  const patient = await Patient.findOne({ patientId: Number(patientId) });
  if (!patient) {
    throw new NotFoundError("Patient not found.");
  }

  // 2. Strict Ownership & IDOR Protection
  if (requestingUser.role === ROLES.PATIENT) {
    if (!patient.userId || !patient.userId.equals(requestingUser.id)) {
      throw new ForbiddenError("Access denied. You can only view your own medical record timeline.");
    }
  } else if (requestingUser.role === ROLES.DOCTOR) {
    const doctor = await Doctor.findOne({ userId: requestingUser.id });
    if (!doctor) {
      throw new ForbiddenError("Access denied. Doctor profile not found.");
    }

    const isPrimaryDoctor = patient.doctorId && patient.doctorId.equals(doctor._id);
    if (!isPrimaryDoctor) {
      const [hasAppointment, hasVisit, hasPrescription] = await Promise.all([
        Appointment.exists({ doctorId: doctor._id, patientId: patient._id }),
        ClinicalVisit.exists({ doctorId: doctor._id, patientId: patient._id }),
        Prescription.exists({ doctorId: doctor._id, patientId: patient._id }),
      ]);

      if (!hasAppointment && !hasVisit && !hasPrescription) {
        throw new ForbiddenError("Access denied. You are not an authorized attending clinician for this patient.");
      }
    }
  }

  // 3. Pagination parameters
  const page = Math.max(1, parseInt(queryParams.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(queryParams.limit) || 20));
  const skip = (page - 1) * limit;

  const startDate = queryParams.startDate || queryParams.from ? new Date(queryParams.startDate || queryParams.from) : null;
  const endDate = queryParams.endDate || queryParams.to ? new Date(queryParams.endDate || queryParams.to) : null;
  const eventTypeFilter = queryParams.eventType;

  // Build domain filters
  const buildDateQuery = (dateField) => {
    if (!startDate && !endDate) return {};
    const q = {};
    if (startDate) q[dateField] = { $gte: startDate };
    if (endDate) {
      q[dateField] = q[dateField] ? { ...q[dateField], $lte: endDate } : { $lte: endDate };
    }
    return q;
  };

  const fetchAppointments = !eventTypeFilter || eventTypeFilter === "appointment";
  const fetchVisits = !eventTypeFilter || eventTypeFilter === "visit";
  const fetchPrescriptions = !eventTypeFilter || eventTypeFilter === "prescription";

  const apptFilter = { patientId: patient._id, ...buildDateQuery("appointmentDate") };
  const visitFilter = { patientId: patient._id, ...buildDateQuery("createdAt") };
  const prescFilter = { patientId: patient._id, ...buildDateQuery("createdAt") };

  // Fetch counts and bounded items in parallel
  const fetchLimit = skip + limit;

  const [
    apptCount,
    visitCount,
    prescCount,
    rawAppts,
    rawVisits,
    rawPrescs,
  ] = await Promise.all([
    fetchAppointments ? Appointment.countDocuments(apptFilter) : 0,
    fetchVisits ? ClinicalVisit.countDocuments(visitFilter) : 0,
    fetchPrescriptions ? Prescription.countDocuments(prescFilter) : 0,
    fetchAppointments
      ? Appointment.find(apptFilter)
          .populate("doctorId", "doctorId name specialization")
          .sort({ appointmentDate: -1 })
          .limit(fetchLimit)
          .lean()
      : [],
    fetchVisits
      ? ClinicalVisit.find(visitFilter)
          .populate("doctorId", "doctorId name specialization")
          .sort({ createdAt: -1 })
          .limit(fetchLimit)
          .lean()
      : [],
    fetchPrescriptions
      ? Prescription.find(prescFilter)
          .populate("doctorId", "doctorId name specialization")
          .sort({ createdAt: -1 })
          .limit(fetchLimit)
          .lean()
      : [],
  ]);

  const total = apptCount + visitCount + prescCount;

  // Transform to normalized events
  const events = [
    ...rawAppts.map(normalizeAppointment),
    ...rawVisits.map(normalizeVisit),
    ...rawPrescs.map(normalizePrescription),
  ];

  // Sort descending by occurredAt
  events.sort((a, b) => new Date(b.occurredAt) - new Date(a.occurredAt));

  // Slice page window
  const paginatedEvents = events.slice(skip, skip + limit);
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    patient: {
      patientId: patient.patientId,
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      disease: patient.disease,
      admissionStatus: patient.admissionStatus,
    },
    timeline: paginatedEvents,
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
