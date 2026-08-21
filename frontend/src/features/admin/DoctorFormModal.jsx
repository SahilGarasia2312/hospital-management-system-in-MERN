import React, { useState, useEffect } from "react";
import { createDoctorApi, updateDoctorApi } from "../../api/doctor.api";
import { X } from "lucide-react";

const DoctorFormModal = ({ isOpen, onClose, mode, initialData, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    specialization: "",
    experience: 0,
    phone: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const specializations = [
    "Cardiology",
    "Cardiologist",
    "Neurology",
    "Neurologist",
    "Dermatology",
    "Dermatologist",
    "Pediatrics",
    "Pediatrician",
    "Orthopedics",
    "Orthopedic",
    "Oncology",
    "Oncologist",
    "Psychiatry",
    "Psychiatrist",
    "General Practice",
    "General Physician",
  ];

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && initialData) {
        setFormData({
          name: initialData.name || "",
          specialization: initialData.specialization || "",
          experience: initialData.experience || 0,
          phone: initialData.phone || "",
          email: initialData.email || "",
        });
      } else {
        setFormData({
          name: "",
          specialization: "",
          experience: 0,
          phone: "",
          email: "",
        });
      }
      setError("");
    }
  }, [isOpen, mode, initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      ...formData,
      experience: Number(formData.experience),
    };

    console.log("Submit Doctor Form Payload:", payload);

    try {
      if (mode === "edit") {
        await updateDoctorApi(initialData.doctorId, payload);
      } else {
        await createDoctorApi(payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Submit Doctor Error Details:", err.response?.data || err.message);
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
          <h2>{mode === "edit" ? "Edit Clinician" : "Add Clinician"}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={20} /></button>
        </div>

        {error && <div style={{ color: "var(--color-danger)", marginBottom: "16px", padding: "10px", backgroundColor: "#fee2e2", borderRadius: "4px" }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "14px", fontWeight: "600", color: "var(--color-text)" }}>Name</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required 
              style={inputStyle} 
              placeholder="e.g. Dr. Sarah Connor"
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "14px", fontWeight: "600", color: "var(--color-text)" }}>Specialization</label>
            <select 
              name="specialization" 
              value={formData.specialization} 
              onChange={handleChange} 
              required 
              style={inputStyle}
            >
              <option value="">Select Department</option>
              {specializations.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "14px", fontWeight: "600", color: "var(--color-text)" }}>Experience (Years)</label>
            <input 
              type="number" 
              name="experience" 
              value={formData.experience} 
              onChange={handleChange} 
              required 
              min="0"
              style={inputStyle} 
            />
          </div>

          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
              <label style={{ fontSize: "14px", fontWeight: "600", color: "var(--color-text)" }}>Email</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                style={inputStyle} 
                placeholder="doctor@hpms.com"
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
              <label style={{ fontSize: "14px", fontWeight: "600", color: "var(--color-text)" }}>Phone</label>
              <input 
                type="text" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                style={inputStyle} 
                placeholder="+1 234 567 890"
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Save Clinician"}
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
  width: "100%", maxWidth: "500px",
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

export default DoctorFormModal;
