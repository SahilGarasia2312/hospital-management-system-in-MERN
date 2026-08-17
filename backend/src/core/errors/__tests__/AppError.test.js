// errors/__tests__/AppError.test.js — QA Unit Tests for Application Errors
import { jest, describe, test, expect } from "@jest/globals";
import { AppError, BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError } from "../index.js";

describe("QA Unit Test: Application Error Classes", () => {
  test("AppError should extend Error and set properties correctly", () => {
    const err = new AppError("Test error", 500);
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
    expect(err.name).toBe("AppError");
    expect(err.message).toBe("Test error");
    expect(err.statusCode).toBe(500);
    expect(err.isOperational).toBe(true);
    expect(err.stack).toBeDefined();
  });

  test("BadRequestError should have 400 status and correct name", () => {
    const err = new BadRequestError("Bad request test");
    expect(err).toBeInstanceOf(AppError);
    expect(err.name).toBe("BadRequestError");
    expect(err.message).toBe("Bad request test");
    expect(err.statusCode).toBe(400);
  });

  test("UnauthorizedError should have 401 status and correct name", () => {
    const err = new UnauthorizedError("Unauthorized test");
    expect(err).toBeInstanceOf(AppError);
    expect(err.name).toBe("UnauthorizedError");
    expect(err.message).toBe("Unauthorized test");
    expect(err.statusCode).toBe(401);
  });

  test("ForbiddenError should have 403 status and correct name", () => {
    const err = new ForbiddenError("Forbidden test");
    expect(err).toBeInstanceOf(AppError);
    expect(err.name).toBe("ForbiddenError");
    expect(err.message).toBe("Forbidden test");
    expect(err.statusCode).toBe(403);
  });

  test("NotFoundError should have 404 status and correct name", () => {
    const err = new NotFoundError("Not found test");
    expect(err).toBeInstanceOf(AppError);
    expect(err.name).toBe("NotFoundError");
    expect(err.message).toBe("Not found test");
    expect(err.statusCode).toBe(404);
  });

  test("ConflictError should have 409 status and correct name", () => {
    const err = new ConflictError("Conflict test");
    expect(err).toBeInstanceOf(AppError);
    expect(err.name).toBe("ConflictError");
    expect(err.message).toBe("Conflict test");
    expect(err.statusCode).toBe(409);
  });
});
