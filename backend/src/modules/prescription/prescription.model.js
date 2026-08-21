// modules/prescription/prescription.model.js — Prescription fulfillment order Mongoose schema
import mongoose from "mongoose";
import { PRESCRIPTION_STATUS } from "../../config/constants.js";

const prescriptionItemSchema = new mongoose.Schema(
  {
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medicine",
      required: [true, "Medicine reference is required"],
    },
    medicineName: {
      type: String,
      required: [true, "Medicine name snapshot is required"],
    },
    strength: {
      type: String,
      required: [true, "Medicine strength snapshot is required"],
    },
    dosageForm: {
      type: String,
      required: [true, "Medicine dosage form snapshot is required"],
    },
    unitPrice: {
      type: Number,
      required: [true, "Medicine unit price snapshot is required"],
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
    instructions: {
      type: String,
      default: "",
      trim: true,
    },
    quantityPrescribed: {
      type: Number,
      required: [true, "Quantity prescribed is required"],
      min: [1, "Quantity prescribed must be at least 1"],
    },
    quantityDispensed: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  { _id: true }
);

const prescriptionSchema = new mongoose.Schema(
  {
    prescriptionId: {
      type: Number,
      required: [true, "Prescription ID is required"],
      unique: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: [true, "Patient reference is required"],
      index: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "Doctor reference is required"],
      index: true,
    },
    visitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClinicalVisit",
      default: null,
      index: true,
    },
    items: {
      type: [prescriptionItemSchema],
      required: [true, "Prescription items are required"],
      validate: [(v) => Array.isArray(v) && v.length > 0, "Prescription must contain at least one medicine item"],
    },
    status: {
      type: String,
      enum: Object.values(PRESCRIPTION_STATUS),
      default: PRESCRIPTION_STATUS.ISSUED,
      index: true,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    cancellationReason: {
      type: String,
      default: "",
      trim: true,
    },
    dispensedAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator reference is required"],
    },
  },
  { timestamps: true }
);

prescriptionSchema.index({ patientId: 1, createdAt: -1 });
prescriptionSchema.index({ doctorId: 1, status: 1, createdAt: -1 });

const Prescription = mongoose.model("Prescription", prescriptionSchema);
export default Prescription;
