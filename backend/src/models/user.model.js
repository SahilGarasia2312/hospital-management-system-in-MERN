// models/user.model.js — User schema for authentication
// feature: Supports 3 roles (admin, doctor, patient) linked to their respective records
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { ROLES } from "../config/constants.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      // Never return password in API responses
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: [true, "Role is required"],
    },
    // Links this User to their Doctor or Patient document (for role-specific data)
    linkedId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "linkedModel",
      default: null,
    },
    linkedModel: {
      type: String,
      enum: ["Doctor", "Patient", null],
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Pre-save hook: hash the password before saving to DB
// This runs automatically on create() and save()
userSchema.pre("save", async function () {
  // Only hash if password was modified (avoids re-hashing on unrelated updates)
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

/**
 * Instance method: comparePassword
 * Compares a plain-text password with the stored hash.
 * Used in auth.service.js during login.
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
