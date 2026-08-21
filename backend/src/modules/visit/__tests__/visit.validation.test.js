import { jest, describe, it, expect } from "@jest/globals";
import express from "express";
import request from "supertest";
import {
  createVisitValidation,
  updateVisitValidation,
  visitIdParamValidation,
} from "../visit.validation.js";
import { validateRequest } from "../../../core/middleware/validation.middleware.js";
import { errorHandler } from "../../../core/middleware/error.middleware.js";

const app = express();
app.use(express.json());

app.post("/visits", createVisitValidation, validateRequest, (req, res) => res.status(201).json({ success: true }));
app.get("/visits/:visitId", visitIdParamValidation, validateRequest, (req, res) => res.status(200).json({ success: true }));
app.patch("/visits/:visitId", visitIdParamValidation, updateVisitValidation, validateRequest, (req, res) => res.status(200).json({ success: true }));

app.use(errorHandler);

describe("QA Unit Test: Clinical Visit Validation Rules", () => {
  const validVisitPayload = {
    doctorId: 1,
    patientId: 1,
    symptoms: "Fever and cough",
    diagnosis: "Acute Bronchitis",
    vitals: {
      temperature: 101.2,
      bloodPressure: "120/80",
    },
  };

  describe("POST /visits (CREATE)", () => {
    it("should pass with valid visit payload", async () => {
      const res = await request(app).post("/visits").send(validVisitPayload);
      expect(res.status).toBe(201);
    });

    it("should fail if symptoms description is missing", async () => {
      const { symptoms, ...payload } = validVisitPayload;
      const res = await request(app).post("/visits").send(payload);
      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining("Symptoms description is required")]));
    });

    it("should fail if doctorId is non-numeric", async () => {
      const res = await request(app).post("/visits").send({ ...validVisitPayload, doctorId: "invalid" });
      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining("Invalid doctorId format")]));
    });

    it("should fail if followUpDate is malformed", async () => {
      const res = await request(app).post("/visits").send({ ...validVisitPayload, followUpDate: "invalid-date" });
      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining("valid ISO 8601 date string")]));
    });

    it("should fail if prescription item is missing required fields", async () => {
      const res = await request(app)
        .post("/visits")
        .send({ ...validVisitPayload, prescriptions: [{ medicineName: "Amoxicillin" }] });
      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining("required for prescription item")]));
    });
  });

  describe("PATCH /visits/:visitId (UPDATE)", () => {
    it("should pass with valid update payload", async () => {
      const res = await request(app).patch("/visits/1").send({ doctorNotes: "Patient resting well" });
      expect(res.status).toBe(200);
    });

    it("should fail when trying to update protected field: status", async () => {
      const res = await request(app).patch("/visits/1").send({ status: "completed" });
      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining("Cannot update protected field: status")]));
    });

    it("should fail with empty payload", async () => {
      const res = await request(app).patch("/visits/1").send({});
      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining("Update payload cannot be empty")]));
    });
  });
});
