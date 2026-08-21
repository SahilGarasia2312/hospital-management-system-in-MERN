// features/auth/LoginPage.jsx — Enterprise Unified Login with Bot Protection & Password Visibility Toggle
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { loginApi } from "../../api/auth.api";
import { 
  Building2, 
  ShieldCheck, 
  Activity, 
  Lock, 
  Mail, 
  AlertCircle, 
  ArrowRight, 
  UserCheck,
  Bot,
  Eye,
  EyeOff
} from "lucide-react";
import "./LoginPage.css";

const DASHBOARD_ROUTES = {
  admin: "/admin",
  doctor: "/doctor/dashboard",
  patient: "/patient/dashboard",
};

const LoginPage = () => {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm]       = useState({ email: "", password: "", website_hp: "" });
  const [showPassword, setShowPassword]       = useState(false);
  const [isHumanVerified, setIsHumanVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ─── Bot Protection Check ──────────────────────────────
    // 1. Honeypot check: If invisible field is filled by a bot, reject
    if (form.website_hp && form.website_hp.trim() !== "") {
      console.warn("🤖 [BOT SECURITY] Honeypot triggered. Request blocked.");
      setError("Automated submission detected by security filters.");
      return;
    }

    // 2. Interactive Bot Protection Checkbox Verification
    if (!isHumanVerified) {
      setError("Please complete the bot protection security check below.");
      return;
    }

    setLoading(true);
    setError("");

    console.log("[AUTH DEBUG] Submitting login payload:", { email: form.email });

    try {
      const res = await loginApi({ email: form.email, password: form.password, website_hp: form.website_hp });
      console.log("[AUTH DEBUG] Login API response:", res);
      const { token, user } = res.data;
      
      console.log("[AUTH DEBUG] User authenticated successfully:", user);
      login(token, user);
      const targetRoute = DASHBOARD_ROUTES[user.role] || "/";
      console.log("[AUTH DEBUG] Navigating to target route:", targetRoute);
      navigate(targetRoute, { replace: true });
    } catch (err) {
      console.error("[AUTH DEBUG] Login error caught:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Authentication failed. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* ─── Left Branding Panel ─────────────────────────── */}
      <div className="login-left">
        <div className="login-brand">
          <div className="login-brand-icon-wrapper">
            <Building2 size={32} />
          </div>
          <h1>HPMS Enterprise</h1>
          <p>
            Secure, centralized healthcare management platform engineered for clinical excellence, patient privacy, and real-time hospital administration.
          </p>
        </div>

        <div className="login-features">
          <div className="login-feature-item">
            <div className="login-feature-icon">
              <ShieldCheck size={20} />
            </div>
            <div className="login-feature-text">
              <h4>Role-Based Access Control (RBAC)</h4>
              <p>Granular authorization routing administrators, clinicians, and patients to specialized clinical workspaces.</p>
            </div>
          </div>

          <div className="login-feature-item">
            <div className="login-feature-icon">
              <Activity size={20} />
            </div>
            <div className="login-feature-text">
              <h4>Real-Time Clinical Telemetry</h4>
              <p>Live patient admission tracking, diagnosis histories, and department-wide census analytics.</p>
            </div>
          </div>

          <div className="login-feature-item">
            <div className="login-feature-icon">
              <UserCheck size={20} />
            </div>
            <div className="login-feature-text">
              <h4>HIPAA & Anti-Bot Protection</h4>
              <p>Encrypted sessions with automated honeypot bot defense and rate-limiting safeguards.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Right Form Panel ────────────────────────────── */}
      <div className="login-right">
        <div className="login-form-wrapper">
          <div className="login-form-header">
            <h2>Sign in to Portal</h2>
            <p>Enter your professional or patient credentials</p>
          </div>

          {error && (
            <div className="login-error" role="alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Honeypot hidden input for Bot Protection */}
            <input
              type="text"
              name="website_hp"
              value={form.website_hp}
              onChange={handleChange}
              style={{ display: "none", position: "absolute", left: "-9999px" }}
              tabIndex="-1"
              autoComplete="off"
            />

            <div className="form-group">
              <label className="form-label" htmlFor="login-email">
                Email Address
              </label>
              <div className="form-input-wrapper">
                <span className="form-input-icon">
                  <Mail size={18} />
                </span>
                <input
                  id="login-email"
                  className="form-control with-icon"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="name@hospital.org"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">
                Password
              </label>
              <div className="form-input-wrapper" style={{ position: "relative" }}>
                <span className="form-input-icon">
                  <Lock size={18} />
                </span>
                <input
                  id="login-password"
                  className="form-control with-icon"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: "40px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#64748b",
                    display: "flex",
                    alignItems: "center",
                    padding: "4px"
                  }}
                  title={showPassword ? "Hide Password" : "Show Password"}
                  aria-label={showPassword ? "Hide Password" : "Show Password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* ─── Bot Protection Verification Box ───────── */}
            <div 
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px",
                marginBottom: "20px",
                background: isHumanVerified ? "#f0fdf4" : "#f8fafc",
                border: isHumanVerified ? "1px solid #bbf7d0" : "1px solid #e2e8f0",
                borderRadius: "8px",
                cursor: "pointer",
                userSelect: "none",
                transition: "all 0.2s ease"
              }}
              onClick={() => setIsHumanVerified(!isHumanVerified)}
            >
              <input
                id="bot-protection-checkbox"
                type="checkbox"
                checked={isHumanVerified}
                onChange={(e) => setIsHumanVerified(e.target.checked)}
                style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "#0284c7" }}
              />
              <label 
                htmlFor="bot-protection-checkbox"
                style={{ 
                  fontSize: "0.875rem", 
                  color: isHumanVerified ? "#15803d" : "#475569", 
                  cursor: "pointer",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <Bot size={16} />
                <span>I am not a bot (Security Check)</span>
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-login"
              disabled={loading}
            >
              <span>{loading ? "Authenticating..." : "Sign In"}</span>
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
