// features/admin/ManagePatients.jsx — Enterprise Patient Records with Lucide Icons
import React, { useState } from "react";
import AppLayout from "../../components/layout/AppLayout";
import useFetch from "../../hooks/useFetch";
import { getPatientsApi, deletePatientApi } from "../../api/patient.api";
import Spinner from "../../components/common/Spinner";
import Badge from "../../components/common/Badge";
import { Users, Plus, Eye, Trash2, Stethoscope } from "lucide-react";
import PatientFormModal from "./PatientFormModal";
import PatientViewModal from "./PatientViewModal";

const ManagePatients = () => {
  const { data: patients, loading, refetch } = useFetch(getPatientsApi);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm("Confirm deletion: Are you sure you want to permanently delete this patient record?")) return;
    try {
      await deletePatientApi(id);
      refetch();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove patient record");
    }
  };

  const handleOpenRegister = () => {
    setIsFormModalOpen(true);
  };

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setIsViewModalOpen(true);
  };

  return (
    <AppLayout title="Patient Master Index">
      <div className="page-header page-header-row">
        <div>
          <h1>Patient Registry</h1>
          <p>Centralized database of inpatient admissions and outpatient visits.</p>
        </div>
        <button className="btn btn-primary" style={{ gap: "8px" }} onClick={handleOpenRegister}>
          <Plus size={18} />
          <span>Register Patient</span>
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
                  <th>MRN / ID</th>
                  <th>Patient Name</th>
                  <th>Primary Diagnosis</th>
                  <th>Status</th>
                  <th>Attending Physician</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
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
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Stethoscope size={14} color="var(--color-primary)" />
                        <span>{pat.doctorId?.name || "Unassigned"}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button 
                        className="btn btn-ghost btn-icon" 
                        title="View Chart" 
                        style={{ marginRight: "4px" }}
                        onClick={() => handleViewPatient(pat)}
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        className="btn btn-ghost btn-icon" 
                        style={{ color: "var(--color-danger)" }}
                        onClick={() => handleDelete(pat.patientId)}
                        title="Delete Record"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {!patients?.length && (
                  <tr>
                    <td colSpan="6">
                      <div className="empty-state">
                        <div className="empty-state-icon" style={{ display: "flex", justify: "center", color: "var(--color-text-light)" }}>
                          <Users size={48} />
                        </div>
                        <h3>No patient records found</h3>
                        <p>No hospital admissions or consultations are currently recorded.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <PatientFormModal 
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={refetch}
      />
      
      <PatientViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        patient={selectedPatient}
      />
    </AppLayout>
  );
};

export default ManagePatients;
