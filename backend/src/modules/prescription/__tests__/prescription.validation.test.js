import { describe, it, expect } from "@jest/globals";
import express from "express";
import request from "supertest";
import {
  createPrescriptionValidation,
  cancelPrescriptionValidation,
  prescriptionIdParamValidation,
} from "../prescription.validation.js";
import { validateRequest } from "../../../core/middleware/validation.middleware.js";
import { errorHandler } from "../../../core/middleware/error.middleware.js";

const app = express();
app.use(express.json());

app.post("/prescriptions", createPrescriptionValidation, validateRequest, (req, res) => res.status(201).json({ success: true }));
app.get("/prescriptions/:prescriptionId", prescriptionIdParamValidation, validateRequest, (req, res) => res.status(200).json({ success: true }));
app.patch("/prescriptions/:prescriptionId/cancel", prescriptionIdParamValidation, cancelPrescriptionValidation, validateRequest, (req, res) => res.status(200).json({ success: true }));

app.use(errorHandler);

describe("QA Unit Test: Prescription Validation Rules", () => {
  const validPrescriptionPayload = {
    doctorId: 1,
    patientId: 1,
    items: [
      {
        medicineId: 1,
        dosage: "1 tablet",
        frequency: "BD (Twice a day)",
        duration: "5 days",
        quantityPrescribed: 10,
      },
    ],
    notes: "Take after meals",
  };

  describe("POST /prescriptions (CREATE)", () => {
    it("should pass with valid prescription payload", async () => {
      const res = await request(app).post("/prescriptions").send(validPrescriptionPayload);
      expect(res.status).toBe(201);
    });

    it("should fail if doctorId is missing or non-numeric", async () => {
      const res = await request(app).post("/prescriptions").send({ ...validPrescriptionPayload, doctorId: "abc" });
      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining("Invalid doctorId format")]));
    });

    it("should fail if items array is empty", async () => {
      const res = await request(app).post("/prescriptions").send({ ...validPrescriptionPayload, items: [] });
      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining("must contain at least one medicine item")]));
    });

    it("should fail if item is missing required dosage field", async () => {
      const invalidItemsPayload = {
        ...validPrescriptionPayload,
        items: [{ medicineId: 1, frequency: "BD", duration: "5 days", quantityPrescribed: 10 }],
      };
      const res = await request(app).post("/prescriptions").send(invalidItemsPayload);
      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining("Dosage is required for prescription item")]));
    });
  });

  describe("PATCH /prescriptions/:prescriptionId/cancel (CANCEL)", () => {
    it("should pass with valid cancellation reason", async () => {
      const res = await request(app).patch("/prescriptions/1/cancel").send({ cancellationReason: "Incorrect dosage prescribed" });
      expect(res.status).toBe(200);
    });

    it("should fail if cancellation reason is missing", async () => {
      const res = await request(app).patch("/prescriptions/1/cancel").send({});
      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining("Cancellation reason is required")]));
    });
  });
});
