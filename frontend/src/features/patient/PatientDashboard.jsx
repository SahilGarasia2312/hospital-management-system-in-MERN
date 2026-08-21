// features/patient/PatientDashboard.jsx — Patient Health Portal with Timeline & Appointments
import React from "react";
import AppLayout from "../../components/layout/AppLayout";
import useFetch from "../../hooks/useFetch";
import { getPatientsApi, getPatientTimelineApi } from "../../api/patient.api";
import { getAppointmentsApi } from "../../api/appointment.api";
import Spinner from "../../components/common/Spinner";
import Badge from "../../components/common/Badge";
import useAuth from "../../hooks/useAuth";
import { Link } from "react-router-dom";
import {
  FileText,
  Stethoscope,
  Pill,
  Activity,
  Calendar,
  Clock,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

const PatientDashboard = () => {
  const { user } = useAuth();
  const { data: records, loading: patLoading } = useFetch(getPatientsApi);
  const { data: apptData, loading: apptLoading } = useFetch(() => getAppointmentsApi({ limit: 5 }));

  const loading = patLoading || apptLoading;
  const appointments = apptData?.data || apptData || [];
  const patientRecord = records?.[0];

  const { data: timelineData } = useFetch(() =>
    patientRecord ? getPatientTimelineApi(patientRecord.patientId) : Promise.resolve(null)
  );

  const timelineEvents = timelineData?.data?.timeline || [];

  return (
    <AppLayout title="My Health Portal">
      <div className="page-header">
        <h1>Patient Health Portal</h1>
        <p>Welcome back, {user?.name}. Manage your appointments and longitudinal medical record timeline.</p>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <>
          {/* Upcoming Appointments Card */}
          <div className="card" style={{ marginBottom: "24px" }}>
            <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Calendar size={20} color="#3b82f6" />
                <h3 className="card-title">My Appointments</h3>
              </div>
              <Link to="/patient/appointments" style={{ color: "#3b82f6", textDecoration: "none", fontSize: "13px", display: "flex", alignItems: "center", gap: "4px" }}>
                <span>Schedule / View Calendar</span>
                <ArrowRight size={14} />
              </Link>
            </div>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Physician</th>
                    <th>Reason</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.slice(0, 3).map((app) => (
                    <tr key={app._id}>
                      <td style={{ fontWeight: 600, color: "#f8fafc" }}>
                        {new Date(app.appointmentDate).toLocaleString("en-US", {
                          month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                        })}
                      </td>
                      <td>Dr. {app.doctorId?.name || "N/A"}</td>
                      <td style={{ color: "#94a3b8" }}>{app.reason}</td>
                      <td>
                        <Badge variant={app.status === "completed" ? "success" : app.status === "cancelled" ? "danger" : "primary"}>
                          {app.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {appointments.length === 0 && (
                    <tr>
                      <td colSpan="4" className="empty-state">
                        You have no upcoming appointments scheduled.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Longitudinal Health Records & Medical History */}
          <div className="grid grid-2" style={{ gap: "24px" }}>
            {/* Active Encounter Card */}
            {records?.map((record) => (
              <div key={record._id} className="card">
                <div className="card-header" style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <FileText size={20} color="var(--color-primary)" />
                    <h3 className="card-title">Medical Record #{record.patientId}</h3>
                  </div>
                  <Badge variant={record.admissionStatus === "Indoor" ? "warning" : "success"}>
                    {record.admissionStatus === "Indoor" ? "Inpatient" : "Outpatient"}
                  </Badge>
                </div>

                <div className="grid grid-2" style={{ gap: "var(--space-4)", margin: "var(--space-4) 0" }}>
                  <div>
                    <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Activity size={14} color="var(--color-text-muted)" />
                      <span>Diagnosis</span>
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
                    <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Pill size={14} color="var(--color-primary)" />
                      <span>Prescribed Medication</span>
                    </label>
                    <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--color-primary-dark)", background: "var(--color-primary-50)", padding: "10px 12px", borderRadius: "var(--radius-sm)" }}>
                      {record.medicinePrescribed || "No active prescription."}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Medical Record Timeline */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Timeline Events (Patient 360°)</h3>
              </div>
              <div style={{ padding: "8px 0" }}>
                {timelineEvents.map((evt, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      gap: "12px",
                      paddingBottom: "16px",
                      marginBottom: "16px",
                      borderBottom: idx === timelineEvents.length - 1 ? "none" : "1px solid rgba(255, 255, 255, 0.05)",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background: evt.eventType === "appointment" ? "rgba(59, 130, 246, 0.15)" : evt.eventType === "visit" ? "rgba(16, 185, 129, 0.15)" : "rgba(139, 92, 246, 0.15)",
                        color: evt.eventType === "appointment" ? "#3b82f6" : evt.eventType === "visit" ? "#10b981" : "#8b5cf6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {evt.eventType === "appointment" && <Calendar size={18} />}
                      {evt.eventType === "visit" && <Stethoscope size={18} />}
                      {evt.eventType === "prescription" && <Pill size={18} />}
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <strong style={{ fontSize: "14px", color: "#f8fafc", textTransform: "capitalize" }}>
                          {evt.eventType} #{evt.eventId}
                        </strong>
                        <Badge variant={evt.status === "completed" || evt.status === "dispensed" ? "success" : "primary"}>
                          {evt.status}
                        </Badge>
                      </div>
                      <span style={{ fontSize: "12px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                        <Clock size={12} />
                        {new Date(evt.occurredAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                ))}
                {timelineEvents.length === 0 && (
                  <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0, textAlign: "center", padding: "20px" }}>
                    No timeline history recorded.
                  </p>
                )}
              </div>
            </div>

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
        </>
      )}
    </AppLayout>
  );
};

export default PatientDashboard;
