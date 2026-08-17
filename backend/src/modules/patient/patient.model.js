// modules/patient/patient.model.js — Patient Mongoose schema (moved from /model/Patient.js)
// improvement: Added age, gender, contact, symptoms fields; added timestamps
import mongoose from "mongoose";
import { ADMISSION_STATUS } from "../../config/constants.js";

const patientSchema = new mongoose.Schema(
  {
    patientId: {
      type: Number,
      required: [true, "Patient ID is required"],
      unique: true,
    },
    // Reference to the Doctor document by ObjectId
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "Doctor assignment is required"],
    },
    // Reference to User account for patient login
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    name: {
      type: String,
      required: [true, "Patient name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters long"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    age: {
      type: Number,
      min: [0, "Age cannot be negative"],
      default: null,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: "Male",
    },
    contact: {
      type: String,
      trim: true,
      default: "",
    },
    disease: {
      type: String,
      required: [true, "Disease is required"],
      trim: true,
    },
    symptoms: {
      type: String,
      default: "",
    },
    medicinePrescribed: {
      type: String,
      default: "",
    },
    admissionStatus: {
      type: String,
      enum: Object.values(ADMISSION_STATUS),
      required: [true, "Admission status is required"],
    },
    admittedDate: {
      type: Date,
      default: null,
    },
    releasingDate: {
      type: Date,
      default: null,
    },
    releasingSummary: {
      type: String,
      default: "",
    },
  },
  { timestamps: true } // improvement: adds createdAt, updatedAt automatically
);

const Patient = mongoose.model("Patient", patientSchema);
export default Patient;
