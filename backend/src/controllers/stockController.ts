/**
 * Stock Controller
 * Updated to use NeDB and Stock types
 */

import { Request, Response } from 'express';
import { getStockDB } from '@/config/database.js';
import { asyncHandler } from '@/middleware/errorHandler.js';
import { AppError } from '@/types/index.js';
import type { Stock } from '@/types/index.js';
import logger from '@/utils/logger.js';
import { find, findWithSort, findOne, insert, update, remove, findWithLimit, generateId } from '@/utils/nedb-helper.js';
import type { StockItem } from '@/models/index.js';

/**
 * Get all stock - matches Flask endpoint GET /stock
 * Returns first two stock items as { stock: { stockA, stockB } }
 */
export const getAllStock = asyncHandler(async (req: Request, res: Response) => {
  const db = getStockDB();
  
  // Get first two items ordered by itemName
  const items = await findWithSort(db, {}, 'itemName', 1);

  // Map to stockA/stockB format matching Flask response
  const stock: Stock = {
    stockA: items[0]?.stockA || 0,
    stockB: items[0]?.stockB || 0,
  };

  res.json({
    stock,
    timestamp: new Date(),
  });
});

/**
 * Update stock - matches Flask endpoint PUT /stock
 * Expects body: { stockA, stockB }
 * Updates first two stock items' quantities
 */
export const updateStock = asyncHandler(async (req: Request, res: Response) => {
  const { stockA, stockB } = req.body as Stock;

  // Validate input
  if (stockA === undefined || stockB === undefined) {
    throw new AppError(400, 'stockA and stockB are required');
  }

  const db = getStockDB();

  // Get all stock items ordered by name to ensure consistency
  const items = await findWithSort(db, {}, 'itemName', 1);

  // Update first two items
  await Promise.all([
    update(db, { _id: items[0]._id }, { $set: { stockA: stockA, stockB: stockB, updatedAt: new Date() } }),
  ]);

  // Return updated stock
  const updatedItems = await findWithSort(db, {}, 'itemName', 1);

  const stock: Stock = {
    stockA: updatedItems[0]?.stockA || 0,
    stockB: updatedItems[0]?.stockB || 0,
  };

  res.json({
    message: 'success put',
    stock,
  });
});
