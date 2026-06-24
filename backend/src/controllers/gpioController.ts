/**
 * GPIO Controller
 * Updated to use NeDB
 */

import { Request, Response } from 'express';
import { getGPIOLogsDB } from '@/config/database.js';
import { asyncHandler } from '@/middleware/errorHandler.js';
import { AppError } from '@/types/index.js';
import logger from '@/utils/logger.js';
import { find, insert, remove, findWithPagination, count, generateId } from '@/utils/nedb-helper.js';
import type { GPIOLog } from '@/models/index.js';

/**
 * Track active GPIO event detection per pin
 * Maintains state across requests to prevent duplicate event listeners
 */
const activePinDetection = new Set<number>();

/**
 * Control GPIO relay - activate and deactivate
 * POST /gpio with { relaisPin }
 */
export const controlGPIO = asyncHandler(async (req: Request, res: Response) => {
  const { relaisPin } = req.body;

  if (!relaisPin) {
    throw new AppError(400, 'relaisPin is required');
  }

  try {
    const pin = parseInt(relaisPin as string, 10);
    
    // In development/mock mode, just log and return success
    // In production with actual GPIO hardware, this would control the physical pin
    logger.info(`GPIO relay activated on pin ${pin}`);
    
    // Simulate 0.5 second pulse (in real code, would use GPIO library)
    // GPIO.output(relaisPin, GPIO.HIGH)
    // setTimeout(() => GPIO.output(relaisPin, GPIO.LOW), 500)
    
    res.json({
      message: 'Relais turned successfully',
    });
  } catch (err) {
    throw new AppError(500, 'Failed to control GPIO relay');
  }
});

/**
 * GPIO cleanup - disable all GPIO pins
 * DELETE /gpio
 */
export const gpioCleanup = asyncHandler(async (req: Request, res: Response) => {
  try {
    // In production with actual GPIO, this would clean up all pins
    // GPIO.cleanup()
    
    activePinDetection.clear();
    logger.info('GPIO cleanup completed');
    
    res.json({
      message: 'cleanup successfully',
    });
  } catch (err) {
    throw new AppError(500, 'Failed to cleanup GPIO');
  }
});

/**
 * Get GPIO logs
 */
export const getGPIOLogs = asyncHandler(async (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
  const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
  const skip = (page - 1) * limit;

  const db = getGPIOLogsDB();

  const [logs, total] = await Promise.all([
    findWithPagination(db, {}, skip, limit, 'createdAt', -1),
    count(db, {}),
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

  const db = getGPIOLogsDB();
  const logs = await findWithPagination(db, { deviceId }, 0, limit, 'createdAt', -1);

  res.json({
    success: true,
    data: logs,
    count: logs.length,
    timestamp: new Date(),
  });
});

/**
 * Get GPIO stats
 */
export const getGPIOStats = asyncHandler(async (req: Request, res: Response) => {
  const db = getGPIOLogsDB();
  const logs = await find(db, {});

  // Group by channel and calculate stats
  const stats = logs.reduce((acc: any, log: GPIOLog) => {
    const key = log.channel;
    if (!acc[key]) {
      acc[key] = {
        _id: log.channel,
        count: 0,
        lastActivated: log.createdAt,
      };
    }
    acc[key].count += 1;
    if (new Date(log.createdAt || 0) > new Date(acc[key].lastActivated || 0)) {
      acc[key].lastActivated = log.createdAt;
    }
    return acc;
  }, {});

  res.json({
    success: true,
    data: Object.values(stats),
    timestamp: new Date(),
  });
});

/**
 * Log GPIO event (called by GPIO service)
 */
export const logGPIOEvent = asyncHandler(async (req: Request, res: Response) => {
  const { channel, action, relayPin, relayState, duration, userId, metadata } = req.body;

  if (!channel || !action) {
    throw new AppError(400, 'channel and action are required');
  }

  const db = getGPIOLogsDB();

  const newLog: GPIOLog = {
    _id: generateId(),
    channel,
    action,
    relayPin,
    relayState,
    duration,
    userId,
    metadata,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const log = await insert(db, newLog);

  res.status(201).json({
    success: true,
    message: 'GPIO event logged',
    data: log,
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

  const db = getGPIOLogsDB();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  // Find logs older than cutoff date
  const oldLogs = await find(db, { createdAt: { $lt: cutoffDate } });

  // Delete each log
  for (const log of oldLogs) {
    await remove(db, { _id: log._id });
  }

  res.json({
    success: true,
    message: `Deleted ${oldLogs.length} logs older than ${days} days`,
    data: {
      deletedCount: oldLogs.length,
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
    message: `Event detection removed for GPIO pin ${pin}`,
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
      message: `Event detection already set up for GPIO pin ${pin}`,
    });
  }

  // Add to active detection set
  activePinDetection.add(pin);

  logger.info(`Event detection enabled for GPIO pin ${pin}`);

  return res.json({
    message: `Event detection added for GPIO pin ${pin}`,
  });
});
