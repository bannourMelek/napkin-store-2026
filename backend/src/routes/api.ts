/**
 * API Routes
 */

import { Router } from 'express';
import * as userController from '@/controllers/userController.js';
import * as stockController from '@/controllers/stockController.js';
import * as gpioController from '@/controllers/gpioController.js';
import * as healthController from '@/controllers/healthController.js';

export const router = Router();

// ============================================================================
// Health Check
// ============================================================================
router.get('/health', healthController.healthCheck);

// ============================================================================
// User Routes
// ============================================================================
router.get('/users', userController.getAllUsers);
router.get('/users/:id', userController.getUserById);
router.post('/users', userController.createUser);
router.post('/users/auth/login', userController.loginUser);
router.put('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);
router.patch('/users/:id/status', userController.changeUserStatus);

// ============================================================================
// Stock Routes
// ============================================================================
router.get('/stock', stockController.getAllStock);
router.get('/stock/search', stockController.searchStock);
router.get('/stock/low', stockController.getLowStock);
router.get('/stock/:id', stockController.getStockById);
router.post('/stock', stockController.createStock);
router.put('/stock/:id', stockController.updateStock);
router.patch('/stock/:id/quantity', stockController.updateStockQuantity);
router.delete('/stock/:id', stockController.deleteStock);

// ============================================================================
// GPIO Routes
// ============================================================================
router.get('/gpio/logs', gpioController.getGPIOLogs);
router.get('/gpio/logs/:deviceId', gpioController.getDeviceLogs);
router.get('/gpio/stats', gpioController.getGPIOStats);
router.post('/gpio/logs', gpioController.logGPIOEvent);
router.post('/gpio/logs/clear', gpioController.clearOldLogs);
router.get('/gpio/turn-on-button', gpioController.turnOnButton);
router.get('/gpio/turn-off-button', gpioController.turnOffButton);

export default router;
