import { jest } from "@jest/globals";
import { validateRequest } from "../validation.middleware.js";
import { BadRequestError } from "../../errors/index.js";

describe("QA Unit Test: validation.middleware", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    // Mock standard Express req, res, next
    req = {};
    res = {};
    next = jest.fn();
  });

  it("should call next() without arguments if there are no validation errors", () => {
    // express-validator attaches an express-validator context to the request.
    // We mock the expected structure that validationResult(req) expects when empty.
    req["express-validator#contexts"] = [];

    validateRequest(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(); // No arguments
  });

  it("should pass a BadRequestError to next() if validation errors exist", () => {
    // Mock the context with a validation error
    req["express-validator#contexts"] = [
      {
        errors: [
          {
            type: "field",
            value: "",
            msg: "Email is required",
            path: "email",
            location: "body",
          },
        ],
      },
    ];

    validateRequest(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const errArg = next.mock.calls[0][0];

    expect(errArg).toBeInstanceOf(BadRequestError);
    expect(errArg.message).toBe("Validation failed");
    expect(errArg.statusCode).toBe(400);
    expect(errArg.errors).toBeDefined();
    expect(Array.isArray(errArg.errors)).toBe(true);
    expect(errArg.errors).toContain("Email is required");
  });

  it("should preserve multiple validation errors with field-level information", () => {
    req["express-validator#contexts"] = [
      {
        errors: [
          { type: "field", msg: "Invalid format", path: "email", location: "body" },
          { type: "field", msg: "Too short", path: "password", location: "body" },
        ],
      },
    ];

    validateRequest(req, res, next);

    const errArg = next.mock.calls[0][0];
    expect(errArg.errors).toHaveLength(2);
    // Based on the middleware logic, if the msg doesn't include the path, it might prepend it
    expect(errArg.errors[0]).toBe("email: Invalid format");
    expect(errArg.errors[1]).toBe("password: Too short");
  });
});
