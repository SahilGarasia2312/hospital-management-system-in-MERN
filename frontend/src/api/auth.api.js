// api/auth.api.js — All auth-related API calls
import api from "./axios.config";

export const loginApi = (credentials) =>
  api.post("/auth/login", credentials).then((r) => r.data);

export const registerApi = (userData) =>
  api.post("/auth/register", userData).then((r) => r.data);

export const getMeApi = () =>
  api.get("/auth/me").then((r) => r.data);
