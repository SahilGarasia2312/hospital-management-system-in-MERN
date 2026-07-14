// routes/ProtectedRoute.jsx — Auth + role guard wrapper
// feature: Redirects unauthenticated or unauthorized users to /login
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Spinner from "../components/common/Spinner";

/**
 * Wraps React Router's <Outlet /> with auth + role checks.
 * Usage in AppRoutes:
 *   <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
 *     <Route path="/admin" element={<AdminDashboard />} />
 *   </Route>
 *
 * @param {string[]} allowedRoles - If empty/undefined, any authenticated user is allowed
 */
const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // While restoring auth from localStorage, show loader
  if (loading) return <Spinner fullPage />;

  // Not logged in → redirect to login
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Logged in but wrong role → redirect to their dashboard
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Authorized → render child routes
  return <Outlet />;
};

export default ProtectedRoute;
