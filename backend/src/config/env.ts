/**
 * Environment Configuration
 */

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const config = {
  // Server
  NODE_ENV: (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test',
  PORT: parseInt(process.env.PORT || '5000', 10),
  HOST: process.env.HOST || '0.0.0.0',

  // Database
  NEDB_PATH: process.env.NEDB_PATH || './data',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',

  // CORS
  CORS_ORIGINS: (
    process.env.CORS_ORIGINS ||
    'http://localhost:4200,http://127.0.0.1:4200,http://localhost:3000,http://127.0.0.1:3000,file://*,app://*'
  ).split(','),

  // GPIO Configuration
  GPIO_MODE: (process.env.GPIO_MODE || 'BCM') as 'BCM' | 'BOARD',
  RELAIS_A_PIN: parseInt(process.env.RELAIS_A_PIN || '16', 10),
  RELAIS_B_PIN: parseInt(process.env.RELAIS_B_PIN || '21', 10),
  BUTTON_A_PIN: parseInt(process.env.BUTTON_A_PIN || '5', 10),
  BUTTON_B_PIN: parseInt(process.env.BUTTON_B_PIN || '6', 10),
  LED_A_PIN: parseInt(process.env.LED_A_PIN || '27', 10),
  LED_B_PIN: parseInt(process.env.LED_B_PIN || '22', 10),

  // Logging
  LOG_LEVEL: (process.env.LOG_LEVEL || 'info') as 'error' | 'warn' | 'info' | 'debug',

  // API
  API_PREFIX: '/api',

  // Features
  ENABLE_GPIO: process.env.ENABLE_GPIO !== 'false',
  ENABLE_SOCKET_IO: process.env.ENABLE_SOCKET_IO !== 'false',
};

export const isDevelopment = config.NODE_ENV === 'development';
export const isProduction = config.NODE_ENV === 'production';
export const isTest = config.NODE_ENV === 'test';
