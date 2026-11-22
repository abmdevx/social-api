export interface ErrorDetail {
  path?: string;
  message: string;
}

/** An error that is safe to show to API clients. Anything else becomes a generic 500. */
export class ApiError extends Error {
  readonly statusCode: number;
  readonly errors: ErrorDetail[];

  constructor(statusCode: number, message: string, errors: ErrorDetail[] = []) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, errors?: ErrorDetail[]): ApiError {
    return new ApiError(400, message, errors);
  }
  static unauthorized(message = "Authentication required"): ApiError {
    return new ApiError(401, message);
  }
  static forbidden(message = "You do not have permission to do that"): ApiError {
    return new ApiError(403, message);
  }
  static notFound(message = "Resource not found"): ApiError {
    return new ApiError(404, message);
  }
  static conflict(message: string): ApiError {
    return new ApiError(409, message);
  }
}
