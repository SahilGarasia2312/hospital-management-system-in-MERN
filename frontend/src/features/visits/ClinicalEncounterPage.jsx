// features/visits/ClinicalEncounterPage.jsx — Doctor EMR / EHR Clinical Encounter Workspace
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import Spinner from "../../components/common/Spinner";
import ErrorBanner from "../../components/common/ErrorBanner";
import PatientClinicalHeader from "./components/PatientClinicalHeader";
import VitalsSection from "./components/VitalsSection";
import SymptomsSection from "./components/SymptomsSection";
import DiagnosisSection from "./components/DiagnosisSection";
import PrescriptionSection from "./components/PrescriptionSection";
import { getVisitByIdApi, createVisitApi, updateVisitApi, completeVisitApi, getVisitsApi } from "../../api/visit.api";
import { getAppointmentByIdApi } from "../../api/appointment.api";
import useAuth from "../../hooks/useAuth";
import { CheckCircle2, Save, Lock, ArrowLeft } from "lucide-react";

const ClinicalEncounterPage = () => {
  const { visitId } = useParams();
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get("appointmentId");
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState([]);
  const [saving, setSaving] = useState(false);

  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "vitals" | "symptoms" | "diagnosis" | "prescriptions"

  // Visit State
  const [visit, setVisit] = useState(null);
  const [appointment, setAppointment] = useState(null);

  // Form Fields
  const [vitals, setVitals] = useState({});
  const [symptoms, setSymptoms] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [doctorNotes, setDoctorNotes] = useState("");
  const [diagnosisValidationError, setDiagnosisValidationError] = useState(false);

  // Load or Initialize Visit
  const loadEncounter = useCallback(async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      if (visitId) {
        // Fetch existing visit by numeric visitId
        const res = await getVisitByIdApi(visitId);
        const vData = res.data || res;
        setVisit(vData);
        setVitals(vData.vitals || {});
        setSymptoms(vData.symptoms || "");
        setDiagnosis(vData.diagnosis || "");
        setDoctorNotes(vData.doctorNotes || "");
        if (vData.appointmentId) {
          setAppointment(vData.appointmentId);
        }
      } else if (appointmentId) {
        // Check if visit already exists for this appointment
        const apptRes = await getAppointmentByIdApi(appointmentId);
        const apptData = apptRes.data || apptRes;
        setAppointment(apptData);

        const existingVisits = await getVisitsApi({ patientId: apptData.patientId?.patientId });
        const items = existingVisits.data?.items || existingVisits.items || existingVisits.data || existingVisits || [];
        const existing = items.find((v) => v.appointmentId?._id === apptData._id || v.appointmentId === apptData._id);

        if (existing) {
          navigate(`/doctor/visits/${existing.visitId}`, { replace: true });
          return;
        }

        // Create new clinical visit for appointment
        const newVisitRes = await createVisitApi({
          doctorId: apptData.doctorId?.doctorId || apptData.doctorId,
          patientId: apptData.patientId?.patientId || apptData.patientId,
          appointmentId: apptData.appointmentId,
          symptoms: apptData.reason || "Scheduled Consultation",
        });

        const newVisit = newVisitRes.data || newVisitRes;
        navigate(`/doctor/visits/${newVisit.visitId}`, { replace: true });
        return;
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to load clinical encounter.");
    } finally {
      setLoading(false);
    }
  }, [visitId, appointmentId, navigate]);

  useEffect(() => {
    loadEncounter();
  }, [loadEncounter]);

  // Save Progress Handler
  const handleSaveProgress = async () => {
    if (!visit) return;
    setSaving(true);
    setErrorMsg("");
    setFieldErrors([]);
    try {
      const updated = await updateVisitApi(visit.visitId, {
        vitals,
        symptoms,
        diagnosis,
        doctorNotes,
      });
      const vData = updated.data || updated;
      setVisit(vData);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to save clinical progress.");
    } finally {
      setSaving(false);
    }
  };

  // Complete Visit Handler
  const handleCompleteEncounter = async () => {
    if (!visit) return;
    if (!diagnosis || !diagnosis.trim()) {
      setDiagnosisValidationError(true);
      setActiveTab("diagnosis");
      return;
    }
    setDiagnosisValidationError(false);
    setSaving(true);
    setErrorMsg("");
    setFieldErrors([]);

    try {
      const completed = await completeVisitApi(visit.visitId, {
        diagnosis,
        doctorNotes,
      });
      const vData = completed.data || completed;
      setVisit(vData);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to complete clinical encounter.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AppLayout title="Clinical Encounter"><Spinner /></AppLayout>;

  const isCompleted = visit?.status === "completed";
  const isReadOnly = isCompleted || user?.role === "patient";

  return (
    <AppLayout title={`Clinical Encounter #${visit?.visitId || ""}`}>
      {/* Back Button Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <ArrowLeft size={16} />
          <span>Back to Roster / Appointments</span>
        </button>

        {/* Global Encounter Action Buttons */}
        {!isReadOnly && (
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn btn-secondary btn-sm" onClick={handleSaveProgress} disabled={saving} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Save size={16} />
              <span>{saving ? "Saving..." : "Save Progress"}</span>
            </button>
            <button className="btn btn-success btn-sm" onClick={handleCompleteEncounter} disabled={saving} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <CheckCircle2 size={16} />
              <span>{saving ? "Completing..." : "Finalize & Complete Encounter"}</span>
            </button>
          </div>
        )}
      </div>

      <ErrorBanner message={errorMsg} errors={fieldErrors} />

      {/* Completed Banner */}
      {isCompleted && (
        <div style={{ padding: "14px 18px", borderRadius: "10px", background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)", color: "#34d399", display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <Lock size={20} />
          <div>
            <strong style={{ fontSize: "14px" }}>Clinical Encounter Completed</strong>
            <p style={{ fontSize: "12px", margin: "2px 0 0 0", color: "#a7f3d0" }}>
              This medical encounter was finalized on {new Date(visit.completedAt).toLocaleString()}. The clinical record is permanent and read-only.
            </p>
          </div>
        </div>
      )}

      {/* Patient & Appointment Context Header */}
      <PatientClinicalHeader
        patient={visit?.patientId}
        doctor={visit?.doctorId}
        appointment={appointment}
        visitStatus={visit?.status}
      />

      {/* Navigation Tabs */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", marginBottom: "20px", paddingBottom: "4px" }}>
        {[
          { id: "overview", label: "Overview" },
          { id: "vitals", label: "Vitals Telemetry" },
          { id: "symptoms", label: "Symptoms" },
          { id: "diagnosis", label: "Assessment & Diagnosis" },
          { id: "prescriptions", label: "Prescriptions" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: "600",
              border: "none",
              cursor: "pointer",
              background: activeTab === tab.id ? "#3b82f6" : "transparent",
              color: activeTab === tab.id ? "#ffffff" : "#94a3b8",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      {activeTab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <VitalsSection vitals={vitals} onChange={setVitals} isReadOnly={isReadOnly} />
          <SymptomsSection symptoms={symptoms} onChange={setSymptoms} isReadOnly={isReadOnly} />
          <DiagnosisSection
            diagnosis={diagnosis}
            doctorNotes={doctorNotes}
            onDiagnosisChange={setDiagnosis}
            onNotesChange={setDoctorNotes}
            isReadOnly={isReadOnly}
            validationError={diagnosisValidationError}
          />
          <PrescriptionSection
            doctorId={visit?.doctorId?.doctorId}
            patientId={visit?.patientId?.patientId}
            visitId={visit?.visitId}
            isReadOnly={isReadOnly}
          />
        </div>
      )}

      {activeTab === "vitals" && (
        <VitalsSection vitals={vitals} onChange={setVitals} isReadOnly={isReadOnly} />
      )}

      {activeTab === "symptoms" && (
        <SymptomsSection symptoms={symptoms} onChange={setSymptoms} isReadOnly={isReadOnly} />
      )}

      {activeTab === "diagnosis" && (
        <DiagnosisSection
          diagnosis={diagnosis}
          doctorNotes={doctorNotes}
          onDiagnosisChange={setDiagnosis}
          onNotesChange={setDoctorNotes}
          isReadOnly={isReadOnly}
          validationError={diagnosisValidationError}
        />
      )}

      {activeTab === "prescriptions" && (
        <PrescriptionSection
          doctorId={visit?.doctorId?.doctorId}
          patientId={visit?.patientId?.patientId}
          visitId={visit?.visitId}
          isReadOnly={isReadOnly}
        />
      )}
    </AppLayout>
  );
};

export default ClinicalEncounterPage;
