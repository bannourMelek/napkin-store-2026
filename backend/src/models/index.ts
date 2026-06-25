/**
 * NeDB Models & Types
 * Define application data types
 */

// Type definitions only - NeDB is used in database.ts
// This file exports the types for use throughout the application

/**
 * User Entity - Matches Frontend User Entity
 */
export interface User {
  _id?: string;
  mat: string;
  name: string;
  org?: string;
  direct?: string;
  costCenter?: number;
  birthday?: string;
  schoolLevel?: string;
  department?: string;
  jobName: string;
  badgeNum: number;
  superior?: string;
  stock?: number;
  badgeId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Admin Entity - Matches Frontend Admin Entity
 */
export interface Admin {
  _id?: string;
  mat: string;
  name: string;
  org?: string;
  jobName: string;
  badgeNum: number;
  badgeId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Stock Entity - Simple two-bin inventory system
 */
export interface Stock {
  stockA: number;
  stockB: number;
}

/**
 * Detailed Stock Item Entity (for internal inventory management)
 */
export interface StockItem {
  _id?: string;
  sku: string;
  quantity: number;
  reorderLevel?: number;
  unit?: string;
  price?: number;
  supplier?: string;
  location?: string;
  category?: string;
  batchNumber?: string;
  expiryDate?: Date;
  images?: string;
  tags?: string;
  lastRestocked?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  itemName?: string;
  description?: string;
}

/**
 * GPIO Log Entity
 */
export interface GPIOLog {
  _id?: string;
  deviceId?: string;
  channel?: number;
  action: string;
  relayPin?: number;
  relayState?: string;
  duration?: number;
  userId?: string;
  metadata?: any;
  createdAt?: Date;
  updatedAt?: Date;
}
