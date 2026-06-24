/**
 * Error Handler Middleware
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/types/index.js';
import logger from '@/utils/logger.js';
import { config } from '@/config/env.js';

/**
 * Global error handler middleware
 */
export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    isOperational: err instanceof AppError ? err.isOperational : false,
  });

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      timestamp: new Date(),
      ...(config.NODE_ENV === 'development' && { stack: err.stack }),
    });
    return;
  }

  // NeDB errors are handled by AppError above

  // Default error
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date(),
    ...(config.NODE_ENV === 'development' && { details: err.message }),
  });
}

/**
 * Not found handler
 */
export function notFoundHandler(
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  res.status(404).json({
    success: false,
    error: 'Resource not found',
    timestamp: new Date(),
  });
}

/**
 * Async error wrapper
 */
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
