import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';
import { config } from '../config/env.config';

/**
 * Global Error Handler Middleware
 * Catches all errors and returns appropriate responses
 * Following Single Responsibility Principle
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log error
  logger.error(`Error: ${err.message}`, {
    error: err,
    url: req.url,
    method: req.method,
    ip: req.ip,
    user: req.user?.email,
  });

  // Handle known AppError instances
  if (err instanceof AppError) {
    const statusCode = err.statusCode || 500;

    const response: any = {
      success: false,
      message: err.message,
      timestamp: new Date().toISOString(),
    };

    // Include validation errors if ValidationError
    if (err instanceof ValidationError && err.errors.length > 0) {
      response.errors = err.errors;
    }

    // Include stack trace in development
    if (config.nodeEnv === 'development' && err.stack) {
      response.stack = err.stack;
    }

    res.status(statusCode).json(response);
    return;
  }

  // Handle unexpected errors
  const statusCode = 500;
  const message =
    config.nodeEnv === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error';

  const response: any = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };

  // Include stack trace in development
  if (config.nodeEnv === 'development' && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

/**
 * 404 Not Found Handler
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new AppError(
    `Route not found: ${req.method} ${req.originalUrl}`,
    404
  );
  next(error);
};

/**
 * Async error wrapper - catches async errors
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
