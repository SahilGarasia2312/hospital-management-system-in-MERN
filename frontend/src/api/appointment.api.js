// api/appointment.api.js — Appointment domain API calls
import api from "./axios.config";

export const getAppointmentsApi = (params = {}) =>
  api.get("/appointments", { params }).then((r) => r.data);

export const getAppointmentByIdApi = (appointmentId) =>
  api.get(`/appointments/${appointmentId}`).then((r) => r.data);

export const createAppointmentApi = (data) =>
  api.post("/appointments", data).then((r) => r.data);

export const updateAppointmentStatusApi = (appointmentId, status) =>
  api.patch(`/appointments/${appointmentId}/status`, { status }).then((r) => r.data);

export const cancelAppointmentApi = (appointmentId, cancellationReason) =>
  api.patch(`/appointments/${appointmentId}/cancel`, { cancellationReason }).then((r) => r.data);
