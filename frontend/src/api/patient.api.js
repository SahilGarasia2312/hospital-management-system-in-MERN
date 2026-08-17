// api/patient.api.js — All patient-related API calls
import api from "./axios.config";

export const getPatientsApi    = ()         => api.get("/patients").then((r) => r.data);
export const getPatientByIdApi = (id)       => api.get(`/patients/${id}`).then((r) => r.data);
export const getPatientStatsApi= ()         => api.get("/patients/stats").then((r) => r.data);
export const createPatientApi  = (data)     => api.post("/patients", data).then((r) => r.data);
export const updatePatientApi  = (id, data) => api.put(`/patients/${id}`, data).then((r) => r.data);
export const deletePatientApi  = (id)       => api.delete(`/patients/${id}`).then((r) => r.data);
