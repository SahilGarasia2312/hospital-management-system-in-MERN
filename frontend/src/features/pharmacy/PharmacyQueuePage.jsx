// features/pharmacy/PharmacyQueuePage.jsx — Pharmacy Prescription Queue Management Page
import React, { useState, useEffect, useCallback } from "react";
import AppLayout from "../../components/layout/AppLayout";
import StatCard from "../../components/common/StatCard";
import Badge from "../../components/common/Badge";
import EmptyState from "../../components/common/EmptyState";
import Spinner from "../../components/common/Spinner";
import ErrorBanner from "../../components/common/ErrorBanner";
import PrescriptionDetailModal from "./PrescriptionDetailModal";
import { getPrescriptionsApi } from "../../api/prescription.api";
import { Pill, Clock, CheckCircle2, AlertCircle, Eye, Search } from "lucide-react";

const PharmacyQueuePage = () => {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [prescriptions, setPrescriptions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const params = { page: pagination.page, limit: 15 };
      if (statusFilter !== "all") params.status = statusFilter;
      const res = await getPrescriptionsApi(params);

      const items = res.data?.items || res.items || res.data || res || [];
      const pag = res.data?.pagination || res.pagination || { page: 1, totalPages: 1, total: items.length };

      setPrescriptions(items);
      setPagination(pag);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to load prescription queue.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, pagination.page]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  // Statistics calculation from loaded list or defaults
  const stats = {
    issued: prescriptions.filter((p) => p.status === "issued").length,
    partiallyDispensed: prescriptions.filter((p) => p.status === "partially_dispensed").length,
    dispensed: prescriptions.filter((p) => p.status === "dispensed").length,
    cancelled: prescriptions.filter((p) => p.status === "cancelled").length,
  };

  const handleOpenDetail = (p) => {
    setSelectedPrescription(p);
    setIsModalOpen(true);
  };

  const filteredItems = prescriptions.filter((p) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      String(p.prescriptionId).includes(query) ||
      p.patientId?.name?.toLowerCase().includes(query) ||
      p.doctorId?.name?.toLowerCase().includes(query)
    );
  });

  return (
    <AppLayout title="Pharmacy Dispensing Workspace">
      <ErrorBanner message={errorMsg} />

      {/* Metric Cards */}
      <div className="grid grid-4" style={{ gap: "16px", marginBottom: "24px" }}>
        <StatCard
          title="Active Order Queue"
          value={stats.issued}
          icon={Clock}
          variant="primary"
          subtitle="Awaiting fulfillment"
        />
        <StatCard
          title="Partially Dispensed"
          value={stats.partiallyDispensed}
          icon={Pill}
          variant="warning"
          subtitle="Partial stock fulfilled"
        />
        <StatCard
          title="Fully Dispensed"
          value={stats.dispensed}
          icon={CheckCircle2}
          variant="success"
          subtitle="Completed orders"
        />
        <StatCard
          title="Cancelled Orders"
          value={stats.cancelled}
          icon={AlertCircle}
          variant="danger"
          subtitle="Aborted prescriptions"
        />
      </div>

      {/* Toolbar & Filters */}
      <div className="card" style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
          {/* Status Tabs */}
          <div style={{ display: "flex", gap: "8px" }}>
            {[
              { id: "all", label: "All Orders" },
              { id: "issued", label: "Issued (Queue)" },
              { id: "partially_dispensed", label: "Partially Dispensed" },
              { id: "dispensed", label: "Dispensed" },
              { id: "cancelled", label: "Cancelled" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: "500",
                  border: "none",
                  cursor: "pointer",
                  background: statusFilter === tab.id ? "#3b82f6" : "rgba(255, 255, 255, 0.05)",
                  color: statusFilter === tab.id ? "#ffffff" : "#94a3b8",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ position: "relative", width: "260px" }}>
            <Search size={16} style={{ position: "absolute", left: "10px", top: "10px", color: "#94a3b8" }} />
            <input
              type="text"
              className="form-control form-control-sm"
              style={{ paddingLeft: "34px" }}
              placeholder="Search ID, Patient, Doctor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Queue Data Table */}
      {loading ? (
        <Spinner />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={Pill}
          title="No Prescriptions Found"
          message="No medical prescriptions match the selected status or search filter."
        />
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Prescription ID</th>
                  <th>Patient</th>
                  <th>Prescribing Doctor</th>
                  <th>Items</th>
                  <th>Date Issued</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((p) => (
                  <tr key={p._id || p.prescriptionId}>
                    <td style={{ fontWeight: "700", color: "#8b5cf6" }}>#{p.prescriptionId}</td>
                    <td>
                      <div style={{ fontWeight: "600", color: "#f8fafc" }}>{p.patientId?.name || "N/A"}</div>
                      <div style={{ fontSize: "11px", color: "#94a3b8" }}>MRN #{p.patientId?.patientId}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: "600", color: "#f8fafc" }}>Dr. {p.doctorId?.name || "N/A"}</div>
                      <div style={{ fontSize: "11px", color: "#3b82f6" }}>{p.doctorId?.specialization}</div>
                    </td>
                    <td style={{ fontWeight: "600" }}>{p.items?.length || 0} Meds</td>
                    <td style={{ fontSize: "12px", color: "#cbd5e1" }}>
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <Badge variant={p.status === "dispensed" ? "success" : p.status === "cancelled" ? "danger" : p.status === "partially_dispensed" ? "warning" : "primary"}>
                        {p.status}
                      </Badge>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleOpenDetail(p)}
                        style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                      >
                        <Eye size={14} /> View & Dispense
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Prescription Detail & Dispense Modal */}
      <PrescriptionDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        prescription={selectedPrescription}
        onRefresh={fetchQueue}
      />
    </AppLayout>
  );
};

export default PharmacyQueuePage;
