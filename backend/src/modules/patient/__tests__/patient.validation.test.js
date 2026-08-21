import { jest } from "@jest/globals";
import express from "express";
import request from "supertest";
import {
  createPatientValidation,
  updatePatientValidation,
  patientIdParamValidation,
} from "../patient.validation.js";
import { validateRequest } from "../../../core/middleware/validation.middleware.js";
import { errorHandler } from "../../../core/middleware/error.middleware.js";

const app = express();
app.use(express.json());

// Dummy endpoints to test validation middleware in isolation
app.post("/patients", createPatientValidation, validateRequest, (req, res) => res.status(201).json({ success: true }));
app.put("/patients/:patientId", patientIdParamValidation, updatePatientValidation, validateRequest, (req, res) => res.status(200).json({ success: true }));
app.get("/patients/:patientId", patientIdParamValidation, validateRequest, (req, res) => res.status(200).json({ success: true }));

app.use(errorHandler);

describe("QA Unit Test: Patient Validation Rules", () => {
  const validPatientPayload = {
    doctorId: 1,
    name: "John Smith",
    age: 45,
    gender: "Male",
    contact: "9876543210",
    disease: "Fever",
    admissionStatus: "Outdoor",
  };

  describe("POST /patients (CREATE)", () => {
    it("should pass with valid payload", async () => {
      const res = await request(app).post("/patients").send(validPatientPayload);
      expect(res.status).toBe(201);
    });

    it("should fail if required field (disease) is missing", async () => {
      const { disease, ...payload } = validPatientPayload;
      const res = await request(app).post("/patients").send(payload);
      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining("Disease is required")]));
    });

    it("should fail if doctorId is invalid (not numeric)", async () => {
      const res = await request(app).post("/patients").send({ ...validPatientPayload, doctorId: "abc" });
      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining("Invalid doctorId format")]));
    });

    it("should fail if admissionStatus is invalid enum", async () => {
      const res = await request(app).post("/patients").send({ ...validPatientPayload, admissionStatus: "Unknown" });
      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining("Invalid admission status")]));
    });

    it("should preserve multiple validation errors", async () => {
      const res = await request(app).post("/patients").send({
        doctorId: "abc",
        name: "A",
        admissionStatus: "Invalid",
      });
      expect(res.status).toBe(400);
      expect(res.body.errors).toHaveLength(5); // doctorId format, name length, disease string, disease required, admissionStatus invalid
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining("Invalid doctorId format"),
          expect.stringContaining("Name must be between 3 and 100"),
          expect.stringContaining("Disease is required"),
          expect.stringContaining("Invalid admission status"),
        ])
      );
    });
  });

  describe("PUT /patients/:patientId (UPDATE)", () => {
    it("should pass with valid partial update payload", async () => {
      const res = await request(app).put("/patients/1").send({ age: 46 });
      expect(res.status).toBe(200);
    });

    it("should fail if update payload is totally empty", async () => {
      const res = await request(app).put("/patients/1").send({});
      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining("Update payload cannot be empty")]));
    });

    it("should fail if protected field (userId) is injected", async () => {
      const res = await request(app).put("/patients/1").send({ name: "Bob", userId: "507f1f77bcf86cd799439011" });
      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining("Cannot update protected field: userId")]));
    });
    
    it("should fail if protected field (doctorId) is injected", async () => {
      const res = await request(app).put("/patients/1").send({ disease: "Flu", doctorId: 2 });
      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining("Cannot update protected field: doctorId")]));
    });
  });

  describe("patientId PARAMETER VALIDATION", () => {
    it("should pass for valid numeric patientId", async () => {
      const res = await request(app).get("/patients/42");
      expect(res.status).toBe(200);
    });

    it("should fail for alphabetic patientId", async () => {
      const res = await request(app).get("/patients/abc");
      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining("Invalid patientId format")]));
    });
  });
});
