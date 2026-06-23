# Napkin Store Backend

Express.js REST API with SQLite + Prisma ORM, GPIO control, JWT authentication, and role-based access control.

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm or yarn

### Installation

```bash
cd backend

# Install dependencies
npm install

# Install SQLite adapter
npm install @prisma/adapter-sqlite better-sqlite3
```

### Environment Setup

Create a `.env` file in the `backend/` directory:

```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# Server
NODE_ENV=development
PORT=3000

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Logging
LOG_LEVEL=info
```

### Database Setup

```bash
# Push schema to SQLite database
npx prisma db push

# (Optional) Seed sample data
npm run db:seed

# (Optional) Open Prisma Studio to view/edit data visually
npx prisma studio
```

### Run Development Server

```bash
npm run dev
```

Server will start at `http://localhost:3000`

## 📁 Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── dev.db             # SQLite database file (git-ignored)
├── src/
│   ├── config/
│   │   ├── database.ts     # Prisma client initialization
│   │   └── env.ts          # Environment variable validation
│   ├── controllers/        # Route handlers
│   │   ├── userController.ts
│   │   ├── adminController.ts
│   │   ├── stockController.ts
│   │   └── gpioController.ts
│   ├── routes/
│   │   └── api.ts          # API route definitions
│   ├── middleware/
│   │   └── errorHandler.ts # Error handling middleware
│   ├── services/           # Business logic
│   │   └── gpioService.ts
│   ├── types/              # TypeScript type definitions
│   ├── utils/
│   │   └── logger.ts       # Winston logging
│   ├── app.ts              # Express app setup
│   └── index.ts            # Server entry point
├── prisma.config.ts        # Prisma configuration with database adapter
├── package.json
├── tsconfig.json
└── README.md
```

## 📚 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot-reload |
| `npm run build` | Build TypeScript to JavaScript |
| `npm start` | Run production build |
| `npm run db:init` | Initialize database |
| `npm run db:seed` | Seed sample data |
| `npx prisma db push` | Sync schema with database |
| `npx prisma migrate dev --name <name>` | Create new migration |
| `npx prisma studio` | Open visual database UI |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm test` | Run tests with Vitest |

## 🗄️ Database Models

### User
- `id` (CUID) - Primary key
- `mat` (String, unique) - Employee ID
- `name` (String) - Full name
- `org` (String?) - Organization
- `direct` (String?) - Direct supervisor
- `costCenter` (Int?) - Cost center
- `birthday` (String?) - Date of birth
- `schoolLevel` (String?) - School/education level
- `department` (String?) - Department
- `jobName` (String) - Job title
- `badgeNum` (Int) - Badge number
- `superior` (String?) - Superior
- `stock` (Int) - Stock count (default: 0)
- `badgeId` (String, unique) - Badge ID
- `createdAt`, `updatedAt` - Timestamps

**Indexes**: `mat`, `badgeId`, `org`, `department`

### Admin
- `id` (CUID) - Primary key
- `mat` (String, unique) - Employee ID
- `name` (String) - Admin name
- `org` (String?) - Organization
- `jobName` (String) - Job title
- `badgeNum` (Int) - Badge number
- `badgeId` (String, unique) - Badge ID
- `createdAt`, `updatedAt` - Timestamps

**Indexes**: `mat`, `badgeId`, `org`

### Stock
- `id` (CUID) - Primary key
- `itemName` (String) - Item name
- `description` (String?) - Description
- `sku` (String, unique) - Stock keeping unit
- `quantity` (Int) - Current quantity
- `reorderLevel` (Int) - Minimum quantity threshold
- `unit` (String) - Unit of measure
- `price` (Float) - Unit price
- `supplier` (String?) - Supplier name
- `location` (String?) - Storage location
- `category` (String) - Item category
- `batchNumber` (String?) - Batch/lot number
- `expiryDate` (DateTime?) - Expiration date
- `images` (String?) - JSON array of image URLs
- `tags` (String?) - JSON array of tags
- `lastRestocked` (DateTime?) - Last restocking date
- `createdAt`, `updatedAt` - Timestamps

**Indexes**: `sku`, `category`, `quantity`, `location`

### GPIOLog
- `id` (CUID) - Primary key
- `deviceId` (String?) - Device identifier
- `channel` (Int) - Channel number
- `action` (String) - Action type: 'pressed', 'released', 'triggered'
- `relayPin` (Int) - GPIO pin number
- `relayState` (String?) - Pin state: 'HIGH', 'LOW', 'ON', 'OFF'
- `duration` (Int?) - Duration in milliseconds
- `metadata` (JSON?) - Additional metadata
- `userId` (String?) - User who triggered action
- `createdAt` - Timestamp

**Indexes**: `channel`, `relayPin`, `createdAt`

## 🔐 API Authentication

The API uses JWT (JSON Web Tokens) for authentication:

```typescript
// Request header
Authorization: Bearer <your-jwt-token>
```

JWT is verified via the `request.interceptor.ts` middleware on the frontend.

## ⚙️ Configuration

### Prisma Configuration (`prisma.config.ts`)

The configuration file handles:
- SQLite adapter setup
- Database URL from environment
- Connection pooling

```typescript
const databaseUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db';
```

### Environment Variables

Key variables:
- `DATABASE_URL` - SQLite connection string (required)
- `JWT_SECRET` - Secret for signing JWTs (change in production)
- `NODE_ENV` - 'development' or 'production'
- `PORT` - Server port (default: 3000)
- `LOG_LEVEL` - Log verbosity level

## 🐛 Troubleshooting

### Database Connection Issues

**Error**: `datasource url is no longer supported in schema files`
- Ensure `prisma.config.ts` exists in backend root
- Verify `DATABASE_URL` is set in `.env`

**Error**: `Error: ENOENT: no such file or directory`
- Create `prisma/` folder: `mkdir -p prisma`
- Try `npx prisma db push` again

### PrismaClient Errors

**Error**: `PrismaClient is not instantiated`
- Check [backend/src/config/database.ts](../backend/src/config/database.ts) is properly initialized
- Verify `.env` file exists with `DATABASE_URL`

### Port Already in Use

```bash
# Change PORT in .env or override via environment
PORT=3001 npm run dev
```

## 📖 Prisma Commands Reference

```bash
# Generate Prisma Client
npx prisma generate

# Push schema changes (development)
npx prisma db push

# Create a migration (recommended for production)
npx prisma migrate dev --name add_new_field

# View/edit data
npx prisma studio

# Reset database (⚠️ removes all data)
npx prisma migrate reset
```

## 🔗 Related Documentation

- [Migration Guide](../MIGRATION_MONGODB_TO_SQLITE.md) - MongoDB to SQLite migration details
- [Prisma Docs](https://www.prisma.io/docs/) - Official Prisma documentation
- [SQLite Docs](https://www.sqlite.org/docs.html) - SQLite documentation

## 📝 License

MIT
