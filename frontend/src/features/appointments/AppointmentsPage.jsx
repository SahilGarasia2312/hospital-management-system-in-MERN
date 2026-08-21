// features/appointments/AppointmentsPage.jsx — Main Appointments Scheduling View
import React, { useState, useEffect, useCallback } from "react";
import AppLayout from "../../components/layout/AppLayout";
import AppointmentCalendar from "./AppointmentCalendar";
import AppointmentModal from "./AppointmentModal";
import AppointmentDetailModal from "./AppointmentDetailModal";
import ErrorBanner from "../../components/common/ErrorBanner";
import Spinner from "../../components/common/Spinner";
import { getAppointmentsApi } from "../../api/appointment.api";
import useAuth from "../../hooks/useAuth";

const AppointmentsPage = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await getAppointmentsApi({ limit: 100 });
      setAppointments(res.data || res || []);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to load appointment schedule.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return (
    <AppLayout title="Appointment Scheduling & Operations">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>Appointment Calendar & Consultations</h1>
          <p>
            {user?.role === "admin" && "Enterprise schedule overview, doctor slot management, and consultation lifecycle."}
            {user?.role === "doctor" && "Your assigned consultation queue, patient bookings, and visit state management."}
            {user?.role === "patient" && "Your personal appointment calendar, upcoming visits, and booking status."}
          </p>
        </div>
      </div>

      <ErrorBanner message={errorMsg} onRetry={fetchAppointments} />

      {loading ? (
        <Spinner />
      ) : (
        <AppointmentCalendar
          appointments={appointments}
          loading={loading}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onSelectAppointment={(app) => setSelectedAppointment(app)}
          onOpenScheduleModal={() => setIsScheduleOpen(true)}
        />
      )}

      {/* Schedule Modal */}
      <AppointmentModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        onSuccess={fetchAppointments}
        initialDate={selectedDate}
      />

      {/* Appointment Detail & Actions Modal */}
      <AppointmentDetailModal
        isOpen={!!selectedAppointment}
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        onRefresh={fetchAppointments}
      />
    </AppLayout>
  );
};

export default AppointmentsPage;
