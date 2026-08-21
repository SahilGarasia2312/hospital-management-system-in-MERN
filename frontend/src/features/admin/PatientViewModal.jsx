import React from "react";
import { X } from "lucide-react";
import Badge from "../../components/common/Badge";

const PatientViewModal = ({ isOpen, onClose, patient }) => {
  if (!isOpen || !patient) return null;

  return (
    <div className="modal-overlay" style={overlayStyle}>
      <div className="modal-content card" style={modalStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2>Patient Chart: #{patient.patientId}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={20} /></button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <span style={labelStyle}>Full Name</span>
              <div style={valueStyle}>{patient.name}</div>
            </div>
            <div>
              <span style={labelStyle}>Age / Gender</span>
              <div style={valueStyle}>{patient.age || "N/A"} / {patient.gender || "N/A"}</div>
            </div>
            <div>
              <span style={labelStyle}>Contact Number</span>
              <div style={valueStyle}>{patient.contact || "N/A"}</div>
            </div>
            <div>
              <span style={labelStyle}>Status</span>
              <div style={valueStyle}>
                <Badge variant={patient.admissionStatus === "Indoor" ? "warning" : "success"}>
                  {patient.admissionStatus === "Indoor" ? "Inpatient" : "Outpatient"}
                </Badge>
              </div>
            </div>
          </div>

          <hr style={{ borderTop: "1px solid var(--color-border)", margin: "8px 0" }} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <span style={labelStyle}>Primary Diagnosis</span>
              <div style={valueStyle}>{patient.disease}</div>
            </div>
            <div>
              <span style={labelStyle}>Attending Physician</span>
              <div style={valueStyle}>{patient.doctorId?.name || "Unassigned"}</div>
            </div>
          </div>

          <div>
            <span style={labelStyle}>Symptoms</span>
            <div style={valueStyle}>{patient.symptoms || "None recorded"}</div>
          </div>
          
          <div>
            <span style={labelStyle}>Medicine Prescribed</span>
            <div style={valueStyle}>{patient.medicinePrescribed || "None recorded"}</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <span style={labelStyle}>Admission Date</span>
              <div style={valueStyle}>{patient.admittedDate ? new Date(patient.admittedDate).toLocaleDateString() : "N/A"}</div>
            </div>
            <div>
              <span style={labelStyle}>Discharge Date</span>
              <div style={valueStyle}>{patient.releasingDate ? new Date(patient.releasingDate).toLocaleDateString() : "N/A"}</div>
            </div>
          </div>

          <div>
            <span style={labelStyle}>Discharge Summary</span>
            <div style={valueStyle}>{patient.releasingSummary || "N/A"}</div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
          <button type="button" className="btn btn-primary" onClick={onClose}>Close Chart</button>
        </div>
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

const labelStyle = {
  fontSize: "12px",
  fontWeight: "600",
  color: "var(--color-text-muted)",
  textTransform: "uppercase",
  display: "block",
  marginBottom: "4px"
};

const valueStyle = {
  fontSize: "15px",
  color: "var(--color-text)",
  fontWeight: "500"
};

export default PatientViewModal;
