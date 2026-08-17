// context/AuthContext.jsx — Global authentication state
// feature: Provides { user, token, role, login, logout } to any component via useAuth hook
import React, { createContext, useState, useCallback, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]   = useState(null);   // { id, name, email, role, linkedId }
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // True while reading from localStorage

  // On mount: restore session from localStorage (persists page refresh)
  useEffect(() => {
    const storedToken = localStorage.getItem("hpms_token");
    const storedUser  = localStorage.getItem("hpms_user");
    if (storedToken && storedUser) {
      try {
        const decoded = jwtDecode(storedToken);
        // Check token is not expired
        if (decoded.exp * 1000 > Date.now()) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } else {
          // Token expired — clear storage
          localStorage.removeItem("hpms_token");
          localStorage.removeItem("hpms_user");
        }
      } catch {
        localStorage.removeItem("hpms_token");
        localStorage.removeItem("hpms_user");
      }
    }
    setLoading(false);
  }, []);

  /**
   * Call after successful API login.
   * Stores token + user in localStorage and state.
   */
  const login = useCallback((tokenStr, userData) => {
    localStorage.setItem("hpms_token", tokenStr);
    localStorage.setItem("hpms_user", JSON.stringify(userData));
    setToken(tokenStr);
    setUser(userData);
  }, []);

  /**
   * Clears all auth state and redirects to login.
   */
  const logout = useCallback(() => {
    localStorage.removeItem("hpms_token");
    localStorage.removeItem("hpms_user");
    setToken(null);
    setUser(null);
  }, []);

  const value = { user, token, loading, login, logout, isAuthenticated: !!token };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
