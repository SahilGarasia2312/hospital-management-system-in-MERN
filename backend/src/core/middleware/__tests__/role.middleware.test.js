// role.middleware.test.js — QA Security Test for Role-Based Access Control (RBAC)
import { jest, describe, test, expect, beforeEach } from "@jest/globals";
import { requireRole } from "../role.middleware.js";

describe("QA Security Test: role.middleware (RBAC)", () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  test("should return 401 if req.user is unauthenticated", () => {
    const middleware = requireRole("admin");
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringMatching(/authentication required/i) })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test("should return 403 Forbidden if user role is not allowed", () => {
    req.user = { id: "usr_001", role: "patient" };
    const middleware = requireRole("admin", "doctor");
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringMatching(/access denied/i) })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test("should call next() if user role is included in allowed roles", () => {
    req.user = { id: "usr_002", role: "doctor" };
    const middleware = requireRole("admin", "doctor");
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
