// features/visits/components/PatientClinicalHeader.jsx — Patient & Appointment Context Header
import React from "react";
import Badge from "../../../components/common/Badge";
import { User, Stethoscope, Calendar, Clock, FileText } from "lucide-react";

const PatientClinicalHeader = ({ patient, doctor, appointment, visitStatus }) => {
  return (
    <div className="card" style={{ marginBottom: "20px", background: "linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "16px" }}>
        {/* Patient Summary */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(59, 130, 246, 0.15)", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <User size={26} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#f8fafc", margin: 0 }}>
                {patient?.name || "Patient"}
              </h2>
              <Badge variant="info">MRN #{patient?.patientId}</Badge>
              <Badge variant={patient?.admissionStatus === "Indoor" ? "warning" : "success"}>
                {patient?.admissionStatus === "Indoor" ? "Inpatient" : "Outpatient"}
              </Badge>
            </div>
            <p style={{ fontSize: "13px", color: "#94a3b8", margin: "4px 0 0 0" }}>
              Age: <strong>{patient?.age || "N/A"}</strong> | Gender: <strong>{patient?.gender || "N/A"}</strong> | Condition: <strong>{patient?.disease || "General"}</strong>
            </p>
          </div>
        </div>

        {/* Visit Status Badge */}
        <div>
          <Badge variant={visitStatus === "completed" ? "success" : "primary"} dot>
            {visitStatus === "completed" ? "COMPLETED ENCOUNTER" : "ACTIVE CONSULTATION"}
          </Badge>
        </div>
      </div>

      {/* Appointment Scoping Subheader */}
      {appointment && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", paddingTop: "14px", fontSize: "13px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#94a3b8" }}>
            <Stethoscope size={16} color="#3b82f6" />
            <span>Physician: <strong style={{ color: "#f8fafc" }}>Dr. {doctor?.name || appointment?.doctorId?.name}</strong></span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#94a3b8" }}>
            <Calendar size={16} color="#3b82f6" />
            <span>Date: <strong style={{ color: "#f8fafc" }}>{new Date(appointment.appointmentDate).toLocaleDateString()}</strong></span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#94a3b8" }}>
            <Clock size={16} color="#3b82f6" />
            <span>Status: <strong style={{ color: "#f8fafc", textTransform: "capitalize" }}>{appointment.status}</strong></span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#94a3b8", gridColumn: "span 2" }}>
            <FileText size={16} color="#3b82f6" />
            <span>Chief Complaint: <strong style={{ color: "#f8fafc" }}>{appointment.reason}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientClinicalHeader;
