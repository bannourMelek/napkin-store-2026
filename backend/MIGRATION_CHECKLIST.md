# Napkin Store: MongoDB → SQLite + Prisma Migration Checklist

## ✅ Completed Tasks

### Backend Configuration
- ✅ Added Prisma dependencies to `package.json`
- ✅ Created `prisma/schema.prisma` with Prisma data models
- ✅ Updated `.env.example` to use `DATABASE_URL` instead of `MONGODB_URI`
- ✅ Updated `src/config/env.ts` to use SQLite config
- ✅ Replaced `src/config/database.ts` with Prisma client implementation
- ✅ Updated `src/models/index.ts` to export Prisma models
- ✅ Updated `src/scripts/db-init.ts` for Prisma
- ✅ Updated `src/scripts/db-seed.ts` for Prisma with sample data
- ✅ Updated `.gitignore` to exclude SQLite database files

### Documentation
- ✅ Created `MIGRATION_MONGODB_TO_SQLITE.md` with comprehensive guide
- ✅ Created `CONTROLLER_MIGRATION_EXAMPLES.md` with code patterns

---

## 📋 TODO: Complete These Steps

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Create Prisma Database
```bash
# Run migrations and create SQLite database
npx prisma migrate deploy

# OR push schema directly (first time)
npx prisma db push
```

### 3. Seed Sample Data (Optional)
```bash
npm run db:seed
```

### 4. Update ALL Controllers
**IMPORTANT**: The controllers still use Mongoose syntax and will NOT work with Prisma.

Controllers that need updating:
- [ ] `src/controllers/userController.ts`
- [ ] `src/controllers/adminController.ts`
- [ ] `src/controllers/stockController.ts`
- [ ] `src/controllers/gpioController.ts`
- [ ] `src/controllers/healthController.ts`

**Reference**: See `CONTROLLER_MIGRATION_EXAMPLES.md` for code patterns

### 5. Update ALL Services
Services that interact with database:
- [ ] `src/services/gpioService.ts` (if it has DB calls)
- [ ] Any other service files with database operations

### 6. Update ALL Middleware/Interceptors
- [ ] `src/middleware/errorHandler.ts` (if relevant)
- [ ] `src/interceptors/request.interceptor.ts` (if relevant)

### 7. Update Routes
- [ ] Check `src/routes/api.ts` for any DB operations

### 8. Test All Endpoints
After updating controllers, test:
```bash
npm run dev

# Test endpoints
curl http://localhost:5000/api/health
curl http://localhost:5000/api/users
curl http://localhost:5000/api/stock
curl http://localhost:5000/api/gpio
```

### 9. Create .env File
```bash
# Copy and modify .env.example
cp .env.example .env

# Update DATABASE_URL if needed:
DATABASE_URL="file:./prisma/dev.db"
```

### 10. Handle Data Migration (if you have existing data)
If migrating from existing MongoDB:
- [ ] Export MongoDB data to JSON
- [ ] Transform data to match Prisma schema (ObjectId → string)
- [ ] Use migration script to import into SQLite

### 11. Update Frontend (if needed)
- [ ] If API returns different data types, update frontend models
- [ ] Change from `_id` to `id` if exposed in API responses

### 12. Update Tests
- [ ] Update any test files using database
- [ ] Mock Prisma client if using jest/vitest

---

## 🔧 Common Tasks

### View Database
```bash
# Open Prisma Studio (GUI for database)
npx prisma studio
```

### Reset Database (DEV ONLY)
```bash
# Recreate database from scratch
npx prisma migrate reset
```

### Generate Prisma Client
```bash
# Regenerate if you get type errors
npx prisma generate
```

### Create Migration (if you modify schema)
```bash
# After editing prisma/schema.prisma
npx prisma migrate dev --name describe_changes
```

---

## 📝 Key Changes to Remember

