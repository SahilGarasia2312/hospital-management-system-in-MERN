// modules/appointment/appointment.model.js — Appointment Mongoose schema
import mongoose from "mongoose";
import { APPOINTMENT_STATUS } from "../../config/constants.js";

const appointmentSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: Number,
      required: [true, "Appointment ID is required"],
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
    appointmentDate: {
      type: Date,
      required: [true, "Appointment date and time are required"],
    },
    durationMinutes: {
      type: Number,
      default: 30,
      min: [15, "Duration must be at least 15 minutes"],
      max: [120, "Duration cannot exceed 120 minutes"],
    },
    reason: {
      type: String,
      required: [true, "Reason for appointment is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(APPOINTMENT_STATUS),
      default: APPOINTMENT_STATUS.SCHEDULED,
    },
    cancellationReason: {
      type: String,
      default: "",
      trim: true,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator reference is required"],
    },
  },
  { timestamps: true }
);

// Compound partial unique index to prevent double booking active slots
appointmentSchema.index(
  { doctorId: 1, appointmentDate: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: {
        $in: [
          APPOINTMENT_STATUS.SCHEDULED,
          APPOINTMENT_STATUS.CONFIRMED,
          APPOINTMENT_STATUS.CHECKED_IN,
          APPOINTMENT_STATUS.IN_CONSULTATION,
        ],
      },
    },
  }
);

// Indexes for common query patterns
appointmentSchema.index({ patientId: 1, appointmentDate: -1 });
appointmentSchema.index({ doctorId: 1, status: 1, appointmentDate: 1 });

const Appointment = mongoose.model("Appointment", appointmentSchema);
export default Appointment;
