// features/pharmacy/MedicineInventoryPage.jsx — Pharmacy Medicine Catalog & Inventory Page
import React, { useState, useEffect, useCallback } from "react";
import AppLayout from "../../components/layout/AppLayout";
import StatCard from "../../components/common/StatCard";
import Badge from "../../components/common/Badge";
import EmptyState from "../../components/common/EmptyState";
import Spinner from "../../components/common/Spinner";
import ErrorBanner from "../../components/common/ErrorBanner";
import MedicineModal from "./MedicineModal";
import Modal from "../../components/common/Modal";
import { getMedicinesApi, updateMedicineStockApi } from "../../api/medicine.api";
import { Pill, Plus, Search, Edit3, AlertTriangle, Layers, DollarSign } from "lucide-react";

const MedicineInventoryPage = () => {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [medicines, setMedicines] = useState([]);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [filterForm, setFilterForm] = useState("all");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Modals
  const [isMedicineModalOpen, setIsMedicineModalOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);

  // Quick Stock Adjustment Modal
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [stockAdjustmentMed, setStockAdjustmentMed] = useState(null);
  const [newStockVal, setNewStockVal] = useState(0);
  const [stockSubmitting, setStockSubmitting] = useState(false);

  const fetchCatalog = useCallback(async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const params = { limit: 100 };
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (filterForm !== "all") params.dosageForm = filterForm;

      const res = await getMedicinesApi(params);
      const items = res.data?.items || res.items || res.data || res || [];
      setMedicines(items);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to load medicine inventory catalog.");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filterForm]);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  const stats = {
    total: medicines.length,
    lowStock: medicines.filter((m) => m.stockQuantity <= m.reorderLevel).length,
    outOfStock: medicines.filter((m) => m.stockQuantity === 0).length,
    active: medicines.filter((m) => m.isActive).length,
  };

  const handleOpenAdd = () => {
    setSelectedMedicine(null);
    setIsMedicineModalOpen(true);
  };

  const handleOpenEdit = (med) => {
    setSelectedMedicine(med);
    setIsMedicineModalOpen(true);
  };

  const handleOpenStockAdjust = (med) => {
    setStockAdjustmentMed(med);
    setNewStockVal(med.stockQuantity);
    setStockModalOpen(true);
  };

  const handleSaveStock = async (e) => {
    e.preventDefault();
    if (!stockAdjustmentMed) return;
    setStockSubmitting(true);
    try {
      await updateMedicineStockApi(stockAdjustmentMed.medicineId, Number(newStockVal));
      setStockModalOpen(false);
      fetchCatalog();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to update stock quantity.");
    } finally {
      setStockSubmitting(false);
    }
  };

  const displayedMedicines = medicines.filter((m) => {
    if (showLowStockOnly && m.stockQuantity > m.reorderLevel) return false;
    return true;
  });

  return (
    <AppLayout title="Pharmacy Medicine Inventory Catalog">
      <ErrorBanner message={errorMsg} />

      {/* Metric Cards */}
      <div className="grid grid-4" style={{ gap: "16px", marginBottom: "24px" }}>
        <StatCard
          title="Total Catalog Items"
          value={stats.total}
          icon={Pill}
          variant="primary"
          subtitle="Formulary items"
        />
        <StatCard
          title="Low Stock Alerts"
          value={stats.lowStock}
          icon={AlertTriangle}
          variant="warning"
          subtitle="Below reorder threshold"
        />
        <StatCard
          title="Out of Stock"
          value={stats.outOfStock}
          icon={AlertTriangle}
          variant="danger"
          subtitle="Depleted inventory"
        />
        <StatCard
          title="Active Formulations"
          value={stats.active}
          icon={Layers}
          variant="success"
          subtitle="Prescription ready"
        />
      </div>

      {/* Toolbar & Filters */}
      <div className="card" style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
          {/* Search Box */}
          <div style={{ position: "relative", width: "300px" }}>
            <Search size={16} style={{ position: "absolute", left: "10px", top: "10px", color: "#94a3b8" }} />
            <input
              type="text"
              className="form-control form-control-sm"
              style={{ paddingLeft: "34px" }}
              placeholder="Search Brand or Generic Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Dosage Form Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <select
              className="form-control form-control-sm"
              style={{ width: "160px" }}
              value={filterForm}
              onChange={(e) => setFilterForm(e.target.value)}
            >
              <option value="all">All Dosage Forms</option>
              <option value="tablet">Tablets</option>
              <option value="capsule">Capsules</option>
              <option value="syrup">Syrups</option>
              <option value="injection">Injections</option>
              <option value="ointment">Ointments</option>
              <option value="drops">Drops</option>
            </select>

            <button
              className={`btn btn-sm ${showLowStockOnly ? "btn-warning" : "btn-ghost"}`}
              onClick={() => setShowLowStockOnly(!showLowStockOnly)}
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <AlertTriangle size={14} />
              <span>Low Stock Filter</span>
            </button>

            <button className="btn btn-primary btn-sm" onClick={handleOpenAdd} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Plus size={16} /> Add New Medicine
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      {loading ? (
        <Spinner />
      ) : displayedMedicines.length === 0 ? (
        <EmptyState
          icon={Pill}
          title="No Medicines in Formulary"
          message="No pharmaceutical records found matching the applied search or filter criteria."
        />
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Brand Name</th>
                  <th>Generic Name</th>
                  <th>Form & Strength</th>
                  <th>Unit Price</th>
                  <th>Stock Level</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedMedicines.map((med) => {
                  const isLow = med.stockQuantity <= med.reorderLevel;
                  const isDepleted = med.stockQuantity === 0;

                  return (
                    <tr key={med._id || med.medicineId}>
                      <td style={{ fontWeight: "700", color: "#8b5cf6" }}>#{med.medicineId}</td>
                      <td>
                        <strong style={{ color: "#f8fafc" }}>{med.name}</strong>
                        {med.manufacturer && (
                          <div style={{ fontSize: "11px", color: "#94a3b8" }}>{med.manufacturer}</div>
                        )}
                      </td>
                      <td style={{ fontSize: "13px", color: "#cbd5e1" }}>{med.genericName || "—"}</td>
                      <td>
                        <Badge variant="info">{med.dosageForm}</Badge>
                        <span style={{ fontSize: "12px", marginLeft: "6px", color: "#94a3b8" }}>{med.strength}</span>
                      </td>
                      <td style={{ fontWeight: "600", color: "#10b981" }}>${med.unitPrice?.toFixed(2)}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontWeight: "700", color: isDepleted ? "#ef4444" : isLow ? "#f59e0b" : "#f8fafc" }}>
                            {med.stockQuantity} units
                          </span>
                          {isLow && (
                            <Badge variant={isDepleted ? "danger" : "warning"}>
                              {isDepleted ? "Out of Stock" : "Low Stock"}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td>
                        <Badge variant={med.isActive ? "success" : "danger"}>
                          {med.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "6px" }}>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleOpenStockAdjust(med)}
                            title="Adjust Stock Quantity"
                            style={{ color: "#3b82f6" }}
                          >
                            <DollarSign size={14} /> Stock
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleOpenEdit(med)}
                            title="Edit Details"
                          >
                            <Edit3 size={14} /> Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Medicine Modal */}
      <MedicineModal
        isOpen={isMedicineModalOpen}
        onClose={() => setIsMedicineModalOpen(false)}
        medicine={selectedMedicine}
        onRefresh={fetchCatalog}
      />

      {/* Quick Stock Level Adjust Modal */}
      <Modal isOpen={stockModalOpen} onClose={() => setStockModalOpen(false)} title={`Stock Adjustment — ${stockAdjustmentMed?.name}`} maxWidth="400px">
        <form onSubmit={handleSaveStock}>
          <div style={{ marginBottom: "16px" }}>
            <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "12px" }}>
              Current stock for <strong>{stockAdjustmentMed?.name}</strong> ({stockAdjustmentMed?.strength}): <strong>{stockAdjustmentMed?.stockQuantity} units</strong>.
            </p>
            <label className="form-label">New Total Stock Quantity *</label>
            <input
              type="number"
              min="0"
              className="form-control"
              value={newStockVal}
              onChange={(e) => setNewStockVal(e.target.value)}
              required
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setStockModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={stockSubmitting}>
              {stockSubmitting ? "Updating..." : "Save Stock Adjustment"}
            </button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
};

export default MedicineInventoryPage;
