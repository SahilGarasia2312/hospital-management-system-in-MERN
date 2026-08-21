// components/common/EmptyState.jsx — Reusable empty state component
import React from "react";
import { Inbox, Plus } from "lucide-react";

const EmptyState = ({
  icon: Icon = Inbox,
  title = "No data found",
  description = "There are no records to display at this time.",
  actionLabel,
  onAction,
}) => (
  <div
    style={{
      textAlign: "center",
      padding: "48px 24px",
      borderRadius: "12px",
      background: "rgba(255, 255, 255, 0.02)",
      border: "1px dashed rgba(255, 255, 255, 0.1)",
      margin: "20px 0",
    }}
  >
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "56px",
        height: "56px",
        borderRadius: "50%",
        background: "rgba(255, 255, 255, 0.05)",
        color: "#94a3b8",
        marginBottom: "16px",
      }}
    >
      <Icon size={28} />
    </div>
    <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#f8fafc", marginBottom: "6px" }}>{title}</h3>
    <p style={{ fontSize: "14px", color: "#94a3b8", maxWidth: "400px", margin: "0 auto 20px" }}>{description}</p>
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        className="btn btn-primary"
        style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
      >
        <Plus size={16} />
        <span>{actionLabel}</span>
      </button>
    )}
  </div>
);

export default EmptyState;
