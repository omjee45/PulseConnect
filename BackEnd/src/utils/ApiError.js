/**
 * Custom operational error class.
 * Use this to create predictable, catchable errors throughout the app.
 * The errorHandler middleware detects `isOperational = true` to format the response.
 */
class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
