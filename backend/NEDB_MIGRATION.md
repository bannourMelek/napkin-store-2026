# Prisma/SQLite to NeDB Migration Guide

## Overview
The Napkin Store Backend has been successfully migrated from **Prisma + SQLite** to **NeDB**. All database operations have been converted to use NeDB's callback-based API with async/await helpers.

## Key Changes

### 1. Dependencies Update
**Removed:**
- `@prisma/cli` (^3.0.0-beta.14)
- `@prisma/client` (^7.8.0)
- `@prisma/internals` (^7.8.0)
- `better-sqlite3` (^12.11.1)

**Added:**
- `nedb` (^1.8.0)
- `@types/nedb` (^1.8.19)

### 2. Database Configuration

#### Before (Prisma):
```typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
```

#### After (NeDB):
```typescript
import Database from 'nedb';
const databases = {
  users: new Database({ filename: './data/users.db', autoload: true }),
  admins: new Database({ filename: './data/admins.db', autoload: true }),
  stock: new Database({ filename: './data/stock.db', autoload: true }),
  gpioLogs: new Database({ filename: './data/gpio-logs.db', autoload: true }),
};
```

**Location:** [src/config/database.ts](src/config/database.ts)

### 3. New NeDB Helper Module

A new utility module has been created at [src/utils/nedb-helper.ts](src/utils/nedb-helper.ts) with helper functions that wrap NeDB's callback-based API with Promises:

- `findOne(db, query)` - Find a single document
- `find(db, query)` - Find multiple documents
- `findWithSort(db, query, sortField, sortOrder)` - Find with sorting
- `findWithLimit(db, query, limit)` - Find with limit
- `findWithPagination(db, query, skip, limit, sortField, sortOrder)` - Find with pagination
- `insert(db, doc)` - Insert a document
- `update(db, query, update, options)` - Update documents
- `remove(db, query, options)` - Remove documents
- `count(db, query)` - Count documents
- `generateId()` - Generate CUID-like IDs

### 4. Data Models

The models have been updated from Prisma types to TypeScript interfaces. Each model now includes an `_id` field (NeDB's default primary key):

**Location:** [src/models/index.ts](src/models/index.ts)

```typescript
export interface User {
  _id?: string;
  mat: string;
  name: string;
  // ... other fields
  createdAt?: Date;
  updatedAt?: Date;
}
```

### 5. Controller Changes

All controllers have been updated to use NeDB operations:

- [src/controllers/userController.ts](src/controllers/userController.ts)
- [src/controllers/adminController.ts](src/controllers/adminController.ts)
- [src/controllers/stockController.ts](src/controllers/stockController.ts)
- [src/controllers/gpioController.ts](src/controllers/gpioController.ts)

#### Operation Mapping

| Prisma | NeDB Helper |
|--------|------------|
| `prisma.user.findUnique()` | `findOne(db, query)` |
| `prisma.user.findMany()` | `find(db, query)` or `findWithLimit()` |
| `prisma.user.create()` | `insert(db, doc)` |
| `prisma.user.update()` | `update(db, query, update)` |
| `prisma.user.delete()` | `remove(db, query)` |
| `prisma.user.count()` | `count(db, query)` |

### 6. Environment Configuration

Updated [src/config/env.ts](src/config/env.ts):

**Before:**
```typescript
DATABASE_URL: process.env.DATABASE_URL || 'file:./prisma/dev.db'
```

**After:**
```typescript
NEDB_PATH: process.env.NEDB_PATH || './data'
```

### 7. .gitignore Updates

Updated to ignore NeDB data directory:

```
# Database
/data
/data/
```

## Data Directory Structure

NeDB creates separate database files for each collection:

```
/data
├── users.db
├── admins.db
├── stock.db
└── gpio-logs.db
```

These files are excluded from version control.

## Key Differences Between Prisma/SQLite and NeDB

### Advantages of NeDB:
- ✅ No external dependencies
- ✅ File-based storage (one file per collection)
- ✅ Embedded database (works great for single-instance applications)
- ✅ Smaller footprint
- ✅ Easier deployment on Raspberry Pi

### Limitations of NeDB:
- ⚠️ No built-in transactions
- ⚠️ Single-process access recommended
- ⚠️ Not suitable for high-concurrency scenarios
- ⚠️ Limited query operators compared to SQL

## API Compatibility

The REST API endpoints remain **unchanged**. All existing frontend code should work without modifications:

- `GET /api/user?badge_id=xxx`
- `POST /api/user`
- `PUT /api/user`
- `DELETE /api/user/:id`
- Similar endpoints for `/admin`, `/stock`, `/gpio`

## Installation & Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm run dev
```

The data directory will be created automatically on first run.

## Migration Scripts

If you have existing Prisma data that needs to be migrated:

1. Export data from SQLite
2. Transform data format if needed
3. Use NeDB import scripts (to be created as needed)

For now, starting fresh is recommended.

## Testing

All endpoints should be tested to ensure NeDB operations work correctly:

```bash
npm run test
```

## Troubleshooting

### Database files are locked
- Ensure only one instance of the application is running
- NeDB doesn't support concurrent access from multiple processes

### Queries returning empty results
- Check that the query syntax matches NeDB format
- NeDB uses MongoDB-like query syntax: `{ field: value }` or `{ field: { $operator: value } }`

### Performance issues
- NeDB is optimized for small to medium datasets
- For large datasets, consider pagination
- Use proper indexes on frequently queried fields

## Future Improvements

Consider these enhancements if needed:
1. Add data backup/restore functionality
2. Implement data compaction for NeDB files
3. Add migration tools for data import/export
4. Consider NeDB-Async wrapper for better async/await support
5. Add data export functionality for analytics

## References

- [NeDB Documentation](https://github.com/louischatriot/nedb)
- [NeDB vs SQLite](https://github.com/louischatriot/nedb#comparison-with-other-databases)
