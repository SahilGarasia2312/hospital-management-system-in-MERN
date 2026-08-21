import { jest } from "@jest/globals";
import { errorHandler } from "../error.middleware.js";
import { AppError } from "../../errors/index.js";

describe("QA Unit Test: Global Error Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    // Suppress console.error during tests to keep output clean
    jest.spyOn(console, "error").mockImplementation(() => {});

    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Mongoose Errors", () => {
    it("should handle Mongoose CastError (Test 1)", () => {
      const err = new Error("Cast to ObjectId failed");
      err.name = "CastError";
      err.path = "_id";
      err.value = "invalid123";

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid value provided for field: _id",
      });
      // Ensure raw error message and stack trace are NOT exposed
      expect(res.json.mock.calls[0][0].stack).toBeUndefined();
    });

    it("should handle generic CastError without path", () => {
      const err = new Error("Cast to ObjectId failed");
      err.name = "CastError";

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid value provided",
      });
    });

    it("should handle Mongoose ValidationError (Test 2)", () => {
      const err = new Error("Validation failed");
      err.name = "ValidationError";
      err.errors = {
        email: { message: "Invalid email" },
        password: { message: "Password too short" },
      };

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Validation failed: Invalid email. Password too short",
        errors: ["Invalid email", "Password too short"],
      });
    });

    it("should handle MongoServerError duplicate key (Test 3)", () => {
      const err = new Error("E11000 duplicate key error");
      err.code = 11000;
      err.keyValue = { email: "test@example.com" };

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Duplicate value: email already exists.",
      });
    });
  });

  describe("Application Operational Errors", () => {
    it("should handle AppError and preserve statusCode (Test 4)", () => {
      const err = new AppError("Resource not found", 404);

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Resource not found",
      });
    });

    it("should handle AppError with validation errors array (Test 4)", () => {
      const err = new AppError("Validation failed", 400);
      err.errors = ["Name is required"];

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Validation failed",
        errors: ["Name is required"],
      });
    });
  });

  describe("Unexpected / Unhandled Errors", () => {
    it("should handle generic Error as HTTP 500 (Test 5)", () => {
      const err = new Error("Sensitive internal database failure");

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Internal server error",
      });
      // Ensure sensitive message is not leaked
      expect(res.json.mock.calls[0][0].message).not.toContain("Sensitive internal database failure");
    });
  });
});
