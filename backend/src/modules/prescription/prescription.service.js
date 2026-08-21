// modules/prescription/prescription.service.js — Pure business logic for prescription management & pharmacy fulfillment
import Prescription from "./prescription.model.js";
import Medicine from "../medicine/medicine.model.js";
import Doctor from "../doctor/doctor.model.js";
import Patient from "../patient/patient.model.js";
import ClinicalVisit from "../visit/visit.model.js";
import { PRESCRIPTION_STATUS, ROLES, AUDIT_ACTIONS } from "../../config/constants.js";
import { NotFoundError, ConflictError, ForbiddenError, BadRequestError } from "../../core/errors/index.js";
import { createAuditLog } from "../audit/audit.service.js";

/**
 * Generates sequential numeric prescriptionId safely.
 */
const generatePrescriptionId = async () => {
  const result = await Prescription.aggregate([
    { $group: { _id: null, maxId: { $max: "$prescriptionId" } } },
  ]);
  return result.length > 0 ? result[0].maxId + 1 : 1;
};

/**
 * Helper to resolve doctor and patient ObjectIds from numeric IDs.
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
 * Create a new prescription
 */
export const createPrescription = async (data, requestingUser) => {
  if (requestingUser.role === ROLES.PATIENT) {
    throw new ForbiddenError("Patients cannot issue prescriptions.");
  }

  const { doctorId: numericDoctorId, patientId: numericPatientId, visitId: numericVisitId, items, notes } = data;

  const { doctor, patient } = await resolveDoctorAndPatient(numericDoctorId, numericPatientId);

  // Scoping check for Doctor role
  if (requestingUser.role === ROLES.DOCTOR) {
    const userDoctor = await Doctor.findOne({ userId: requestingUser.id });
    if (!userDoctor || !userDoctor._id.equals(doctor._id)) {
      throw new ForbiddenError("Doctors can only issue prescriptions under their own profile.");
    }
  }

  let linkedVisit = null;
  if (numericVisitId) {
    linkedVisit = await ClinicalVisit.findOne({ visitId: Number(numericVisitId) });
    if (!linkedVisit) {
      throw new NotFoundError("Referenced clinical visit not found.");
    }
    if (!linkedVisit.doctorId.equals(doctor._id) || !linkedVisit.patientId.equals(patient._id)) {
      throw new BadRequestError("Referenced clinical visit doctor and patient must match prescription details.");
    }
  }

  // Resolve and snapshot medicine details
  const snapshotItems = [];
  for (const item of items) {
    const medicine = await Medicine.findOne({ medicineId: Number(item.medicineId) });
    if (!medicine) {
      throw new NotFoundError(`Medicine not found in catalog for ID: ${item.medicineId}`);
    }
    if (!medicine.isActive) {
      throw new BadRequestError(`Medicine '${medicine.name}' is inactive and cannot be prescribed.`);
    }

    snapshotItems.push({
      medicineId: medicine._id,
      medicineName: medicine.name,
      strength: medicine.strength,
      dosageForm: medicine.dosageForm,
      unitPrice: medicine.unitPrice,
      dosage: item.dosage,
      frequency: item.frequency,
      duration: item.duration,
      instructions: item.instructions || "",
      quantityPrescribed: item.quantityPrescribed,
      quantityDispensed: 0,
    });
  }

  const prescriptionId = await generatePrescriptionId();

  const created = await Prescription.create({
    prescriptionId,
    patientId: patient._id,
    doctorId: doctor._id,
    visitId: linkedVisit ? linkedVisit._id : null,
    items: snapshotItems,
    status: PRESCRIPTION_STATUS.ISSUED,
    notes: notes || "",
    createdBy: requestingUser.id,
  });

  await createAuditLog({
    actor: { userId: requestingUser.id, role: requestingUser.role },
    action: AUDIT_ACTIONS.PRESCRIPTION_ISSUED,
    resource: { type: "prescription", id: created.prescriptionId },
    metadata: {
      patientId: patient.patientId,
      doctorId: doctor.doctorId,
      itemCount: created.items.length,
    },
  });

  return created;
};

/**
 * List & filter prescriptions with pagination and role-based data scoping
 */
