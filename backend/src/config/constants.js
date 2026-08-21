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

export const PRESCRIPTION_STATUS = {
  ISSUED: "issued",
  PARTIALLY_DISPENSED: "partially_dispensed",
  DISPENSED: "dispensed",
  CANCELLED: "cancelled",
};

export const DOSAGE_FORMS = [
  "Tablet",
  "Capsule",
  "Syrup",
  "Injection",
  "Ointment",
  "Drops",
  "Inhaler",
  "Other",
];

export const AUDIT_ACTIONS = {
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  APPOINTMENT_CREATED: "APPOINTMENT_CREATED",
  APPOINTMENT_STATUS_CHANGED: "APPOINTMENT_STATUS_CHANGED",
  APPOINTMENT_CANCELLED: "APPOINTMENT_CANCELLED",
  VISIT_CREATED: "VISIT_CREATED",
  VISIT_COMPLETED: "VISIT_COMPLETED",
  MEDICINE_CREATED: "MEDICINE_CREATED",
  MEDICINE_UPDATED: "MEDICINE_UPDATED",
  MEDICINE_STOCK_UPDATED: "MEDICINE_STOCK_UPDATED",
  PRESCRIPTION_ISSUED: "PRESCRIPTION_ISSUED",
  PRESCRIPTION_DISPENSED: "PRESCRIPTION_DISPENSED",
  PRESCRIPTION_CANCELLED: "PRESCRIPTION_CANCELLED",
};
