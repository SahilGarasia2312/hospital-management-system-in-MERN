import { jest } from "@jest/globals";
import express from "express";
import request from "supertest";
import {
  createDoctorValidation,
  updateDoctorValidation,
  doctorIdParamValidation,
} from "../doctor.validation.js";
import { validateRequest } from "../../../core/middleware/validation.middleware.js";
import { errorHandler } from "../../../core/middleware/error.middleware.js";

const app = express();
app.use(express.json());

// Dummy endpoints to test validation middleware in isolation
app.post("/doctors", createDoctorValidation, validateRequest, (req, res) => res.status(201).json({ success: true }));
app.put("/doctors/:doctorId", doctorIdParamValidation, updateDoctorValidation, validateRequest, (req, res) => res.status(200).json({ success: true }));
app.get("/doctors/:doctorId", doctorIdParamValidation, validateRequest, (req, res) => res.status(200).json({ success: true }));

app.use(errorHandler);

describe("QA Unit Test: Doctor Validation Rules", () => {
  const validDoctorPayload = {
    name: "Dr. Strange",
    specialization: "Neurologist",
    experience: 10,
    phone: "1234567890",
    email: "strange@example.com",
  };

  describe("POST /doctors (CREATE)", () => {
    it("should pass with valid payload", async () => {
      const res = await request(app).post("/doctors").send(validDoctorPayload);
      expect(res.status).toBe(201);
    });

    it("should fail if name is missing", async () => {
      const { name, ...payload } = validDoctorPayload;
      const res = await request(app).post("/doctors").send(payload);
      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining("Name is required")]));
    });

    it("should fail if name is invalid (too short)", async () => {
      const res = await request(app).post("/doctors").send({ ...validDoctorPayload, name: "Dr" });
      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining("Name must be between 3 and 100")]));
    });

    it("should fail if specialization is missing", async () => {
      const { specialization, ...payload } = validDoctorPayload;
      const res = await request(app).post("/doctors").send(payload);
      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining("Specialization is required")]));
    });

    it("should fail if specialization is invalid", async () => {
      const res = await request(app).post("/doctors").send({ ...validDoctorPayload, specialization: "Magician" });
      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining("Invalid specialization")]));
    });

    it("should fail if experience is invalid (negative)", async () => {
      const res = await request(app).post("/doctors").send({ ...validDoctorPayload, experience: -5 });
      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining("Experience cannot be negative")]));
    });

    it("should fail if email is invalid format", async () => {
      const res = await request(app).post("/doctors").send({ ...validDoctorPayload, email: "not-an-email" });
      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining("valid email address")]));
    });

    it("should fail if wrong field types are provided", async () => {
      const res = await request(app).post("/doctors").send({
        name: 123,
        specialization: [],
        experience: "ten",
      });
      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining("Name must be a string"),
          expect.stringContaining("Specialization must be a string"),
          expect.stringContaining("Experience must be a number"),
        ])
      );
    });
  });

  describe("PUT /doctors/:doctorId (UPDATE)", () => {
    it("should pass with valid partial update payload", async () => {
      const res = await request(app).put("/doctors/1").send({ experience: 11 });
      expect(res.status).toBe(200);
    });

    it("should fail with invalid update field types", async () => {
      const res = await request(app).put("/doctors/1").send({ experience: "eleven" });
      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining("Experience must be a number")]));
    });
  });

  describe("doctorId PARAMETER VALIDATION", () => {
    it("should pass for valid numeric doctorId", async () => {
      const res = await request(app).get("/doctors/42");
      expect(res.status).toBe(200);
    });

    it("should fail for alphabetic doctorId", async () => {
      const res = await request(app).get("/doctors/abc");
      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining("Invalid doctorId format")]));
    });

    it("should fail for malformed numeric doctorId", async () => {
      const res = await request(app).get("/doctors/12abc");
      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining("Invalid doctorId format")]));
    });
  });
});
