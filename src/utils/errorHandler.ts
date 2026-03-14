import { Request, Response, NextFunction } from "express";
import { AppError } from "./AppError";
import logger from "./logger";

/**
 */
export function globalErrorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    const error = {
      message: err.message,
      code: err.code,
    };
    logger.error("Application error:", {
      error,
      status: err.statusCode,
    });
    res.status(err.statusCode).json({
      error,
    });
    return;
  }
  logger.error("[unhandled error]", err);

  res.status(500).json({
    error: {
      message: "Internal server error",
      code: "INTERNAL_ERROR",
    },
  });
}
