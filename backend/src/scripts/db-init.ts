/**
 * Database Initialization Script
 * Creates collections and indexes
 *
 * Usage:
 *   npm run db:init
 */

import { connectDB, disconnectDB } from '@/config/database.js';
import { User, Admin, Stock, GPIOLog, Order, Transaction } from '@/models/index.js';
import logger from '@/utils/logger.js';

async function initializeDatabase(): Promise<void> {
  try {
    logger.info('🔌 Connecting to MongoDB...');
    await connectDB();

    logger.info('📋 Ensuring all indexes exist...');

    // Create indexes for all collections
    await Promise.all([
      User.collection.createIndex({ email: 1 }, { unique: true }),
      User.collection.createIndex({ username: 1 }, { unique: true }),
      User.collection.createIndex({ role: 1 }),
      User.collection.createIndex({ status: 1 }),

      Admin.collection.createIndex({ userId: 1 }),
      Admin.collection.createIndex({ adminLevel: 1 }),

      Stock.collection.createIndex({ sku: 1 }, { unique: true }),
      Stock.collection.createIndex({ itemName: 'text', description: 'text' }),
      Stock.collection.createIndex({ category: 1 }),
      Stock.collection.createIndex({ quantity: 1 }),
      Stock.collection.createIndex({ location: 1 }),

      GPIOLog.collection.createIndex({ timestamp: -1 }),
      GPIOLog.collection.createIndex({ deviceId: 1 }),
      GPIOLog.collection.createIndex({ channel: 1 }),

      Order.collection.createIndex({ orderNumber: 1 }, { unique: true }),
      Order.collection.createIndex({ userId: 1 }),
      Order.collection.createIndex({ status: 1 }),

      Transaction.collection.createIndex({ transactionId: 1 }, { unique: true }),
      Transaction.collection.createIndex({ userId: 1 }),
    ]);

    logger.info('✅ All indexes created successfully!');

    // Show collection info
    const collections = await User.collection.db.listCollections().toArray();
    logger.info('📊 Collections:');
    for (const collection of collections) {
      const count = await User.collection.db.collection(collection.name).countDocuments();
      logger.info(`   - ${collection.name}: ${count} documents`);
    }

    logger.info('🎉 Database initialization complete!');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`❌ Database initialization failed: ${message}`);
    process.exit(1);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
}

initializeDatabase();
