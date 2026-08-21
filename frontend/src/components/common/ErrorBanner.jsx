// components/common/ErrorBanner.jsx — User-friendly alert banner for API/Validation errors
import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

const ErrorBanner = ({ message, errors = [], onRetry }) => {
  if (!message && (!errors || errors.length === 0)) return null;

  return (
    <div
      style={{
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        border: "1px solid rgba(239, 68, 68, 0.3)",
        borderRadius: "8px",
        padding: "16px",
        marginBottom: "20px",
        color: "#f87171",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
        <AlertCircle size={20} style={{ flexShrink: 0, marginTop: "2px" }} />
        <div style={{ flexGrow: 1 }}>
          <strong style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "600" }}>
            {message || "An error occurred while processing your request."}
          </strong>
          {errors && errors.length > 0 && (
            <ul style={{ margin: "4px 0 0 0", paddingLeft: "18px", fontSize: "13px" }}>
              {errors.map((err, i) => (
                <li key={i}>{typeof err === "string" ? err : err.msg || JSON.stringify(err)}</li>
              ))}
            </ul>
          )}
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="btn btn-secondary btn-sm"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <RefreshCw size={14} />
            <span>Retry</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorBanner;
