// features/admin/AdminDashboard.jsx — Enterprise Admin Dashboard with Real Backend Integration
import React from "react";
import AppLayout from "../../components/layout/AppLayout";
import StatCard from "../../components/common/StatCard";
import useFetch from "../../hooks/useFetch";
import { getDoctorStatsApi } from "../../api/doctor.api";
import { getPatientStatsApi } from "../../api/patient.api";
import { getAppointmentsApi } from "../../api/appointment.api";
import Spinner from "../../components/common/Spinner";
import Badge from "../../components/common/Badge";
import { Link } from "react-router-dom";
import {
  Stethoscope,
  Users,
  Building2,
  Calendar,
  FileSpreadsheet,
  ArrowRight,
} from "lucide-react";

const AdminDashboard = () => {
  const { data: docStats, loading: docLoading } = useFetch(getDoctorStatsApi);
  const { data: patStats, loading: patLoading } = useFetch(getPatientStatsApi);
  const { data: apptData, loading: apptLoading } = useFetch(() => getAppointmentsApi({ limit: 5 }));

  const loading = docLoading || patLoading || apptLoading;
  const recentAppointments = apptData?.data || apptData || [];
  const totalAppointments = apptData?.pagination?.total || recentAppointments.length;

  if (loading) return <AppLayout title="Admin Dashboard"><Spinner /></AppLayout>;

  return (
    <AppLayout title="Admin Control Panel">
      <div className="page-header">
        <h1>Executive Overview</h1>
        <p>Real-time hospital administration telemetry, clinical roster, and scheduling metrics.</p>
      </div>

      <div className="grid grid-4" style={{ marginBottom: "var(--space-8)" }}>
        <StatCard
          icon={Stethoscope}
          value={docStats?.total || 0}
          title="Active Clinicians"
          color="#0f766e"
          subtitle={`${docStats?.bySpecialization?.length || 0} departments`}
        />
        <StatCard
          icon={Users}
          value={patStats?.total || 0}
          title="Total Patients"
          color="#3b82f6"
          subtitle="Registered medical records"
        />
        <StatCard
          icon={Building2}
          value={patStats?.indoor || 0}
          title="Admitted Inpatients"
          color="#f59e0b"
          subtitle="Hospital bed census"
        />
        <StatCard
          icon={Calendar}
          value={totalAppointments}
          title="Total Appointments"
          color="#8b5cf6"
          subtitle="Scheduled & completed"
        />
      </div>

      <div className="grid grid-2" style={{ gap: "24px", marginBottom: "24px" }}>
        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Administrative Actions</h3>
          </div>
          <div className="grid grid-3" style={{ gap: "12px" }}>
            <Link
              to="/admin/doctors"
              className="btn btn-primary"
              style={{ height: "100px", flexDirection: "column", gap: "8px", textDecoration: "none", justifyContent: "center" }}
            >
              <Stethoscope size={24} />
              <span>Clinicians</span>
            </Link>
            <Link
              to="/admin/patients"
              className="btn btn-secondary"
              style={{ height: "100px", flexDirection: "column", gap: "8px", textDecoration: "none", justifyContent: "center" }}
            >
              <Users size={24} />
              <span>Patients</span>
            </Link>
            <Link
              to="/admin/appointments"
              className="btn btn-outline"
              style={{ height: "100px", flexDirection: "column", gap: "8px", textDecoration: "none", justifyContent: "center" }}
            >
              <Calendar size={24} />
              <span>Schedule</span>
            </Link>
          </div>
        </div>

        {/* Doctors by Department */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Department Census</h3>
            <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
              <FileSpreadsheet size={14} />
              <span>Active Allocation</span>
            </span>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Specialization</th>
                  <th style={{ textAlign: "right" }}>Active Staff</th>
                </tr>
              </thead>
              <tbody>
                {docStats?.bySpecialization?.map((spec, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{spec._id}</td>
                    <td style={{ textAlign: "right", fontWeight: "600", color: "var(--color-primary)" }}>
                      {spec.count}
                    </td>
                  </tr>
                ))}
                {!docStats?.bySpecialization?.length && (
                  <tr>
                    <td colSpan="2" className="empty-state">
                      No clinical departments recorded
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Appointments Stream */}
      <div className="card">
        <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 className="card-title">Recent Appointment Activity</h3>
          <Link to="/admin/appointments" style={{ color: "#3b82f6", textDecoration: "none", fontSize: "13px", display: "flex", alignItems: "center", gap: "4px" }}>
            <span>View Full Calendar</span>
            <ArrowRight size={14} />
          </Link>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Patient</th>
                <th>Physician</th>
                <th>Scheduled Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentAppointments.slice(0, 5).map((app) => (
                <tr key={app._id}>
                  <td><Badge variant="info">#{app.appointmentId}</Badge></td>
                  <td style={{ fontWeight: 600 }}>{app.patientId?.name || "N/A"}</td>
                  <td>Dr. {app.doctorId?.name || "N/A"}</td>
                  <td>
                    {new Date(app.appointmentDate).toLocaleString("en-US", {
                      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                    })}
                  </td>
                  <td>
                    <Badge variant={app.status === "completed" ? "success" : app.status === "cancelled" ? "danger" : "primary"}>
                      {app.status}
                    </Badge>
                  </td>
                </tr>
              ))}
              {recentAppointments.length === 0 && (
                <tr>
                  <td colSpan="5" className="empty-state">
                    No recent appointments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminDashboard;
