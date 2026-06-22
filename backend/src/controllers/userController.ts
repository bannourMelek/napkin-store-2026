/**
 * User Controller
 */

import { Request, Response } from 'express';
import { User } from '@/models/index.js';
import { asyncHandler } from '@/middleware/errorHandler.js';
import { AppError } from '@/types/index.js';
import type { IUserDTO, IUserResponse, ILoginRequest } from '@/types/index.js';
import logger from '@/utils/logger.js';

/**
 * Get all users (admin only)
 */
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;

  const users = await User.find({}).limit(limit).select('-passwordHash');

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

  const user = await User.findById(id).select('-passwordHash');

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
  const { email, username, password, firstName, lastName, phone } = req.body as IUserDTO;

  // Validation
  if (!email || !username || !password) {
    throw new AppError(400, 'Email, username, and password are required');
  }

  // Check if user already exists
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    throw new AppError(409, 'Email or username already registered');
  }

  // Hash password (in production, use bcrypt)
  // TODO: Implement password hashing with bcryptjs
  const userDoc = new User({
    email,
    username,
    passwordHash: password,
    firstName,
    lastName,
    phone,
    role: 'user',
    status: 'active',
  });

  const savedUser = await userDoc.save();

  // Remove password from response
  const userResponse = savedUser.toObject();
  delete (userResponse as any).passwordHash;

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: userResponse,
    timestamp: new Date(),
  });
});

/**
 * Login user
 */
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as ILoginRequest;

  if (!email || !password) {
    throw new AppError(400, 'Email and password are required');
  }

  const user = await User.findOne({ email }).select('+passwordHash');

  if (!user || user.passwordHash !== password) {
    // TODO: Use bcrypt.compare() for proper password validation
    throw new AppError(401, 'Invalid email or password');
  }

  if (user.status !== 'active') {
    throw new AppError(403, 'User account is not active');
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate JWT token (implement this)
  // const token = generateToken(user._id, user.email, user.role);

  const userResponse = user.toObject();
  delete (userResponse as any).passwordHash;

  res.json({
    success: true,
    message: 'Login successful',
    data: userResponse,
    timestamp: new Date(),
    // token, // Add this after implementing JWT
  });
});

/**
 * Update user
 */
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { firstName, lastName, phone, preferences } = req.body;

  const user = await User.findByIdAndUpdate(
    id,
    {
      firstName,
      lastName,
      phone,
      preferences,
      updatedAt: new Date(),
    },
    { new: true, runValidators: true }
  ).select('-passwordHash');

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  res.json({
    success: true,
    message: 'User updated successfully',
    data: user,
    timestamp: new Date(),
  });
});

/**
 * Delete user
 */
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await User.findByIdAndDelete(id);

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  res.json({
    success: true,
    message: 'User deleted successfully',
    timestamp: new Date(),
  });
});

/**
 * Change user status
 */
export const changeUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['active', 'inactive', 'suspended'].includes(status)) {
    throw new AppError(400, 'Invalid status');
  }

  const user = await User.findByIdAndUpdate(id, { status }, { new: true }).select('-passwordHash');

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  res.json({
    success: true,
    message: 'User status updated',
    data: user,
    timestamp: new Date(),
  });
});
