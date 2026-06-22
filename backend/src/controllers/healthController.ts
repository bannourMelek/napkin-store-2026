/**
 * Health Check Controller
 */

import { Request, Response } from 'express';
import { asyncHandler } from '@/middleware/errorHandler.js';
import { isDBConnected, getDBStats } from '@/config/database.js';
import { config } from '@/config/env.js';

export const healthCheck = asyncHandler(async (req: Request, res: Response) => {
  const dbStats = await getDBStats();

  res.json({
    success: true,
    message: 'Napkin Store Backend is running',
    status: {
      database: {
        connected: isDBConnected(),
        name: config.MONGODB_DB,
        collections: dbStats?.collections || [],
      },
      gpio: {
        enabled: config.ENABLE_GPIO,
        mode: config.GPIO_MODE,
      },
      socketio: {
        enabled: config.ENABLE_SOCKET_IO,
      },
      environment: config.NODE_ENV,
    },
    timestamp: new Date(),
  });
});
