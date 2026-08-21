// features/visits/components/VitalsSection.jsx — Clinical Vitals Monitoring & Entry
import React from "react";
import { Activity, Heart, Thermometer, Weight, Ruler, Percent } from "lucide-react";

const VitalsSection = ({ vitals = {}, onChange, isReadOnly }) => {
  const handleInputChange = (field, value) => {
    if (isReadOnly) return;
    onChange({
      ...vitals,
      [field]: value === "" ? "" : isNaN(value) ? value : Number(value),
    });
  };

  return (
    <div className="card" style={{ marginBottom: "20px" }}>
      <div className="card-header" style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--color-border)", paddingBottom: "12px" }}>
        <Activity size={20} color="#3b82f6" />
        <h3 className="card-title">Patient Vital Signs Telemetry</h3>
      </div>

      <div className="grid grid-3" style={{ gap: "16px", marginTop: "16px" }}>
        {/* Blood Pressure */}
        <div>
          <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Activity size={14} color="#94a3b8" />
            <span>Blood Pressure (mmHg)</span>
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. 120/80"
            value={vitals.bloodPressure || ""}
            onChange={(e) => onChange({ ...vitals, bloodPressure: e.target.value })}
            disabled={isReadOnly}
          />
        </div>

        {/* Heart Rate */}
        <div>
          <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Heart size={14} color="#ef4444" />
            <span>Heart Rate (bpm)</span>
          </label>
          <input
            type="number"
            className="form-control"
            placeholder="e.g. 72"
            min="0"
            max="300"
            value={vitals.heartRate !== null && vitals.heartRate !== undefined ? vitals.heartRate : ""}
            onChange={(e) => handleInputChange("heartRate", e.target.value)}
            disabled={isReadOnly}
          />
        </div>

        {/* Temperature */}
        <div>
          <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Thermometer size={14} color="#f59e0b" />
            <span>Body Temp (°F)</span>
          </label>
          <input
            type="number"
            step="0.1"
            className="form-control"
            placeholder="e.g. 98.6"
            min="0"
            value={vitals.temperature !== null && vitals.temperature !== undefined ? vitals.temperature : ""}
            onChange={(e) => handleInputChange("temperature", e.target.value)}
            disabled={isReadOnly}
          />
        </div>

        {/* Weight */}
        <div>
          <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Weight size={14} color="#10b981" />
            <span>Weight (kg)</span>
          </label>
          <input
            type="number"
            step="0.1"
            className="form-control"
            placeholder="e.g. 70"
            min="0"
            value={vitals.weight !== null && vitals.weight !== undefined ? vitals.weight : ""}
            onChange={(e) => handleInputChange("weight", e.target.value)}
            disabled={isReadOnly}
          />
        </div>

        {/* Height */}
        <div>
          <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Ruler size={14} color="#8b5cf6" />
            <span>Height (cm)</span>
          </label>
          <input
            type="number"
            className="form-control"
            placeholder="e.g. 175"
            min="0"
            value={vitals.height !== null && vitals.height !== undefined ? vitals.height : ""}
            onChange={(e) => handleInputChange("height", e.target.value)}
            disabled={isReadOnly}
          />
        </div>

        {/* Oxygen Saturation */}
        <div>
          <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Percent size={14} color="#06b6d4" />
            <span>Oxygen Saturation (%)</span>
          </label>
          <input
            type="number"
            className="form-control"
            placeholder="e.g. 98"
            min="0"
            max="100"
            value={vitals.oxygenSaturation !== null && vitals.oxygenSaturation !== undefined ? vitals.oxygenSaturation : ""}
            onChange={(e) => handleInputChange("oxygenSaturation", e.target.value)}
            disabled={isReadOnly}
          />
        </div>
      </div>
    </div>
  );
};

export default VitalsSection;
