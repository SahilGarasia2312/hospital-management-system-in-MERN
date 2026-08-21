// features/doctor/DoctorDashboard.jsx — Clinician Workspace with Real Appointment Stream
import React from "react";
import AppLayout from "../../components/layout/AppLayout";
import StatCard from "../../components/common/StatCard";
import useFetch from "../../hooks/useFetch";
import { getPatientsApi } from "../../api/patient.api";
import { getAppointmentsApi } from "../../api/appointment.api";
import Spinner from "../../components/common/Spinner";
import Badge from "../../components/common/Badge";
import useAuth from "../../hooks/useAuth";
import { Link } from "react-router-dom";
import { ClipboardList, Phone, Calendar, Users, ArrowRight } from "lucide-react";

const DoctorDashboard = () => {
  const { user } = useAuth();
  const { data: patients, loading: patLoading } = useFetch(getPatientsApi);
  const { data: apptData, loading: apptLoading } = useFetch(() => getAppointmentsApi({ limit: 10 }));

  const loading = patLoading || apptLoading;
  const appointments = apptData?.data || apptData || [];

  const todayStr = new Date().toISOString().split("T")[0];
  const todayAppointments = appointments.filter(
    (a) => new Date(a.appointmentDate).toISOString().split("T")[0] === todayStr
  );

  return (
    <AppLayout title="Clinician Workspace">
      <div className="page-header">
        <h1>Welcome, Dr. {user?.name}</h1>
        <p>Department of Cardiology & General Medicine — Operational Telemetry & Active Patients</p>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <>
          <div className="grid grid-3" style={{ gap: "20px", marginBottom: "24px" }}>
            <StatCard
              icon={Users}
              value={patients?.length || 0}
              title="Assigned Patients"
              color="#3b82f6"
              subtitle="Active medical records"
            />
            <StatCard
              icon={Calendar}
              value={todayAppointments.length}
              title="Today's Consultations"
              color="#f59e0b"
              subtitle="Scheduled for today"
            />
            <StatCard
              icon={ClipboardList}
              value={appointments.filter((a) => a.status === "completed").length}
              title="Completed Visits"
              color="#10b981"
              subtitle="Total encounters concluded"
            />
          </div>

          {/* Today's Schedule Stream */}
          <div className="card" style={{ marginBottom: "24px" }}>
            <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 className="card-title">Today's Appointment Schedule</h3>
              <Link to="/doctor/appointments" style={{ color: "#3b82f6", textDecoration: "none", fontSize: "13px", display: "flex", alignItems: "center", gap: "4px" }}>
                <span>Open Calendar View</span>
                <ArrowRight size={14} />
              </Link>
            </div>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Patient Name</th>
                    <th>Reason for Visit</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.slice(0, 5).map((app) => (
                    <tr key={app._id}>
                      <td style={{ fontWeight: 600, color: "#3b82f6" }}>
                        {new Date(app.appointmentDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td style={{ fontWeight: 600 }}>{app.patientId?.name || "Patient"}</td>
                      <td style={{ color: "#94a3b8", fontSize: "13px" }}>{app.reason}</td>
                      <td>
                        <Badge variant={app.status === "completed" ? "success" : app.status === "cancelled" ? "danger" : "primary"}>
                          {app.status}
                        </Badge>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <Link to="/doctor/appointments" className="btn btn-outline btn-sm">
                          View Slot
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {appointments.length === 0 && (
                    <tr>
                      <td colSpan="5" className="empty-state">
                        No appointments scheduled for today.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Assigned Patients Table */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Assigned Clinical Roster</h3>
              <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
                Total Assigned: <strong>{patients?.length || 0}</strong>
              </span>
            </div>

            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>MRN / ID</th>
                    <th>Patient Name</th>
                    <th>Primary Condition</th>
                    <th>Admission Type</th>
                    <th>Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {patients?.map((pat) => (
                    <tr key={pat._id}>
                      <td><Badge variant="info">#{pat.patientId}</Badge></td>
                      <td style={{ fontWeight: 600 }}>{pat.name}</td>
                      <td>{pat.disease}</td>
                      <td>
                        <Badge variant={pat.admissionStatus === "Indoor" ? "warning" : "success"}>
                          {pat.admissionStatus === "Indoor" ? "Inpatient" : "Outpatient"}
                        </Badge>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
                          <Phone size={14} />
                          <span>{pat.contact || "—"}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!patients?.length && (
                    <tr>
                      <td colSpan="5">
                        <div className="empty-state">
                          <h3>No patients assigned</h3>
                          <p>You currently have no active patient admissions in your clinical roster.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </AppLayout>
  );
};

export default DoctorDashboard;
