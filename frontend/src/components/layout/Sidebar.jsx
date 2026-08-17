// components/layout/Sidebar.jsx — Enterprise Navigation Sidebar with Lucide Icons
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import Badge from "../common/Badge";
import { 
  Building2, 
  LayoutDashboard, 
  Stethoscope, 
  Users, 
  ClipboardList, 
  LogOut 
} from "lucide-react";

const NAV_ITEMS = {
  admin: [
    { label: "Dashboard",       icon: <LayoutDashboard size={18} />, path: "/admin" },
    { label: "Manage Doctors",  icon: <Stethoscope size={18} />,     path: "/admin/doctors" },
    { label: "Manage Patients", icon: <Users size={18} />,           path: "/admin/patients" },
  ],
  doctor: [
    { label: "My Dashboard",    icon: <LayoutDashboard size={18} />, path: "/doctor/dashboard" },
  ],
  patient: [
    { label: "My Records",      icon: <ClipboardList size={18} />,   path: "/patient/dashboard" },
  ],
};

const ROLE_BADGE = { admin: "admin", doctor: "doctor", patient: "patient" };

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const navItems = NAV_ITEMS[user.role] || [];
  const initials = user.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      {/* ─── Brand ─────────────────────────────────────── */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Building2 size={22} />
          </div>
          <div className="sidebar-logo-text">
            <h2>HPMS</h2>
            <p>Enterprise Medical</p>
          </div>
        </div>
      </div>

      {/* ─── Navigation ────────────────────────────────── */}
      <nav className="sidebar-nav">
        <p className="nav-section-label">Navigation</p>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path.split("/").length <= 2}
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
          >
            <span className="nav-icon" style={{ display: "flex", alignItems: "center" }}>
              {item.icon}
            </span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* ─── User Footer ───────────────────────────────── */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user.name}</div>
            <div className="sidebar-user-role">
              <Badge variant={ROLE_BADGE[user.role]}>{user.role}</Badge>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="btn btn-ghost btn-sm"
          style={{ width: "100%", marginTop: "8px", justifyContent: "center", color: "#ef4444", gap: "8px" }}
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
