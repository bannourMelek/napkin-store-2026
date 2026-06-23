/**
 * Prisma Models & Types
 * Re-export models from Prisma Client
 */

import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export type { User, Admin, Stock, GPIOLog } from '@prisma/client';
