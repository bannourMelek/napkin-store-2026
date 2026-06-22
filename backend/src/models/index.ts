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



// Note: All Mongoose models have been migrated to Prisma
// Use the Prisma client from database.ts instead

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
