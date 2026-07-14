// features/admin/AdminDashboard.jsx — Enterprise Admin Dashboard with Lucide Icons
import React from "react";
import AppLayout from "../../components/layout/AppLayout";
import StatCard from "../../components/ui/StatCard";
import useFetch from "../../hooks/useFetch";
import { getDoctorStatsApi } from "../../api/doctor.api";
import { getPatientStatsApi } from "../../api/patient.api";
import Spinner from "../../components/common/Spinner";
import { Link } from "react-router-dom";
import { 
  Stethoscope, 
  Users, 
  Building2, 
  UserCheck, 
  FileSpreadsheet
} from "lucide-react";

const AdminDashboard = () => {
  const { data: docStats, loading: docLoading } = useFetch(getDoctorStatsApi);
  const { data: patStats, loading: patLoading } = useFetch(getPatientStatsApi);

  if (docLoading || patLoading) return <AppLayout title="Admin Dashboard"><Spinner /></AppLayout>;

  return (
    <AppLayout title="Admin Control Panel">
      <div className="page-header">
        <h1>Executive Overview</h1>
        <p>Real-time hospital administration telemetry and department metrics.</p>
      </div>

      <div className="grid grid-4" style={{ marginBottom: "var(--space-8)" }}>
        <StatCard
          icon={<Stethoscope size={24} color="#0f766e" />}
          value={docStats?.total || 0}
          label="Active Clinicians"
          iconBg="var(--color-primary-light)"
          trend="2% this month"
          trendDir="up"
        />
        <StatCard
          icon={<Users size={24} color="#1d4ed8" />}
          value={patStats?.total || 0}
          label="Total Patients"
          iconBg="var(--color-info-bg)"
          trend="8% this week"
          trendDir="up"
        />
        <StatCard
          icon={<Building2 size={24} color="#b45309" />}
          value={patStats?.indoor || 0}
          label="Admitted (Inpatient)"
          iconBg="var(--color-warning-bg)"
        />
        <StatCard
          icon={<UserCheck size={24} color="#15803d" />}
          value={patStats?.outdoor || 0}
          label="Outpatient Census"
          iconBg="var(--color-success-bg)"
        />
      </div>

      <div className="grid grid-2">
        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Administrative Actions</h3>
          </div>
          <div className="grid grid-2">
            <Link 
              to="/admin/doctors" 
              className="btn btn-primary" 
              style={{ height: "110px", flexDirection: "column", gap: "10px", textDecoration: "none" }}
            >
              <Stethoscope size={28} />
              <span>Manage Clinicians</span>
            </Link>
            <Link 
              to="/admin/patients" 
              className="btn btn-outline" 
              style={{ height: "110px", flexDirection: "column", gap: "10px", textDecoration: "none" }}
            >
              <Users size={28} />
              <span>Manage Patients</span>
            </Link>
          </div>
        </div>

        {/* Doctors by Department */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Department Allocation</h3>
            <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
              <FileSpreadsheet size={14} />
              <span>Live Census</span>
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
    </AppLayout>
  );
};

export default AdminDashboard;
