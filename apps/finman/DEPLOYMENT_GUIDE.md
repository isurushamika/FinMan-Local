# FinMan Backend - Ubuntu Server Deployment

## 🏗️ Architecture Overview

```
┌─────────────────┐
│  React Frontend │ ──────┐
│   (Port 5173)   │       │
└─────────────────┘       │
                          │ HTTP/HTTPS
┌─────────────────┐       │
│  Nginx (Proxy)  │ ◄─────┘
│   (Port 80/443) │
└─────────────────┘
         │
         │ Reverse Proxy
         ▼
┌─────────────────┐
│ Express Backend │
│   (Port 3000)   │
└─────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────┐   ┌──────────┐
│ DB  │   │   File   │
│     │   │  System  │
└─────┘   │ /uploads │
          └──────────┘
```

## 📦 Backend Stack

- **Runtime**: Node.js 18+ LTS
- **Framework**: Express.js
- **Database**: PostgreSQL (recommended) or MongoDB
- **File Upload**: Multer
- **Authentication**: JWT (JSON Web Tokens)
- **ORM**: Prisma (PostgreSQL) or Mongoose (MongoDB)
- **Storage**: Ubuntu file system for images
- **Process Manager**: PM2
- **Reverse Proxy**: Nginx

## 🚀 Quick Start

### 1. Create Backend Structure

```bash
cd /var/www/finman
mkdir backend
cd backend
npm init -y
```

### 2. Install Dependencies

```bash
# Core
npm install express cors dotenv

# File handling
npm install multer sharp

# Database (choose one)
npm install pg prisma @prisma/client  # PostgreSQL
# OR
npm install mongoose  # MongoDB

# Authentication
npm install bcryptjs jsonwebtoken

# Validation
npm install express-validator

# Dev dependencies
npm install -D typescript @types/node @types/express @types/multer nodemon ts-node
```

## 📁 Recommended Directory Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts       # DB connection
│   │   └── multer.ts         # File upload config
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── transaction.controller.ts
│   │   ├── budget.controller.ts
│   │   ├── recurring.controller.ts
│   │   └── upload.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── upload.middleware.ts
│   ├── models/
│   │   ├── User.ts
│   │   ├── Transaction.ts
│   │   ├── Budget.ts
│   │   └── RecurringTransaction.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── transaction.routes.ts
│   │   ├── budget.routes.ts
│   │   └── recurring.routes.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── transaction.service.ts
│   │   └── storage.service.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   └── validator.ts
│   └── server.ts             # Entry point
├── uploads/                  # Receipt images
│   └── receipts/
├── prisma/                   # If using Prisma
│   └── schema.prisma
├── .env                      # Environment variables
├── .gitignore
├── package.json
└── tsconfig.json
```

## 🗄️ Database Schema (PostgreSQL with Prisma)

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id           String        @id @default(cuid())
  email        String        @unique
  password     String
  name         String?
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  transactions Transaction[]
  budgets      Budget[]
  recurring    RecurringTransaction[]
}

model Transaction {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  type        String   // 'income' | 'expense'
  amount      Float
  category    String
  description String
  date        DateTime
  receiptPath String?  // File path on server
  account     String?
  recurringId String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId, date])
}

model Budget {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  category  String
  amount    Float
  period    String   // 'monthly' | 'yearly'
  startDate DateTime
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, category])
}

model RecurringTransaction {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  type        String
  amount      Float
  category    String
  description String
  account     String?
  frequency   String   // 'daily' | 'weekly' | 'monthly' | 'yearly'
  startDate   DateTime
  endDate     DateTime?
  lastGenerated DateTime?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId, isActive])
}
```

## 🔧 Environment Variables (.env)

```env
# Server
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Database
DATABASE_URL="postgresql://finman:password@localhost:5432/finman?schema=public"

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# File Upload
UPLOAD_DIR=/var/www/finman/backend/uploads
MAX_FILE_SIZE=5242880  # 5MB in bytes
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg,image/webp

# CORS
CORS_ORIGIN=https://yourdomain.com

# Frontend URL
FRONTEND_URL=https://yourdomain.com
```

## 🔐 Ubuntu Server Setup

### 1. Install Prerequisites

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install PM2 globally
sudo npm install -g pm2
```

### 2. Setup PostgreSQL

```bash
# Create database and user
sudo -u postgres psql

CREATE DATABASE finman;
CREATE USER finman WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE finman TO finman;
\q
```

### 3. Deploy Application

```bash
# Create app directory
sudo mkdir -p /var/www/finman
sudo chown -R $USER:$USER /var/www/finman

# Clone or upload your code
cd /var/www/finman

# Setup backend
cd backend
npm install
npx prisma migrate deploy
npm run build

# Setup frontend
cd ../financial
npm install
npm run build

# Create uploads directory
mkdir -p /var/www/finman/backend/uploads/receipts
chmod 755 /var/www/finman/backend/uploads
```

### 4. Configure PM2

```bash
# Start backend with PM2
cd /var/www/finman/backend
pm2 start dist/server.js --name finman-api

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup systemd
```

### 5. Configure Nginx

```nginx
# /etc/nginx/sites-available/finman
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend (React app)
    location / {
        root /var/www/finman/financial/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Serve uploaded files
    location /uploads {
        alias /var/www/finman/backend/uploads;
        expires 30d;
        access_log off;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

Enable site and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/finman /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is configured automatically
```

## 📊 File Storage Strategy

### Images Stored On Server:

```
/var/www/finman/backend/uploads/
└── receipts/
    ├── user-abc123/
    │   ├── 2025/
    │   │   └── 10/
    │   │       ├── receipt-1696435200000.jpg
    │   │       └── receipt-1696435300000.png
    │   └── ...
    └── user-def456/
        └── ...
```

**Benefits:**
- Unlimited storage (only limited by server disk)
- Fast access
- Easy backups
- Can serve optimized images
- Multi-device sync
- User authentication required

## 🔄 Migration from localStorage

You'll need to:
1. Export existing data from localStorage
2. Create user accounts
3. Import data via API
4. Upload receipt images to server

## 📝 Next Steps

Would you like me to create:
1. **Complete backend code** with all API endpoints?
2. **Frontend API service** to replace localStorage calls?
3. **Deployment scripts** for automated deployment?
4. **Docker configuration** for containerized deployment?
5. **Migration scripts** to move existing data?

Let me know which parts you'd like me to implement first! 🚀
