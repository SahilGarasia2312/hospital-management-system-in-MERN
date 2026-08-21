import { jest, describe, it, expect } from "@jest/globals";
import express from "express";
import request from "supertest";
import {
  createAppointmentValidation,
  updateStatusValidation,
  cancelAppointmentValidation,
  appointmentIdParamValidation,
} from "../appointment.validation.js";
import { validateRequest } from "../../../core/middleware/validation.middleware.js";
import { errorHandler } from "../../../core/middleware/error.middleware.js";

const app = express();
app.use(express.json());

app.post("/appointments", createAppointmentValidation, validateRequest, (req, res) => res.status(201).json({ success: true }));
app.get("/appointments/:appointmentId", appointmentIdParamValidation, validateRequest, (req, res) => res.status(200).json({ success: true }));
app.patch("/appointments/:appointmentId/status", appointmentIdParamValidation, updateStatusValidation, validateRequest, (req, res) => res.status(200).json({ success: true }));
app.patch("/appointments/:appointmentId/cancel", appointmentIdParamValidation, cancelAppointmentValidation, validateRequest, (req, res) => res.status(200).json({ success: true }));

app.use(errorHandler);

describe("QA Unit Test: Appointment Validation Rules", () => {
  const validPayload = {
    doctorId: 1,
    patientId: 1,
    appointmentDate: "2026-09-01T10:00:00.000Z",
    reason: "General Consultation",
    durationMinutes: 30,
  };

  describe("POST /appointments (CREATE)", () => {
    it("should pass with valid appointment payload", async () => {
      const res = await request(app).post("/appointments").send(validPayload);
      expect(res.status).toBe(201);
    });

    it("should fail if doctorId is missing or non-numeric", async () => {
      const res = await request(app).post("/appointments").send({ ...validPayload, doctorId: "abc" });
      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining("Invalid doctorId format")]));
    });

    it("should fail if appointmentDate is invalid format", async () => {
      const res = await request(app).post("/appointments").send({ ...validPayload, appointmentDate: "not-a-date" });
      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining("valid ISO 8601 date string")]));
    });

    it("should fail if durationMinutes is out of range", async () => {
      const res = await request(app).post("/appointments").send({ ...validPayload, durationMinutes: 5 });
      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining("Duration must be between 15 and 120")]));
    });

    it("should fail if reason is missing or empty", async () => {
      const res = await request(app).post("/appointments").send({ ...validPayload, reason: "  " });
      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining("Reason is required")]));
    });
  });

  describe("PATCH /appointments/:appointmentId/status (STATUS TRANSITION)", () => {
    it("should pass with valid status enum", async () => {
      const res = await request(app).patch("/appointments/10/status").send({ status: "confirmed" });
      expect(res.status).toBe(200);
    });

    it("should fail with invalid status enum", async () => {
      const res = await request(app).patch("/appointments/10/status").send({ status: "pending" });
      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining("Invalid status value")]));
    });
  });

  describe("PATCH /appointments/:appointmentId/cancel (CANCEL)", () => {
    it("should pass with valid cancellation reason", async () => {
      const res = await request(app).patch("/appointments/10/cancel").send({ cancellationReason: "Patient unavailable" });
      expect(res.status).toBe(200);
    });

    it("should fail if cancellation reason is missing", async () => {
      const res = await request(app).patch("/appointments/10/cancel").send({});
      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining("Cancellation reason is required")]));
    });
  });
});
