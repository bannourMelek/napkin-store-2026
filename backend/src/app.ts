/**
 * Express Application Setup
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from '@/config/env.js';
import apiRouter from '@/routes/api.js';
import { errorHandler, notFoundHandler } from '@/middleware/errorHandler.js';
import logger from '@/utils/logger.js';

/**
 * Create Express app
 */
export function createApp(): express.Application {
  const app = express();

  // ========================================================================
  // Middleware
  // ========================================================================

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // CORS
  app.use(
    cors({
      origin: config.CORS_ORIGINS,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Request logging middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    logger.info(`${req.method} ${req.path}`, {
      body: req.body,
      query: req.query,
    });
    next();
  });

  // ========================================================================
  // Routes
  // ========================================================================

  app.use(`${config.API_PREFIX}`, apiRouter);

  // ========================================================================
  // Error Handling
  // ========================================================================

  // 404 handler (must be after all routes)
  app.use(notFoundHandler);

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
}
