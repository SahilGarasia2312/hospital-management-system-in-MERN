// features/visits/components/PrescriptionSection.jsx — Prescription Builder & Issuance Interface
import React, { useState, useEffect, useCallback } from "react";
import Badge from "../../../components/common/Badge";
import ErrorBanner from "../../../components/common/ErrorBanner";
import { getMedicinesApi } from "../../../api/medicine.api";
import { createPrescriptionApi, getPrescriptionsApi } from "../../../api/prescription.api";
import { Pill, Search, Plus, Trash2, CheckCircle2 } from "lucide-react";

const PrescriptionSection = ({ doctorId, patientId, visitId, isReadOnly }) => {
  const [issuedPrescriptions, setIssuedPrescriptions] = useState([]);

  // Search & Selector State
  const [searchQuery, setSearchQuery] = useState("");
  const [medicineCatalog, setMedicineCatalog] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);

  // Item Form State
  const [itemForm, setItemForm] = useState({
    dosage: "1 tablet",
    frequency: "Twice daily after meals",
    duration: "5 days",
    quantityPrescribed: 10,
    instructions: "Take with water",
  });

  // Builder Cart
  const [prescriptionItems, setPrescriptionItems] = useState([]);
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Load existing prescriptions linked to this visit
  const fetchPrescriptionHistory = useCallback(async () => {
    if (!visitId) return;
    try {
      const res = await getPrescriptionsApi({ patientId });
      const items = res.data || res || [];
      // Filter linked to this numeric visit ID if populated
      const linked = items.filter((p) => p.visitId?.visitId === Number(visitId) || p.visitId === Number(visitId));
      setIssuedPrescriptions(linked);
    } catch {
      // Ignore initial load error
    }
  }, [visitId, patientId]);

  useEffect(() => {
    fetchPrescriptionHistory();
  }, [fetchPrescriptionHistory]);

  // Search medicines with debouncing
  useEffect(() => {
    if (!searchQuery.trim()) {
      setMedicineCatalog([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await getMedicinesApi({ search: searchQuery.trim(), limit: 10 });
        setMedicineCatalog(res.data || res || []);
      } catch {
        setMedicineCatalog([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectMedicine = (med) => {
    setSelectedMedicine(med);
    setSearchQuery("");
    setMedicineCatalog([]);
  };

  const handleAddItem = () => {
    if (!selectedMedicine) {
      setErrorMsg("Please select a medicine from catalog.");
      return;
    }
    if (Number(itemForm.quantityPrescribed) <= 0) {
      setErrorMsg("Quantity prescribed must be at least 1.");
      return;
    }

    const newItem = {
      medicineId: selectedMedicine.medicineId,
      medicineName: selectedMedicine.name,
      strength: selectedMedicine.strength,
      dosageForm: selectedMedicine.dosageForm,
      unitPrice: selectedMedicine.unitPrice,
      stockQuantity: selectedMedicine.stockQuantity,
      dosage: itemForm.dosage,
      frequency: itemForm.frequency,
      duration: itemForm.duration,
      quantityPrescribed: Number(itemForm.quantityPrescribed),
      instructions: itemForm.instructions,
    };

    setPrescriptionItems((prev) => [...prev, newItem]);
    setSelectedMedicine(null);
    setErrorMsg("");
  };

  const handleRemoveItem = (index) => {
    setPrescriptionItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleIssuePrescription = async (e) => {
    e.preventDefault();
    if (prescriptionItems.length === 0) {
      setErrorMsg("Prescription must contain at least one medicine item.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await createPrescriptionApi({
        doctorId: Number(doctorId),
        patientId: Number(patientId),
        visitId: Number(visitId),
        notes,
        items: prescriptionItems.map((item) => ({
          medicineId: item.medicineId,
          dosage: item.dosage,
          frequency: item.frequency,
          duration: item.duration,
          quantityPrescribed: item.quantityPrescribed,
          instructions: item.instructions,
        })),
      });

      setSuccessMsg("Prescription successfully issued to Pharmacy Queue!");
      setPrescriptionItems([]);
      setNotes("");
      fetchPrescriptionHistory();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to issue prescription.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card" style={{ marginBottom: "20px" }}>
      <div className="card-header" style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--color-border)", paddingBottom: "12px" }}>
        <Pill size={20} color="#8b5cf6" />
        <h3 className="card-title">Prescription Builder & Pharmacotherapy</h3>
      </div>

      <ErrorBanner message={errorMsg} />

      {successMsg && (
        <div style={{ padding: "12px 16px", borderRadius: "8px", background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)", color: "#34d399", display: "flex", alignItems: "center", gap: "8px", margin: "16px 0" }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Issued Prescriptions List */}
      {issuedPrescriptions.length > 0 && (
        <div style={{ margin: "16px 0", padding: "14px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
          <h4 style={{ fontSize: "14px", color: "#8b5cf6", margin: "0 0 10px 0" }}>Issued Prescriptions for this Visit</h4>
          {issuedPrescriptions.map((p) => (
            <div key={p._id} style={{ padding: "10px", background: "rgba(15, 23, 42, 0.6)", borderRadius: "8px", marginBottom: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <strong style={{ fontSize: "13px", color: "#f8fafc" }}>Prescription #{p.prescriptionId}</strong>
                <Badge variant={p.status === "dispensed" ? "success" : p.status === "partially_dispensed" ? "warning" : "primary"}>
                  {p.status}
                </Badge>
              </div>
              <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12px", color: "#cbd5e1" }}>
                {p.items?.map((item, idx) => (
                  <li key={idx}>
                    <strong>{item.medicineName}</strong> ({item.strength}, {item.dosageForm}) — {item.dosage}, {item.frequency} for {item.duration} (Qty: {item.quantityPrescribed})
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Medicine Search & Form (Active Doctor consultation only) */}
      {!isReadOnly && (
        <div style={{ marginTop: "16px" }}>
          <h4 style={{ fontSize: "14px", color: "#cbd5e1", marginBottom: "12px" }}>Add Pharmacological Item</h4>

          {/* Catalog Search Input */}
          <div style={{ position: "relative", marginBottom: "12px" }}>
            <div style={{ position: "relative" }}>
              <Search size={16} style={{ position: "absolute", left: "12px", top: "12px", color: "#94a3b8" }} />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: "36px" }}
                placeholder={searching ? "Searching medicine catalog..." : "Search active medicine catalog (e.g., Amoxicillin, Paracetamol)..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Dropdown Catalog Results */}
            {medicineCatalog.length > 0 && (
              <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 10, background: "#1e293b", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "8px", marginTop: "4px", maxHeight: "200px", overflowY: "auto" }}>
                {medicineCatalog.map((med) => (
                  <div
                    key={med._id}
                    onClick={() => handleSelectMedicine(med)}
                    style={{ padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                  >
                    <div>
                      <strong style={{ color: "#f8fafc", fontSize: "13px" }}>{med.name}</strong>
                      <span style={{ fontSize: "12px", color: "#94a3b8", marginLeft: "8px" }}>({med.strength} — {med.dosageForm})</span>
                    </div>
                    <Badge variant={med.stockQuantity > med.reorderLevel ? "success" : "danger"}>
                      Stock: {med.stockQuantity}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Medicine Info Banner */}
          {selectedMedicine && (
            <div style={{ background: "rgba(139, 92, 246, 0.1)", border: "1px solid rgba(139, 92, 246, 0.3)", borderRadius: "8px", padding: "12px", marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <strong style={{ color: "#c084fc", fontSize: "14px" }}>Selected: {selectedMedicine.name}</strong>
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                  Strength: {selectedMedicine.strength} | Form: {selectedMedicine.dosageForm} | Available Stock: <strong>{selectedMedicine.stockQuantity}</strong>
                </span>
              </div>

              {/* Item Details Inputs */}
              <div className="grid grid-2" style={{ gap: "10px", marginBottom: "10px" }}>
                <div>
                  <label className="form-label" style={{ fontSize: "12px" }}>Dosage</label>
                  <input
                    type="text"
                    className="form-control"
                    value={itemForm.dosage}
                    onChange={(e) => setItemForm({ ...itemForm, dosage: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: "12px" }}>Frequency</label>
                  <input
                    type="text"
                    className="form-control"
                    value={itemForm.frequency}
                    onChange={(e) => setItemForm({ ...itemForm, frequency: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: "12px" }}>Duration</label>
                  <input
                    type="text"
                    className="form-control"
                    value={itemForm.duration}
                    onChange={(e) => setItemForm({ ...itemForm, duration: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: "12px" }}>Quantity Prescribed</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={itemForm.quantityPrescribed}
                    onChange={(e) => setItemForm({ ...itemForm, quantityPrescribed: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSelectedMedicine(null)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary btn-sm" onClick={handleAddItem} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Plus size={14} /> Add Item to Builder
                </button>
              </div>
            </div>
          )}

          {/* Builder Cart Table */}
          {prescriptionItems.length > 0 && (
            <div style={{ marginTop: "16px" }}>
              <h5 style={{ fontSize: "13px", color: "#f8fafc", marginBottom: "8px" }}>Staged Prescription Items</h5>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Medicine Name</th>
                      <th>Dosage</th>
                      <th>Frequency</th>
                      <th>Duration</th>
                      <th>Quantity</th>
                      <th style={{ textAlign: "right" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescriptionItems.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600 }}>{item.medicineName} ({item.strength})</td>
                        <td>{item.dosage}</td>
                        <td>{item.frequency}</td>
                        <td>{item.duration}</td>
                        <td style={{ fontWeight: 600, color: "#8b5cf6" }}>{item.quantityPrescribed}</td>
                        <td style={{ textAlign: "right" }}>
                          <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleRemoveItem(idx)} style={{ color: "#ef4444" }}>
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Special Instructions & Issue Action */}
              <div style={{ marginTop: "16px" }}>
                <label className="form-label">Special Prescriptive Instructions (Optional)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Patient has mild renal insufficiency, monitor fluid intake"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleIssuePrescription}
                  disabled={submitting}
                  style={{ width: "100%", marginTop: "12px", justifyContent: "center" }}
                >
                  {submitting ? "Issuing Prescription Order..." : "Issue Prescription Order to Pharmacy"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PrescriptionSection;
