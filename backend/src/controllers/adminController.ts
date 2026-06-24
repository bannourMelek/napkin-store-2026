/**
 * Admin Controller
 * Matches Frontend Admin Entity and API expectations
 */

import { Request, Response } from 'express';
import { getAdminsDB } from '@/config/database.js';
import { asyncHandler } from '@/middleware/errorHandler.js';
import { AppError } from '@/types/index.js';
import type { IAdminDTO } from '@/types/index.js';
import logger from '@/utils/logger.js';
import { findOne, find, insert, update, remove, findWithLimit, generateId } from '@/utils/nedb-helper.js';
import type { Admin } from '@/models/index.js';

/**
 * Get admin by badgeId (signin)
 * Frontend: GET /admin?badge_id=xxx
 */
export const getAdminByBadge = asyncHandler(async (req: Request, res: Response) => {
  const { badge_id } = req.query;

  if (!badge_id) {
    throw new AppError(400, 'badge_id is required');
  }

  const db = getAdminsDB();
  const admin = await findOne(db, { badgeId: badge_id as string });

  if (!admin) {
    throw new AppError(404, 'Admin not found');
  }

  res.json({
    admin: admin,
  });
});

/**
 * Create new admin (signup)
 * Frontend: POST /admin
 */
export const createAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { mat, name, org, jobName, badgeNum, badgeId } = req.body as IAdminDTO;

  // Validation
  if (!mat || !name || !jobName || badgeNum === undefined || !badgeId) {
    throw new AppError(400, 'mat, name, jobName, badgeNum, and badgeId are required');
  }

  const db = getAdminsDB();

  // Check if admin already exists
  const existingAdmin = await findOne(db, {
    $or: [{ mat }, { badgeId }],
  });

  if (existingAdmin) {
    throw new AppError(409, 'Admin with this mat or badgeId already exists');
  }

  const newAdmin: Admin = {
    _id: generateId(),
    mat,
    name,
    org,
    jobName,
    badgeNum,
    badgeId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const admin = await insert(db, newAdmin);

  res.status(201).json({
    message: 'success new admin',
    admin: admin,
  });
});

/**
 * Update admin
 * Frontend: PUT /admin (with id in body)
 */
export const updateAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { id, ...updates } = req.body;

  if (!id) {
    throw new AppError(400, 'Admin ID is required in request body');
  }

  const db = getAdminsDB();

  // Add updatedAt timestamp
  updates.updatedAt = new Date();

  const numUpdated = await update(db, { _id: id }, { $set: updates }, { returnUpdatedDocs: true });

  if (numUpdated === 0) {
    throw new AppError(404, 'Admin not found');
  }

  res.json({
    message: 'success update admin',
  });
});

/**
 * Delete admin
 */
export const deleteAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const db = getAdminsDB();
  const numRemoved = await remove(db, { _id: id });

  if (numRemoved === 0) {
    throw new AppError(404, 'Admin not found');
  }

  res.json({
    success: true,
    message: 'Admin deleted successfully',
    timestamp: new Date(),
  });
});

/**
 * Get all admins
 */
export const getAllAdmins = asyncHandler(async (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;

  const db = getAdminsDB();
  const admins = await findWithLimit(db, {}, limit);

  res.json({
    success: true,
    data: admins,
    count: admins.length,
    timestamp: new Date(),
  });
});
