import { describe, it, expect } from "@jest/globals";
import express from "express";
import request from "supertest";
import {
  createMedicineValidation,
  updateMedicineValidation,
  medicineIdParamValidation,
} from "../medicine.validation.js";
import { validateRequest } from "../../../core/middleware/validation.middleware.js";
import { errorHandler } from "../../../core/middleware/error.middleware.js";

const app = express();
app.use(express.json());

app.post("/medicines", createMedicineValidation, validateRequest, (req, res) => res.status(201).json({ success: true }));
app.get("/medicines/:medicineId", medicineIdParamValidation, validateRequest, (req, res) => res.status(200).json({ success: true }));
app.put("/medicines/:medicineId", medicineIdParamValidation, updateMedicineValidation, validateRequest, (req, res) => res.status(200).json({ success: true }));

app.use(errorHandler);

describe("QA Unit Test: Medicine Validation Rules", () => {
  const validMedicinePayload = {
    name: "Amoxicillin",
    genericName: "Amoxicillin Trihydrate",
    dosageForm: "Capsule",
    strength: "500mg",
    manufacturer: "PharmaCorp",
    unitPrice: 12.5,
    stockQuantity: 100,
    reorderLevel: 20,
  };

  describe("POST /medicines (CREATE)", () => {
    it("should pass with valid medicine payload", async () => {
      const res = await request(app).post("/medicines").send(validMedicinePayload);
      expect(res.status).toBe(201);
    });

    it("should fail if name is missing", async () => {
      const { name, ...payload } = validMedicinePayload;
      const res = await request(app).post("/medicines").send(payload);
      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining("Medicine name is required")]));
    });

    it("should fail if dosageForm is invalid", async () => {
      const res = await request(app).post("/medicines").send({ ...validMedicinePayload, dosageForm: "InvalidForm" });
      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining("Invalid dosage form")]));
    });

    it("should fail if unitPrice is negative", async () => {
      const res = await request(app).post("/medicines").send({ ...validMedicinePayload, unitPrice: -5 });
      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining("Unit price must be a non-negative number")]));
    });
  });

  describe("PUT /medicines/:medicineId (UPDATE)", () => {
    it("should pass with valid update payload", async () => {
      const res = await request(app).put("/medicines/1").send({ unitPrice: 15.0 });
      expect(res.status).toBe(200);
    });

    it("should fail when trying to update protected field: medicineId", async () => {
      const res = await request(app).put("/medicines/1").send({ medicineId: 99 });
      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining("Cannot update protected field: medicineId")]));
    });
  });
});
