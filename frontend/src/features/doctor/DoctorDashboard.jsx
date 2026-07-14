// features/doctor/DoctorDashboard.jsx — Clinician Workspace with Lucide Icons
import React from "react";
import AppLayout from "../../components/layout/AppLayout";
import useFetch from "../../hooks/useFetch";
import { getPatientsApi } from "../../api/patient.api";
import Spinner from "../../components/common/Spinner";
import Badge from "../../components/common/Badge";
import useAuth from "../../hooks/useAuth";
import { ClipboardList, Phone, FileText, CheckCircle, Clock } from "lucide-react";

const DoctorDashboard = () => {
  const { user } = useAuth();
  // Doctor backend only returns patients assigned to their physician ID
  const { data: patients, loading } = useFetch(getPatientsApi);

  return (
    <AppLayout title="Clinician Workspace">
      <div className="page-header">
        <h1>Welcome, {user?.name}</h1>
        <p>Department of Cardiology & General Medicine — Assigned Patient Roster</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Assigned Inpatient & Outpatient Cases</h3>
          <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
            Total Assigned: <strong>{patients?.length || 0}</strong>
          </span>
        </div>
        
        {loading ? (
          <Spinner />
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>MRN / ID</th>
                  <th>Patient Name</th>
                  <th>Primary Diagnosis</th>
                  <th>Admission Type</th>
                  <th>Contact Information</th>
                  <th style={{ textAlign: "right" }}>Clinical Actions</th>
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
                    <td style={{ textAlign: "right" }}>
                      <button className="btn btn-outline btn-sm" style={{ gap: "6px" }}>
                        <FileText size={14} />
                        <span>Update Chart</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {!patients?.length && (
                  <tr>
                    <td colSpan="6">
                      <div className="empty-state">
                        <div className="empty-state-icon" style={{ display: "flex", justify: "center", color: "var(--color-text-light)" }}>
                          <ClipboardList size={48} />
                        </div>
                        <h3>No patients assigned</h3>
                        <p>You currently have no active patient admissions in your clinical roster.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default DoctorDashboard;
