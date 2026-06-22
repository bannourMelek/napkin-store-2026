/**
 * Database Connection Module (Prisma + SQLite)
 */

import { PrismaClient } from '@prisma/client';
import logger from '@/utils/logger.js';

let prisma: PrismaClient | null = null;

/**
 * Get or create Prisma client instance
 */
export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'error' },
        { emit: 'stdout', level: 'warn' },
      ],
    });

    // Log queries in development
    prisma.$on('query', (e) => {
      if (process.env.NODE_ENV === 'development') {
        logger.debug(`Query: ${e.query}`, { duration: `${e.duration}ms` });
      }
    });
  }
  return prisma;
}

/**
 * Connect to database (initialize Prisma)
 */
export async function connectDB(): Promise<void> {
  try {
    const prismaClient = getPrismaClient();
    await prismaClient.$queryRaw`SELECT 1`;
    logger.info('✅ Connected to SQLite successfully!');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`❌ Failed to connect to SQLite: ${errorMessage}`);
    throw error;
  }
}

/**
 * Disconnect from database
 */
export async function disconnectDB(): Promise<void> {
  if (prisma) {
    try {
      await prisma.$disconnect();
      logger.info('🔌 Disconnected from SQLite');
      prisma = null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`❌ Error disconnecting from SQLite: ${errorMessage}`);
      throw error;
    }
  }
}

/**
 * Get database client instance
 */
export function getDB(): PrismaClient {
  return getPrismaClient();
}

/**
 * Check if connected
 */
export async function isDBConnected(): Promise<boolean> {
  try {
    const client = getPrismaClient();
    await client.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

/**
 * Get database statistics
 */
export async function getDBStats() {
  try {
    const client = getPrismaClient();

    const userCount = await client.user.count();
    const adminCount = await client.admin.count();
    const stockCount = await client.stock.count();
    const gpioLogCount = await client.gPIOLog.count();

    const stats = {
      connected: await isDBConnected(),
      database: 'SQLite',
      tables: {
        users: userCount,
        admins: adminCount,
        stock: stockCount,
        gpioLogs: gpioLogCount,
      },
    };
    return stats;
  } catch (error) {
    logger.error('Error getting DB stats:', error);
    return null;
  }
}

export default {
  connectDB,
  disconnectDB,
  getDB,
  isDBConnected,
  getDBStats,
};
