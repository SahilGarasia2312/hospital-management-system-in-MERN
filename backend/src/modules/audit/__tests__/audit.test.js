import { describe, it, expect, beforeEach } from "@jest/globals";
import express from "express";
import request from "supertest";
import { createAuditLog, sanitizeMetadata } from "../audit.service.js";
import { listAuditLogsValidation, auditIdParamValidation } from "../audit.validation.js";
import { validateRequest } from "../../../core/middleware/validation.middleware.js";
import { errorHandler } from "../../../core/middleware/error.middleware.js";
import { AUDIT_ACTIONS } from "../../../config/constants.js";

const app = express();
app.use(express.json());

app.get("/audit", listAuditLogsValidation, validateRequest, (req, res) => res.status(200).json({ success: true }));
app.get("/audit/:auditId", auditIdParamValidation, validateRequest, (req, res) => res.status(200).json({ success: true }));

app.use(errorHandler);

describe("QA Unit Test: Audit Module & Validation Rules", () => {
  describe("Audit Service Sanitization & Fail-Safe Invariants", () => {
    it("should sanitize passwords and tokens from metadata", () => {
      const rawMetadata = {
        email: "user@hpms.com",
        password: "SecretPassword123",
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
        nested: {
          authorization: "Bearer secret",
          itemCount: 5,
        },
      };

      const clean = sanitizeMetadata(rawMetadata);
      expect(clean.password).toBeUndefined();
      expect(clean.token).toBeUndefined();
      expect(clean.nested.authorization).toBeUndefined();
      expect(clean.nested.itemCount).toBe(5);
      expect(clean.email).toBe("user@hpms.com");
    });

    it("should safely handle null or missing fields in createAuditLog without throwing", async () => {
      const result = await createAuditLog({
        actor: null,
        action: null,
        resource: null,
      });

      expect(result).toBeNull();
    });
  });

  describe("GET /audit Validation", () => {
    it("should pass for valid filter query parameters", async () => {
      const res = await request(app).get("/audit?page=1&limit=10&action=PRESCRIPTION_ISSUED");
      expect(res.status).toBe(200);
    });

    it("should fail for invalid action enum query filter", async () => {
      const res = await request(app).get("/audit?action=INVALID_ACTION");
      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining("Invalid audit action filter")]));
    });

    it("should fail for non-numeric auditId parameter", async () => {
      const res = await request(app).get("/audit/abc");
      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining("Invalid auditId format")]));
    });
  });
});
