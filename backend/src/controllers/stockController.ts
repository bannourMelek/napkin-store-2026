/**
 * Stock Controller
 */

import { Request, Response } from 'express';
import { Stock } from '@/models/index.js';
import { asyncHandler } from '@/middleware/errorHandler.js';
import { AppError } from '@/types/index.js';
import type { IStockDTO } from '@/types/index.js';
import logger from '@/utils/logger.js';

/**
 * Get all stock items
 */
export const getAllStock = asyncHandler(async (req: Request, res: Response) => {
  const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Stock.find({}).sort({ itemName: 1 }).skip(skip).limit(limit),
    Stock.countDocuments({}),
  ]);

  res.json({
    success: true,
    data: items,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
    timestamp: new Date(),
  });
});

/**
 * Get single stock item
 */
export const getStockById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const item = await Stock.findById(id);

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

  const results = await Stock.find(
    { $text: { $search: q as string } },
    { score: { $meta: 'textScore' } }
  ).sort({ score: { $meta: 'textScore' } });

  res.json({
    success: true,
    data: results,
    count: results.length,
    timestamp: new Date(),
  });
});

/**
 * Create new stock item
 */
export const createStock = asyncHandler(async (req: Request, res: Response) => {
  const {
    itemName,
    description,
    sku,
    quantity,
    reorderLevel,
    unit,
    price,
    supplier,
    location,
    category,
  } = req.body as IStockDTO;

  // Validation
  if (!itemName || !sku || quantity === undefined) {
    throw new AppError(400, 'itemName, sku, and quantity are required');
  }

  // Check if SKU already exists
  const existing = await Stock.findOne({ sku: sku.toUpperCase() });
  if (existing) {
    throw new AppError(409, 'SKU already exists');
  }

  const item = new Stock({
    itemName,
    description,
    sku: sku.toUpperCase(),
    quantity,
    reorderLevel: reorderLevel || 20,
    unit: unit || 'pack',
    price: price || 0,
    supplier,
    location,
    category: category || 'General',
    lastRestocked: new Date(),
  });

  const savedItem = await item.save();

  res.status(201).json({
    success: true,
    message: 'Stock item created successfully',
    data: savedItem,
    timestamp: new Date(),
  });
});

/**
 * Update stock item
 */
export const updateStock = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  // Prevent changing SKU (it's unique identifier)
  if (updates.sku) {
    delete updates.sku;
  }

  const item = await Stock.findByIdAndUpdate(id, { ...updates, updatedAt: new Date() }, {
    new: true,
    runValidators: true,
  });

  if (!item) {
    throw new AppError(404, 'Stock item not found');
  }

  res.json({
    success: true,
    message: 'Stock item updated successfully',
    data: item,
    timestamp: new Date(),
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

  let updateQuery: any = { updatedAt: new Date() };

  if (operation === 'add') {
    updateQuery.$inc = { quantity };
  } else if (operation === 'subtract') {
    updateQuery.$inc = { quantity: -quantity };
  } else {
    updateQuery.quantity = quantity;
  }

  const item = await Stock.findByIdAndUpdate(id, updateQuery, { new: true });

  if (!item) {
    throw new AppError(404, 'Stock item not found');
  }

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

  const item = await Stock.findByIdAndDelete(id);

  if (!item) {
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
  const items = await Stock.find({
    $expr: { $lte: ['$quantity', '$reorderLevel'] },
  }).sort({ quantity: 1 });

  res.json({
    success: true,
    data: items,
    count: items.length,
    message: `${items.length} items below reorder level`,
    timestamp: new Date(),
  });
});
