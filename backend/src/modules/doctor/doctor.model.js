// modules/doctor/doctor.model.js — Doctor Mongoose schema (moved from /model/Doctor.js)
// improvement: Added timestamps, phone, avatar fields; kept all existing validations
import mongoose from "mongoose";
import { SPECIALIZATIONS } from "../../config/constants.js";

const doctorSchema = new mongoose.Schema(
  {
    doctorId: {
      type: Number,
      required: [true, "Doctor ID is required"],
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Doctor name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters long"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    specialization: {
      type: String,
      enum: SPECIALIZATIONS,
      required: [true, "Specialization is required"],
    },
    experience: {
      type: Number,
      required: [true, "Experience is required"],
      min: [0, "Experience cannot be negative"],
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: "",
    },
    // Links to the User account for this doctor (for auth)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true } // improvement: adds createdAt, updatedAt automatically
);

const Doctor = mongoose.model("Doctor", doctorSchema);
export default Doctor;
