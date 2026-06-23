/**
 * Add Admin Script
 * 
 * Usage: npx tsx scripts/add-admin.ts
 * 
 * Simply modify the ADMINS array below with your admin data and run the script
 */

import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';
import logger from '@/utils/logger.js';

const prisma = new PrismaClient();

// ============================================================================
// MODIFY THIS ARRAY TO ADD YOUR ADMINS
// ============================================================================

interface AdminInput {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  adminLevel: 'superadmin' | 'moderator' | 'support';
  department?: string;
  permissions?: string[];
}

const ADMINS: AdminInput[] = [
  {
    email: 'admin@napkinstore.com',
    username: 'admin',
    password: 'Admin@123456',
    firstName: 'Admin',
    lastName: 'User',
    adminLevel: 'superadmin',
    department: 'Management',
    permissions: ['*'],
  },
  // Add more admins below:
  // {
  //   email: 'moderator@napkinstore.com',
  //   username: 'moderator',
  //   password: 'Mod@123456',
  //   firstName: 'Moderator',
  //   lastName: 'User',
  //   adminLevel: 'moderator',
  //   department: 'Support',
  //   permissions: ['read', 'update'],
  // },
];

// ============================================================================
// DO NOT MODIFY BELOW THIS LINE
// ============================================================================

async function addAdmins(): Promise<void> {
  try {
    logger.info(`📝 Adding ${ADMINS.length} admin(s)...`);

    for (const adminData of ADMINS) {
      try {
        // Hash password
        const passwordHash = await bcryptjs.hash(adminData.password, 10);

        // Create or update user
        const user = await prisma.user.upsert({
          where: { email: adminData.email },
          update: {
            role: 'admin',
            status: 'active',
          },
          create: {
            email: adminData.email,
            username: adminData.username,
            passwordHash,
            firstName: adminData.firstName,
            lastName: adminData.lastName,
            role: 'admin',
            status: 'active',
          },
        });

        logger.info(`✅ User created/updated: ${adminData.email} (${user.id})`);

        // Create or update admin
        const admin = await prisma.admin.upsert({
          where: { userId: user.id },
          update: {
            adminLevel: adminData.adminLevel,
            department: adminData.department,
            permissions: adminData.permissions ? JSON.stringify(adminData.permissions) : null,
          },
          create: {
            userId: user.id,
            adminLevel: adminData.adminLevel,
            department: adminData.department,
            permissions: adminData.permissions ? JSON.stringify(adminData.permissions) : null,
          },
        });

        logger.info(
          `✅ Admin created: ${adminData.email} (Level: ${adminData.adminLevel}) (${admin.id})`
        );
        logger.info(`   Email: ${adminData.email}`);
        logger.info(`   Level: ${adminData.adminLevel}`);
        logger.info(`   Department: ${adminData.department || 'N/A'}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(`❌ Error adding admin ${adminData.email}: ${message}`);
      }
    }

    // Show all admins
    logger.info('\n📊 All admins in database:');
    const allAdmins = await prisma.admin.findMany({
      include: { user: true },
    });

    allAdmins.forEach((admin) => {
      logger.info(
        `  • ${admin.user.email} (${admin.adminLevel}) - ${admin.user.status}`
      );
    });

    logger.info(`\n✅ Admin setup complete! Total admins: ${allAdmins.length}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`❌ Script failed: ${message}`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addAdmins();
