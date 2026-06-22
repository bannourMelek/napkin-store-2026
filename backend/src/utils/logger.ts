/**
 * Logger Utility
 */

import winston from 'winston';
import { config, isDevelopment } from '@/config/env.js';

const colors = {
  error: '\x1b[31m',
  warn: '\x1b[33m',
  info: '\x1b[36m',
  debug: '\x1b[35m',
  reset: '\x1b[0m',
};

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    const color = colors[level as keyof typeof colors] || colors.reset;
    const metaStr = Object.keys(meta).length > 0 ? JSON.stringify(meta, null, 2) : '';
    return `${color}${timestamp} [${level.toUpperCase()}]${colors.reset} ${message} ${metaStr}`;
  })
);

const transports = [
  new winston.transports.Console({ format }),
  new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
  new winston.transports.File({ filename: 'logs/combined.log' }),
];

const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  format,
  transports,
  exceptionHandlers: [new winston.transports.File({ filename: 'logs/exceptions.log' })],
  rejectionHandlers: [new winston.transports.File({ filename: 'logs/rejections.log' })],
});

export default logger;
