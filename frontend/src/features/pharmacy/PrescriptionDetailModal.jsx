// features/pharmacy/PrescriptionDetailModal.jsx — Pharmacy Dispensing & Order Detail View
import React, { useState, useEffect } from "react";
import Modal from "../../components/common/Modal";
import Badge from "../../components/common/Badge";
import ErrorBanner from "../../components/common/ErrorBanner";
import { dispensePrescriptionApi, cancelPrescriptionApi } from "../../api/prescription.api";
import useAuth from "../../hooks/useAuth";
import { Pill, User, Stethoscope, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

const PrescriptionDetailModal = ({ isOpen, onClose, prescription, onRefresh }) => {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Staged Dispense Quantities map { [medicineId]: quantityToDispense }
  const [dispenseMap, setDispenseMap] = useState({});

  // Cancellation State
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    if (prescription?.items) {
      const initialMap = {};
      prescription.items.forEach((item) => {
        const remaining = Math.max(0, item.quantityPrescribed - item.quantityDispensed);
        initialMap[item.medicineId] = remaining;
      });
      setDispenseMap(initialMap);
    }
    setErrorMsg("");
    setSuccessMsg("");
    setShowCancel(false);
  }, [prescription]);

  if (!prescription) return null;

  const isAdmin = user?.role === "admin";
  const status = prescription.status;
  const isFullyDispensed = status === "dispensed";
  const isCancelled = status === "cancelled";

  const handleDispenseQtyChange = (medicineId, val) => {
    const qty = Math.max(0, parseInt(val) || 0);
    setDispenseMap((prev) => ({ ...prev, [medicineId]: qty }));
  };

  const handleDispenseSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    const dispenseItems = Object.entries(dispenseMap)
      .map(([medId, qty]) => ({
        medicineId: medId,
        quantityToDispense: Number(qty),
      }))
      .filter((item) => item.quantityToDispense > 0);

    if (dispenseItems.length === 0) {
      setErrorMsg("Please specify a positive quantity to dispense for at least one item.");
      setSubmitting(false);
      return;
    }

    try {
      await dispensePrescriptionApi(prescription.prescriptionId, dispenseItems);
      setSuccessMsg("Prescription items successfully dispensed! Inventory updated.");
      if (onRefresh) onRefresh();
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to dispense prescription items.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!cancelReason.trim()) {
      setErrorMsg("Cancellation reason is required.");
      return;
    }
    setSubmitting(true);
    setErrorMsg("");
    try {
      await cancelPrescriptionApi(prescription.prescriptionId, cancelReason);
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to cancel prescription.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Prescription #${prescription.prescriptionId}`} maxWidth="700px">
      <ErrorBanner message={errorMsg} />

      {successMsg && (
        <div style={{ padding: "12px", borderRadius: "8px", background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)", color: "#34d399", display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Header Context */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <Badge variant={isFullyDispensed ? "success" : isCancelled ? "danger" : status === "partially_dispensed" ? "warning" : "primary"} dot>
            {status?.toUpperCase().replace("_", " ")}
          </Badge>
        </div>
        <div style={{ fontSize: "12px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px" }}>
          <Clock size={14} />
          <span>Issued: {new Date(prescription.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="grid grid-2" style={{ gap: "12px", marginBottom: "16px" }}>
        <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "12px", borderRadius: "8px" }}>
          <span style={{ fontSize: "11px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px" }}>
            <User size={14} /> Patient
          </span>
          <strong style={{ display: "block", color: "#f8fafc", marginTop: "2px", fontSize: "14px" }}>
            {prescription.patientId?.name || "N/A"}
          </strong>
          <span style={{ fontSize: "12px", color: "#94a3b8" }}>
            MRN: #{prescription.patientId?.patientId}
          </span>
        </div>

        <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "12px", borderRadius: "8px" }}>
          <span style={{ fontSize: "11px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px" }}>
            <Stethoscope size={14} /> Prescribing Doctor
          </span>
          <strong style={{ display: "block", color: "#f8fafc", marginTop: "2px", fontSize: "14px" }}>
            Dr. {prescription.doctorId?.name || "N/A"}
          </strong>
          <span style={{ fontSize: "12px", color: "#3b82f6" }}>
            {prescription.doctorId?.specialization}
          </span>
        </div>
      </div>

      {prescription.notes && (
        <div style={{ marginBottom: "16px", padding: "10px", background: "rgba(139, 92, 246, 0.1)", borderRadius: "6px", border: "1px solid rgba(139, 92, 246, 0.2)" }}>
          <span style={{ fontSize: "12px", color: "#c084fc", fontWeight: 600 }}>Doctor Special Instructions:</span>
          <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "#e2e8f0" }}>{prescription.notes}</p>
        </div>
      )}

      {/* Prescription Items Fulfillment Table */}
      <div style={{ marginTop: "16px" }}>
        <h4 style={{ fontSize: "14px", color: "#f8fafc", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
          <Pill size={16} color="#8b5cf6" /> Prescribed Medications & Fulfillment Status
        </h4>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Medication</th>
                <th>Dosage / Freq</th>
                <th>Prescribed</th>
                <th>Dispensed</th>
                <th>Remaining</th>
                {isAdmin && !isFullyDispensed && !isCancelled && <th>Dispense Now</th>}
              </tr>
            </thead>
            <tbody>
              {prescription.items?.map((item, idx) => {
                const remaining = Math.max(0, item.quantityPrescribed - item.quantityDispensed);
                return (
                  <tr key={idx}>
                    <td>
                      <strong style={{ color: "#f8fafc" }}>{item.medicineName}</strong>
                      <div style={{ fontSize: "11px", color: "#94a3b8" }}>{item.strength} — {item.dosageForm}</div>
                    </td>
                    <td style={{ fontSize: "12px" }}>
                      {item.dosage}, {item.frequency} ({item.duration})
                    </td>
                    <td style={{ fontWeight: 600, color: "#8b5cf6" }}>{item.quantityPrescribed}</td>
                    <td style={{ fontWeight: 600, color: "#10b981" }}>{item.quantityDispensed}</td>
                    <td style={{ fontWeight: 600, color: remaining > 0 ? "#f59e0b" : "#94a3b8" }}>{remaining}</td>
                    {isAdmin && !isFullyDispensed && !isCancelled && (
                      <td>
                        <input
                          type="number"
                          min="0"
                          max={remaining}
                          className="form-control form-control-sm"
                          style={{ width: "80px" }}
                          value={dispenseMap[item.medicineId] ?? remaining}
                          onChange={(e) => handleDispenseQtyChange(item.medicineId, e.target.value)}
                          disabled={remaining === 0}
                        />
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cancellation Reason if Cancelled */}
      {isCancelled && prescription.cancellationReason && (
        <div style={{ marginTop: "16px", padding: "12px", borderRadius: "8px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
          <strong style={{ color: "#f87171", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
            <AlertTriangle size={14} /> Cancellation Reason:
          </strong>
          <p style={{ color: "#f87171", fontSize: "13px", margin: "4px 0 0 0" }}>{prescription.cancellationReason}</p>
        </div>
      )}

      {/* Action Footer */}
      {!isFullyDispensed && !isCancelled && (
        <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
          {showCancel ? (
            <form onSubmit={handleCancelSubmit}>
              <div style={{ marginBottom: "12px" }}>
                <label className="form-label">Reason for Prescriptive Order Cancellation *</label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Provide reason for cancelling this prescription..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowCancel(false)}>
                  Back
                </button>
                <button type="submit" className="btn btn-danger btn-sm" disabled={submitting}>
                  {submitting ? "Cancelling..." : "Confirm Cancellation"}
                </button>
              </div>
            </form>
          ) : (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button type="button" className="btn btn-outline btn-sm" style={{ color: "#ef4444", borderColor: "rgba(239, 68, 68, 0.3)" }} onClick={() => setShowCancel(true)}>
                <XCircle size={14} /> Cancel Order
              </button>

              {isAdmin && (
                <button type="button" className="btn btn-success btn-sm" onClick={handleDispenseSubmit} disabled={submitting}>
                  {submitting ? "Processing Dispense..." : "Dispense Selected Quantities"}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default PrescriptionDetailModal;
