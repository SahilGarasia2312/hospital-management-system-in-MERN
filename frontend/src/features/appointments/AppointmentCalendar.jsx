// features/appointments/AppointmentCalendar.jsx — Dynamic Multi-View Calendar Component
import React, { useState } from "react";
import Badge from "../../components/common/Badge";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Filter,
} from "lucide-react";

const STATUS_COLORS = {
  scheduled: "#3b82f6",
  confirmed: "#6366f1",
  checked_in: "#f59e0b",
  in_consultation: "#8b5cf6",
  completed: "#10b981",
  cancelled: "#ef4444",
  no_show: "#f97316",
};

const AppointmentCalendar = ({
  appointments = [],
  loading = false,
  onSelectAppointment,
  onOpenScheduleModal,
  selectedDate = new Date(),
  onDateChange,
}) => {
  const [viewMode, setViewMode] = useState("month"); // "month" | "week" | "day"
  const [statusFilter, setStatusFilter] = useState("all");

  const currentDate = new Date(selectedDate);

  // Filter appointments by status
  const filteredAppointments = appointments.filter((app) => {
    if (statusFilter === "all") return true;
    return app.status === statusFilter;
  });

  // Date Navigation Helpers
  const handlePrev = () => {
    const next = new Date(currentDate);
    if (viewMode === "month") next.setMonth(next.getMonth() - 1);
    else if (viewMode === "week") next.setDate(next.getDate() - 7);
    else next.setDate(next.getDate() - 1);
    if (onDateChange) onDateChange(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (viewMode === "month") next.setMonth(next.getMonth() + 1);
    else if (viewMode === "week") next.setDate(next.getDate() + 7);
    else next.setDate(next.getDate() + 1);
    if (onDateChange) onDateChange(next);
  };

  const handleToday = () => {
    if (onDateChange) onDateChange(new Date());
  };

  // Calendar Grid Generation for Month View
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = [];
  // Padding previous month days
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push({ isCurrentMonth: false });
  }
  // Days of current month
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    const dateStr = dateObj.toISOString().split("T")[0];
    const dayApps = filteredAppointments.filter((app) => {
      const appDateStr = new Date(app.appointmentDate).toISOString().split("T")[0];
      return appDateStr === dateStr;
    });
    calendarDays.push({
      date: dateObj,
      dayNumber: d,
      isCurrentMonth: true,
      appointments: dayApps,
      isToday: new Date().toDateString() === dateObj.toDateString(),
    });
  }

  // Week View Days Generation
  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    const dayOfWeek = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek); // Sunday as start

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const dateObj = new Date(startOfWeek);
      dateObj.setDate(dateObj.getDate() + i);
      const dateStr = dateObj.toISOString().split("T")[0];
      const dayApps = filteredAppointments.filter((app) => {
        const appDateStr = new Date(app.appointmentDate).toISOString().split("T")[0];
        return appDateStr === dateStr;
      });
      weekDays.push({
        date: dateObj,
        dayNumber: dateObj.getDate(),
        dayName: dateObj.toLocaleDateString("en-US", { weekday: "short" }),
        appointments: dayApps,
        isToday: new Date().toDateString() === dateObj.toDateString(),
      });
    }
    return weekDays;
  };

  return (
    <div style={{ background: "#0f172a", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "20px" }}>
      {/* Calendar Header Controls */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
        {/* Left: Navigation & Date Label */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ display: "flex", gap: "4px" }}>
            <button onClick={handlePrev} className="btn btn-ghost btn-sm" style={{ padding: "6px" }}>
              <ChevronLeft size={18} />
            </button>
            <button onClick={handleToday} className="btn btn-secondary btn-sm">
              Today
            </button>
            <button onClick={handleNext} className="btn btn-ghost btn-sm" style={{ padding: "6px" }}>
              <ChevronRight size={18} />
            </button>
          </div>
          <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#f8fafc", margin: 0, minWidth: "180px" }}>
            {currentDate.toLocaleString("en-US", { month: "long", year: "numeric" })}
          </h2>
        </div>

        {/* Right: Filters, Views & Action */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          {/* Status Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Filter size={16} style={{ color: "#94a3b8" }} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-control"
              style={{ width: "140px", padding: "6px 10px", fontSize: "13px" }}
            >
              <option value="all">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="checked_in">Checked In</option>
              <option value="in_consultation">In Consultation</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* View Mode Buttons */}
          <div style={{ display: "flex", background: "rgba(255, 255, 255, 0.05)", borderRadius: "8px", padding: "3px" }}>
            {["month", "week", "day"].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  padding: "4px 12px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: "500",
                  border: "none",
                  cursor: "pointer",
                  background: viewMode === mode ? "#3b82f6" : "transparent",
                  color: viewMode === mode ? "#ffffff" : "#94a3b8",
                  textTransform: "capitalize",
                }}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Schedule Button */}
          {onOpenScheduleModal && (
            <button onClick={() => onOpenScheduleModal()} className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Plus size={16} />
              <span>Schedule</span>
            </button>
          )}
        </div>
      </div>

      {/* MONTH VIEW */}
      {viewMode === "month" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px" }}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
            <div key={dayName} style={{ textAlign: "center", padding: "8px", fontSize: "12px", fontWeight: "600", color: "#64748b" }}>
              {dayName}
            </div>
          ))}
          {calendarDays.map((cell, idx) => (
            <div
              key={idx}
              style={{
                minHeight: "110px",
                padding: "8px",
                borderRadius: "10px",
                background: cell.isCurrentMonth ? (cell.isToday ? "rgba(59, 130, 246, 0.1)" : "rgba(255, 255, 255, 0.02)") : "transparent",
                border: cell.isToday ? "1px solid #3b82f6" : "1px solid rgba(255, 255, 255, 0.05)",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                opacity: cell.isCurrentMonth ? 1 : 0.25,
              }}
            >
              {cell.isCurrentMonth && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", fontWeight: cell.isToday ? "700" : "500", color: cell.isToday ? "#3b82f6" : "#cbd5e1" }}>
                    {cell.dayNumber}
                  </span>
                  {cell.appointments?.length > 0 && (
                    <span style={{ fontSize: "10px", background: "rgba(255, 255, 255, 0.1)", color: "#94a3b8", borderRadius: "10px", padding: "1px 6px" }}>
                      {cell.appointments.length}
                    </span>
                  )}
                </div>
              )}
              {cell.isCurrentMonth &&
                cell.appointments?.map((app) => (
                  <div
                    key={app._id}
                    onClick={() => onSelectAppointment && onSelectAppointment(app)}
                    style={{
                      background: STATUS_COLORS[app.status] || "#3b82f6",
                      color: "#ffffff",
                      fontSize: "11px",
                      fontWeight: "500",
                      padding: "4px 6px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      marginTop: "2px",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                    }}
                    title={`${app.patientId?.name || "Patient"} — Dr. ${app.doctorId?.name || "Doctor"}`}
                  >
                    {new Date(app.appointmentDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} — {app.patientId?.name || "Patient"}
                  </div>
                ))}
            </div>
          ))}
        </div>
      )}

      {/* WEEK VIEW */}
      {viewMode === "week" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px" }}>
          {getWeekDays().map((weekDay, idx) => (
            <div
              key={idx}
              style={{
                minHeight: "350px",
                background: weekDay.isToday ? "rgba(59, 130, 246, 0.08)" : "rgba(255, 255, 255, 0.02)",
                border: weekDay.isToday ? "1px solid #3b82f6" : "1px solid rgba(255, 255, 255, 0.05)",
                borderRadius: "10px",
                padding: "10px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div style={{ textAlign: "center", borderBottom: "1px solid rgba(255, 255, 255, 0.06)", paddingBottom: "6px" }}>
                <span style={{ fontSize: "12px", color: "#64748b", display: "block" }}>{weekDay.dayName}</span>
                <strong style={{ fontSize: "16px", color: weekDay.isToday ? "#3b82f6" : "#f8fafc" }}>{weekDay.dayNumber}</strong>
              </div>
              <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                {weekDay.appointments.map((app) => (
                  <div
                    key={app._id}
                    onClick={() => onSelectAppointment && onSelectAppointment(app)}
                    style={{
                      background: "rgba(15, 23, 42, 0.8)",
                      borderLeft: `4px solid ${STATUS_COLORS[app.status] || "#3b82f6"}`,
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      padding: "8px",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    <span style={{ fontSize: "11px", color: STATUS_COLORS[app.status], fontWeight: "600", display: "block" }}>
                      {new Date(app.appointmentDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <strong style={{ fontSize: "12px", color: "#f8fafc", display: "block", marginTop: "2px" }}>
                      {app.patientId?.name || "Patient"}
                    </strong>
                    <span style={{ fontSize: "11px", color: "#94a3b8", display: "block" }}>
                      Dr. {app.doctorId?.name}
                    </span>
                  </div>
                ))}
                {weekDay.appointments.length === 0 && (
                  <span style={{ fontSize: "12px", color: "#475569", textAlign: "center", marginTop: "20px" }}>No events</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DAY VIEW */}
      {viewMode === "day" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ padding: "12px", background: "rgba(255, 255, 255, 0.03)", borderRadius: "8px", textAlign: "center" }}>
            <strong style={{ color: "#f8fafc", fontSize: "16px" }}>
              {currentDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </strong>
          </div>
          {filteredAppointments.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
              <CalendarIcon size={36} style={{ marginBottom: "8px" }} />
              <p>No appointments scheduled for this date.</p>
            </div>
          ) : (
            filteredAppointments.map((app) => (
              <div
                key={app._id}
                onClick={() => onSelectAppointment && onSelectAppointment(app)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 18px",
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  borderLeft: `5px solid ${STATUS_COLORS[app.status] || "#3b82f6"}`,
                  borderRadius: "10px",
                  cursor: "pointer",
                }}
              >
                <div>
                  <span style={{ fontSize: "14px", fontWeight: "700", color: "#3b82f6" }}>
                    {new Date(app.appointmentDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <strong style={{ display: "block", fontSize: "15px", color: "#f8fafc", marginTop: "2px" }}>
                    {app.patientId?.name} — Dr. {app.doctorId?.name}
                  </strong>
                  <span style={{ fontSize: "13px", color: "#94a3b8" }}>{app.reason}</span>
                </div>
                <Badge variant={app.status === "completed" ? "success" : app.status === "cancelled" ? "danger" : "primary"}>
                  {app.status}
                </Badge>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AppointmentCalendar;
