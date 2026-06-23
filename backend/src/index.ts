/**
 * Server Entry Point
 */

import http from 'http';
import { createApp } from '@/app.js';
import { connectDB, disconnectDB } from '@/config/database.js';
import { gpioService } from '@/services/gpioService.js';
import { config } from '@/config/env.js';
import logger from '@/utils/logger.js';

/**
 * Start server
 */
async function startServer(): Promise<void> {
  try {
    logger.info('🚀 Starting Napkin Store Backend...');
    logger.info(`📝 Environment: ${config.NODE_ENV}`);
    logger.info(`📊 Database: SQLite`);

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
      try {
        // @ts-ignore - socketio import
        // import { Server as SocketIOServer } from 'socket.io';
        // const io = new SocketIOServer(server, {
        //   cors: { origin: config.CORS_ORIGINS }
        // });
        logger.info('✅ Socket.IO configured (implementation pending)');
      } catch (error) {
        logger.warn('⚠️  Socket.IO not configured');
      }
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
