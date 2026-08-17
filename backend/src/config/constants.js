// config/constants.js — App-wide constants
// feature: Centralised role and status enums — prevents magic strings scattered across codebase

export const ROLES = {
  ADMIN: "admin",
  DOCTOR: "doctor",
  PATIENT: "patient",
};

export const SPECIALIZATIONS = [
  "Cardiologist",
  "Neurologist",
  "Dermatologist",
  "Pediatrician",
  "Orthopedic",
  "Oncologist",
  "Psychiatrist",
  "General Physician",
];

export const ADMISSION_STATUS = {
  INDOOR: "Indoor",
  OUTDOOR: "Outdoor",
};
