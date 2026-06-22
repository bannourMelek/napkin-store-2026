/**
 * CONTROLLER MIGRATION EXAMPLES
 * 
 * This file shows how to update your controllers from Mongoose to Prisma.
 * Copy patterns from here into your actual controller files.
 */

// ============================================================================
// BEFORE: Mongoose Pattern
// ============================================================================

/*
import { User } from '@/models/index.js';

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  // Mongoose pattern
  const user = await User.findById(id).select('-passwordHash');
  
  if (!user) {
    throw new AppError(404, 'User not found');
  }
  
  res.json(user);
};

export const getAllUsers = async (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
  
  // Mongoose pattern
  const users = await User.find({}).limit(limit).select('-passwordHash');
  
  res.json(users);
};

export const createUser = async (req: Request, res: Response) => {
  const { email, username, password, firstName, lastName } = req.body;
  
  // Check if exists
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new AppError(409, 'User already exists');
  
  // Create
  const newUser = await User.create({
    email,
    username,
    passwordHash: await bcrypt.hash(password, 10),
    firstName,
    lastName,
    role: 'user',
    status: 'active',
  });
  
  res.status(201).json(newUser);
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  
  // MongoDB update pattern
  const user = await User.findByIdAndUpdate(id, updates, { new: true });
  
  if (!user) throw new AppError(404, 'User not found');
  
  res.json(user);
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  await User.deleteOne({ _id: id });
  
  res.json({ success: true });
};
*/

// ============================================================================
// AFTER: Prisma Pattern
// ============================================================================

import { Request, Response } from 'express';
import { getPrismaClient } from '@/config/database.js';
import bcrypt from 'bcryptjs';
import { asyncHandler } from '@/middleware/errorHandler.js';
import { AppError } from '@/types/index.js';
import type { IUserDTO, IUserResponse } from '@/types/index.js';
import logger from '@/utils/logger.js';

const prisma = getPrismaClient();

/**
 * Get all users (admin only)
 */
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;

  // Prisma pattern: select excludes fields
  const users = await prisma.user.findMany({
    take: limit,
    select: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      // passwordHash is excluded
    },
  });

  res.json({
    success: true,
    data: users,
    count: users.length,
    timestamp: new Date(),
  });
});

/**
 * Get single user by ID
 */
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Change: findById → findUnique with where clause
  // Change: _id → id
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  res.json({
    success: true,
    data: user,
    timestamp: new Date(),
  });
});

/**
 * Create new user (signup)
 */
export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, username, password, firstName, lastName, phone }: IUserDTO = req.body;

  // Change: findOne → findUnique
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError(409, 'Email already in use');
  }

  // Check username uniqueness
  const existingUsername = await prisma.user.findUnique({
    where: { username },
  });

  if (existingUsername) {
    throw new AppError(409, 'Username already taken');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Change: create → create (same but syntax slightly different)
  const newUser = await prisma.user.create({
    data: {
      email,
      username,
      passwordHash,
      firstName,
      lastName,
      phone,
      role: 'user',
      status: 'active',
    },
    select: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.status(201).json({
    success: true,
    data: newUser,
    timestamp: new Date(),
  });
});

/**
 * Update user
 */
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  // Prevent password updates through this endpoint
  if (updates.passwordHash) {
    delete updates.passwordHash;
  }

  // Change: findByIdAndUpdate → update
  const user = await prisma.user.update({
    where: { id },
    data: updates,
    select: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.json({
    success: true,
    data: user,
    timestamp: new Date(),
  });
});

/**
 * Delete user
 */
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Change: deleteOne → delete
  await prisma.user.delete({
    where: { id },
  });

  res.json({
    success: true,
    message: 'User deleted',
    timestamp: new Date(),
  });
});

