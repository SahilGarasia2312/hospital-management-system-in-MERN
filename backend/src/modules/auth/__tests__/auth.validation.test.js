import { jest } from "@jest/globals";
import express from "express";
import request from "supertest";
import { loginValidation, registerValidation } from "../auth.validation.js";
import { validateRequest } from "../../../core/middleware/validation.middleware.js";
import { errorHandler } from "../../../core/middleware/error.middleware.js";

const app = express();
app.use(express.json());

// Dummy endpoints to test validation middleware in isolation
app.post("/login", loginValidation, validateRequest, (req, res) => res.status(200).json({ success: true }));
app.post("/register", registerValidation, validateRequest, (req, res) => res.status(201).json({ success: true }));

app.use(errorHandler);

describe("QA Unit Test: Auth Validation Rules", () => {
  describe("POST /login validation", () => {
    it("should pass with valid email and password", async () => {
      const res = await request(app)
        .post("/login")
        .send({ email: "test@example.com", password: "password123" });
      expect(res.status).toBe(200);
    });

    it("should fail if email is missing", async () => {
      const res = await request(app)
        .post("/login")
        .send({ password: "password123" });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining("Email is required")]));
    });

    it("should fail if email is invalid format", async () => {
      const res = await request(app)
        .post("/login")
        .send({ email: "not-an-email", password: "password123" });
      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining("valid email address")]));
    });

    it("should fail if password is missing", async () => {
      const res = await request(app)
        .post("/login")
        .send({ email: "test@example.com" });
      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining("Password is required")]));
    });

    it("should fail if password is empty or whitespace only", async () => {
      const res = await request(app)
        .post("/login")
        .send({ email: "test@example.com", password: "   " });
      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining("Password is required")]));
    });

    it("should fail if field types are wrong", async () => {
      const res = await request(app)
        .post("/login")
        .send({ email: 12345, password: { obj: true } });
      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining("Email must be a string"),
          expect.stringContaining("Password must be a string"),
        ])
      );
    });
  });

  describe("POST /register validation", () => {
    const validPayload = {
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
      role: "patient",
    };

    it("should pass with valid registration payload", async () => {
      const res = await request(app).post("/register").send(validPayload);
      expect(res.status).toBe(201);
    });

    it("should fail if name is missing", async () => {
      const { name, ...invalidPayload } = validPayload;
      const res = await request(app).post("/register").send(invalidPayload);
      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining("Name is required")]));
    });

    it("should fail if name is invalid (too short)", async () => {
      const res = await request(app)
        .post("/register")
        .send({ ...validPayload, name: "Jo" });
      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining("Name must be between 3 and 100")]));
    });

    it("should fail if email is missing", async () => {
      const { email, ...invalidPayload } = validPayload;
      const res = await request(app).post("/register").send(invalidPayload);
      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining("Email is required")]));
    });

    it("should fail if email is invalid format", async () => {
      const res = await request(app)
        .post("/register")
        .send({ ...validPayload, email: "invalid-email" });
      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining("valid email address")]));
    });

    it("should fail if password is missing", async () => {
      const { password, ...invalidPayload } = validPayload;
      const res = await request(app).post("/register").send(invalidPayload);
      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining("Password is required")]));
    });

    it("should fail if password is invalid (too short)", async () => {
      const res = await request(app)
        .post("/register")
        .send({ ...validPayload, password: "short" });
      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining("Password must be at least 6")]));
    });

    it("should fail if role is invalid", async () => {
      const res = await request(app)
        .post("/register")
        .send({ ...validPayload, role: "superadmin" });
      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([expect.stringContaining("Invalid role")]));
    });

    it("should fail if field types are wrong", async () => {
      const res = await request(app)
        .post("/register")
        .send({ name: 123, email: [], password: {}, role: 456 });
      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining("Name must be a string"),
          expect.stringContaining("Email must be a string"),
          expect.stringContaining("Password must be a string"),
          expect.stringContaining("Role must be a string"),
        ])
      );
    });
  });
});
