// api/axios.config.js — Centralized Axios instance
// feature: Single place for baseURL + auto-attach JWT token to every request
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000/api",
  headers: { "Content-Type": "application/json" },
});

// Request interceptor — attaches JWT token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("hpms_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handles global 401 (expired token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired — clear storage and redirect to login
      localStorage.removeItem("hpms_token");
      localStorage.removeItem("hpms_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
