// features/visits/components/SymptomsSection.jsx — Clinical Symptoms Input
import React from "react";
import { ClipboardList } from "lucide-react";

const SymptomsSection = ({ symptoms = "", onChange, isReadOnly }) => {
  return (
    <div className="card" style={{ marginBottom: "20px" }}>
      <div className="card-header" style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--color-border)", paddingBottom: "12px" }}>
        <ClipboardList size={20} color="#f59e0b" />
        <h3 className="card-title">Presented Clinical Symptoms</h3>
      </div>

      <div style={{ marginTop: "16px" }}>
        <label className="form-label">Subjective Symptoms & Patient Complaints *</label>
        <textarea
          className="form-control"
          rows="4"
          placeholder="Describe symptoms, onset, duration, severity, and exacerbating factors..."
          value={symptoms}
          onChange={(e) => onChange(e.target.value)}
          disabled={isReadOnly}
          required
        />
      </div>
    </div>
  );
};

export default SymptomsSection;
