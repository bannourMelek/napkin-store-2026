/**
 * Database Connection Module
 */

import mongoose from 'mongoose';
import { config } from '@/config/env.js';
import logger from '@/utils/logger.js';

let isConnected = false;

/**
 * Connect to MongoDB
 */
export async function connectDB(): Promise<void> {
  if (isConnected) {
    logger.info('📊 Using existing MongoDB connection');
    return;
  }

  try {
    logger.info(`🔗 Connecting to MongoDB at ${config.MONGODB_URI}...`);

    await mongoose.connect(config.MONGODB_URI, {
      dbName: config.MONGODB_DB,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });

    isConnected = true;
    logger.info('✅ Connected to MongoDB successfully!');

    // Handle connection events
    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      logger.warn('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      isConnected = true;
      logger.info('✅ MongoDB reconnected');
    });

    mongoose.connection.on('error', (error) => {
      logger.error(`❌ MongoDB connection error: ${error.message}`);
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`❌ Failed to connect to MongoDB: ${errorMessage}`);
    throw error;
  }
}

/**
 * Disconnect from MongoDB
 */
export async function disconnectDB(): Promise<void> {
  if (!isConnected) return;

  try {
    await mongoose.disconnect();
    isConnected = false;
    logger.info('🔌 Disconnected from MongoDB');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`❌ Error disconnecting from MongoDB: ${errorMessage}`);
    throw error;
  }
}

/**
 * Get Mongoose connection instance
 */
export function getDB() {
  return mongoose.connection;
}

/**
 * Check if connected
 */
export function isDBConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}

/**
 * Get database statistics
 */
export async function getDBStats() {
  try {
    const collections = await mongoose.connection.db?.listCollections().toArray();
    const stats = {
      connected: isConnected,
      database: config.MONGODB_DB,
      collections: collections?.map((c) => c.name) || [],
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
