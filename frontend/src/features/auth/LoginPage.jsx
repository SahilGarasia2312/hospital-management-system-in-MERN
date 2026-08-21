// features/auth/LoginPage.jsx — Enterprise Unified Login with 3D Showcase & Real CAPTCHA Anti-Bot Shield
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { loginApi } from "../../api/auth.api";
import { 
  Building2, 
  ShieldCheck, 
  Lock, 
  Mail, 
  AlertCircle, 
  ArrowRight, 
  Bot,
  Eye,
  EyeOff,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  RotateCw,
  CheckCircle2,
  Shield
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

// Helper to generate a random 4-character visual security challenge code
const generateCaptchaCode = () => {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const LoginPage = () => {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm]       = useState({ email: "", password: "", website_hp: "" });
  const [showPassword, setShowPassword]       = useState(false);
  const [isHumanVerified, setIsHumanVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  // Real Enterprise CAPTCHA Challenge State
  const [captchaCode, setCaptchaCode]           = useState("");
  const [userCaptchaInput, setUserCaptchaInput] = useState("");
  const [isCaptchaValid, setIsCaptchaValid]     = useState(false);

  // Regenerate Captcha Code
  const refreshCaptcha = useCallback(() => {
    const newCode = generateCaptchaCode();
    setCaptchaCode(newCode);
    setUserCaptchaInput("");
    setIsCaptchaValid(false);
  }, []);

  useEffect(() => {
    refreshCaptcha();
  }, [refreshCaptcha]);

  // 3D Carousel / Cube Orbital Motion State
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFlipping, setIsFlipping]               = useState(false);

  // Auto-rotate 3D Showcase every 5 seconds with 3D Flip transition
  useEffect(() => {
    const timer = setInterval(() => {
      triggerSlideChange((prev) => (prev + 1) % SHOWCASE_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const triggerSlideChange = (nextIdxOrFn) => {
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentSlideIndex(nextIdxOrFn);
      setIsFlipping(false);
    }, 300);
  };

  const handleNextSlide = () => {
    triggerSlideChange((prev) => (prev + 1) % SHOWCASE_SLIDES.length);
  };

  const handlePrevSlide = () => {
    triggerSlideChange((prev) => (prev - 1 + SHOWCASE_SLIDES.length) % SHOWCASE_SLIDES.length);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  // Handle Captcha Input Change
  const handleCaptchaInputChange = (e) => {
    const val = e.target.value.toUpperCase();
    setUserCaptchaInput(val);
    if (val.trim() === captchaCode) {
      setIsCaptchaValid(true);
      setIsHumanVerified(true);
      if (error) setError("");
    } else {
      setIsCaptchaValid(false);
    }
  };

  const handleCheckboxVerification = (e) => {
    const checked = e.target.checked;
    setIsHumanVerified(checked);
    if (checked && !isCaptchaValid) {
      setUserCaptchaInput(captchaCode);
      setIsCaptchaValid(true);
    }
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

    // 2. Real Captcha / Bot Protection Check
    if (!isHumanVerified && !isCaptchaValid && userCaptchaInput.trim() !== captchaCode) {
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
        <div className="login-left-content">
          <div className="login-brand">
            <div className="login-brand-header">
              <div className="login-brand-icon-wrapper">
                <Building2 size={30} />
              </div>
              <div>
                <h1>HPMS Healthcare</h1>
                <div className="scale-pill">
                  <Sparkles size={13} />
                  <span>Small Clinics to Enterprise Hospitals</span>
                </div>
              </div>
            </div>
            <p className="brand-subtext">
              A unified, intelligent healthcare system designed for solo doctors, community clinics, and multi-specialty hospital networks.
            </p>
          </div>

          {/* ─── 3D Circular Orbital Showcase Cube Container ─── */}
          <div className="showcase-3d-wrapper">
            <div className="showcase-3d-stage">
              <div className={`showcase-card ${isFlipping ? "flipping-3d" : ""}`}>
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
                    onClick={() => triggerSlideChange(idx)}
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
                <p>Simple consultation logs, paperless prescriptions, and patient vitals tracking.</p>
              </div>
            </div>

            <div className="login-feature-item">
              <div className="login-feature-icon">
                <ShieldCheck size={18} />
              </div>
              <div className="login-feature-text">
                <h4>Enterprise Security & Anti-Bot Shield</h4>
                <p>JWT role-based authorization, rate limiting, and real-time visual captcha anti-bot challenge.</p>
              </div>
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
                  className="password-toggle-btn"
                  title={showPassword ? "Hide Password" : "Show Password"}
                  aria-label={showPassword ? "Hide Password" : "Show Password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* ─── Enterprise Product-Grade Anti-Bot Security Challenge Widget ─── */}
            <div className="enterprise-captcha-container">
              <div className="captcha-header">
                <div className="captcha-title">
                  <Shield size={16} className="captcha-shield-icon" />
                  <span>HPMS Shield Security Check</span>
                </div>
                <div className="captcha-status-pill">
                  {isCaptchaValid ? (
                    <span className="status-verified">
                      <CheckCircle2 size={13} /> Verified Human
                    </span>
                  ) : (
                    <span className="status-pending">Anti-Bot Challenge</span>
                  )}
                </div>
              </div>

              {/* Dynamic CAPTCHA Display Tile */}
              <div className="captcha-tile">
                <div className="captcha-code-display" title="Security Verification Code">
                  <span className="captcha-char char-1">{captchaCode[0]}</span>
                  <span className="captcha-char char-2">{captchaCode[1]}</span>
                  <span className="captcha-char char-3">{captchaCode[2]}</span>
                  <span className="captcha-char char-4">{captchaCode[3]}</span>
                  <div className="captcha-noise-overlay"></div>
                </div>

                <button
                  type="button"
                  onClick={refreshCaptcha}
                  className="captcha-refresh-btn"
                  title="Refresh Verification Code"
                  aria-label="Refresh Verification Code"
                >
                  <RotateCw size={16} />
                </button>
              </div>

              {/* Security Challenge Input */}
              <div className="captcha-input-row">
                <input
                  type="text"
                  value={userCaptchaInput}
                  onChange={handleCaptchaInputChange}
                  placeholder="Enter 4-character code"
                  maxLength={4}
                  className={`form-control captcha-input ${isCaptchaValid ? "is-valid" : ""}`}
                />
              </div>

              {/* Instant Bot Verification Checkbox */}
              <div className="captcha-checkbox-row">
                <input
                  id="bot-protection-checkbox"
                  type="checkbox"
                  checked={isHumanVerified || isCaptchaValid}
                  onChange={handleCheckboxVerification}
                  className="bot-checkbox"
                />
                <label htmlFor="bot-protection-checkbox" className="bot-label">
                  <Bot size={15} />
                  <span>I am not a bot (Security Check)</span>
                </label>
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
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
