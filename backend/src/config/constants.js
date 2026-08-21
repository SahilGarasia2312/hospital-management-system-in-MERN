// config/constants.js — App-wide constants
// feature: Centralised role and status enums — prevents magic strings scattered across codebase

export const ROLES = {
  ADMIN: "admin",
  DOCTOR: "doctor",
  PATIENT: "patient",
};

export const SPECIALIZATIONS = [
  "Cardiology",
  "Cardiologist",
  "Neurology",
  "Neurologist",
  "Dermatology",
  "Dermatologist",
  "Pediatrics",
  "Pediatrician",
  "Orthopedics",
  "Orthopedic",
  "Oncology",
  "Oncologist",
  "Psychiatry",
  "Psychiatrist",
  "General Practice",
  "General Physician",
];

export const ADMISSION_STATUS = {
  INDOOR: "Indoor",
  OUTDOOR: "Outdoor",
};

export const APPOINTMENT_STATUS = {
  SCHEDULED: "scheduled",
  CONFIRMED: "confirmed",
  CHECKED_IN: "checked_in",
  IN_CONSULTATION: "in_consultation",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  NO_SHOW: "no_show",
};

export const VISIT_STATUS = {
  OPEN: "open",
  COMPLETED: "completed",
};
