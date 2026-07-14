import React from "react";
import "../CompStyles/navbar.css";
import { Link } from "react-router-dom";

export const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="brand">HPMS</div>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/Doctor">Doctor</Link>
        <Link to="/Patient">Patient</Link>
        <Link to="/PatientRecordManager">PatientRecordManager</Link>
      </div>
    </nav>
  );
};
