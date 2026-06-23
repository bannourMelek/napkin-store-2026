# MongoDB to SQLite + Prisma Migration Guide

## Overview
The Napkin Store backend has been migrated from MongoDB (Mongoose) to SQLite with Prisma ORM. This provides a lightweight, file-based database that requires no external setup.

## Changes Made

### 1. **Dependencies Updated**
- ✅ Removed: `mongoose` 
- ✅ Added: `@prisma/client`, `@prisma/cli`, `@prisma/adapter-sqlite`, `better-sqlite3`

### 2. **Database Configuration**
- **Old**: `MONGODB_URI` and `MONGODB_DB` environment variables
- **New**: `DATABASE_URL=file:./prisma/dev.db` in `.env`
- **Config**: `prisma.config.ts` handles connection URL (Prisma v7.0+)

### 3. **File Structure Changes**
```
backend/
├── prisma/
│   ├── schema.prisma    (new) - Prisma schema definition
│   └── dev.db          (new) - SQLite database file
├── prisma.config.ts    (new) - Prisma configuration with database adapter
├── src/
│   ├── config/
│   │   ├── database.ts   (updated) - Now uses Prisma client
│   │   └── env.ts       (updated) - Removed MongoDB config
│   ├── models/
│   │   └── index.ts     (updated) - Re-exports Prisma models
│   └── scripts/
│       ├── db-init.ts   (updated) - Prisma initialization
│       └── db-seed.ts   (updated) - Prisma seeding
```

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
npm install @prisma/adapter-sqlite better-sqlite3
```

### 2. Create Environment File
Create `.env` in the `backend/` directory:
```env
DATABASE_URL="file:./prisma/dev.db"
NODE_ENV=development
PORT=3000
JWT_SECRET=your-secret-key-here
```

### 3. Initialize Database
```bash
# Generate Prisma client and create database
npx prisma db push

# Verify database setup
npx prisma studio
```

### 4. Seed Sample Data (Optional)
```bash
npm run db:seed
```

### 5. Start Development Server
```bash
npm run dev
```

## Key Differences

### Data Model Changes
- **MongoDB ObjectIds** → **Prisma CUID** (character-based unique IDs)
- **UUID() support** available in schema if preferred
- Array fields (images, tags) stored as JSON strings
- Mixed types handled as JSON

### API Changes
The API endpoints remain the same, but data types have changed:
```typescript
// Old (MongoDB)
const user = await User.findById(id);  // _id field

// New (Prisma)
const user = await prisma.user.findUnique({ where: { id } });  // id field
```

### Important: Update Controllers
Controllers using `.findById()` or MongoDB-specific methods need updates:

**User Controller Example:**
```typescript
// Before
const user = await User.findById(id).select('+passwordHash');

// After
import { getPrismaClient } from '@/config/database.js';
const prisma = getPrismaClient();
const user = await prisma.user.findUnique({ where: { id } });
```

## Database Schema

### User Table
- `id`: String (CUID, primary key)
- `email`: String (unique)
- `username`: String (unique)
- `passwordHash`: String
- `firstName`, `lastName`, `phone`: String (optional)
- `role`: String ('user' | 'admin')
- `status`: String ('active' | 'inactive' | 'suspended')
- `preferences`: JSON
- `createdAt`, `updatedAt`: DateTime

### Admin Table
- `id`: String (CUID, primary key)
- `userId`: String (foreign key to User)
- `adminLevel`: String ('superadmin' | 'moderator' | 'support')
- `permissions`: String (JSON array)
- `department`: String
- `approvals`: JSON
- `activityLog`: JSON
- `createdAt`, `updatedAt`: DateTime

### Stock Table
- `id`: String (CUID, primary key)
- `itemName`: String
- `description`: String (optional)
- `sku`: String (unique)
- `quantity`: Int
- `reorderLevel`: Int
- `unit`: String
- `price`: Float
- `supplier`, `location`, `category`: String
- `batchNumber`, `expiryDate`: DateTime (optional)
- `images`, `tags`: String (JSON arrays)
- `lastRestocked`: DateTime (optional)
- `createdAt`, `updatedAt`: DateTime

### GPIOLog Table
- `id`: String (CUID, primary key)
- `deviceId`: String (optional)
- `channel`: Int
- `action`: String ('pressed' | 'released' | 'triggered')
- `relayPin`: Int
- `relayState`: String (optional)
- `duration`: Int (optional)
- `metadata`: JSON
- `userId`: String (optional)
- `createdAt`: DateTime

## Configuration Files

### `.env` (Environment Variables)
```env
DATABASE_URL="file:./prisma/dev.db"
NODE_ENV=development
PORT=3000
JWT_SECRET=your-secret-key-here
LOG_LEVEL=info
```

### `prisma/schema.prisma`
Defines all data models without the connection URL (URL is now in `prisma.config.ts`):
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
}
```

### `prisma.config.ts`
Manages database connection and adapter configuration:
```typescript
import { defineConfig } from '@prisma/internals';

const databaseUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db';

export default defineConfig({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});
```

## Common Issues & Solutions

### Issue: "datasource url is no longer supported in schema files"
**Solution**: Ensure you have created `prisma.config.ts` in the backend root directory with database adapter configuration.

### Issue: "Error: ENOENT: no such file or directory"
**Solution**: Ensure `prisma/` folder exists
```bash
mkdir -p prisma
```

### Issue: "PrismaClient is not instantiated"
**Solution**: Import from database.ts:
```typescript
import { getPrismaClient } from '@/config/database.js';
const prisma = getPrismaClient();
```

### Issue: "Type errors with Prisma models"
**Solution**: Regenerate Prisma client:
```bash
npx prisma generate
```

## Migration Path for Existing Data

If you have existing MongoDB data, use Prisma's import tools or ETL scripts:

1. **Export MongoDB data as JSON**
2. **Transform to match Prisma schema** (handle ID conversion)
3. **Use `prisma db push` to create tables**
4. **Import data using Prisma client**

```typescript
import { getPrismaClient } from '@/config/database.js';
const prisma = getPrismaClient();

// Batch import
await prisma.user.createMany({
  data: transformedUsers,
  skipDuplicates: true,
});
```

## Performance Notes

- SQLite is great for development and small to medium deployments
- For production with high traffic, consider migrating to PostgreSQL (drop-in replacement with Prisma)
- Full-text search uses FTS5 (available in schema but may require query adjustments)
- Database file is self-contained, no external services needed

## Next Steps

1. ✅ Update all controller files to use new Prisma query syntax
2. ✅ Update all service files to use Prisma client
3. ✅ Update middleware/interceptors if they use database
4. ✅ Test all API endpoints
5. ✅ Update frontend types if MongoDB ObjectId is exposed in API responses

## Useful Prisma Commands

```bash
# View database GUI
npx prisma studio

# Inspect schema
npx prisma introspect

# Generate client
npx prisma generate

# Create migration (if schema changes)
npx prisma migrate dev --name descriptive_name

# Reset database (careful!)
npx prisma migrate reset
```

## References
- [Prisma Documentation](https://www.prisma.io/docs)
- [SQLite Limitations](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#sqlite)
- [Migration Guide](https://www.prisma.io/docs/guides/migrate/prisma-migrate)
