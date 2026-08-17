// auth.middleware.test.js — QA Unit Tests for Auth Middleware
import { jest, describe, test, expect, beforeEach } from "@jest/globals";
import jwt from "jsonwebtoken";
import { verifyTokenMiddleware } from "../auth.middleware.js";

describe("QA Security Test: auth.middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.restoreAllMocks();
  });

  test("should return 401 if Authorization header is missing", () => {
    verifyTokenMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringMatching(/access denied/i) })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test("should return 401 if Authorization format is invalid (not Bearer)", () => {
    req.headers.authorization = "Basic 12345";
    verifyTokenMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("should attach decoded user to req.user and call next() on valid token", () => {
    req.headers.authorization = "Bearer valid_jwt_token";
    const mockUser = { id: "usr_123", role: "admin", email: "admin@hospital.com" };
    jest.spyOn(jwt, "verify").mockReturnValue(mockUser);

    verifyTokenMiddleware(req, res, next);

    expect(req.user).toEqual(mockUser);
    expect(next).toHaveBeenCalled();
  });

  test("should return 401 if token is expired", () => {
    req.headers.authorization = "Bearer expired_jwt_token";
    const expiredError = new Error("jwt expired");
    expiredError.name = "TokenExpiredError";
    jest.spyOn(jwt, "verify").mockImplementation(() => {
      throw expiredError;
    });

    verifyTokenMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringMatching(/expired/i) })
    );
    expect(next).not.toHaveBeenCalled();
  });
});
