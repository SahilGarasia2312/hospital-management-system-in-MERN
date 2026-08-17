// components/common/Badge.jsx — Status / Role badge
import React from "react";

/**
 * @param {string} variant — success | warning | danger | info | admin | doctor | patient | primary
 * @param {string} children — label text
 */
const Badge = ({ variant = "primary", children, dot = false }) => (
  <span className={`badge badge-${variant}`}>
    {dot && (
      <span
        style={{
          width: 6, height: 6,
          borderRadius: "50%",
          background: "currentColor",
          display: "inline-block",
        }}
      />
    )}
    {children}
  </span>
);

export default Badge;
