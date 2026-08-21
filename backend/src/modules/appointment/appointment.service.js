// modules/appointment/appointment.service.js — Pure business logic for appointment scheduling
import Appointment from "./appointment.model.js";
import Doctor from "../doctor/doctor.model.js";
import Patient from "../patient/patient.model.js";
import { APPOINTMENT_STATUS, ROLES } from "../../config/constants.js";
import { NotFoundError, ConflictError, ForbiddenError, BadRequestError } from "../../core/errors/index.js";

/** Valid state transitions graph */
const ALLOWED_TRANSITIONS = {
  [APPOINTMENT_STATUS.SCHEDULED]: [
    APPOINTMENT_STATUS.CONFIRMED,
    APPOINTMENT_STATUS.CANCELLED,
    APPOINTMENT_STATUS.NO_SHOW,
  ],
  [APPOINTMENT_STATUS.CONFIRMED]: [
    APPOINTMENT_STATUS.CHECKED_IN,
    APPOINTMENT_STATUS.CANCELLED,
    APPOINTMENT_STATUS.NO_SHOW,
  ],
  [APPOINTMENT_STATUS.CHECKED_IN]: [
    APPOINTMENT_STATUS.IN_CONSULTATION,
    APPOINTMENT_STATUS.CANCELLED,
  ],
  [APPOINTMENT_STATUS.IN_CONSULTATION]: [
    APPOINTMENT_STATUS.COMPLETED,
  ],
  [APPOINTMENT_STATUS.COMPLETED]: [],
  [APPOINTMENT_STATUS.CANCELLED]: [],
  [APPOINTMENT_STATUS.NO_SHOW]: [],
};

/**
 * Generates sequential numeric appointmentId safely.
 */
const generateAppointmentId = async () => {
  const result = await Appointment.aggregate([
    { $group: { _id: null, maxId: { $max: "$appointmentId" } } },
  ]);
  return result.length > 0 ? result[0].maxId + 1 : 1;
};

/**
 * Helper to resolve doctor and patient ObjectIds from numeric IDs or ObjectIds.
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
 * Create a new appointment
 */
export const createAppointment = async (data, requestingUser) => {
  const { doctorId: numericDoctorId, patientId: numericPatientId, appointmentDate, durationMinutes, reason, notes } = data;

  const { doctor, patient } = await resolveDoctorAndPatient(numericDoctorId, numericPatientId);

  // Scoping checks based on user role
  if (requestingUser.role === ROLES.PATIENT) {
    const userPatient = await Patient.findOne({ userId: requestingUser.id });
    if (!userPatient || !userPatient._id.equals(patient._id)) {
      throw new ForbiddenError("You can only book appointments for yourself.");
    }
  } else if (requestingUser.role === ROLES.DOCTOR) {
    const userDoctor = await Doctor.findOne({ userId: requestingUser.id });
    if (!userDoctor || !userDoctor._id.equals(doctor._id)) {
      throw new ForbiddenError("Doctors can only schedule appointments for their own profile.");
    }
  }

  const parsedDate = new Date(appointmentDate);

  // Service-level double booking check
  const activeConflict = await Appointment.findOne({
    doctorId: doctor._id,
    appointmentDate: parsedDate,
    status: {
      $in: [
        APPOINTMENT_STATUS.SCHEDULED,
        APPOINTMENT_STATUS.CONFIRMED,
        APPOINTMENT_STATUS.CHECKED_IN,
        APPOINTMENT_STATUS.IN_CONSULTATION,
      ],
    },
  });

  if (activeConflict) {
    throw new ConflictError("Doctor already has an active appointment at the requested date and time.");
  }

  const appointmentId = await generateAppointmentId();

  return Appointment.create({
    appointmentId,
    patientId: patient._id,
    doctorId: doctor._id,
    appointmentDate: parsedDate,
    durationMinutes: durationMinutes || 30,
    reason,
    notes: notes || "",
    status: APPOINTMENT_STATUS.SCHEDULED,
    createdBy: requestingUser.id,
  });
};

/**
 * List & filter appointments with pagination and strict role-based ownership scoping
 */
export const getAllAppointments = async (requestingUser, queryParams = {}) => {
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
    if (doctor) {
      filter.doctorId = doctor._id;
    } else {
      filter.doctorId = null; // force empty result if doctor filter doesn't exist
    }
  }

  if (queryParams.patientId && (requestingUser.role === ROLES.ADMIN || requestingUser.role === ROLES.DOCTOR)) {
    const patient = await Patient.findOne({ patientId: Number(queryParams.patientId) });
    if (patient) {
      filter.patientId = patient._id;
    } else {
      filter.patientId = null;
    }
  }

  if (queryParams.startDate || queryParams.endDate) {
    filter.appointmentDate = {};
    if (queryParams.startDate) {
      filter.appointmentDate.$gte = new Date(queryParams.startDate);
    }
    if (queryParams.endDate) {
      filter.appointmentDate.$lte = new Date(queryParams.endDate);
    }
  }

  const total = await Appointment.countDocuments(filter);
  const items = await Appointment.find(filter)
    .populate("doctorId", "doctorId name specialization phone email")
    .populate("patientId", "patientId name age gender contact disease")
    .populate("createdBy", "name email role")
    .sort({ appointmentDate: -1 })
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
 * Get appointment by numeric appointmentId with ownership check
 */
