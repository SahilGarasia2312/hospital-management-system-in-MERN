// components/ui/StatCard.jsx — Dashboard statistics widget with vector icon support
import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

/**
 * @param {React.ReactNode} icon — Lucide icon element
 * @param {string|number} value — The metric value
 * @param {string} label — Metric label
 * @param {string} iconBg — CSS background color for icon container
 * @param {string} trend — e.g. "12% increase"
 * @param {string} trendDir — "up" | "down"
 */
const StatCard = ({ icon, value, label, iconBg = "#ccfbf1", trend, trendDir = "up" }) => (
  <div className="stat-card animate-slide-up">
    <div className="stat-icon" style={{ background: iconBg }}>
      {icon}
    </div>
    <div className="stat-content">
      <div className="stat-value">{value ?? "—"}</div>
      <div className="stat-label">{label}</div>
      {trend && (
        <div className={`stat-trend ${trendDir}`}>
          {trendDir === "up" ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          <span>{trend}</span>
        </div>
      )}
    </div>
  </div>
);

export default StatCard;
