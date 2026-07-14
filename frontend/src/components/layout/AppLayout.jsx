// components/layout/AppLayout.jsx — Shell wrapper used by all authenticated pages
import React from "react";
import Sidebar from "./Sidebar";

/**
 * Wraps every authenticated page with the sidebar + main area shell.
 * Usage: <AppLayout title="Dashboard"><YourPageContent /></AppLayout>
 */
const AppLayout = ({ children, title = "HPMS" }) => {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-area">
        <header className="top-navbar">
          <div className="navbar-title">
            <h1>{title}</h1>
          </div>
          <div className="navbar-actions">
            <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
            </span>
          </div>
        </header>
        <main className="page-content animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
