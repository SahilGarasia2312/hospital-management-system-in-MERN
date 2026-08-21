// components/common/StatCard.jsx — Metric stat card for Dashboards
import React from "react";

const StatCard = ({ title, value, icon: Icon, color = "#3b82f6", subtitle, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: "rgba(15, 23, 42, 0.6)",
      backdropFilter: "blur(12px)",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      borderRadius: "14px",
      padding: "20px",
      display: "flex",
      alignItems: "center",
      gap: "16px",
      cursor: onClick ? "pointer" : "default",
      transition: "transform 0.2s ease, border-color 0.2s ease",
    }}
    className={onClick ? "hover-card" : ""}
  >
    {Icon && (
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "12px",
          background: `${color}15`,
          color: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={24} />
      </div>
    )}
    <div>
      <span style={{ fontSize: "13px", color: "#94a3b8", fontWeight: "500", display: "block" }}>{title}</span>
      <span style={{ fontSize: "24px", fontWeight: "700", color: "#f8fafc", lineHeight: "1.2", marginTop: "2px", display: "block" }}>
        {value !== undefined && value !== null ? value : "—"}
      </span>
      {subtitle && (
        <span style={{ fontSize: "12px", color: "#64748b", marginTop: "4px", display: "block" }}>{subtitle}</span>
      )}
    </div>
  </div>
);

export default StatCard;
