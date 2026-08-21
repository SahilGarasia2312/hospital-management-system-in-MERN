// modules/medicine/medicine.model.js — Medicine master catalog schema
import mongoose from "mongoose";
import { DOSAGE_FORMS } from "../../config/constants.js";

const medicineSchema = new mongoose.Schema(
  {
    medicineId: {
      type: Number,
      required: [true, "Medicine ID is required"],
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Medicine name is required"],
      trim: true,
      index: true,
    },
    genericName: {
      type: String,
      trim: true,
      default: "",
    },
    dosageForm: {
      type: String,
      required: [true, "Dosage form is required"],
      enum: DOSAGE_FORMS,
    },
    strength: {
      type: String,
      required: [true, "Strength is required"],
      trim: true,
    },
    manufacturer: {
      type: String,
      trim: true,
      default: "",
    },
    unitPrice: {
      type: Number,
      required: [true, "Unit price is required"],
      min: [0, "Unit price cannot be negative"],
    },
    stockQuantity: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock quantity cannot be negative"],
      default: 0,
    },
    reorderLevel: {
      type: Number,
      default: 10,
      min: [0, "Reorder level cannot be negative"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Compound unique index for drug uniqueness
medicineSchema.index({ name: 1, strength: 1, dosageForm: 1 }, { unique: true });

const Medicine = mongoose.model("Medicine", medicineSchema);
export default Medicine;