export const getAllPrescriptions = async (requestingUser, queryParams = {}) => {
  const page = Math.max(1, parseInt(queryParams.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(queryParams.limit) || 10));
  const skip = (page - 1) * limit;

  const filter = {};

  if (requestingUser.role === ROLES.DOCTOR) {
    const doctor = await Doctor.findOne({ userId: requestingUser.id });
    if (!doctor) return { items: [], pagination: { total: 0, page, limit, totalPages: 0, hasNextPage: false, hasPrevPage: false } };
    filter.doctorId = doctor._id;
  } else if (requestingUser.role === ROLES.PATIENT) {
    const patient = await Patient.findOne({ userId: requestingUser.id });
    if (!patient) return { items: [], pagination: { total: 0, page, limit, totalPages: 0, hasNextPage: false, hasPrevPage: false } };
    filter.patientId = patient._id;
  }

  if (queryParams.status) {
    filter.status = queryParams.status;
  }

  if (queryParams.doctorId && requestingUser.role === ROLES.ADMIN) {
    const doctor = await Doctor.findOne({ doctorId: Number(queryParams.doctorId) });
    filter.doctorId = doctor ? doctor._id : null;
  }

  if (queryParams.patientId && (requestingUser.role === ROLES.ADMIN || requestingUser.role === ROLES.DOCTOR)) {
    const patient = await Patient.findOne({ patientId: Number(queryParams.patientId) });
    filter.patientId = patient ? patient._id : null;
  }

  const total = await Prescription.countDocuments(filter);
  const items = await Prescription.find(filter)
    .populate("doctorId", "doctorId name specialization phone email")
    .populate("patientId", "patientId name age gender contact disease")
    .populate("visitId", "visitId createdAt status")
    .populate("createdBy", "name email role")
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
 * Get single prescription by ID with ownership check
 */
export const getPrescriptionById = async (prescriptionId, requestingUser) => {
  const prescription = await Prescription.findOne({ prescriptionId: Number(prescriptionId) })
    .populate("doctorId", "doctorId name specialization phone email userId")
    .populate("patientId", "patientId name age gender contact disease userId")
    .populate("visitId", "visitId createdAt status")
    .populate("createdBy", "name email role");

  if (!prescription) {
    throw new NotFoundError("Prescription not found.");
  }

  if (requestingUser.role === ROLES.DOCTOR) {
    const doctor = await Doctor.findOne({ userId: requestingUser.id });
    if (!doctor || !prescription.doctorId._id.equals(doctor._id)) {
      throw new ForbiddenError("Access denied. You are not the issuing doctor for this prescription.");
    }
  } else if (requestingUser.role === ROLES.PATIENT) {
    const patient = await Patient.findOne({ userId: requestingUser.id });
    if (!patient || !prescription.patientId._id.equals(patient._id)) {
      throw new ForbiddenError("Access denied. You are not authorized to view this prescription.");
    }
  }

  return prescription;
};

/**
 * Dispense items for a prescription and deduct inventory atomically
 */
export const dispensePrescription = async (prescriptionId, dispensePayload = {}, requestingUser) => {
  if (requestingUser.role !== ROLES.ADMIN) {
    throw new ForbiddenError("Only pharmacy administrators can dispense prescriptions.");
  }

  const prescription = await Prescription.findOne({ prescriptionId: Number(prescriptionId) });
  if (!prescription) {
    throw new NotFoundError("Prescription not found.");
  }

  if (prescription.status === PRESCRIPTION_STATUS.DISPENSED) {
    throw new BadRequestError("Prescription has already been fully dispensed.");
  }

  if (prescription.status === PRESCRIPTION_STATUS.CANCELLED) {
    throw new BadRequestError("Cannot dispense a cancelled prescription.");
  }

  const itemsToDispense = dispensePayload.dispenseItems || [];
  const stockDeductions = [];

  try {
    for (const item of prescription.items) {
      const matchedReq = itemsToDispense.find((d) => String(d.medicineId) === String(item.medicineId));
      const qtyToDispense = matchedReq
        ? Number(matchedReq.quantityToDispense)
        : item.quantityPrescribed - item.quantityDispensed;

      if (qtyToDispense <= 0) continue;

      const remainingToPrescribe = item.quantityPrescribed - item.quantityDispensed;
      if (qtyToDispense > remainingToPrescribe) {
        throw new BadRequestError(`Cannot dispense ${qtyToDispense} units for '${item.medicineName}'. Exceeds remaining prescribed quantity (${remainingToPrescribe}).`);
      }

      // Atomic inventory reduction check
      const updatedMedicine = await Medicine.findOneAndUpdate(
        { _id: item.medicineId, stockQuantity: { $gte: qtyToDispense } },
        { $inc: { stockQuantity: -qtyToDispense } },
        { new: true }
      );

      if (!updatedMedicine) {
        throw new BadRequestError(`Insufficient stock in inventory for medicine '${item.medicineName}'. Dispensing aborted.`);
      }

      stockDeductions.push({ medicineId: item.medicineId, quantity: qtyToDispense });
      item.quantityDispensed += qtyToDispense;
    }
  } catch (err) {
    for (const deduction of stockDeductions) {
      await Medicine.updateOne(
        { _id: deduction.medicineId },
        { $inc: { stockQuantity: deduction.quantity } }
      );
    }
    throw err;
  }

  // Update status based on fulfillment progress
  const allFullyDispensed = prescription.items.every((i) => i.quantityDispensed >= i.quantityPrescribed);
  const anyDispensed = prescription.items.some((i) => i.quantityDispensed > 0);

  if (allFullyDispensed) {
    prescription.status = PRESCRIPTION_STATUS.DISPENSED;
    prescription.dispensedAt = new Date();
  } else if (anyDispensed) {
    prescription.status = PRESCRIPTION_STATUS.PARTIALLY_DISPENSED;
  }

  await prescription.save();

  const totalQuantityDispensed = prescription.items.reduce((sum, item) => sum + item.quantityDispensed, 0);

  await createAuditLog({
    actor: { userId: requestingUser.id, role: requestingUser.role },
    action: AUDIT_ACTIONS.PRESCRIPTION_DISPENSED,
    resource: { type: "prescription", id: prescription.prescriptionId },
    metadata: {
      status: prescription.status,
      itemCount: prescription.items.length,
      totalQuantityDispensed,
    },
  });

  return prescription.populate([
    { path: "doctorId", select: "doctorId name specialization" },
    { path: "patientId", select: "patientId name" },
  ]);
};

/**
 * Cancel an unfulfilled prescription
 */
export const cancelPrescription = async (prescriptionId, cancellationReason, requestingUser) => {
  const prescription = await Prescription.findOne({ prescriptionId: Number(prescriptionId) });
  if (!prescription) {
    throw new NotFoundError("Prescription not found.");
  }

  if (requestingUser.role === ROLES.DOCTOR) {
    const doctor = await Doctor.findOne({ userId: requestingUser.id });
    if (!doctor || !prescription.doctorId.equals(doctor._id)) {
      throw new ForbiddenError("Access denied. Only the issuing doctor can cancel this prescription.");
    }
  } else if (requestingUser.role === ROLES.PATIENT) {
    throw new ForbiddenError("Patients cannot cancel prescriptions directly.");
  }

  if (prescription.status === PRESCRIPTION_STATUS.DISPENSED) {
    throw new BadRequestError("Cannot cancel a fully dispensed prescription.");
  }

  if (prescription.status === PRESCRIPTION_STATUS.CANCELLED) {
    throw new BadRequestError("Prescription is already cancelled.");
  }

  prescription.status = PRESCRIPTION_STATUS.CANCELLED;
  prescription.cancellationReason = cancellationReason;
  await prescription.save();

  await createAuditLog({
    actor: { userId: requestingUser.id, role: requestingUser.role },
    action: AUDIT_ACTIONS.PRESCRIPTION_CANCELLED,
    resource: { type: "prescription", id: prescription.prescriptionId },
    metadata: { cancellationReason },
  });

  return prescription.populate([
    { path: "doctorId", select: "doctorId name specialization" },
    { path: "patientId", select: "patientId name" },
  ]);
};
