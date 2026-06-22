/**
 * GPIO Controller
 */

import { Request, Response } from 'express';
import { GPIOLog } from '@/models/index.js';
import { asyncHandler } from '@/middleware/errorHandler.js';
import { AppError } from '@/types/index.js';
import logger from '@/utils/logger.js';

/**
 * Track active GPIO event detection per pin
 * Maintains state across requests to prevent duplicate event listeners
 */
const activePinDetection = new Set<number>();

/**
 * Get GPIO logs
 */
export const getGPIOLogs = asyncHandler(async (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
  const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    GPIOLog.find({}).sort({ timestamp: -1 }).skip(skip).limit(limit),
    GPIOLog.countDocuments({}),
  ]);

  res.json({
    success: true,
    data: logs,
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
 * Get GPIO logs for specific device
 */
export const getDeviceLogs = asyncHandler(async (req: Request, res: Response) => {
  const { deviceId } = req.params;
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;

  const logs = await GPIOLog.find({ deviceId }).sort({ timestamp: -1 }).limit(limit);

  res.json({
    success: true,
    data: logs,
    count: logs.length,
    timestamp: new Date(),
  });
});

/**
 * Get GPIO stats (requires GPIO service)
 */
export const getGPIOStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await GPIOLog.aggregate([
    {
      $group: {
        _id: '$channel',
        count: { $sum: 1 },
        lastActivated: { $max: '$timestamp' },
        successCount: {
          $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] },
        },
        failureCount: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] },
        },
      },
    },
  ]);

  res.json({
    success: true,
    data: stats,
    timestamp: new Date(),
  });
});

/**
 * Log GPIO event (called by GPIO service)
 */
export const logGPIOEvent = asyncHandler(async (req: Request, res: Response) => {
  const { channel, action, relayPin, relayState, duration, status, errorMessage, userId, metadata } = req.body;

  if (!channel || !action) {
    throw new AppError(400, 'channel and action are required');
  }

  const log = new GPIOLog({
    channel,
    action,
    relayPin,
    relayState,
    duration,
    timestamp: new Date(),
    status: status || 'success',
    errorMessage,
    userId,
    metadata,
  });

  const savedLog = await log.save();

  res.status(201).json({
    success: true,
    message: 'GPIO event logged',
    data: savedLog,
    timestamp: new Date(),
  });
});

/**
 * Clear old GPIO logs
 */
export const clearOldLogs = asyncHandler(async (req: Request, res: Response) => {
  const { days } = req.body;

  if (!days || days < 1) {
    throw new AppError(400, 'days must be >= 1');
  }

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const result = await GPIOLog.deleteMany({
    timestamp: { $lt: cutoffDate },
  });

  res.json({
    success: true,
    message: `Deleted ${result.deletedCount} logs older than ${days} days`,
    data: {
      deletedCount: result.deletedCount,
    },
    timestamp: new Date(),
  });
});

/**
 * Turn off button - disable event detection for a GPIO pin
 * Maintains state using activePinDetection Set
 */
export const turnOffButton = asyncHandler(async (req: Request, res: Response) => {
  const pinButton = req.query.pinButton as string;

  if (!pinButton) {
    throw new AppError(400, 'pinButton parameter is required');
  }

  const pin = parseInt(pinButton, 10);
  
  if (isNaN(pin)) {
    throw new AppError(400, 'pinButton must be a valid integer');
  }

  // Remove from active detection set
  activePinDetection.delete(pin);

  logger.info(`Event detection disabled for GPIO pin ${pin}`);

  return res.json({
    success: true,
    message: `Event detection removed for GPIO pin ${pin}`,
    data: {
      pin,
      status: 'disabled',
    },
    timestamp: new Date(),
  });
});

/**
 * Turn on button - enable event detection for a GPIO pin
 * Maintains state using activePinDetection Set
 */
export const turnOnButton = asyncHandler(async (req: Request, res: Response) => {
  const pinButton = req.query.pinButton as string;

  if (!pinButton) {
    throw new AppError(400, 'pinButton parameter is required');
  }

  const pin = parseInt(pinButton, 10);
  
  if (isNaN(pin)) {
    throw new AppError(400, 'pinButton must be a valid integer');
  }

  // Check if event detection is already active for this pin
  if (activePinDetection.has(pin)) {
    return res.json({
      success: true,
      message: `Event detection already set up for GPIO pin ${pin}`,
      data: {
        pin,
        status: 'already_active',
      },
      timestamp: new Date(),
    });
  }

  // Add to active detection set
  activePinDetection.add(pin);

  logger.info(`Event detection enabled for GPIO pin ${pin}`);

  return res.json({
    success: true,
    message: `Event detection added for GPIO pin ${pin}`,
    data: {
      pin,
      status: 'enabled',
    },
    timestamp: new Date(),
  });
});
