import type { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const isDev = process.env.NODE_ENV === "development";

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      ...(isDev && { stack: err.stack }),
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ status: "error", message: "Token invalide" });
  }
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ status: "error", message: "Token expiré" });
  }

  // PostgreSQL errors
  if ((err as any).code === "23505") {
    return res.status(409).json({ status: "error", message: "Cette ressource existe déjà" });
  }
  if ((err as any).code === "23503") {
    return res.status(400).json({ status: "error", message: "Référence invalide" });
  }

  console.error("Unexpected error:", err);

  return res.status(500).json({
    status: "error",
    message: "Une erreur interne est survenue",
    ...(isDev && { details: err.message, stack: err.stack }),
  });
}
