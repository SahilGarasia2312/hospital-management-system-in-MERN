// modules/audit/audit.model.js — Immutable enterprise audit trail Mongoose schema
import mongoose from "mongoose";
import { AUDIT_ACTIONS } from "../../config/constants.js";

const auditLogSchema = new mongoose.Schema(
  {
    auditId: {
      type: Number,
      required: [true, "Audit ID is required"],
      unique: true,
    },
    actor: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      role: {
        type: String,
        required: [true, "Actor role is required"],
      },
    },
    action: {
      type: String,
      required: [true, "Audit action is required"],
      enum: Object.values(AUDIT_ACTIONS),
    },
    resource: {
      type: {
        type: String,
        required: [true, "Resource type is required"],
      },
      id: {
        type: String,
        required: [true, "Resource ID is required"],
      },
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Append-only immutable log
  }
);

// Indexes optimized for common audit queries
auditLogSchema.index({ createdAt: -1 }); // Recent system activity query
auditLogSchema.index({ "actor.userId": 1, createdAt: -1 }); // Activity by specific user/actor
auditLogSchema.index({ "resource.type": 1, "resource.id": 1, createdAt: -1 }); // History for specific domain entity
auditLogSchema.index({ action: 1, createdAt: -1 }); // Filter by audit action type

const AuditLog = mongoose.model("AuditLog", auditLogSchema);
export default AuditLog;
