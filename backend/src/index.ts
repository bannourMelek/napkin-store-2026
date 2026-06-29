/**
 * Server Entry Point
 */

import http from 'http';
import { createApp } from '@/app.js';
import { connectDB, disconnectDB } from '@/config/database.js';
import { gpioService } from '@/services/gpioService.js';
import { config } from '@/config/env.js';
import logger from '@/utils/logger.js';
import { Server as SocketIOServer } from 'socket.io';

/**
 * Start server
 */
async function startServer(): Promise<void> {
  try {
    logger.info('🚀 Starting Napkin Store Backend...');
    logger.info(`📝 Environment: ${config.NODE_ENV}`);
    logger.info(`📊 Database: NeDB`);

    // Connect to SQLite
    await connectDB();

    // Initialize GPIO
    await gpioService.init();
    logger.info('✅ GPIO service initialized');
    logger.info(gpioService.getStatus());

    // Create Express app
    const app = createApp();

    // Create HTTP server
    const server = http.createServer(app);

    // Socket.IO (if enabled)
    if (config.ENABLE_SOCKET_IO) {
      console.log('✅ Socket.IO is enabled');
      let corsOrigins: string[] | boolean = Array.isArray(config.CORS_ORIGINS)
        ? config.CORS_ORIGINS.map((origin) => origin.trim())
        : config.CORS_ORIGINS.split(',').map((origin) => origin.trim());

      // Handle wildcard origins for Electron (file://, app://)
      const hasWildcard = corsOrigins.some((origin) => origin.includes('*'));
      if (hasWildcard) {
        corsOrigins = true; // Allow all origins if wildcard is present
        logger.info('⚠️  CORS configured with wildcard (allowing all origins for Electron support)');
      }

      const io = new SocketIOServer(server, {
        cors: {
          origin: corsOrigins,
          methods: ['GET', 'POST'],
          credentials: true,
          allowedHeaders: ['Content-Type', 'Authorization'],
        }
      });

      // Handle Socket.IO connections
      io.on('connection', (socket) => {
        logger.info(`✅ Client connected: ${socket.id}`);

        socket.on('disconnect', () => {
          logger.info(`❌ Client disconnected: ${socket.id}`);
        });

        socket.on('error', (error) => {
          logger.error(`⚠️  Socket.IO error from ${socket.id}:`, error);
        });
      });

      logger.info('✅ Socket.IO server initialized and listening');
    }

    // Start listening
    server.listen(config.PORT, config.HOST, () => {
      logger.info(`🎉 Server running on http://${config.HOST}:${config.PORT}`);
      logger.info(`📡 API available at http://${config.HOST}:${config.PORT}${config.API_PREFIX}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('📍 SIGTERM received, shutting down gracefully...');
      server.close(async () => {
        await gpioService.cleanup();
        await disconnectDB();
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      logger.info('📍 SIGINT received, shutting down gracefully...');
      server.close(async () => {
        await gpioService.cleanup();
        await disconnectDB();
        process.exit(0);
      });
    });

    // Unhandled errors
    process.on('uncaughtException', (error) => {
      logger.error('❌ Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`❌ Failed to start server: ${message}`);
    process.exit(1);
  }
}

// Start the server
startServer();
