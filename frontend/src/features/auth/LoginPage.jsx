// features/auth/LoginPage.jsx — Enterprise Unified Login (No Role Selection Tabs)
// feature: Professional single login point. Backend RBAC determines role dynamically.
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
  Info,
  UserCheck
} from "lucide-react";
import "./LoginPage.css";

const DASHBOARD_ROUTES = {
  admin: "/admin",
  doctor: "/doctor/dashboard",
  patient: "/patient/dashboard",
};

const DEMO_ACCOUNTS = [
  { label: "Admin Access",   role: "System Admin", email: "admin@hpms.com",        password: "Admin@123" },
  { label: "Doctor Portal",  role: "Cardiologist", email: "arjun.sharma@hpms.com", password: "Doctor@123" },
  { label: "Patient Record", role: "Outpatient",   email: "ravi.kumar@hpms.com",   password: "Patient@123" },
];

const LoginPage = () => {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm]       = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  // Allow recruiters/testers to quickly populate credentials
  const handleSelectDemo = (account) => {
    setForm({ email: account.email, password: account.password });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await loginApi(form);
      const { token, user } = res.data;
      
      // Store session and redirect based on backend-authenticated RBAC role
      login(token, user);
      const targetRoute = DASHBOARD_ROUTES[user.role] || "/";
      navigate(targetRoute, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* ─── Left Branding Panel (Enterprise Value Prop) ─── */}
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
              <h4>HIPAA-Ready Security Architecture</h4>
              <p>Encrypted JSON Web Token (JWT) sessions with automated expiration and token verification.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Right Form Panel (Unified Login) ───────────── */}
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
              <div className="form-input-wrapper">
                <span className="form-input-icon">
                  <Lock size={18} />
                </span>
                <input
                  id="login-password"
                  className="form-control with-icon"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>
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

          {/* ─── Interviewer / Recruiter Quick Test Helper ─── */}
          <div className="demo-credentials-box">
            <div className="demo-credentials-title">
              <Info size={14} />
              <span>Quick Test Credentials (For Reviewers)</span>
            </div>
            <div className="demo-grid">
              {DEMO_ACCOUNTS.map((acc, index) => (
                <button
                  key={index}
                  type="button"
                  className="demo-role-btn"
                  onClick={() => handleSelectDemo(acc)}
                  title={`Click to fill ${acc.label} credentials`}
                >
                  <strong>{acc.label}</strong>
                  <span>{acc.role}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
