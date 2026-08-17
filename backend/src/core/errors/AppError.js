// core/errors/AppError.js — Base application error class
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = true; // Flag to distinguish operational errors from programming bugs
    Error.captureStackTrace(this, this.constructor);
  }
}
