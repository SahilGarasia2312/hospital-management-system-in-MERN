// api/audit.api.js — Audit log domain API calls
import api from "./axios.config";

export const getAuditLogsApi = (params = {}) =>
  api.get("/audit", { params }).then((r) => r.data);

export const getAuditLogByIdApi = (auditId) =>
  api.get(`/audit/${auditId}`).then((r) => r.data);
