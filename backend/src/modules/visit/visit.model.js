// modules/visit/visit.model.js — Clinical Visit / Encounter Mongoose schema
import mongoose from "mongoose";
import { VISIT_STATUS } from "../../config/constants.js";

const prescriptionSchema = new mongoose.Schema(
  {
    medicineName: {
      type: String,
      required: [true, "Medicine name is required"],
      trim: true,
    },
    dosage: {
      type: String,
      required: [true, "Dosage is required"],
      trim: true,
    },
    frequency: {
      type: String,
      required: [true, "Frequency is required"],
      trim: true,
    },
    duration: {
      type: String,
      required: [true, "Duration is required"],
      trim: true,
    },
  },
  { _id: false }
);

const vitalsSchema = new mongoose.Schema(
  {
    bloodPressure: { type: String, default: "", trim: true },
    heartRate: { type: Number, default: null, min: 0 },
    temperature: { type: Number, default: null, min: 0 },
    weight: { type: Number, default: null, min: 0 },
    height: { type: Number, default: null, min: 0 },
    oxygenSaturation: { type: Number, default: null, min: 0, max: 100 },
  },
  { _id: false }
);

const visitSchema = new mongoose.Schema(
  {
    visitId: {
      type: Number,
      required: [true, "Visit ID is required"],
      unique: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: [true, "Patient reference is required"],
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "Doctor reference is required"],
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      default: null,
    },
    vitals: {
      type: vitalsSchema,
      default: () => ({}),
    },
    symptoms: {
      type: String,
      required: [true, "Symptoms description is required"],
      trim: true,
    },
    diagnosis: {
      type: String,
      default: "",
      trim: true,
    },
    doctorNotes: {
      type: String,
      default: "",
      trim: true,
    },
    prescriptions: {
      type: [prescriptionSchema],
      default: [],
    },
    followUpDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(VISIT_STATUS),
      default: VISIT_STATUS.OPEN,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Unique partial index to ensure at most 1 visit per appointment
visitSchema.index(
  { appointmentId: 1 },
  {
    unique: true,
    partialFilterExpression: { appointmentId: { $ne: null } },
  }
);

// Indexes for EHR patient timeline and doctor activity queries
visitSchema.index({ patientId: 1, createdAt: -1 });
visitSchema.index({ doctorId: 1, createdAt: -1 });

const ClinicalVisit = mongoose.model("ClinicalVisit", visitSchema);
export default ClinicalVisit;