export const getAppointmentById = async (appointmentId, requestingUser) => {
  const appointment = await Appointment.findOne({ appointmentId: Number(appointmentId) })
    .populate("doctorId", "doctorId name specialization phone email userId")
    .populate("patientId", "patientId name age gender contact disease userId")
    .populate("createdBy", "name email role");

  if (!appointment) {
    throw new NotFoundError("Appointment not found.");
  }

  // Scoping check
  if (requestingUser.role === ROLES.DOCTOR) {
    const doctor = await Doctor.findOne({ userId: requestingUser.id });
    if (!doctor || !appointment.doctorId._id.equals(doctor._id)) {
      throw new ForbiddenError("Access denied. You are not the assigned doctor for this appointment.");
    }
  } else if (requestingUser.role === ROLES.PATIENT) {
    const patient = await Patient.findOne({ userId: requestingUser.id });
    if (!patient || !appointment.patientId._id.equals(patient._id)) {
      throw new ForbiddenError("Access denied. You are not authorized to view this appointment.");
    }
  }

  return appointment;
};

/**
 * Update appointment status enforcing state machine logic
 */
export const updateAppointmentStatus = async (appointmentId, newStatus, requestingUser) => {
  const appointment = await Appointment.findOne({ appointmentId: Number(appointmentId) });
  if (!appointment) {
    throw new NotFoundError("Appointment not found.");
  }

  // Scoping check (only Admin or assigned Doctor can advance status)
  if (requestingUser.role === ROLES.DOCTOR) {
    const doctor = await Doctor.findOne({ userId: requestingUser.id });
    if (!doctor || !appointment.doctorId.equals(doctor._id)) {
      throw new ForbiddenError("Access denied. Only the assigned doctor can update status.");
    }
  } else if (requestingUser.role === ROLES.PATIENT) {
    throw new ForbiddenError("Patients cannot update appointment status directly. Use cancellation endpoint instead.");
  }

  if (newStatus === APPOINTMENT_STATUS.CANCELLED) {
    throw new BadRequestError("Use the /cancel endpoint to cancel an appointment with a mandatory cancellation reason.");
  }

  const currentStatus = appointment.status;

  if (currentStatus === newStatus) {
    return appointment;
  }

  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(newStatus)) {
    throw new BadRequestError(
      `Invalid status transition from '${currentStatus}' to '${newStatus}'. Allowed transitions: [${allowed.join(", ")}]`
    );
  }

  appointment.status = newStatus;
  await appointment.save();

  return appointment.populate([
    { path: "doctorId", select: "doctorId name specialization" },
    { path: "patientId", select: "patientId name" },
  ]);
};

/**
 * Cancel an appointment with mandatory cancellation reason
 */
export const cancelAppointment = async (appointmentId, cancellationReason, requestingUser) => {
  const appointment = await Appointment.findOne({ appointmentId: Number(appointmentId) });
  if (!appointment) {
    throw new NotFoundError("Appointment not found.");
  }

  // Ownership scoping check
  if (requestingUser.role === ROLES.DOCTOR) {
    const doctor = await Doctor.findOne({ userId: requestingUser.id });
    if (!doctor || !appointment.doctorId.equals(doctor._id)) {
      throw new ForbiddenError("Access denied. You are not the assigned doctor.");
    }
  } else if (requestingUser.role === ROLES.PATIENT) {
    const patient = await Patient.findOne({ userId: requestingUser.id });
    if (!patient || !appointment.patientId.equals(patient._id)) {
      throw new ForbiddenError("Access denied. You are not authorized to cancel this appointment.");
    }
  }

  if (
    [APPOINTMENT_STATUS.COMPLETED, APPOINTMENT_STATUS.CANCELLED, APPOINTMENT_STATUS.NO_SHOW].includes(
      appointment.status
    )
  ) {
    throw new BadRequestError(`Cannot cancel an appointment that is already '${appointment.status}'.`);
  }

  appointment.status = APPOINTMENT_STATUS.CANCELLED;
  appointment.cancellationReason = cancellationReason;
  await appointment.save();

  return appointment.populate([
    { path: "doctorId", select: "doctorId name specialization" },
    { path: "patientId", select: "patientId name" },
  ]);
};
