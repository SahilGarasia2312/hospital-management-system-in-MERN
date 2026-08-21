// features/appointments/AppointmentModal.jsx — Scheduling Form Modal
import React, { useState, useEffect } from "react";
import Modal from "../../components/common/Modal";
import ErrorBanner from "../../components/common/ErrorBanner";
import { createAppointmentApi } from "../../api/appointment.api";
import { getDoctorsApi } from "../../api/doctor.api";
import { getPatientsApi } from "../../api/patient.api";
import useAuth from "../../hooks/useAuth";

const AppointmentModal = ({ isOpen, onClose, onSuccess, initialDate }) => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const [formData, setFormData] = useState({
    doctorId: "",
    patientId: "",
    appointmentDate: "",
    durationMinutes: 30,
    reason: "",
    notes: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setLoadingOptions(true);
      setErrorMsg("");
      setFieldErrors([]);

      // Preset appointmentDate if passed
      const defaultDate = initialDate ? new Date(initialDate) : new Date();
      // Format to datetime-local (YYYY-MM-DDTHH:mm)
      const offset = defaultDate.getTimezoneOffset() * 60000;
      const localISOTime = new Date(defaultDate.getTime() - offset).toISOString().slice(0, 16);

      setFormData({
        doctorId: user?.role === "doctor" && user?.linkedId ? user.linkedId : "",
        patientId: user?.role === "patient" && user?.linkedId ? user.linkedId : "",
        appointmentDate: localISOTime,
        durationMinutes: 30,
        reason: "",
        notes: "",
      });

      Promise.all([
        getDoctorsApi().catch(() => ({ data: [] })),
        getPatientsApi().catch(() => ({ data: [] })),
      ])
        .then(([docRes, patRes]) => {
          setDoctors(docRes.data || docRes || []);
          setPatients(patRes.data || patRes || []);
        })
        .finally(() => setLoadingOptions(false));
    }
  }, [isOpen, initialDate, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    setFieldErrors([]);

    try {
      // Convert datetime-local to ISO string
      const isoDate = new Date(formData.appointmentDate).toISOString();

      await createAppointmentApi({
        doctorId: Number(formData.doctorId),
        patientId: Number(formData.patientId),
        appointmentDate: isoDate,
        durationMinutes: Number(formData.durationMinutes),
        reason: formData.reason,
        notes: formData.notes || "",
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      const resp = err.response?.data;
      if (err.response?.status === 409) {
        setErrorMsg("This appointment slot is no longer available. Please select another time slot or physician.");
      } else if (resp) {
        setErrorMsg(resp.message || "Failed to schedule appointment");
        setFieldErrors(resp.errors || []);
      } else {
        setErrorMsg("Network or server error while scheduling appointment");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Schedule New Appointment" maxWidth="560px">
      <ErrorBanner message={errorMsg} errors={fieldErrors} />

      <form onSubmit={handleSubmit}>
        <div className="grid grid-2" style={{ gap: "16px", marginBottom: "16px" }}>
          {/* Doctor Selector */}
          <div>
            <label className="form-label">Doctor *</label>
            <select
              name="doctorId"
              className="form-control"
              value={formData.doctorId}
              onChange={handleChange}
              required
              disabled={loadingOptions || submitting}
            >
              <option value="">-- Select Doctor --</option>
              {doctors.map((doc) => (
                <option key={doc._id} value={doc.doctorId}>
                  Dr. {doc.name} ({doc.specialization})
                </option>
              ))}
            </select>
          </div>

          {/* Patient Selector */}
          <div>
            <label className="form-label">Patient *</label>
            <select
              name="patientId"
              className="form-control"
              value={formData.patientId}
              onChange={handleChange}
              required
              disabled={loadingOptions || submitting}
            >
              <option value="">-- Select Patient --</option>
              {patients.map((pat) => (
                <option key={pat._id} value={pat.patientId}>
                  #{pat.patientId} — {pat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-2" style={{ gap: "16px", marginBottom: "16px" }}>
          {/* Date & Time */}
          <div>
            <label className="form-label">Date & Time *</label>
            <input
              type="datetime-local"
              name="appointmentDate"
              className="form-control"
              value={formData.appointmentDate}
              onChange={handleChange}
              required
              disabled={submitting}
            />
          </div>

          {/* Duration */}
          <div>
            <label className="form-label">Duration (Minutes)</label>
            <select
              name="durationMinutes"
              className="form-control"
              value={formData.durationMinutes}
              onChange={handleChange}
              disabled={submitting}
            >
              <option value={15}>15 mins</option>
              <option value={30}>30 mins</option>
              <option value={45}>45 mins</option>
              <option value={60}>60 mins</option>
            </select>
          </div>
        </div>

        {/* Reason */}
        <div style={{ marginBottom: "16px" }}>
          <label className="form-label">Reason for Visit *</label>
          <textarea
            name="reason"
            className="form-control"
            rows="3"
            placeholder="e.g. Routine cardiology consultation, chest discomfort"
            value={formData.reason}
            onChange={handleChange}
            required
            minLength={3}
            maxLength={500}
            disabled={submitting}
          />
        </div>

        {/* Notes */}
        <div style={{ marginBottom: "24px" }}>
          <label className="form-label">Clinical Notes (Optional)</label>
          <input
            type="text"
            name="notes"
            className="form-control"
            placeholder="Additional preparation instructions or notes"
            value={formData.notes}
            onChange={handleChange}
            disabled={submitting}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Scheduling..." : "Confirm Scheduling"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AppointmentModal;
