/**
 * Mongoose Schemas & Models
 * All schemas with TypeScript interfaces
 */

import mongoose, { Schema, Document } from 'mongoose';
import type { IUser, IAdmin, IStock, IGPIOLog } from '@/types/index.js';

// ============================================================================
// User Schema
// ============================================================================

export interface IUserDocument extends Omit<IUser, '_id'>, Document {
  comparePassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      minlength: 3,
      maxlength: 30,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // Don't include password by default in queries
    },
    firstName: String,
    lastName: String,
    phone: String,
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
    preferences: mongoose.Schema.Types.Mixed,
    lastLogin: Date,
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });

export const User = mongoose.model<IUserDocument>('User', userSchema);

// ============================================================================
// Admin Schema
// ============================================================================

export interface IAdminDocument extends Omit<IAdmin, '_id'>, Document {}

const adminSchema = new Schema<IAdminDocument>(
  {
    userId: {
      type: String,
      ref: 'User',
      required: true,
    },
    adminLevel: {
      type: String,
      enum: ['superadmin', 'moderator', 'support'],
      default: 'support',
    },
    permissions: [String],
    department: String,
    approvals: [mongoose.Schema.Types.Mixed],
    activityLog: [
      {
        action: String,
        timestamp: { type: Date, default: Date.now },
        details: mongoose.Schema.Types.Mixed,
      },
    ],
  },
  {
    timestamps: true,
    collection: 'admins',
  }
);

adminSchema.index({ userId: 1 });
adminSchema.index({ adminLevel: 1 });

export const Admin = mongoose.model<IAdminDocument>('Admin', adminSchema);

// ============================================================================
// Stock Schema
// ============================================================================

export interface IStockDocument extends Omit<IStock, '_id'>, Document {}

const stockSchema = new Schema<IStockDocument>(
  {
    itemName: {
      type: String,
      required: [true, 'Item name is required'],
    },
    description: String,
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      uppercase: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    reorderLevel: {
      type: Number,
      default: 20,
    },
    unit: {
      type: String,
      default: 'pack',
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    supplier: String,
    location: String,
    category: {
      type: String,
      default: 'General',
    },
    batchNumber: String,
    expiryDate: Date,
    images: [String],
    tags: [String],
    lastRestocked: Date,
  },
  {
    timestamps: true,
    collection: 'stock',
  }
);

// Text search index
stockSchema.index({ itemName: 'text', description: 'text' });
// Regular indexes
stockSchema.index({ sku: 1 });
stockSchema.index({ category: 1 });
stockSchema.index({ quantity: 1 });
stockSchema.index({ location: 1 });

export const Stock = mongoose.model<IStockDocument>('Stock', stockSchema);

// ============================================================================
// GPIO Log Schema
// ============================================================================

export interface IGPIOLogDocument extends Omit<IGPIOLog, '_id'>, Document {}

const gpioLogSchema = new Schema<IGPIOLogDocument>(
  {
    deviceId: String,
    channel: {
      type: Number,
      required: true,
    },
    action: {
      type: String,
      enum: ['pressed', 'released', 'triggered'],
      required: true,
    },
    relayPin: {
      type: Number,
      required: true,
    },
    relayState: {
      type: String,
      enum: ['HIGH', 'LOW', 'ON', 'OFF'],
    },
    duration: Number,
    timestamp: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'timeout'],
      default: 'success',
    },
    errorMessage: String,
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    metadata: mongoose.Schema.Types.Mixed,
  },
  {
    collection: 'gpio_logs',
  }
);

// Indexes
gpioLogSchema.index({ timestamp: -1 });
gpioLogSchema.index({ deviceId: 1 });
gpioLogSchema.index({ channel: 1 });

// TTL Index (auto-delete logs older than 90 days)
// Uncomment to enable:
// gpioLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

export const GPIOLog = mongoose.model<IGPIOLogDocument>('GPIOLog', gpioLogSchema);

// ============================================================================
// Order Schema (Future Use)
// ============================================================================

const orderSchema = new Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        stockId: {
          type: Schema.Types.ObjectId,
          ref: 'Stock',
        },
        quantity: Number,
        price: Number,
      },
    ],
    totalAmount: Number,
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'dispatched', 'delivered', 'cancelled'],
      default: 'pending',
    },
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    deliveryDate: Date,
  },
  {
    timestamps: true,
    collection: 'orders',
  }
);

orderSchema.index({ orderNumber: 1 });
orderSchema.index({ userId: 1 });
orderSchema.index({ status: 1 });

export const Order = mongoose.model('Order', orderSchema);

// ============================================================================
// Transaction Schema (Future Use)
// ============================================================================

const transactionSchema = new Schema(
  {
    transactionId: {
      type: String,
      unique: true,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    method: {
      type: String,
      enum: ['cash', 'card', 'transfer'],
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    description: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
    receipt: mongoose.Schema.Types.Mixed,
  },
  {
    collection: 'transactions',
  }
);

transactionSchema.index({ transactionId: 1 });
transactionSchema.index({ userId: 1 });

export const Transaction = mongoose.model('Transaction', transactionSchema);
