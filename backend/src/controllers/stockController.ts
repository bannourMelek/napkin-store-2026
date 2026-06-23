/**
 * Stock Controller
 * Updated to use Prisma
 */

import { Request, Response } from 'express';
import { prisma } from '@/models/index.js';
import { asyncHandler } from '@/middleware/errorHandler.js';
import { AppError } from '@/types/index.js';
import type { IStockDTO } from '@/types/index.js';
import logger from '@/utils/logger.js';

/**
 * Get all stock - matches Flask endpoint GET /stock
 * Returns first two stock items as { stock: { stockA, stockB } }
 */
export const getAllStock = asyncHandler(async (req: Request, res: Response) => {
  // Get first two items ordered by name
  const items = await prisma.stock.findMany({
    orderBy: { itemName: 'asc' },
    take: 2,
  });

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

  const item = await prisma.stock.findUnique({
    where: { id },
  });

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

  const results = await prisma.stock.findMany({
    where: {
      OR: [
        { itemName: { contains: q as string } },
        { description: { contains: q as string } },
        { sku: { contains: q as string } },
      ],
    },
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

  // Get or create first two stock items
  let items = await prisma.stock.findMany({
    orderBy: { itemName: 'asc' },
    take: 2,
  });

  // If less than 2 items exist, create them
  if (items.length === 0) {
    const item1 = await prisma.stock.create({
      data: {
        itemName: 'Stock Item A',
        sku: 'STOCK-A',
        quantity: stockA,
        reorderLevel: 10,
        unit: 'pack',
        category: 'General',
        lastRestocked: new Date(),
      },
    });

    const item2 = await prisma.stock.create({
      data: {
        itemName: 'Stock Item B',
        sku: 'STOCK-B',
        quantity: stockB,
        reorderLevel: 10,
        unit: 'pack',
        category: 'General',
        lastRestocked: new Date(),
      },
    });

    items = [item1, item2];
  } else if (items.length === 1) {
    const item2 = await prisma.stock.create({
      data: {
        itemName: 'Stock Item B',
        sku: 'STOCK-B',
        quantity: stockB,
        reorderLevel: 10,
        unit: 'pack',
        category: 'General',
        lastRestocked: new Date(),
      },
    });
    items.push(item2);
  } else {
    // Update existing items
    await Promise.all([
      prisma.stock.update({
        where: { id: items[0].id },
        data: { quantity: stockA, updatedAt: new Date() },
      }),
      prisma.stock.update({
        where: { id: items[1].id },
        data: { quantity: stockB, updatedAt: new Date() },
      }),
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

  // Get all stock items ordered by name to ensure consistency
  const items = await prisma.stock.findMany({
    orderBy: { itemName: 'asc' },
    take: 2,
  });

  if (items.length < 2) {
    throw new AppError(400, 'At least 2 stock items required for stockA and stockB');
  }

  // Update first two items
  await Promise.all([
    prisma.stock.update({
      where: { id: items[0].id },
      data: { quantity: stockA, updatedAt: new Date() },
    }),
    prisma.stock.update({
      where: { id: items[1].id },
      data: { quantity: stockB, updatedAt: new Date() },
    }),
  ]);

  // Return updated stock
  const updatedItems = await prisma.stock.findMany({
    orderBy: { itemName: 'asc' },
    take: 2,
  });

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

  // Get current stock
  const current = await prisma.stock.findUnique({ where: { id } });
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

  const item = await prisma.stock.update({
    where: { id },
    data: {
      quantity: newQuantity,
      updatedAt: new Date(),
    },
  });

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

  const item = await prisma.stock.delete({
    where: { id },
  });

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
  const items = await prisma.stock.findMany({
    orderBy: { quantity: 'asc' },
  });

  // Filter items where quantity <= reorderLevel
  const lowStockItems = items.filter((item: any) => item.quantity <= item.reorderLevel);

  res.json({
    success: true,
    data: lowStockItems,
    count: lowStockItems.length,
    message: `${lowStockItems.length} items below reorder level`,
    timestamp: new Date(),
  });
});