| Item | Before (MongoDB) | After (Prisma/SQLite) |
|------|------------------|----------------------|
| **Primary Key** | `_id` (ObjectId) | `id` (CUID string) |
| **Connection** | `mongoose.connect()` | `new PrismaClient()` |
| **Find by ID** | `User.findById(id)` | `prisma.user.findUnique({where:{id}})` |
| **Find Multiple** | `User.find({})` | `prisma.user.findMany({})` |
| **Create** | `User.create(data)` | `prisma.user.create({data})` |
| **Update** | `User.findByIdAndUpdate(id, u)` | `prisma.user.update({where:{id}, data:u})` |
| **Delete** | `User.deleteOne({_id:id})` | `prisma.user.delete({where:{id}})` |
| **Select Fields** | `.select('-field')` | `{select: {field: false}}` |
| **Populate** | `.populate('relation')` | `{include: {relation: true}}` |
| **Limit** | `.limit(10)` | `{take: 10}` |
| **Skip** | `.skip(20)` | `{skip: 20}` |

---

## ⚠️ Breaking Changes

1. **ID Format**: All IDs change from ObjectId to CUID (string)
   - Update frontend if you expose IDs in API responses
   - Update any code comparing IDs

2. **Model Imports**: No more importing `User`, `Stock`, etc. from models
   ```typescript
   // ❌ Old
   import { User } from '@/models';
   
   // ✅ New
   import { getPrismaClient } from '@/config/database';
   const prisma = getPrismaClient();
   ```

3. **Array Fields**: Images and tags are now JSON strings, not arrays
   ```typescript
   // Parse before using
   const images = JSON.parse(stock.images || '[]');
   const tags = JSON.parse(stock.tags || '[]');
   
   // Save as string
   data.images = JSON.stringify(imageArray);
   ```

4. **Full-Text Search**: SQLite has limited FTS5 support
   - Use `{contains: query, mode: 'insensitive'}` for text search
   - For complex search, use Prisma's `$queryRaw`

5. **Transactions**: Syntax has changed
   ```typescript
   // ❌ Old Mongoose
   const session = await mongoose.startSession();
   await session.withTransaction(async () => { ... });
   
   // ✅ New Prisma
   await prisma.$transaction(async (tx) => {
     await tx.user.create({...});
   });
   ```

---

## 📚 Helpful Resources

- **Prisma Docs**: https://www.prisma.io/docs
- **SQLite Docs**: https://www.sqlite.org/docs.html
- **Migration Guide**: https://www.prisma.io/docs/guides/migrate/prisma-migrate
- **API Reference**: https://www.prisma.io/docs/reference/api-reference
- **Studio**: Run `npx prisma studio` to explore database GUI

---

## 🎯 Validation Checklist

Once you've completed the migration:
- [ ] `npm install` completes without errors
- [ ] `npx prisma db push` succeeds
- [ ] `npm run db:seed` successfully populates database
- [ ] `npx prisma studio` opens and shows tables
- [ ] `npm run dev` server starts without errors
- [ ] All API endpoints return 200/correct status codes
- [ ] Database operations (CRUD) work correctly
- [ ] No TypeScript errors in build
- [ ] Tests pass (if applicable)

---

## 🆘 Troubleshooting

### Issue: "Cannot find module @prisma/client"
```bash
npm install
npx prisma generate
```

### Issue: "Database file not found"
```bash
mkdir -p prisma
npx prisma db push
```

### Issue: "Type errors with Prisma models"
```bash
npx prisma generate
# Then rebuild TypeScript
npm run build
```

### Issue: "Connection timeout"
- Check `DATABASE_URL` in `.env`
- Ensure `prisma/` directory is writable
- Try: `npx prisma db push`

### Issue: "Unique constraint failed"
- The seed data has hardcoded emails/SKUs
- Run `npx prisma migrate reset` to start fresh
- Or modify seed script with unique values

---

## 📞 Need Help?

1. Check `MIGRATION_MONGODB_TO_SQLITE.md` for detailed explanations
2. Review `CONTROLLER_MIGRATION_EXAMPLES.md` for code patterns
3. Run `npx prisma studio` to inspect database
4. Check error messages - they're usually very descriptive
5. Refer to Prisma documentation: https://www.prisma.io/docs

---

**Last Updated**: 2024-12-20
**Status**: Database layer migrated ✅ | Controllers need updating ⏳
