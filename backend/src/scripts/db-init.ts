/**
 * Database Initialization Script
 * Runs Prisma migrations and sets up database
 *
 * Usage:
 *   npm run db:init
 */

import logger from '@/utils/logger.js';
import { PrismaClient } from '@prisma/client/extension';

const prisma = new PrismaClient();

async function initializeDatabase(): Promise<void> {
  try {
    logger.info('🔌 Initializing SQLite database with Prisma...');

    // Test connection
    await prisma.$queryRaw`SELECT 1`;
    logger.info('✅ Connected to SQLite database!');

    // Get table counts
    const userCount = await prisma.user.count();
    const stockCount = await prisma.stock.count();
    const adminCount = await prisma.admin.count();
    const gpioLogCount = await prisma.gPIOLog.count();

    logger.info('📊 Database tables status:', {
      users: userCount,
      stock: stockCount,
      admins: adminCount,
      gpioLogs: gpioLogCount,
    });

    logger.info('✅ Database initialization complete!');
    logger.info('📝 To seed sample data, run: npm run db:seed');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`❌ Database initialization failed: ${message}`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

initializeDatabase();

