// features/timeline/PatientTimelinePage.jsx — Patient 360° Longitudinal Medical Record Timeline
import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import Badge from "../../components/common/Badge";
import EmptyState from "../../components/common/EmptyState";
import Spinner from "../../components/common/Spinner";
import ErrorBanner from "../../components/common/ErrorBanner";
import { getPatientTimelineApi, getPatientsApi } from "../../api/patient.api";
import useAuth from "../../hooks/useAuth";
import {
  User,
  Calendar,
  Stethoscope,
  Pill,
  Activity,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const PatientTimelinePage = () => {
  const { patientId: paramPatientId } = useParams();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [patientData, setPatientData] = useState(null);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  // Filters
  const [eventTypeFilter, setEventTypeFilter] = useState("all");
  const [expandedEventIds, setExpandedEventIds] = useState({});

  // Resolve numeric Patient ID
  const [targetPatientId, setTargetPatientId] = useState(null);

  const resolvePatientId = useCallback(async () => {
    if (paramPatientId) {
      setTargetPatientId(paramPatientId);
      return;
    }

    if (user?.role === "patient") {
      try {
        const res = await getPatientsApi();
        const items = res.data?.items || res.items || res.data || res || [];
        if (items.length > 0) {
          setTargetPatientId(items[0].patientId);
        } else {
          setErrorMsg("Patient profile record not found.");
        }
      } catch (err) {
        setErrorMsg("Failed to resolve patient profile.");
      }
    }
  }, [paramPatientId, user]);

  useEffect(() => {
    resolvePatientId();
  }, [resolvePatientId]);

  const fetchTimeline = useCallback(async () => {
    if (!targetPatientId) return;
    setLoading(true);
    setErrorMsg("");

    try {
      const params = { page: pagination.page, limit: 20 };
      if (eventTypeFilter !== "all") params.eventType = eventTypeFilter;

      const res = await getPatientTimelineApi(targetPatientId, params);
      const data = res.data || res;

      setPatientData(data.patient || null);
      setTimelineEvents(data.timeline || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to retrieve longitudinal medical timeline.");
    } finally {
      setLoading(false);
    }
  }, [targetPatientId, eventTypeFilter, pagination.page]);

  useEffect(() => {
    if (targetPatientId) {
      fetchTimeline();
    }
  }, [targetPatientId, fetchTimeline]);

  const toggleExpand = (id) => {
    setExpandedEventIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getEventIcon = (type) => {
    switch (type) {
      case "appointment":
        return <Calendar size={18} color="#3b82f6" />;
      case "visit":
        return <Stethoscope size={18} color="#10b981" />;
      case "prescription":
        return <Pill size={18} color="#8b5cf6" />;
      default:
        return <Activity size={18} color="#94a3b8" />;
    }
  };

  return (
    <AppLayout title="Patient 360° Longitudinal Medical Timeline">
      <ErrorBanner message={errorMsg} />

      {/* Patient Summary Header Card */}
      {patientData && (
        <div className="card" style={{ marginBottom: "24px", background: "linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "rgba(59, 130, 246, 0.15)", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <User size={28} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#f8fafc", margin: 0 }}>
                    {patientData.name}
                  </h2>
                  <Badge variant="info">MRN #{patientData.patientId}</Badge>
                  <Badge variant={patientData.admissionStatus === "Indoor" ? "warning" : "success"}>
                    {patientData.admissionStatus === "Indoor" ? "Inpatient" : "Outpatient"}
                  </Badge>
                </div>
                <p style={{ fontSize: "13px", color: "#94a3b8", margin: "4px 0 0 0" }}>
                  Age: <strong>{patientData.age} yrs</strong> | Gender: <strong>{patientData.gender}</strong> | Condition: <strong>{patientData.disease || "General"}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          {[
            { id: "all", label: "All Timeline Events" },
            { id: "appointment", label: "Appointments" },
            { id: "visit", label: "Clinical Encounters" },
            { id: "prescription", label: "Prescriptions & Pharmacotherapy" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setEventTypeFilter(tab.id)}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "600",
                border: "none",
                cursor: "pointer",
                background: eventTypeFilter === tab.id ? "#3b82f6" : "rgba(255, 255, 255, 0.05)",
                color: eventTypeFilter === tab.id ? "#ffffff" : "#94a3b8",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Stream */}
      {loading ? (
        <Spinner />
      ) : timelineEvents.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No Medical Timeline Events"
          message="No longitudinal medical history events recorded for this patient under the selected filter."
        />
      ) : (
        <div style={{ position: "relative", paddingLeft: "30px", borderLeft: "2px solid rgba(59, 130, 246, 0.3)", marginLeft: "16px" }}>
          {timelineEvents.map((evt, idx) => {
            const eventKey = `${evt.eventType}-${evt.eventId}-${idx}`;
            const isExpanded = expandedEventIds[eventKey];

            return (
              <div key={eventKey} style={{ position: "relative", marginBottom: "24px" }}>
                {/* Timeline Icon Node */}
                <div style={{ position: "absolute", left: "-41px", top: "12px", width: "22px", height: "22px", borderRadius: "50%", background: "#0f172a", border: "2px solid #3b82f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#3b82f6" }} />
                </div>

                {/* Event Card */}
                <div className="card" style={{ transition: "all 0.2s ease" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ padding: "8px", borderRadius: "8px", background: "rgba(255, 255, 255, 0.04)" }}>
                        {getEventIcon(evt.eventType)}
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <h4 style={{ fontSize: "15px", fontWeight: "700", color: "#f8fafc", margin: 0 }}>
                            {evt.eventType === "appointment" && `Scheduled Appointment #${evt.eventId}`}
                            {evt.eventType === "visit" && `Clinical Encounter #${evt.eventId}`}
                            {evt.eventType === "prescription" && `Prescription Order #${evt.eventId}`}
                          </h4>
                          <Badge variant={evt.status === "completed" || evt.status === "dispensed" ? "success" : evt.status === "cancelled" ? "danger" : "primary"}>
                            {evt.status}
                          </Badge>
                        </div>
                        <p style={{ fontSize: "12px", color: "#94a3b8", margin: "3px 0 0 0", display: "flex", alignItems: "center", gap: "6px" }}>
                          <Clock size={12} /> {new Date(evt.occurredAt).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          {evt.summary?.doctorName && (
                            <span>| Attending: <strong>Dr. {evt.summary.doctorName}</strong></span>
                          )}
                        </p>
                      </div>
                    </div>

                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => toggleExpand(eventKey)}
                      style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#3b82f6" }}
                    >
                      <span>{isExpanded ? "Collapse Details" : "View Details"}</span>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>

                  {/* SUMMARY PREVIEW */}
                  <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid rgba(255, 255, 255, 0.06)", fontSize: "13px", color: "#cbd5e1" }}>
                    {evt.eventType === "appointment" && (
                      <p style={{ margin: 0 }}>Reason: <strong>{evt.summary.reason}</strong></p>
                    )}
                    {evt.eventType === "visit" && (
                      <div>
                        <p style={{ margin: "0 0 4px 0" }}>Symptoms: <strong>{evt.summary.symptoms}</strong></p>
                        {evt.summary.diagnosis && (
                          <p style={{ margin: 0, color: "#34d399" }}>Diagnosis: <strong>{evt.summary.diagnosis}</strong></p>
                        )}
                      </div>
                    )}
                    {evt.eventType === "prescription" && (
                      <p style={{ margin: 0 }}>Medications Prescribed: <strong>{evt.summary.itemCount} items</strong></p>
                    )}
                  </div>

                  {/* EXPANDED DETAILS PANEL */}
                  {isExpanded && (
                    <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px dashed rgba(255, 255, 255, 0.1)", background: "rgba(15, 23, 42, 0.5)", borderRadius: "8px", padding: "14px" }}>
                      {/* VISIT DETAILED PANEL */}
                      {evt.eventType === "visit" && (
                        <div>
                          {evt.summary.vitals && Object.keys(evt.summary.vitals).length > 0 && (
                            <div style={{ marginBottom: "12px" }}>
                              <h5 style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 8px 0" }}>Vitals Snapshot</h5>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", fontSize: "12px", color: "#f8fafc" }}>
                                {evt.summary.vitals.bloodPressure && <span>BP: <strong>{evt.summary.vitals.bloodPressure} mmHg</strong></span>}
                                {evt.summary.vitals.heartRate && <span>Heart Rate: <strong>{evt.summary.vitals.heartRate} bpm</strong></span>}
                                {evt.summary.vitals.temperature && <span>Temp: <strong>{evt.summary.vitals.temperature} °F</strong></span>}
                                {evt.summary.vitals.oxygenSaturation && <span>SpO2: <strong>{evt.summary.vitals.oxygenSaturation}%</strong></span>}
                              </div>
                            </div>
                          )}

                          {evt.summary.doctorNotes && (
                            <div>
                              <h5 style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 4px 0" }}>Physician Progress Notes</h5>
                              <p style={{ fontSize: "13px", color: "#cbd5e1", margin: 0 }}>{evt.summary.doctorNotes}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* PRESCRIPTION DETAILED PANEL */}
                      {evt.eventType === "prescription" && (
                        <div>
                          <h5 style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 8px 0" }}>Prescribed Items</h5>
                          <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12px", color: "#e2e8f0" }}>
                            {evt.summary.items?.map((med, mIdx) => (
                              <li key={mIdx} style={{ marginBottom: "4px" }}>
                                <strong>{med.medicineName}</strong> ({med.strength}) — {med.dosage}, {med.frequency} for {med.duration} (Prescribed Qty: {med.quantityPrescribed}, Dispensed: {med.quantityDispensed})
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* APPOINTMENT DETAILED PANEL */}
                      {evt.eventType === "appointment" && (
                        <div>
                          <p style={{ fontSize: "13px", margin: "0 0 4px 0", color: "#94a3b8" }}>
                            Specialization: <strong>{evt.summary.specialization || "General Medicine"}</strong>
                          </p>
                          {evt.summary.cancellationReason && (
                            <p style={{ fontSize: "13px", color: "#f87171", margin: 0 }}>
                              Cancellation Reason: <strong>{evt.summary.cancellationReason}</strong>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
};

export default PatientTimelinePage;
