// api/visit.api.js — Clinical Visit domain API calls
import api from "./axios.config";

export const getVisitsApi = (params = {}) =>
  api.get("/visits", { params }).then((r) => r.data);

export const getVisitByIdApi = (visitId) =>
  api.get(`/visits/${visitId}`).then((r) => r.data);

export const createVisitApi = (data) =>
  api.post("/visits", data).then((r) => r.data);

export const completeVisitApi = (visitId, data) =>
  api.patch(`/visits/${visitId}/complete`, data).then((r) => r.data);
