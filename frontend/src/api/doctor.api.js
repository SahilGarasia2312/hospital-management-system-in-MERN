// api/doctor.api.js — All doctor-related API calls
import api from "./axios.config";

export const getDoctorsApi    = ()         => api.get("/doctors").then((r) => r.data);
export const getDoctorByIdApi = (id)       => api.get(`/doctors/${id}`).then((r) => r.data);
export const getDoctorStatsApi= ()         => api.get("/doctors/stats").then((r) => r.data);
export const createDoctorApi  = (data)     => api.post("/doctors", data).then((r) => r.data);
export const updateDoctorApi  = (id, data) => api.put(`/doctors/${id}`, data).then((r) => r.data);
export const deleteDoctorApi  = (id)       => api.delete(`/doctors/${id}`).then((r) => r.data);
