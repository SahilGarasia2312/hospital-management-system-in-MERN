// features/pharmacy/MedicineModal.jsx — Add/Edit Medicine Modal
import React, { useState, useEffect } from "react";
import Modal from "../../components/common/Modal";
import ErrorBanner from "../../components/common/ErrorBanner";
import { createMedicineApi, updateMedicineApi } from "../../api/medicine.api";

const MedicineModal = ({ isOpen, onClose, medicine, onRefresh }) => {
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    genericName: "",
    dosageForm: "tablet",
    strength: "",
    manufacturer: "",
    unitPrice: 0,
    stockQuantity: 100,
    reorderLevel: 10,
    isActive: true,
  });

  useEffect(() => {
    if (medicine) {
      setFormData({
        name: medicine.name || "",
        genericName: medicine.genericName || "",
        dosageForm: medicine.dosageForm || "tablet",
        strength: medicine.strength || "",
        manufacturer: medicine.manufacturer || "",
        unitPrice: medicine.unitPrice ?? 0,
        stockQuantity: medicine.stockQuantity ?? 100,
        reorderLevel: medicine.reorderLevel ?? 10,
        isActive: medicine.isActive !== undefined ? medicine.isActive : true,
      });
    } else {
      setFormData({
        name: "",
        genericName: "",
        dosageForm: "tablet",
        strength: "",
        manufacturer: "",
        unitPrice: 0,
        stockQuantity: 100,
        reorderLevel: 10,
        isActive: true,
      });
    }
    setErrorMsg("");
    setFieldErrors([]);
  }, [medicine, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    setFieldErrors([]);

    try {
      if (medicine) {
        await updateMedicineApi(medicine.medicineId, formData);
      } else {
        await createMedicineApi(formData);
      }
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      if (err.response?.data?.errors) {
        setFieldErrors(err.response.data.errors);
      }
      setErrorMsg(err.response?.data?.message || "Failed to save medicine details.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={medicine ? `Edit Medicine #${medicine.medicineId}` : "Add New Medicine to Catalog"} maxWidth="600px">
      <ErrorBanner message={errorMsg} errors={fieldErrors} />

      <form onSubmit={handleSubmit}>
        <div className="grid grid-2" style={{ gap: "14px" }}>
          <div>
            <label className="form-label">Brand Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Amoxil"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="form-label">Generic Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Amoxicillin"
              value={formData.genericName}
              onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
            />
          </div>

          <div>
            <label className="form-label">Dosage Form *</label>
            <select
              className="form-control"
              value={formData.dosageForm}
              onChange={(e) => setFormData({ ...formData, dosageForm: e.target.value })}
              required
            >
              <option value="tablet">Tablet</option>
              <option value="capsule">Capsule</option>
              <option value="syrup">Syrup</option>
              <option value="injection">Injection</option>
              <option value="ointment">Ointment</option>
              <option value="drops">Drops</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="form-label">Strength *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. 500mg, 10mg/ml"
              value={formData.strength}
              onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="form-label">Manufacturer</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Pfizer, Novartis"
              value={formData.manufacturer}
              onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
            />
          </div>

          <div>
            <label className="form-label">Unit Price ($) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="form-control"
              value={formData.unitPrice}
              onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
              required
            />
          </div>

          <div>
            <label className="form-label">Initial Stock Quantity</label>
            <input
              type="number"
              min="0"
              className="form-control"
              value={formData.stockQuantity}
              onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="form-label">Reorder Level Threshold</label>
            <input
              type="number"
              min="0"
              className="form-control"
              value={formData.reorderLevel}
              onChange={(e) => setFormData({ ...formData, reorderLevel: Number(e.target.value) })}
            />
          </div>
        </div>

        <div style={{ marginTop: "16px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", color: "#f8fafc" }}>
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            />
            <span>Active in Pharmacy Catalog (Available for Prescriptions)</span>
          </label>
        </div>

        <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Saving..." : medicine ? "Update Medicine" : "Create Medicine"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default MedicineModal;
