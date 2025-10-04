# FinMan Backend API

Backend server for FinMan financial management application with file-based image storage.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and configure your settings:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Random secret key for JWT tokens
- `UPLOAD_DIR`: Directory for uploaded files (default: `./uploads`)

### 3. Setup Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio
npm run prisma:studio
```

### 4. Run Development Server

```bash
npm run dev
```

Server will start on `http://localhost:3000`

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Helper functions
│   └── server.ts        # Entry point
├── prisma/
│   └── schema.prisma    # Database schema
├── uploads/             # Uploaded files (gitignored)
├── .env                 # Environment variables
└── package.json
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create transaction (with file upload)
- `GET /api/transactions/:id` - Get single transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Budgets
- `GET /api/budgets` - Get all budgets
- `POST /api/budgets` - Create budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

### Recurring Transactions
- `GET /api/recurring` - Get all recurring transactions
- `POST /api/recurring` - Create recurring transaction
- `PUT /api/recurring/:id` - Update recurring transaction
- `DELETE /api/recurring/:id` - Delete recurring transaction

## 🔒 Authentication

All endpoints except `/api/auth/register` and `/api/auth/login` require JWT authentication.

Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## 📤 File Upload

Receipt images are uploaded with transactions using multipart/form-data:

```typescript
const formData = new FormData();
formData.append('type', 'expense');
formData.append('amount', '45.50');
formData.append('category', 'Food & Dining');
formData.append('description', 'Lunch');
formData.append('date', '2025-10-04');
formData.append('receipt', fileObject); // File object

fetch('http://localhost:3000/api/transactions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token
  },
  body: formData
});
```

## 🗄️ Database

Using PostgreSQL with Prisma ORM.

**Install PostgreSQL:**

Ubuntu:
```bash
sudo apt install postgresql postgresql-contrib
```

**Create Database:**
```bash
sudo -u postgres psql
CREATE DATABASE finman;
CREATE USER finman WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE finman TO finman;
\q
```

## 🚀 Production Deployment

### Using PM2

```bash
# Build
npm run build

# Start with PM2
pm2 start dist/server.js --name finman-api

# Save PM2 config
pm2 save

# Setup startup script
pm2 startup systemd
```

### Using Docker (Alternative)

```bash
docker build -t finman-backend .
docker run -p 3000:3000 --env-file .env finman-backend
```

## 🔐 Security

- Helmet.js for security headers
- CORS configuration
- Rate limiting
- JWT authentication
- File upload validation
- SQL injection prevention (Prisma)
- XSS protection

## 📝 Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

## 🌐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | development |
| `PORT` | Server port | 3000 |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `JWT_SECRET` | JWT secret key | - |
| `JWT_EXPIRES_IN` | JWT expiration | 7d |
| `UPLOAD_DIR` | Upload directory | ./uploads |
| `MAX_FILE_SIZE` | Max file size in bytes | 5242880 (5MB) |
| `CORS_ORIGIN` | Allowed CORS origin | http://localhost:5173 |

## 📊 File Storage

Receipt images are stored on the server filesystem:

```
uploads/
└── receipts/
    └── user-abc123/
        └── 2025/
            └── 10/
                └── receipt-1696435200000.jpg
```

Files are automatically organized by user and date for easy management.

## 🔄 Migration from localStorage

See `/docs/MIGRATION.md` for instructions on migrating data from the current localStorage-based system.

## 📚 Additional Documentation

- [Deployment Guide](../DEPLOYMENT_GUIDE.md) - Full Ubuntu deployment instructions
- [API Documentation](./docs/API.md) - Detailed API reference
- [Database Schema](./prisma/schema.prisma) - Prisma schema

## 🆘 Troubleshooting

**Database connection error:**
- Check DATABASE_URL in .env
- Ensure PostgreSQL is running
- Verify database and user exist

**File upload fails:**
- Check UPLOAD_DIR exists and is writable
- Verify file size under MAX_FILE_SIZE
- Check file type is allowed

**JWT authentication error:**
- Ensure JWT_SECRET is set
- Check token hasn't expired
- Verify Authorization header format

## 📄 License

MIT
