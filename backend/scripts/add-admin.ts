/**
 * Add Admin Script
 * 
 * Usage: npx tsx scripts/add-admin.ts
 * 
 * Simply modify the ADMINS array below with your admin data and run the script
 */

import { connectDB, getAdminsDB } from '@/config/database.js';
import logger from '@/utils/logger.js';
import { insert, find, generateId } from '@/utils/nedb-helper.js';
import type { Admin } from '@/models/index.js';

// ============================================================================
// MODIFY THIS ARRAY TO ADD YOUR ADMINS
// ============================================================================

interface AdminInput {
  mat: string;
  name: string;
  org?: string;
  jobName: string;
  badgeNum: number;
  badgeId: string;
}

const ADMINS: AdminInput[] = [
  {
    mat: '4049360',
    name: 'Malek Bannour',
    org: 'IT',
    jobName: 'specialist IT',
    badgeNum: 4160308,
    badgeId: '>11,4254462,4E0040EAFE<11,4254462,4E0040EAFE',

  },
  // Add more admins below:
  // {
  //   mat: 'ADMIN002',
  //   name: 'Another Admin',
  //   org: 'Support',
  //   jobName: 'Support Admin',
  //   badgeNum: 1002,
  //   badgeId: 'BADGE-ADMIN-002',
  // },
];

// ============================================================================
// DO NOT MODIFY BELOW THIS LINE
// ============================================================================

async function addAdmins(): Promise<void> {
  try {
    await connectDB();
    const db = getAdminsDB();

    logger.info(`📝 Adding ${ADMINS.length} admin(s)...`);

    for (const adminData of ADMINS) {
      try {
        // Check if admin already exists by mat or badgeId
        const existingAdmins = await find(db, {
          $or: [{ mat: adminData.mat }, { badgeId: adminData.badgeId }],
        });

        if (existingAdmins.length > 0) {
          logger.warn(`⚠️  Admin already exists: ${adminData.mat} (${adminData.name})`);
          continue;
        }

        // Create new admin
        const newAdmin: Admin = {
          _id: generateId(),
          mat: adminData.mat,
          name: adminData.name,
          org: adminData.org,
          jobName: adminData.jobName,
          badgeNum: adminData.badgeNum,
          badgeId: adminData.badgeId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const admin = await insert(db, newAdmin);

        logger.info(`✅ Admin created: ${adminData.mat} (${adminData.name})`);
        logger.info(`   ID: ${admin._id}`);
        logger.info(`   Job: ${adminData.jobName}`);
        logger.info(`   Badge: ${adminData.badgeId}`);
        logger.info(`   Org: ${adminData.org || 'N/A'}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(`❌ Error adding admin ${adminData.mat}: ${message}`);
      }
    }

    // Show all admins
    logger.info('\n📊 All admins in database:');
    const allAdmins = await find(db, {});

    allAdmins.forEach((admin: any) => {
      logger.info(`  • ${admin.mat} - ${admin.name} (${admin.jobName})`);
    });

    logger.info(`\n✅ Admin setup complete! Total admins: ${allAdmins.length}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`❌ Script failed: ${message}`);
    process.exit(1);
  }
}

addAdmins();
