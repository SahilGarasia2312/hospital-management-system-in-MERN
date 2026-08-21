// api/prescription.api.js — Prescription order domain API calls
import api from "./axios.config";

export const getPrescriptionsApi = (params = {}) =>
  api.get("/prescriptions", { params }).then((r) => r.data);

export const getPrescriptionByIdApi = (prescriptionId) =>
  api.get(`/prescriptions/${prescriptionId}`).then((r) => r.data);

export const createPrescriptionApi = (data) =>
  api.post("/prescriptions", data).then((r) => r.data);

export const fulfillPrescriptionApi = (prescriptionId, items) =>
  api.patch(`/prescriptions/${prescriptionId}/fulfill`, { items }).then((r) => r.data);

export const cancelPrescriptionApi = (prescriptionId, cancellationReason) =>
  api.patch(`/prescriptions/${prescriptionId}/cancel`, { cancellationReason }).then((r) => r.data);
