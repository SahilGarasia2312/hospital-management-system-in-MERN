// features/patient/PatientDashboard.jsx — Patient Portal with Lucide Icons
import React from "react";
import AppLayout from "../../components/layout/AppLayout";
import useFetch from "../../hooks/useFetch";
import { getPatientsApi } from "../../api/patient.api";
import Spinner from "../../components/common/Spinner";
import Badge from "../../components/common/Badge";
import useAuth from "../../hooks/useAuth";
import { 
  FileText, 
  Stethoscope, 
  Pill, 
  Activity, 
  CheckCircle2, 
  ShieldAlert 
} from "lucide-react";

const PatientDashboard = () => {
  const { user } = useAuth();
  // Backend returns only records belonging to this authenticated user
  const { data: records, loading } = useFetch(getPatientsApi);

  return (
    <AppLayout title="My Health Portal">
      <div className="page-header">
        <h1>Patient Medical Chart</h1>
        <p>Welcome back, {user?.name}. Review your clinical consultations, diagnoses, and discharge summaries.</p>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="grid grid-2">
          {records?.map((record) => (
            <div key={record._id} className="card animate-slide-up">
              <div className="card-header" style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <FileText size={20} color="var(--color-primary)" />
                  <h3 className="card-title">Encounter Record #{record.patientId}</h3>
                </div>
                <Badge variant={record.admissionStatus === "Indoor" ? "warning" : "success"}>
                  {record.admissionStatus === "Indoor" ? "Inpatient Admission" : "Outpatient Visit"}
                </Badge>
              </div>
              
              <div className="grid grid-2" style={{ gap: "var(--space-4)", margin: "var(--space-4) 0" }}>
                <div>
                  <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <Activity size={14} color="var(--color-text-muted)" />
                    <span>Diagnosis / Condition</span>
                  </label>
                  <p style={{ fontWeight: 600, color: "var(--color-text)", fontSize: "0.9375rem" }}>
                    {record.disease}
                  </p>
                </div>

                <div>
                  <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <Stethoscope size={14} color="var(--color-text-muted)" />
                    <span>Attending Physician</span>
                  </label>
                  <p style={{ fontWeight: 500, color: "var(--color-text)" }}>
                    {record.doctorId?.name || "Not assigned"}
                  </p>
                </div>

                <div style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Reported Symptoms</label>
                  <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", background: "var(--color-surface-2)", padding: "10px 12px", borderRadius: "var(--radius-sm)" }}>
                    {record.symptoms || "No specific symptoms documented."}
                  </p>
                </div>

                <div style={{ gridColumn: "span 2" }}>
                  <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <Pill size={14} color="var(--color-primary)" />
                    <span>Prescribed Medications & Regimen</span>
                  </label>
                  <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--color-primary-dark)", background: "var(--color-primary-50)", padding: "10px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-primary-light)" }}>
                    {record.medicinePrescribed || "No pharmacological therapy prescribed."}
                  </p>
                </div>
              </div>

              {record.releasingSummary && (
                <div style={{ padding: "var(--space-4)", background: "var(--color-bg)", borderRadius: "var(--radius-md)", marginTop: "12px" }}>
                  <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--color-text)" }}>
                    <CheckCircle2 size={16} color="var(--color-success)" />
                    <span>Physician Discharge Summary</span>
                  </label>
                  <p style={{ fontSize: "0.875rem", color: "var(--color-text)", marginTop: "4px", lineHeight: 1.5 }}>
                    {record.releasingSummary}
                  </p>
                </div>
              )}
            </div>
          ))}

          {!records?.length && (
            <div className="card" style={{ gridColumn: "span 2" }}>
              <div className="empty-state">
                <div className="empty-state-icon" style={{ display: "flex", justify: "center", color: "var(--color-text-light)" }}>
                  <ShieldAlert size={48} />
                </div>
                <h3>No medical records on file</h3>
                <p>You have no past admissions, prescriptions, or clinical encounter histories documented.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
};

export default PatientDashboard;
