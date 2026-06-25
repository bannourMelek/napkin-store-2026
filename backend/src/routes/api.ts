/**
 * API Routes
 * Matches original Flask application endpoints
 */

import { Router } from 'express';
import * as userController from '@/controllers/userController.js';
import * as adminController from '@/controllers/adminController.js';
import * as stockController from '@/controllers/stockController.js';
import * as gpioController from '@/controllers/gpioController.js';

export const router = Router();

// ============================================================================
// User Routes
// ============================================================================
router.get('/user', userController.getUserByBadge);      // GET /user?badge_id=xxx
router.post('/user', userController.createUser);         // POST /user
router.put('/user', userController.updateUser);          // PUT /user

// ============================================================================
// Admin Routes
// ============================================================================
router.get('/admin', adminController.getAdminByBadge);   // GET /admin?badge_id=xxx
router.post('/admin', adminController.createAdmin);      // POST /admin
router.put('/admin', adminController.updateAdmin);       // PUT /admin

// ============================================================================
// Stock Routes
// ============================================================================
router.get('/stock', stockController.getAllStock);       // GET /stock
router.put('/stock', stockController.updateStock);       // PUT /stock

// ============================================================================
// GPIO Routes
// ============================================================================
router.post('/gpio', gpioController.controlGPIO);        // POST /gpio
router.delete('/gpio', gpioController.gpioCleanup);      // DELETE /gpio
router.get('/turn-on-button', gpioController.turnOnButton);    // GET /turn-on-button?pinButton=xxx
router.get('/turn-off-button', gpioController.turnOffButton);  // GET /turn-off-button?pinButton=xxx

export default router;
