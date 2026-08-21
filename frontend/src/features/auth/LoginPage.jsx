// features/auth/LoginPage.jsx — Enterprise Unified Login with 3D Showcase & Bot Protection
import React, { useState, useEffect } from "react";
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
  EyeOff,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from "lucide-react";

import clinicCareImg from "../../assets/images/clinic_care.png";
import enterpriseHospitalImg from "../../assets/images/enterprise_hospital.png";
import smartPharmacyImg from "../../assets/images/smart_pharmacy.png";

import "./LoginPage.css";

const DASHBOARD_ROUTES = {
  admin: "/admin",
  doctor: "/doctor/dashboard",
  patient: "/patient/dashboard",
};

const SHOWCASE_SLIDES = [
  {
    id: 1,
    title: "Small Clinics & Solo Practice",
    badge: "🏡 Small Clinics & Outpatient Care",
    tagline: "Tailored for solo practitioners & family clinics",
    description: "Streamlined consultation workflows, paperless digital prescriptions, and fast appointment scheduling for independent practices.",
    image: clinicCareImg,
  },
  {
    id: 2,
    title: "Multispecialty Hospitals",
    badge: "🏥 Enterprise Medical Centers",
    tagline: "High-capacity hospital telemetry & ward analytics",
    description: "Multi-department coordination, bed census analytics, emergency routing, and central administrative control for large hospitals.",
    image: enterpriseHospitalImg,
  },
  {
    id: 3,
    title: "Smart Pharmacy & 360° Records",
    badge: "💊 Integrated Pharmacy & Medical History",
    tagline: "End-to-end drug inventory & lifetime health records",
    description: "Real-time drug stock alerts, automated pharmacy dispense queues, and unified patient medical timelines accessible securely.",
    image: smartPharmacyImg,
  },
];

const LoginPage = () => {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm]       = useState({ email: "", password: "", website_hp: "" });
  const [showPassword, setShowPassword]       = useState(false);
  const [isHumanVerified, setIsHumanVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  // 3D Carousel / Cube Orbital Motion State
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Auto-rotate 3D Showcase every 4.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % SHOWCASE_SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleNextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % SHOWCASE_SLIDES.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + SHOWCASE_SLIDES.length) % SHOWCASE_SLIDES.length);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ─── Bot Protection Check ──────────────────────────────
    if (form.website_hp && form.website_hp.trim() !== "") {
      console.warn("🤖 [BOT SECURITY] Honeypot triggered. Request blocked.");
      setError("Automated submission detected by security filters.");
      return;
    }

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

  const activeSlide = SHOWCASE_SLIDES[currentSlideIndex];

  return (
    <div className="login-page">
      {/* ─── Left Branding Panel (3D Cube & Orbital AI Showcase) ─── */}
      <div className="login-left">
        <div className="login-brand">
          <div className="login-brand-header">
            <div className="login-brand-icon-wrapper">
              <Building2 size={32} />
            </div>
            <div>
              <h1>HPMS Healthcare</h1>
              <div className="scale-pill">
                <Sparkles size={13} />
                <span>Engineered for Small Clinics to Enterprise Hospitals</span>
              </div>
            </div>
          </div>
          <p className="brand-subtext">
            A unified, scalable hospital & clinic management engine designed for solo practitioners, community health centers, and multi-specialty medical networks.
          </p>
        </div>

        {/* ─── 3D Circular Orbital Showcase Cube Container ─── */}
        <div className="showcase-3d-wrapper">
          <div className="showcase-3d-stage">
            <div className="showcase-card active-3d-card">
              <div className="card-image-container">
                <img 
                  src={activeSlide.image} 
                  alt={activeSlide.title} 
                  className="showcase-ai-image" 
                />
                <div className="image-overlay-gradient"></div>
                <div className="card-floating-badge">
                  <span>{activeSlide.badge}</span>
                </div>
              </div>
              <div className="card-content">
                <h3>{activeSlide.title}</h3>
                <p className="card-tagline">{activeSlide.tagline}</p>
                <p className="card-desc">{activeSlide.description}</p>
              </div>
            </div>
          </div>

          {/* ─── Orbital Controls & Navigation Dots ───────── */}
          <div className="showcase-controls">
            <button 
              type="button" 
              className="orbital-nav-btn" 
              onClick={handlePrevSlide}
              aria-label="Previous Slide"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="orbital-dots">
              {SHOWCASE_SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  type="button"
                  className={`orbital-dot ${idx === currentSlideIndex ? "active" : ""}`}
                  onClick={() => setCurrentSlideIndex(idx)}
                  title={slide.title}
                />
              ))}
            </div>

            <button 
              type="button" 
              className="orbital-nav-btn" 
              onClick={handleNextSlide}
              aria-label="Next Slide"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* ─── Bottom Feature Badges ───────────────────────── */}
        <div className="login-features">
          <div className="login-feature-item">
            <div className="login-feature-icon">
              <Stethoscope size={18} />
            </div>
            <div className="login-feature-text">
              <h4>Solo Clinic & Outpatient Ready</h4>
              <p>Simple consultation logs, prescription printing, and patient vitals tracking.</p>
            </div>
          </div>

          <div className="login-feature-item">
            <div className="login-feature-icon">
              <ShieldCheck size={18} />
            </div>
            <div className="login-feature-text">
              <h4>Enterprise Security & Anti-Bot Defense</h4>
              <p>JWT role-based authorization, request throttling, and automated honeypot bot shielding.</p>
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
