/**
 * Stock Controller
 * Updated to use NeDB
 */

import { Request, Response } from 'express';
import { getStockDB } from '@/config/database.js';
import { asyncHandler } from '@/middleware/errorHandler.js';
import { AppError } from '@/types/index.js';
import type { IStockDTO } from '@/types/index.js';
import logger from '@/utils/logger.js';
import { findOne, find, findWithSort, insert, update, remove, findWithLimit, generateId } from '@/utils/nedb-helper.js';
import type { Stock } from '@/models/index.js';

/**
 * Get all stock - matches Flask endpoint GET /stock
 * Returns first two stock items as { stock: { stockA, stockB } }
 */
export const getAllStock = asyncHandler(async (req: Request, res: Response) => {
  const db = getStockDB();
  
  // Get first two items ordered by itemName
  const items = await findWithSort(db, {}, 'itemName', 1);

  // Map to stockA/stockB format matching Flask response
  const stock = {
    stockA: items[0]?.quantity || 0,
    stockB: items[1]?.quantity || 0,
  };

  res.json({
    stock,
    timestamp: new Date(),
  });
});

/**
 * Get single stock item
 */
export const getStockById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const db = getStockDB();

  const item = await findOne(db, { _id: id });

  if (!item) {
    throw new AppError(404, 'Stock item not found');
  }

  res.json({
    success: true,
    data: item,
    timestamp: new Date(),
  });
});

/**
 * Search stock items
 */
export const searchStock = asyncHandler(async (req: Request, res: Response) => {
  const { q } = req.query;

  if (!q) {
    throw new AppError(400, 'Search query is required');
  }

  const db = getStockDB();
  const searchTerm = (q as string).toLowerCase();

  // NeDB simple search across multiple fields
  const allItems = await find(db, {});
  const results = allItems.filter((item: Stock) => {
    return (
      (item.itemName && item.itemName.toLowerCase().includes(searchTerm)) ||
      (item.description && item.description.toLowerCase().includes(searchTerm)) ||
      (item.sku && item.sku.toLowerCase().includes(searchTerm))
    );
  });

  res.json({
    success: true,
    data: results,
    count: results.length,
    timestamp: new Date(),
  });
});

/**
 * Create or initialize stock - matches Flask endpoint POST /stock
 * Expects body: { stockA, stockB }
 */
export const createStock = asyncHandler(async (req: Request, res: Response) => {
  const { stockA, stockB } = req.body;

  // Validate input
  if (stockA === undefined || stockB === undefined) {
    throw new AppError(400, 'stockA and stockB are required');
  }

  const db = getStockDB();

  // Get or create first two stock items
  let items = await findWithSort(db, {}, 'itemName', 1);

  // If less than 2 items exist, create them
  if (items.length === 0) {
    const item1: Stock = {
      _id: generateId(),
      itemName: 'Stock Item A',
      sku: 'STOCK-A',
      quantity: stockA,
      reorderLevel: 10,
      unit: 'pack',
      category: 'General',
      lastRestocked: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const item2: Stock = {
      _id: generateId(),
      itemName: 'Stock Item B',
      sku: 'STOCK-B',
      quantity: stockB,
      reorderLevel: 10,
      unit: 'pack',
      category: 'General',
      lastRestocked: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await insert(db, item1);
    await insert(db, item2);
    items = [item1, item2];
  } else if (items.length === 1) {
    const item2: Stock = {
      _id: generateId(),
      itemName: 'Stock Item B',
      sku: 'STOCK-B',
      quantity: stockB,
      reorderLevel: 10,
      unit: 'pack',
      category: 'General',
      lastRestocked: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await insert(db, item2);
    items.push(item2);
  } else {
    // Update existing items
    await Promise.all([
      update(db, { _id: items[0]._id }, { $set: { quantity: stockA, updatedAt: new Date() } }),
      update(db, { _id: items[1]._id }, { $set: { quantity: stockB, updatedAt: new Date() } }),
    ]);
  }

  res.json({
    message: 'success post',
  });
});

/**
 * Update stock - matches Flask endpoint PUT /stock
 * Expects body: { stockA, stockB }
 * Updates first two stock items' quantities
 */
export const updateStock = asyncHandler(async (req: Request, res: Response) => {
  const { stockA, stockB } = req.body;

  // Validate input
  if (stockA === undefined || stockB === undefined) {
    throw new AppError(400, 'stockA and stockB are required');
  }

  const db = getStockDB();

  // Get all stock items ordered by name to ensure consistency
  const items = await findWithSort(db, {}, 'itemName', 1);

  if (items.length < 2) {
    throw new AppError(400, 'At least 2 stock items required for stockA and stockB');
  }

  // Update first two items
  await Promise.all([
    update(db, { _id: items[0]._id }, { $set: { quantity: stockA, updatedAt: new Date() } }),
    update(db, { _id: items[1]._id }, { $set: { quantity: stockB, updatedAt: new Date() } }),
  ]);

  // Return updated stock
  const updatedItems = await findWithSort(db, {}, 'itemName', 1);

  const stock = {
    stockA: updatedItems[0]?.quantity || 0,
    stockB: updatedItems[1]?.quantity || 0,
  };

  res.json({
    message: 'success put',
    stock,
  });
});

/**
 * Update stock quantity
 */
export const updateStockQuantity = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { quantity, operation } = req.body;

  if (quantity === undefined) {
    throw new AppError(400, 'Quantity is required');
  }

  const db = getStockDB();

  // Get current stock
  const current = await findOne(db, { _id: id });
  if (!current) {
    throw new AppError(404, 'Stock item not found');
  }

  let newQuantity = current.quantity;

  if (operation === 'add') {
    newQuantity += quantity;
  } else if (operation === 'subtract') {
    newQuantity -= quantity;
  } else {
    newQuantity = quantity;
  }

  await update(db, { _id: id }, { $set: { quantity: newQuantity, updatedAt: new Date() } });

  // Fetch and return updated item
  const item = await findOne(db, { _id: id });

  res.json({
    success: true,
    message: 'Stock quantity updated',
    data: item,
    timestamp: new Date(),
  });
});

/**
 * Delete stock item
 */
export const deleteStock = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const db = getStockDB();

  const numRemoved = await remove(db, { _id: id });

  if (numRemoved === 0) {
    throw new AppError(404, 'Stock item not found');
  }

  res.json({
    success: true,
    message: 'Stock item deleted successfully',
    timestamp: new Date(),
  });
});

/**
 * Get low stock items
 */
export const getLowStock = asyncHandler(async (req: Request, res: Response) => {
  const db = getStockDB();
  const items = await findWithSort(db, {}, 'quantity', 1);

  // Filter items where quantity <= reorderLevel
  const lowStockItems = items.filter((item: Stock) => item.quantity !== undefined && item.reorderLevel !== undefined && item.quantity <= item.reorderLevel);

  res.json({
    success: true,
    data: lowStockItems,
    count: lowStockItems.length,
    message: `${lowStockItems.length} items below reorder level`,
    timestamp: new Date(),
  });
});
