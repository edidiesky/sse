/**
 * AppError
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static notFound(resource: string): AppError {
    return new AppError(`${resource} not found`, 404, "NOT_FOUND");
  }

  static badRequest(message: string): AppError {
    return new AppError(message, 400, "BAD_REQUEST");
  }

  static forbidden(message: string): AppError {
    return new AppError(message, 403, "FORBIDDEN");
  }
}