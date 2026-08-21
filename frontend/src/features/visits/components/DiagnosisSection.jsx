// features/visits/components/DiagnosisSection.jsx — Clinical Diagnosis & Physician Notes
import React from "react";
import { FileText, AlertCircle } from "lucide-react";

const DiagnosisSection = ({ diagnosis = "", doctorNotes = "", onDiagnosisChange, onNotesChange, isReadOnly, validationError }) => {
  return (
    <div className="card" style={{ marginBottom: "20px" }}>
      <div className="card-header" style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--color-border)", paddingBottom: "12px" }}>
        <FileText size={20} color="#10b981" />
        <h3 className="card-title">Clinical Assessment & Diagnosis</h3>
      </div>

      <div style={{ marginTop: "16px" }}>
        <label className="form-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Primary Diagnosis / Assessment *</span>
          <span style={{ fontSize: "12px", color: "#f59e0b", fontWeight: "500" }}>Mandatory for Completion</span>
        </label>
        <textarea
          className="form-control"
          rows="3"
          placeholder="Enter conclusive clinical diagnosis, ICD-10 assessment, or impression..."
          value={diagnosis}
          onChange={(e) => onDiagnosisChange(e.target.value)}
          disabled={isReadOnly}
          style={{ borderColor: validationError ? "#ef4444" : undefined }}
        />

        {validationError && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#f87171", fontSize: "13px", marginTop: "6px" }}>
            <AlertCircle size={16} />
            <span>Diagnosis is required before completing this clinical encounter.</span>
          </div>
        )}

        <div style={{ marginTop: "16px" }}>
          <label className="form-label">Physician Clinical Progress Notes</label>
          <textarea
            className="form-control"
            rows="3"
            placeholder="Additional treatment plan, recommended follow-up, diet instructions, or clinical observations..."
            value={doctorNotes}
            onChange={(e) => onNotesChange(e.target.value)}
            disabled={isReadOnly}
          />
        </div>
      </div>
    </div>
  );
};

export default DiagnosisSection;
