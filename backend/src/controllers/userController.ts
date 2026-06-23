/**
 * User Controller
 * Matches Frontend User Entity and API expectations
 */

import { Request, Response } from 'express';
import { prisma } from '@/models/index.js';
import { asyncHandler } from '@/middleware/errorHandler.js';
import { AppError } from '@/types/index.js';
import type { IUserDTO, IUserResponse } from '@/types/index.js';
import logger from '@/utils/logger.js';

/**
 * Get user by badgeId (signin)
 * Frontend: GET /user?badge_id=xxx
 */
export const getUserByBadge = asyncHandler(async (req: Request, res: Response) => {
  const { badge_id } = req.query;

  if (!badge_id) {
    throw new AppError(400, 'badge_id is required');
  }

  const user = await prisma.user.findUnique({
    where: { badgeId: badge_id as string },
  });

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
  const { mat, name, org, direct, costCenter, birthday, schoolLevel, department, jobName, badgeNum, superior, stock, badgeId } = req.body as IUserDTO;

  // Validation
  if (!mat || !name || !jobName || badgeNum === undefined || !badgeId) {
    throw new AppError(400, 'mat, name, jobName, badgeNum, and badgeId are required');
  }

  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ mat }, { badgeId }],
    },
  });

  if (existingUser) {
    throw new AppError(409, 'User with this mat or badgeId already exists');
  }

  const user = await prisma.user.create({
    data: {
      mat,
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
    },
  });

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
  const { id, ...updates } = req.body;

  if (!id) {
    throw new AppError(400, 'User ID is required in request body');
  }

  const user = await prisma.user.update({
    where: { id },
    data: updates,
  });

  res.json({
    message: 'success put',
    user: user,
  });
});

/**
 * Delete user
 */
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await prisma.user.delete({
    where: { id },
  });

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
 * Get all users (admin only)
 */
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;

  const users = await prisma.user.findMany({
    take: limit,
  });

  res.json({
    message: 'success get all users',
    data: users,
    count: users.length,
  });
});

