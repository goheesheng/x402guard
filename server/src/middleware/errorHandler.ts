import { logger } from "../utils/logger.js";

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const errorHandler = (
  err: Error,
  req: any,
  res: any,
  _next: any
) => {
  logger.error("Request error:", err.message, req.path);
  
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      details: err.details,
    });
    return;
  }
  
  // Generic error
  res.status(500).json({
    error: "Internal server error",
    code: "INTERNAL_ERROR",
  });
};
