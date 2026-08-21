import { describe, it, expect, jest } from "@jest/globals";
import express from "express";
import request from "supertest";
import { getPatientTimeline } from "../timeline.service.js";
import { patientTimelineValidation } from "../timeline.validation.js";
import { validateRequest } from "../../../core/middleware/validation.middleware.js";
import { errorHandler } from "../../../core/middleware/error.middleware.js";
import Patient from "../../patient/patient.model.js";
import Doctor from "../../doctor/doctor.model.js";
import Appointment from "../../appointment/appointment.model.js";
import ClinicalVisit from "../../visit/visit.model.js";
import Prescription from "../../prescription/prescription.model.js";
import { ForbiddenError, NotFoundError } from "../../../core/errors/index.js";

const app = express();
app.use(express.json());

app.get("/patients/:patientId/timeline", patientTimelineValidation, validateRequest, (req, res) => {
  res.status(200).json({ success: true, data: { patientId: req.params.patientId, query: req.query } });
});

app.use(errorHandler);

describe("QA Unit Test: Patient Timeline Validation & Authorization Rules", () => {
  describe("GET /patients/:patientId/timeline Parameter & Query Validation", () => {
    it("should pass for valid numeric patientId and optional query parameters", async () => {
      const res = await request(app).get("/patients/1001/timeline?page=1&limit=20&eventType=appointment");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.patientId).toBe(1001);
    });

    it("should fail for non-numeric patientId parameter", async () => {
      const res = await request(app).get("/patients/abc/timeline");
      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining("Invalid patientId format")]));
    });

    it("should fail for negative or zero patientId", async () => {
      const res = await request(app).get("/patients/0/timeline");
      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining("Invalid patientId format")]));
    });

    it("should fail for invalid limit exceeding 100", async () => {
      const res = await request(app).get("/patients/1001/timeline?limit=500");
      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining("Limit must be between 1 and 100")]));
    });

    it("should fail for unsupported eventType filter", async () => {
      const res = await request(app).get("/patients/1001/timeline?eventType=unsupported_type");
      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining("Invalid eventType filter")]));
    });

    it("should fail for malformed ISO8601 date string", async () => {
      const res = await request(app).get("/patients/1001/timeline?startDate=invalid-date");
      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining("startDate must be a valid ISO8601 date string")]));
    });
  });

  describe("Service Layer Authorization & IDOR Controls", () => {
    it("should throw NotFoundError if patient does not exist", async () => {
      jest.spyOn(Patient, "findOne").mockResolvedValue(null);

      await expect(
        getPatientTimeline(9999, { id: "user123", role: "admin" })
      ).rejects.toThrow(NotFoundError);

      Patient.findOne.mockRestore();
    });

    it("should throw ForbiddenError when a Patient attempts to access another patient's timeline", async () => {
      const mockPatient = {
        _id: "patientMongoId123",
        patientId: 1001,
        userId: { equals: (id) => id === "ownerUserId" },
      };

      jest.spyOn(Patient, "findOne").mockResolvedValue(mockPatient);

      await expect(
        getPatientTimeline(1001, { id: "attackerUserId", role: "patient" })
      ).rejects.toThrow(ForbiddenError);

      Patient.findOne.mockRestore();
    });

    it("should throw ForbiddenError when an unlinked Doctor attempts to access a patient's timeline", async () => {
      const mockPatient = {
        _id: "patientMongoId123",
        patientId: 1001,
        doctorId: { equals: (id) => false },
      };

      const mockDoctor = {
        _id: "unlinkedDoctorId",
        userId: "doctorUserId",
      };

      jest.spyOn(Patient, "findOne").mockResolvedValue(mockPatient);
      jest.spyOn(Doctor, "findOne").mockResolvedValue(mockDoctor);
      jest.spyOn(Appointment, "exists").mockResolvedValue(false);
      jest.spyOn(ClinicalVisit, "exists").mockResolvedValue(false);
      jest.spyOn(Prescription, "exists").mockResolvedValue(false);

      await expect(
        getPatientTimeline(1001, { id: "doctorUserId", role: "doctor" })
      ).rejects.toThrow(ForbiddenError);

      Patient.findOne.mockRestore();
      Doctor.findOne.mockRestore();
      Appointment.exists.mockRestore();
      ClinicalVisit.exists.mockRestore();
      Prescription.exists.mockRestore();
    });
  });
});
