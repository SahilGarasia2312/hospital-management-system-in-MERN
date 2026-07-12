// hooks/useAuth.js — Custom hook for consuming AuthContext
// feature: Clean API so components don't import AuthContext directly
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

/**
 * Returns { user, token, loading, login, logout, isAuthenticated } from AuthContext.
 * Throws if used outside <AuthProvider>.
 */
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return context;
};

export default useAuth;
