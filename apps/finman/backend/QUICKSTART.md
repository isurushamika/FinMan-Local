# FinMan Backend Quick Start

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ installed and running

## Setup Steps

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Setup PostgreSQL Database

**Windows (using psql):**
```bash
# Start PostgreSQL service (if not running)
# In Services or via command line

# Connect to PostgreSQL
psql -U postgres

# In psql:
CREATE DATABASE finman;
CREATE USER finman WITH ENCRYPTED PASSWORD 'finman123';
GRANT ALL PRIVILEGES ON DATABASE finman TO finman;
\q
```

**Linux/Mac:**
```bash
sudo -u postgres psql
CREATE DATABASE finman;
CREATE USER finman WITH ENCRYPTED PASSWORD 'finman123';
GRANT ALL PRIVILEGES ON DATABASE finman TO finman;
\q
```

### 3. Configure Environment

The `.env` file is already created. Update if needed:
```env
DATABASE_URL="postgresql://finman:finman123@localhost:5432/finman?schema=public"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 4. Run Database Migrations
```bash
npx prisma migrate dev --name init
```

This will:
- Create all database tables
- Generate Prisma Client

### 5. Start Development Server
```bash
npm run dev
```

Server will start on: `http://localhost:3000`

## Quick Test

### Health Check
```bash
curl http://localhost:3000/health
```

### Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

You'll receive a JWT token in the response.

### Create a Transaction
```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "expense",
    "amount": 45.50,
    "category": "Food & Dining",
    "description": "Lunch",
    "date": "2025-10-04",
    "account": "Cash"
  }'
```

## Available Scripts

- `npm run dev` - Start development server with auto-reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma migrate dev` - Create and apply migrations

## Troubleshooting

### Database Connection Error

Make sure PostgreSQL is running and credentials in `.env` are correct.

**Check PostgreSQL status:**
```bash
# Windows
Get-Service postgresql*

# Linux
sudo systemctl status postgresql
```

### Port Already in Use

If port 3000 is in use, change it in `.env`:
```env
PORT=3001
```

### TypeScript Errors

Make sure you ran:
```bash
npm install
npx prisma generate
```

## Next Steps

1. **Test all endpoints** - See `/docs/API.md` for full API documentation
2. **Update frontend** - Configure frontend to use this API
3. **Add seed data** - Create sample transactions for testing
4. **Deploy** - Follow `/DEPLOYMENT_GUIDE.md` for Ubuntu deployment

## Project Structure

```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── routes/          # API routes
│   ├── middleware/      # Auth, upload, error handling
│   └── server.ts        # Entry point
├── prisma/
│   └── schema.prisma    # Database schema
├── uploads/             # Uploaded files (created on first upload)
└── .env                 # Environment variables
```

## Support

For issues, check:
- API Documentation: `/docs/API.md`
- Deployment Guide: `/DEPLOYMENT_GUIDE.md`
- Backend README: `/backend/README.md`
