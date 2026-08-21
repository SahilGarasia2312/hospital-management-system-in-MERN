import React, { useState, useEffect } from "react";
import { createPatientApi } from "../../api/patient.api";
import { getDoctorsApi } from "../../api/doctor.api";
import { X } from "lucide-react";
import useFetch from "../../hooks/useFetch";

const PatientFormModal = ({ isOpen, onClose, onSuccess }) => {
  const { data: doctors } = useFetch(getDoctorsApi);

  const [formData, setFormData] = useState({
    doctorId: "",
    name: "",
    disease: "",
    admissionStatus: "Indoor",
    age: "",
    gender: "Male",
    contact: "",
    symptoms: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setFormData({
        doctorId: "",
        name: "",
        disease: "",
        admissionStatus: "Indoor",
        age: "",
        gender: "Male",
        contact: "",
        symptoms: "",
      });
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = { ...formData };
    if (payload.age) payload.age = Number(payload.age);
    if (payload.doctorId) payload.doctorId = Number(payload.doctorId);

    try {
      await createPatientApi(payload);
      onSuccess();
      onClose();
    } catch (err) {
      const errMsgs = err.response?.data?.errors;
      if (errMsgs && Array.isArray(errMsgs)) {
        setError(errMsgs.join(", "));
      } else {
        setError(err.response?.data?.message || "Operation failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={overlayStyle}>
      <div className="modal-content card" style={modalStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2>Register Patient</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={20} /></button>
        </div>

        {error && <div style={{ color: "var(--color-danger)", marginBottom: "16px", padding: "10px", backgroundColor: "#fee2e2", borderRadius: "4px" }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 2 }}>
              <label style={{ fontSize: "14px", fontWeight: "600", color: "var(--color-text)" }}>Patient Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required style={inputStyle} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
              <label style={{ fontSize: "14px", fontWeight: "600", color: "var(--color-text)" }}>Age</label>
              <input type="number" name="age" value={formData.age} onChange={handleChange} min="0" style={inputStyle} />
            </div>
          </div>

          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
              <label style={{ fontSize: "14px", fontWeight: "600", color: "var(--color-text)" }}>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} style={inputStyle}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
              <label style={{ fontSize: "14px", fontWeight: "600", color: "var(--color-text)" }}>Contact Number</label>
              <input type="text" name="contact" value={formData.contact} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "14px", fontWeight: "600", color: "var(--color-text)" }}>Assign Doctor *</label>
            <select name="doctorId" value={formData.doctorId} onChange={handleChange} required style={inputStyle}>
              <option value="">Select Attending Physician</option>
              {doctors?.map(doc => (
                <option key={doc._id} value={doc.doctorId}>{doc.name} ({doc.specialization})</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
              <label style={{ fontSize: "14px", fontWeight: "600", color: "var(--color-text)" }}>Primary Diagnosis *</label>
              <input type="text" name="disease" value={formData.disease} onChange={handleChange} required style={inputStyle} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
              <label style={{ fontSize: "14px", fontWeight: "600", color: "var(--color-text)" }}>Admission Status *</label>
              <select name="admissionStatus" value={formData.admissionStatus} onChange={handleChange} required style={inputStyle}>
                <option value="Indoor">Indoor (Inpatient)</option>
                <option value="Outdoor">Outdoor (Outpatient)</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "14px", fontWeight: "600", color: "var(--color-text)" }}>Symptoms</label>
            <input type="text" name="symptoms" value={formData.symptoms} onChange={handleChange} style={inputStyle} />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Registering..." : "Register Patient"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const overlayStyle = {
  position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex", justifyContent: "center", alignItems: "center",
  zIndex: 1000
};

const modalStyle = {
  width: "100%", maxWidth: "600px",
  padding: "24px",
  maxHeight: "90vh",
  overflowY: "auto"
};

const inputStyle = {
  padding: "10px",
  border: "1px solid var(--color-border)",
  borderRadius: "6px",
  fontSize: "14px",
  width: "100%",
  boxSizing: "border-box"
};

export default PatientFormModal;
