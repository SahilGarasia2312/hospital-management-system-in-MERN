// components/common/Spinner.jsx — Loading indicator
import React from "react";

const Spinner = ({ fullPage = false, size = "md" }) => {
  const sizes = { sm: "24px", md: "40px", lg: "56px" };
  return (
    <div className={`spinner-wrapper${fullPage ? " full-page" : ""}`}>
      <div
        className="spinner"
        style={{ width: sizes[size], height: sizes[size] }}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
};

export default Spinner;
