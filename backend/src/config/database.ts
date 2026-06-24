/**
 * Database Connection Module (NeDB)
 */

import Database from 'nedb';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '@/utils/logger.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database directory
const dbDir = path.join(__dirname, '../../data');

// NeDB Databases
let databases: {
  users: Database | null;
  admins: Database | null;
  stock: Database | null;
  gpioLogs: Database | null;
} = {
  users: null,
  admins: null,
  stock: null,
  gpioLogs: null,
};

/**
 * Initialize all databases
 */
export async function connectDB(): Promise<void> {
  try {
    // Import fs to ensure directory exists
    const fs = await import('fs');
    
    // Create data directory if it doesn't exist
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Initialize each database with autoload
    databases.users = new Database({ filename: path.join(dbDir, 'users.db'), autoload: true });
    databases.admins = new Database({ filename: path.join(dbDir, 'admins.db'), autoload: true });
    databases.stock = new Database({ filename: path.join(dbDir, 'stock.db'), autoload: true });
    databases.gpioLogs = new Database({ filename: path.join(dbDir, 'gpio-logs.db'), autoload: true });

    // Create indexes
    databases.users.ensureIndex({ fieldName: 'mat', unique: true });
    databases.users.ensureIndex({ fieldName: 'badgeId', unique: true });
    databases.users.ensureIndex({ fieldName: 'org' });
    databases.users.ensureIndex({ fieldName: 'department' });

    databases.admins.ensureIndex({ fieldName: 'mat', unique: true });
    databases.admins.ensureIndex({ fieldName: 'badgeId', unique: true });
    databases.admins.ensureIndex({ fieldName: 'org' });

    databases.stock.ensureIndex({ fieldName: 'sku', unique: true });
    databases.stock.ensureIndex({ fieldName: 'category' });
    databases.stock.ensureIndex({ fieldName: 'quantity' });
    databases.stock.ensureIndex({ fieldName: 'location' });

    databases.gpioLogs.ensureIndex({ fieldName: 'createdAt' });
    databases.gpioLogs.ensureIndex({ fieldName: 'channel' });
    databases.gpioLogs.ensureIndex({ fieldName: 'deviceId' });

    logger.info('✅ Connected to NeDB successfully!');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`❌ Failed to connect to NeDB: ${errorMessage}`);
    throw error;
  }
}

/**
 * Disconnect from databases
 */
export async function disconnectDB(): Promise<void> {
  try {
    // NeDB doesn't have explicit disconnect, but we can clear references
    databases.users = null;
    databases.admins = null;
    databases.stock = null;
    databases.gpioLogs = null;
    logger.info('🔌 Disconnected from NeDB');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`❌ Error disconnecting from NeDB: ${errorMessage}`);
    throw error;
  }
}

/**
 * Get database instances
 */
export function getDB() {
  if (!databases.users || !databases.admins || !databases.stock || !databases.gpioLogs) {
    throw new Error('Databases not initialized. Call connectDB first.');
  }
  return {
    users: databases.users,
    admins: databases.admins,
    stock: databases.stock,
    gpioLogs: databases.gpioLogs,
  };
}

/**
 * Get single database
 */
export function getUsersDB() {
  if (!databases.users) throw new Error('Users database not initialized');
  return databases.users;
}

export function getAdminsDB() {
  if (!databases.admins) throw new Error('Admins database not initialized');
  return databases.admins;
}

export function getStockDB() {
  if (!databases.stock) throw new Error('Stock database not initialized');
  return databases.stock;
}

export function getGPIOLogsDB() {
  if (!databases.gpioLogs) throw new Error('GPIO logs database not initialized');
  return databases.gpioLogs;
}

/**
 * Check if connected
 */
export async function isDBConnected(): Promise<boolean> {
  return !!(databases.users && databases.admins && databases.stock && databases.gpioLogs);
}

/**
 * Get database statistics
 */
export async function getDBStats() {
  try {
    const db = getDB();

    // Count documents in each collection
    const stats = await new Promise((resolve) => {
      let userCount = 0,
        adminCount = 0,
        stockCount = 0,
        gpioLogCount = 0;
      let completed = 0;

      db.users.count({}, (err: Error | null, count: number) => {
        if (!err) userCount = count;
        completed++;
        if (completed === 4) {
          resolve({
            connected: true,
            database: 'NeDB',
            tables: {
              users: userCount,
              admins: adminCount,
              stock: stockCount,
              gpioLogs: gpioLogCount,
            },
          });
        }
      });

      db.admins.count({}, (err: Error | null, count: number) => {
        if (!err) adminCount = count;
        completed++;
        if (completed === 4) {
          resolve({
            connected: true,
            database: 'NeDB',
            tables: {
              users: userCount,
              admins: adminCount,
              stock: stockCount,
              gpioLogs: gpioLogCount,
            },
          });
        }
      });

      db.stock.count({}, (err: Error | null, count: number) => {
        if (!err) stockCount = count;
        completed++;
        if (completed === 4) {
          resolve({
            connected: true,
            database: 'NeDB',
            tables: {
              users: userCount,
              admins: adminCount,
              stock: stockCount,
              gpioLogs: gpioLogCount,
            },
          });
        }
      });

      db.gpioLogs.count({}, (err: Error | null, count: number) => {
        if (!err) gpioLogCount = count;
        completed++;
        if (completed === 4) {
          resolve({
            connected: true,
            database: 'NeDB',
            tables: {
              users: userCount,
              admins: adminCount,
              stock: stockCount,
              gpioLogs: gpioLogCount,
            },
          });
        }
      });
    });

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
  getUsersDB,
  getAdminsDB,
  getStockDB,
  getGPIOLogsDB,
  isDBConnected,
  getDBStats,
};
