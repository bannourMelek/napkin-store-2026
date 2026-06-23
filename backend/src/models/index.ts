/**
 * Prisma Models & Types
 * Re-export models from Prisma Client
 */

export { Prisma } from '@prisma/client';
export type {
  User,
  Admin,
  Stock,
  GPIOLog,
} from '@prisma/client';

// Type definitions for responses (without database internal fields)
export interface IUserResponse {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAdminResponse {
  id: string;
  userId: string;
  adminLevel: string;
  permissions?: string;
  department?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStockResponse {
  id: string;
  itemName: string;
  description?: string;
  sku: string;
  quantity: number;
  reorderLevel: number;
  unit: string;
  price: number;
  supplier?: string;
  location?: string;
  category: string;
  batchNumber?: string;
  expiryDate?: Date;
  images?: string;
  tags?: string;
  lastRestocked?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGPIOLogResponse {
  id: string;
  deviceId?: string;
  channel: number;
  action: string;
  relayPin: number;
  relayState?: string;
  duration?: number;
  metadata?: any;
  userId?: string;
  createdAt: Date;
}

// ============================================================================
// Re-export utility types for backward compatibility
// ============================================================================

export interface IUserDocument extends Omit<any, 'id'> {
  id: string;
  email: string;
  username: string;
}

export interface IAdminDocument extends Omit<any, 'id'> {
  id: string;
  userId: string;
}

export interface IStockDocument extends Omit<any, 'id'> {
  id: string;
  sku: string;
}

export interface IGPIOLogDocument extends Omit<any, 'id'> {
  id: string;
  channel: number;
}
