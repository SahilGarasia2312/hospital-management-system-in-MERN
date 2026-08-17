// auth.service.integration.test.js — Integration test with MongoDB Atlas
import "dotenv/config";
import { jest, describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import mongoose from "mongoose";
import { loginUser } from "../auth.service.js";

jest.setTimeout(20000);

describe("QA Database Verification: loginUser Integration Test", () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI);
    }
  }, 20000);

  afterAll(async () => {
    await mongoose.disconnect();
  });

  test("should successfully log in admin user created by seed.js", async () => {
    const result = await loginUser("admin@hpms.com", "Admin@123");
    expect(result).toHaveProperty("token");
    expect(result.user).toEqual(
      expect.objectContaining({
        email: "admin@hpms.com",
        role: "admin",
      })
    );
  });

  test("should successfully log in doctor user created by seed.js", async () => {
    const result = await loginUser("arjun.sharma@hpms.com", "Doctor@123");
    expect(result).toHaveProperty("token");
    expect(result.user).toEqual(
      expect.objectContaining({
        email: "arjun.sharma@hpms.com",
        role: "doctor",
      })
    );
  });
});
