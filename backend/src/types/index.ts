/**
 * Shared Type Definitions
 * These can be imported by both frontend and backend
 * 
 * Export to frontend: Copy this file to napkin-store-frontend/src/app/shared/types/
 */

// ============================================================================
// User Types
// ============================================================================

export interface IUser {
  _id?: string;
  email: string;
  username: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: 'user' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  createdAt?: Date;
  updatedAt?: Date;
  lastLogin?: Date;
  preferences?: Record<string, any>;
}

export interface IUserDTO {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface IUserResponse {
  _id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: 'user' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Admin Types
// ============================================================================

export interface IAdmin {
  _id?: string;
  userId: string;
  adminLevel: 'superadmin' | 'moderator' | 'support';
  permissions: string[];
  department?: string;
  approvals?: any[];
  activityLog?: IActivityLog[];
  createdAt?: Date;
  lastActive?: Date;
}

export interface IActivityLog {
  action: string;
  timestamp: Date;
  details?: Record<string, any>;
}

// ============================================================================
// Stock/Inventory Types
// ============================================================================

export interface IStock {
  _id?: string;
  itemName: string;
  description?: string;
  sku: string;
  quantity: number;
  reorderLevel: number;
  unit: string;
  price: number;
  supplier?: string;
  location: string;
  category: string;
  batchNumber?: string;
  expiryDate?: Date;
  images?: string[];
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  lastRestocked?: Date;
}

export interface IStockDTO {
  itemName: string;
  description?: string;
  sku: string;
  quantity: number;
  reorderLevel?: number;
  unit?: string;
  price?: number;
  supplier?: string;
  location?: string;
  category?: string;
}

// ============================================================================
// GPIO & Hardware Types
// ============================================================================

export interface IGPIOLog {
  _id?: string;
  deviceId?: string;
  channel: number;
  action: 'pressed' | 'released' | 'triggered';
  relayPin: number;
  relayState: 'HIGH' | 'LOW' | 'ON' | 'OFF';
  duration?: number;
  timestamp: Date;
  status: 'success' | 'failed' | 'timeout';
  errorMessage?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface IGPIOEvent {
  relay: 'A' | 'B';
  action: string;
  timestamp: Date;
  userId?: string;
}

// ============================================================================
// Order Types (Future)
// ============================================================================

export interface IOrder {
  _id?: string;
  orderNumber: string;
  userId: string;
  items: IOrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'dispatched' | 'delivered' | 'cancelled';
  shippingAddress?: IAddress;
  createdAt?: Date;
  updatedAt?: Date;
  deliveryDate?: Date;
}

export interface IOrderItem {
  stockId: string;
  quantity: number;
  price: number;
}

export interface IAddress {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

// ============================================================================
// Transaction Types (Future)
// ============================================================================

export interface ITransaction {
  _id?: string;
  transactionId: string;
  userId?: string;
  orderId?: string;
  amount: number;
  currency: string;
  method: 'cash' | 'card' | 'transfer';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  description?: string;
  timestamp: Date;
  receipt?: Record<string, any>;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface IApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  timestamp: Date;
}

export interface IPaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  timestamp: Date;
}

// ============================================================================
// Auth Types
// ============================================================================

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface ILoginResponse {
  success: boolean;
  token: string;
  user: IUserResponse;
}

export interface IJwtPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin';
  iat?: number;
  exp?: number;
}

// ============================================================================
// Error Types
// ============================================================================

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// ============================================================================
// Query Types
// ============================================================================

export interface IQueryOptions {
  page?: number;
  limit?: number;
  sort?: Record<string, 1 | -1>;
  search?: string;
  filter?: Record<string, any>;
}
