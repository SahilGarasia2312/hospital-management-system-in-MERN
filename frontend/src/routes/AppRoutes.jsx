// routes/AppRoutes.jsx — Centralized route definitions with Lucide icons & Clinical Workspaces
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import useAuth from "../hooks/useAuth";
import { ShieldAlert, ArrowRight } from "lucide-react";

// Auth
import LoginPage from "../features/auth/LoginPage";

// Admin
import AdminDashboard   from "../features/admin/AdminDashboard";
import ManageDoctors    from "../features/admin/ManageDoctors";
import ManagePatients   from "../features/admin/ManagePatients";

// Doctor
import DoctorDashboard  from "../features/doctor/DoctorDashboard";
import DoctorDetail     from "../features/doctor/DoctorDetail";

// Patient
import PatientDashboard from "../features/patient/PatientDashboard";

// Appointments
import AppointmentsPage from "../features/appointments/AppointmentsPage";

// Clinical Visit Encounter (Sprint 14)
import ClinicalEncounterPage from "../features/visits/ClinicalEncounterPage";

// Pharmacy & Inventory (Sprint 15)
import PharmacyQueuePage from "../features/pharmacy/PharmacyQueuePage";
import MedicineInventoryPage from "../features/pharmacy/MedicineInventoryPage";

// Patient 360° Medical Timeline (Sprint 16)
import PatientTimelinePage from "../features/timeline/PatientTimelinePage";

// Unauthorized page
const Unauthorized = () => (
  <div className="unauthorized-page">
    <div className="unauth-card">
      <div style={{ display: "flex", justifyContent: "center", color: "#ef4444", marginBottom: "16px" }}>
        <ShieldAlert size={56} />
      </div>
      <h2>Access Restricted</h2>
      <p>Your clinical authorization role does not permit access to this secure workspace.</p>
      <a href="/" className="btn btn-primary" style={{ gap: "8px", display: "inline-flex" }}>
        <span>Return to Dashboard</span>
        <ArrowRight size={16} />
      </a>
    </div>
  </div>
);

const AppRoutes = () => {
  const { user, isAuthenticated } = useAuth();

  // Redirect authenticated users from /login to their authorized workspace
  const getDashboardPath = () => {
    if (!user) return "/login";
    if (user.role === "admin")   return "/admin";
    if (user.role === "doctor")  return "/doctor/dashboard";
    if (user.role === "patient") return "/patient/dashboard";
    return "/login";
  };

  return (
    <Routes>
      {/* Public Route */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={getDashboardPath()} replace /> : <LoginPage />}
      />

      {/* Admin-only Routes */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin"              element={<AdminDashboard />} />
        <Route path="/admin/doctors"      element={<ManageDoctors />} />
        <Route path="/admin/patients"     element={<ManagePatients />} />
        <Route path="/admin/appointments" element={<AppointmentsPage />} />
        <Route path="/admin/pharmacy"     element={<PharmacyQueuePage />} />
        <Route path="/admin/medicines"    element={<MedicineInventoryPage />} />
      </Route>

      {/* Doctor & Staff Routes (admin + doctor) */}
      <Route element={<ProtectedRoute allowedRoles={["admin", "doctor"]} />}>
        <Route path="/doctor/dashboard"      element={<DoctorDashboard />} />
        <Route path="/doctor/appointments"   element={<AppointmentsPage />} />
        <Route path="/doctor/:doctorId"      element={<DoctorDetail />} />
        <Route path="/doctor/visits/:visitId" element={<ClinicalEncounterPage />} />
        <Route path="/doctor/encounters/new" element={<ClinicalEncounterPage />} />
        <Route path="/patients/:patientId/360" element={<PatientTimelinePage />} />
      </Route>

      {/* Patient Routes */}
      <Route element={<ProtectedRoute allowedRoles={["patient"]} />}>
        <Route path="/patient/dashboard"    element={<PatientDashboard />} />
        <Route path="/patient/appointments" element={<AppointmentsPage />} />
        <Route path="/patient/history"      element={<PatientTimelinePage />} />
      </Route>

      {/* Universal Protected Routes for all authenticated roles */}
      <Route element={<ProtectedRoute allowedRoles={["admin", "doctor", "patient"]} />}>
        <Route path="/visits/:visitId" element={<ClinicalEncounterPage />} />
      </Route>

      {/* Misc */}
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Catch-all: redirect to login or dashboard */}
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? getDashboardPath() : "/login"} replace />}
      />
    </Routes>
  );
};

export default AppRoutes;
