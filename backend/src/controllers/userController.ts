/**
 * User Controller
 * Matches Frontend User Entity and API expectations
 */

import { Request, Response } from 'express';
import { getUsersDB } from '@/config/database.js';
import { asyncHandler } from '@/middleware/errorHandler.js';
import { AppError } from '@/types/index.js';
import type { IUserDTO, IUserResponse, User } from '@/types/index.js';
import logger from '@/utils/logger.js';
import { findOne, find, insert, update, remove, findWithLimit, generateId } from '@/utils/nedb-helper.js';

/**
 * Get user by badgeId (signin)
 * Frontend: GET /user?badge_id=xxx
 */
export const getUserByBadge = asyncHandler(async (req: Request, res: Response) => {
  const { badge_id } = req.query;
  console.log(badge_id)
  if (!badge_id) {
    throw new AppError(400, 'badge_id is required');
  }

  const db = getUsersDB();
  const user = await findOne(db, { badgeId: badge_id as string });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  res.json({
    user: user,
  });
});

/**
 * Create new user (signup)
 * Frontend: POST /user
 */
export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { personalNum, name, org, direct, costCenter, birthday, schoolLevel, department, jobName, badgeNum, superior, stock, badgeId } = req.body as IUserDTO;

  // Validation
  if (!personalNum || !name || !jobName || badgeNum === undefined || !badgeId) {
    throw new AppError(400, 'personalNum, name, jobName, badgeNum, and badgeId are required');
  }

  const db = getUsersDB();

  // Check if user already exists
  const existingUser = await findOne(db, {
    $or: [{ personalNum }, { badgeId }],
  });

  if (existingUser) {
    throw new AppError(409, 'User with this personalNum or badgeId already exists');
  }

  const newUser: User = {
    id: generateId(),
    personalNum,
    name,
    org,
    direct,
    costCenter,
    birthday,
    schoolLevel,
    department,
    jobName,
    badgeNum,
    superior,
    stock: stock || 0,
    badgeId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const user = await insert(db, newUser);

  res.status(201).json({
    message: 'success signup',
    user: user,
  });
});

/**
 * Update user
 * Frontend: PUT /user (with id in body)
 */
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { personalNum, ...updates } = req.body;

  if (!personalNum) {
    throw new AppError(400, 'User personalNum is required in request body');
  }

  const db = getUsersDB();

  // Add updatedAt timestamp
  updates.updatedAt = new Date();

  const numUpdated = await update(db, { personalNum }, { $set: updates }, { returnUpdatedDocs: true });

  if (numUpdated === 0) {
    throw new AppError(404, 'User not found');
  }

  // Fetch and return updated user
  const user = await findOne(db, { personalNum });

  res.json({
    message: 'success put',
    user: user,
  });
});

/**
 * Delete user
 */
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { personalNum } = req.params;

  const db = getUsersDB();
  const numRemoved = await remove(db, { personalNum });

  if (numRemoved === 0) {
    throw new AppError(404, 'User not found');
  }

  res.json({
    success: true,
    message: 'User deleted successfully',
    timestamp: new Date(),
  });
});

/**
 * Get all users (admin only)
 */
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;

  const db = getUsersDB();
  const users = await findWithLimit(db, {}, limit);

  res.json({
    message: 'success get all users',
    data: users,
    count: users.length,
  });
});

