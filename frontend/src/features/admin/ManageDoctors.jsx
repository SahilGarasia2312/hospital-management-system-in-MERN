// features/admin/ManageDoctors.jsx — Enterprise Clinician Management with Lucide Icons
import React, { useState } from "react";
import AppLayout from "../../components/layout/AppLayout";
import useFetch from "../../hooks/useFetch";
import { getDoctorsApi, deleteDoctorApi } from "../../api/doctor.api";
import Spinner from "../../components/common/Spinner";
import Badge from "../../components/common/Badge";
import { Stethoscope, Plus, Edit2, Trash2, Mail } from "lucide-react";

const ManageDoctors = () => {
  const { data: doctors, loading, refetch } = useFetch(getDoctorsApi);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDelete = async (id) => {
    if (!window.confirm("Confirm deletion: This will remove the physician and cascade delete associated patient records.")) return;
    setDeleteLoading(true);
    try {
      await deleteDoctorApi(id);
      refetch();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove clinician record");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <AppLayout title="Clinician Directory">
      <div className="page-header page-header-row">
        <div>
          <h1>Medical Staff</h1>
          <p>Manage hospital physicians, surgeons, and departmental specializations.</p>
        </div>
        <button className="btn btn-primary" style={{ gap: "8px" }}>
          <Plus size={18} />
          <span>Add Clinician</span>
        </button>
      </div>

      <div className="card">
        {loading ? (
          <Spinner />
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Staff ID</th>
                  <th>Physician Name</th>
                  <th>Department / Specialization</th>
                  <th>Experience</th>
                  <th>Contact Information</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors?.map((doc) => (
                  <tr key={doc._id}>
                    <td><Badge variant="info">#{doc.doctorId}</Badge></td>
                    <td style={{ fontWeight: 600 }}>{doc.name}</td>
                    <td><Badge variant="doctor">{doc.specialization}</Badge></td>
                    <td>{doc.experience} yrs</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
                        <Mail size={14} />
                        <span>{doc.email || "—"}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button className="btn btn-ghost btn-icon" title="Edit Physician" style={{ marginRight: "4px" }}>
                        <Edit2 size={16} />
                      </button>
                      <button 
                        className="btn btn-ghost btn-icon" 
                        style={{ color: "var(--color-danger)" }}
                        onClick={() => handleDelete(doc.doctorId)}
                        disabled={deleteLoading}
                        title="Delete Physician"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {!doctors?.length && (
                  <tr>
                    <td colSpan="6">
                      <div className="empty-state">
                        <div className="empty-state-icon" style={{ display: "flex", justify: "center", color: "var(--color-text-light)" }}>
                          <Stethoscope size={48} />
                        </div>
                        <h3>No physicians registered</h3>
                        <p>Get started by onboarding a new clinical specialist.</p>
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

export default ManageDoctors;
