// features/appointments/AppointmentDetailModal.jsx — Detail view & State Machine Actions
import React, { useState } from "react";
import Modal from "../../components/common/Modal";
import Badge from "../../components/common/Badge";
import ErrorBanner from "../../components/common/ErrorBanner";
import { updateAppointmentStatusApi, cancelAppointmentApi } from "../../api/appointment.api";
import useAuth from "../../hooks/useAuth";
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  PlayCircle,
} from "lucide-react";

const STATUS_VARIANTS = {
  scheduled: "info",
  confirmed: "primary",
  checked_in: "warning",
  in_consultation: "primary",
  completed: "success",
  cancelled: "danger",
  no_show: "danger",
};

const AppointmentDetailModal = ({ isOpen, onClose, appointment, onRefresh }) => {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [showCancelInput, setShowCancelInput] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  if (!appointment) return null;

  const handleStatusChange = async (newStatus) => {
    setSubmitting(true);
    setErrorMsg("");
    try {
      await updateAppointmentStatusApi(appointment.appointmentId, newStatus);
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to update status");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (e) => {
    e.preventDefault();
    if (!cancellationReason.trim()) {
      setErrorMsg("Cancellation reason is required.");
      return;
    }
    setSubmitting(true);
    setErrorMsg("");
    try {
      await cancelAppointmentApi(appointment.appointmentId, cancellationReason);
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to cancel appointment");
    } finally {
      setSubmitting(false);
    }
  };

  const isStaff = user?.role === "admin" || user?.role === "doctor";
  const status = appointment.status;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Appointment #${appointment.appointmentId}`} maxWidth="580px">
      <ErrorBanner message={errorMsg} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <Badge variant={STATUS_VARIANTS[status] || "primary"} dot>
            {status?.toUpperCase().replace("_", " ")}
          </Badge>
        </div>
        <div style={{ fontSize: "13px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "6px" }}>
          <Clock size={14} />
          <span>{appointment.durationMinutes || 30} mins</span>
        </div>
      </div>

      <div className="grid grid-2" style={{ gap: "16px", marginBottom: "20px" }}>
        {/* Doctor Info */}
        <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "14px", borderRadius: "10px" }}>
          <span style={{ fontSize: "12px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px" }}>
            <Stethoscope size={14} /> Doctor
          </span>
          <strong style={{ display: "block", color: "#f8fafc", marginTop: "4px", fontSize: "14px" }}>
            Dr. {appointment.doctorId?.name || "N/A"}
          </strong>
          <span style={{ fontSize: "12px", color: "#3b82f6" }}>
            {appointment.doctorId?.specialization}
          </span>
        </div>

        {/* Patient Info */}
        <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "14px", borderRadius: "10px" }}>
          <span style={{ fontSize: "12px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px" }}>
            <User size={14} /> Patient
          </span>
          <strong style={{ display: "block", color: "#f8fafc", marginTop: "4px", fontSize: "14px" }}>
            {appointment.patientId?.name || "N/A"}
          </strong>
          <span style={{ fontSize: "12px", color: "#94a3b8" }}>
            MRN: #{appointment.patientId?.patientId}
          </span>
        </div>
      </div>

      {/* Date & Time */}
      <div style={{ marginBottom: "16px", background: "rgba(255, 255, 255, 0.02)", padding: "12px 16px", borderRadius: "8px" }}>
        <span style={{ fontSize: "12px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "6px" }}>
          <Calendar size={14} /> Date & Scheduled Time
        </span>
        <div style={{ color: "#f8fafc", fontWeight: "600", fontSize: "15px", marginTop: "4px" }}>
          {new Date(appointment.appointmentDate).toLocaleString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>

      {/* Reason */}
      <div style={{ marginBottom: "16px" }}>
        <span style={{ fontSize: "12px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px" }}>
          <FileText size={14} /> Reason for Appointment
        </span>
        <p style={{ color: "#e2e8f0", fontSize: "14px", marginTop: "4px", margin: 0, lineHeight: 1.5 }}>
          {appointment.reason}
        </p>
      </div>

      {/* Notes */}
      {appointment.notes && (
        <div style={{ marginBottom: "16px" }}>
          <span style={{ fontSize: "12px", color: "#94a3b8" }}>Clinical Notes</span>
          <p style={{ color: "#94a3b8", fontSize: "13px", marginTop: "4px", margin: 0 }}>{appointment.notes}</p>
        </div>
      )}

      {/* Cancellation Reason if cancelled */}
      {status === "cancelled" && appointment.cancellationReason && (
        <div style={{ padding: "12px", borderRadius: "8px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", marginBottom: "20px" }}>
          <strong style={{ color: "#f87171", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
            <AlertTriangle size={14} /> Cancellation Reason:
          </strong>
          <p style={{ color: "#f87171", fontSize: "13px", margin: "4px 0 0 0" }}>{appointment.cancellationReason}</p>
        </div>
      )}

      {/* Action Buttons based on State Machine & Role */}
      {status !== "completed" && status !== "cancelled" && status !== "no_show" && (
        <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
          {showCancelInput ? (
            <form onSubmit={handleCancel}>
              <div style={{ marginBottom: "12px" }}>
                <label className="form-label">Reason for Cancellation *</label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Provide reason for cancelling this appointment..."
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowCancelInput(false)}>
                  Back
                </button>
                <button type="submit" className="btn btn-danger btn-sm" disabled={submitting}>
                  {submitting ? "Cancelling..." : "Confirm Cancellation"}
                </button>
              </div>
            </form>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "flex-end" }}>
              {/* Doctor / Admin State Transitions */}
              {isStaff && status === "scheduled" && (
                <button className="btn btn-primary btn-sm" onClick={() => handleStatusChange("confirmed")} disabled={submitting}>
                  <CheckCircle size={14} /> Confirm Appointment
                </button>
              )}
              {isStaff && status === "confirmed" && (
                <button className="btn btn-warning btn-sm" onClick={() => handleStatusChange("checked_in")} disabled={submitting}>
                  <User size={14} /> Patient Checked In
                </button>
              )}
              {isStaff && status === "checked_in" && (
                <button className="btn btn-primary btn-sm" onClick={() => handleStatusChange("in_consultation")} disabled={submitting}>
                  <PlayCircle size={14} /> Start Consultation
                </button>
              )}
              {isStaff && status === "in_consultation" && (
                <button className="btn btn-success btn-sm" onClick={() => handleStatusChange("completed")} disabled={submitting}>
                  <CheckCircle size={14} /> Complete Visit
                </button>
              )}

              {/* Clinical Encounter Launch Button */}
              {isStaff && ["confirmed", "checked_in", "in_consultation"].includes(status) && (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)" }}
                  onClick={() => {
                    onClose();
                    window.location.href = `/doctor/encounters/new?appointmentId=${appointment.appointmentId}`;
                  }}
                >
                  <Stethoscope size={14} /> Open Clinical Encounter
                </button>
              )}

              {/* Cancellation trigger allowed for all roles on active appointments */}
              <button type="button" className="btn btn-outline btn-sm" style={{ color: "#ef4444", borderColor: "rgba(239, 68, 68, 0.4)" }} onClick={() => setShowCancelInput(true)} disabled={submitting}>
                <XCircle size={14} /> Cancel Appointment
              </button>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default AppointmentDetailModal;
