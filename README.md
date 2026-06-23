# Napkin Store

A full-stack application for managing inventory and GPIO-based napkin dispensing with role-based access control.

**Tech Stack**: Express.js + SQLite + Prisma (Backend) | Angular (Frontend) | Node 18+ | TypeScript

## 📋 Project Overview

**Napkin Store** is a comprehensive inventory management and GPIO control system for Draexlmaier. It features:

- ✅ **User Management** - Employee authentication with JWT
- ✅ **Role-Based Access** - Admin and regular user roles
- ✅ **Inventory System** - Track stock items, quantities, reorder levels
- ✅ **GPIO Control** - Hardware relay control for napkin dispensing
- ✅ **Activity Logging** - Track all GPIO and user actions
- ✅ **Responsive UI** - Angular-based frontend

## 🏗️ Project Structure

```
napkin-store-master/
├── backend/                              # Express.js REST API
│   ├── prisma/
│   │   └── schema.prisma                # SQLite database schema
│   ├── src/
│   │   ├── controllers/                 # Route handlers
│   │   ├── routes/                      # API routes
│   │   ├── services/                    # Business logic
│   │   ├── config/
│   │   │   ├── database.ts              # Prisma client
│   │   │   └── env.ts                   # Environment config
│   │   └── ...
│   ├── prisma.config.ts                 # Prisma configuration
│   ├── package.json
│   └── README.md
│
├── angular/                              # Angular frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── services/                # API services
│   │   │   ├── components/
│   │   │   └── ...
│   │   └── ...
│   ├── package.json
│   └── README.md
│
├── MIGRATION_MONGODB_TO_SQLITE.md        # Migration guide
└── README.md                             # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** or **yarn**

### Installation & Setup

#### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install
npm install @prisma/adapter-sqlite better-sqlite3

# Create .env file
# DATABASE_URL="file:./prisma/dev.db"
# PORT=3000
# JWT_SECRET=your-secret-key

# Initialize database
npx prisma db push

# (Optional) Seed sample data
npm run db:seed

# Start server
npm run dev
```

**Backend**: http://localhost:3000

#### 2. Frontend Setup

```bash
cd angular

# Install dependencies
npm install

# Start development server
npm start
```

**Frontend**: http://localhost:4200

## 📚 Documentation

- **[Backend README](./backend/README.md)** - Express API setup, database schema, troubleshooting
- **[Frontend README](./angular/README.md)** - Angular app setup and components
- **[Migration Guide](./MIGRATION_MONGODB_TO_SQLITE.md)** - MongoDB to SQLite migration details
- **[Raspberry Pi Setup](./README_RASPBERRY_PI_SETUP.md)** - Deploy to Raspberry Pi

## 🗄️ Database

The application uses **SQLite** with **Prisma ORM**:

- **File-based** - No external database server needed
- **Lightweight** - Perfect for Raspberry Pi and edge devices
- **Type-safe** - Full TypeScript support
- **Migrations** - Easy schema versioning

### Key Models

| Model | Purpose |
|-------|---------|
| **User** | Employee accounts with authentication |
| **Admin** | Admin roles and permissions |
| **Stock** | Inventory items and quantities |
| **GPIOLog** | Hardware relay and button press logs |

See [Backend README](./backend/README.md) for detailed schema.

## 🔐 Authentication

Uses JWT (JSON Web Tokens):

```typescript
// Signing in returns a JWT
POST /api/signin
→ { token: "eyJhbGciOiJIUzI1NiIs..." }

// Use token in subsequent requests
Authorization: Bearer <token>
```

## 🔌 API Endpoints

### User Management
- `POST /api/signin` - Login with credentials
- `POST /api/signup` - Create new user account
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user

### Stock Management
- `GET /api/stock` - List all items
- `GET /api/stock/:id` - Get item details
- `POST /api/stock` - Create item (admin)
- `PUT /api/stock/:id` - Update item (admin)
- `DELETE /api/stock/:id` - Delete item (admin)

### GPIO Control
- `POST /api/gpio/trigger/:relayId` - Trigger relay
- `GET /api/gpio/logs` - View GPIO activity logs

See [Backend README](./backend/README.md) for complete API documentation.

## 📦 Available Scripts

### Backend

```bash
npm run dev            # Start dev server with hot-reload
npm run build          # Build TypeScript
npm start              # Run production build
npm run db:seed        # Seed database
npx prisma studio     # Open database UI
npm run lint          # Run linter
npm test              # Run tests
```

### Frontend

```bash
npm start              # Start Angular dev server
npm run build          # Build for production
npm test               # Run tests
npm run lint           # Run linter
```

## 🛠️ Technology Stack

### Backend
- **Express.js** - Web framework
- **Prisma** - ORM
- **SQLite** - Database
- **TypeScript** - Type safety
- **JWT** - Authentication
- **Bcryptjs** - Password hashing
- **Winston** - Logging

### Frontend
- **Angular** - Framework
- **TypeScript** - Type safety
- **Angular Material** - UI components
- **RxJS** - Reactive programming

### DevOps
- **Node 18+** - Runtime
- **Docker** - Containerization (optional)
- **Raspberry Pi** - Hardware target

## 🔧 Configuration

### Environment Variables

**Backend** (`.env`):
```env
DATABASE_URL="file:./prisma/dev.db"
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key
LOG_LEVEL=info
```

### Build Configuration

- **TypeScript** - See `tsconfig.json` in each directory
- **Prisma** - See `prisma.config.ts` (backend)
- **Angular** - See `angular.json`

## 🚨 Troubleshooting

### Backend Issues

| Problem | Solution |
|---------|----------|
| "datasource url not supported" | Ensure `prisma.config.ts` exists |
| Database file not created | Run `mkdir -p prisma && npx prisma db push` |
| Port already in use | Change `PORT` in `.env` |
| JWT errors | Verify `JWT_SECRET` is set |

### Frontend Issues

| Problem | Solution |
|---------|----------|
| Can't connect to API | Check backend is running on correct port |
| CORS errors | Ensure backend has CORS enabled |
| Module not found | Run `npm install` again |

See individual README files for more troubleshooting.

## 📈 Development Workflow

1. **Feature Branch**
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make Changes**
   - Update backend/frontend code
   - Update database schema if needed

3. **Test Locally**
   ```bash
   # Backend
   cd backend && npm run dev
   
   # Frontend (new terminal)
   cd angular && npm start
   ```

4. **Create Pull Request**
   - Document changes
   - Request review

## 🔄 Database Migrations

### Create Migration (Recommended for Production)

```bash
cd backend
npx prisma migrate dev --name <description>
```

### Apply Pending Migrations

```bash
npx prisma migrate deploy
```

### Reset Database (⚠️ Removes All Data)

```bash
npx prisma migrate reset
```

## 📱 Deployment

### Local Development
See quick start above.

### Raspberry Pi
See [README_RASPBERRY_PI_SETUP.md](./README_RASPBERRY_PI_SETUP.md)

### Docker (Optional)
Add `Dockerfile` and `docker-compose.yml` for containerized deployment.

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Create a pull request with description

## 📝 License

MIT

## 👥 Team

- **Author**: Malek Bannour (Malek.Bannour@draexlmaier.com)
- **Organization**: Draexlmaier

## 📧 Support

For issues or questions, contact the development team or create an issue in the repository.

---

**Last Updated**: 2026-06-23
**Database**: SQLite + Prisma
**Node Version**: 18+
