// api/medicine.api.js — Medicine catalog domain API calls
import api from "./axios.config";

export const getMedicinesApi = (params = {}) =>
  api.get("/medicines", { params }).then((r) => r.data);

export const getLowStockMedicinesApi = () =>
  api.get("/medicines/low-stock").then((r) => r.data);

export const createMedicineApi = (data) =>
  api.post("/medicines", data).then((r) => r.data);

export const updateMedicineApi = (medicineId, data) =>
  api.put(`/medicines/${medicineId}`, data).then((r) => r.data);

export const updateMedicineStockApi = (medicineId, stockQuantity) =>
  api.patch(`/medicines/${medicineId}/stock`, { stockQuantity }).then((r) => r.data);