/**
 * Login user
 */
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Change: findOne({email}) → findUnique({where: {email}})
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError(401, 'Invalid credentials');
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    throw new AppError(401, 'Invalid credentials');
  }

  // Update lastLogin
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  // Return user without password
  const { passwordHash, ...userWithoutPassword } = user;

  res.json({
    success: true,
    data: userWithoutPassword,
    timestamp: new Date(),
  });
});

// ============================================================================
// MIGRATION REFERENCE: Common Mongoose → Prisma Patterns
// ============================================================================

/*
FIND OPERATIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Mongoose                          │  Prisma
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  User.findById(id)                 │  prisma.user.findUnique({where: {id}})
  User.findOne({email})             │  prisma.user.findUnique({where: {email}})
  User.find({role: 'admin'})        │  prisma.user.findMany({where: {role: 'admin'}})
  User.find({}).limit(10)           │  prisma.user.findMany({take: 10})
  User.find({}).skip(20)            │  prisma.user.findMany({skip: 20})
  User.find({}).select('-password') │  prisma.user.findMany({select: {password: false}})
  User.countDocuments()             │  prisma.user.count()

CREATE OPERATIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Mongoose                          │  Prisma
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  User.create(data)                 │  prisma.user.create({data})
  User.insertMany([...])            │  prisma.user.createMany({data: [...]})

UPDATE OPERATIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Mongoose                          │  Prisma
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  User.findByIdAndUpdate(id, u)     │  prisma.user.update({where: {id}, data: u})
  User.updateOne({email}, {$set})   │  prisma.user.update({where: {email}, data})
  User.updateMany({role: 'user'})   │  prisma.user.updateMany({where: {role}, data})

DELETE OPERATIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Mongoose                          │  Prisma
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  User.deleteOne({_id: id})         │  prisma.user.delete({where: {id}})
  User.deleteMany({status: 'old'})  │  prisma.user.deleteMany({where: {status}})

RELATIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Mongoose                          │  Prisma
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  User.findById(id).populate()      │  prisma.user.findUnique({where: {id}, include: {admin: true}})
  User.find().populate('admin')     │  prisma.user.findMany({include: {admin: true}})

AGGREGATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Mongoose: User.aggregate([...])   │  Prisma: prisma.$queryRaw (for complex queries)
                                    │  or use: prisma.user.groupBy()
*/

// ============================================================================
// STOCK CONTROLLER EXAMPLE
// ============================================================================

export const searchStock = asyncHandler(async (req: Request, res: Response) => {
  const { q } = req.query;

  if (!q) {
    throw new AppError(400, 'Search query is required');
  }

  // Prisma text search (using LIKE for SQLite compatibility)
  const results = await prisma.stock.findMany({
    where: {
      OR: [
        { itemName: { contains: String(q), mode: 'insensitive' } },
        { description: { contains: String(q), mode: 'insensitive' } },
        { sku: { contains: String(q), mode: 'insensitive' } },
      ],
    },
    take: 20,
  });

  res.json({
    success: true,
    data: results,
    count: results.length,
  });
});

export const getStockBySku = asyncHandler(async (req: Request, res: Response) => {
  const { sku } = req.params;

  const stock = await prisma.stock.findUnique({
    where: { sku: sku.toUpperCase() },
  });

  if (!stock) {
    throw new AppError(404, 'Stock item not found');
  }

  // Parse JSON fields
  const data = {
    ...stock,
    images: stock.images ? JSON.parse(stock.images) : [],
    tags: stock.tags ? JSON.parse(stock.tags) : [],
  };

  res.json({
    success: true,
    data,
  });
});

export const updateStockQuantity = asyncHandler(async (req: Request, res: Response) => {
  const { sku } = req.params;
  const { quantity } = req.body;

  const stock = await prisma.stock.update({
    where: { sku: sku.toUpperCase() },
    data: {
      quantity: parseInt(quantity, 10),
      updatedAt: new Date(),
    },
  });

  res.json({
    success: true,
    data: stock,
  });
});
