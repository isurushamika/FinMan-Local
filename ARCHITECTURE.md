# Project Architecture - Visual Overview

## 📁 File Structure

```
financial/                                    # 🏠 Root Directory
│
├── apps/                                     # 📦 All Applications
│   │
│   ├── finman/                              # 💰 Financial Manager App
│   │   │
│   │   ├── frontend/                        # ⚛️ React Frontend
│   │   │   ├── src/
│   │   │   │   ├── components/              # UI Components
│   │   │   │   │   ├── BudgetManager.tsx
│   │   │   │   │   ├── Charts.tsx
│   │   │   │   │   ├── TransactionForm.tsx
│   │   │   │   │   └── ...
│   │   │   │   ├── types/                   # TypeScript types
│   │   │   │   ├── utils/                   # Utilities
│   │   │   │   ├── App.tsx                  # Main component
│   │   │   │   └── main.tsx                 # Entry point
│   │   │   │
│   │   │   ├── public/                      # Static assets
│   │   │   ├── dist/                        # 📦 Production build
│   │   │   ├── index.html
│   │   │   ├── package.json
│   │   │   ├── vite.config.ts              # Vite config
│   │   │   └── tailwind.config.js          # Tailwind CSS
│   │   │
│   │   ├── backend/                         # 🔧 Node.js Backend
│   │   │   ├── src/
│   │   │   │   ├── controllers/            # 🎮 Request handlers
│   │   │   │   │   ├── auth.controller.ts
│   │   │   │   │   ├── transaction.controller.ts
│   │   │   │   │   ├── budget.controller.ts
│   │   │   │   │   └── recurring.controller.ts
│   │   │   │   │
│   │   │   │   ├── services/               # 💼 Business logic
│   │   │   │   │   ├── auth.service.ts
│   │   │   │   │   ├── transaction.service.ts
│   │   │   │   │   ├── budget.service.ts
│   │   │   │   │   └── recurring.service.ts
│   │   │   │   │
│   │   │   │   ├── routes/                 # 🛣️ API routes
│   │   │   │   │   ├── auth.routes.ts
│   │   │   │   │   ├── transaction.routes.ts
│   │   │   │   │   ├── budget.routes.ts
│   │   │   │   │   └── recurring.routes.ts
│   │   │   │   │
│   │   │   │   ├── middleware/             # 🔐 Middleware
│   │   │   │   │   ├── auth.middleware.ts
│   │   │   │   │   ├── upload.middleware.ts
│   │   │   │   │   └── error.middleware.ts
│   │   │   │   │
│   │   │   │   └── server.ts               # 🚀 Main server
│   │   │   │
│   │   │   ├── prisma/
│   │   │   │   └── schema.prisma           # 🗄️ Database schema
│   │   │   │
│   │   │   ├── uploads/                     # 📁 User uploads
│   │   │   │   └── receipts/
│   │   │   │       └── user-xxx/
│   │   │   │           └── 2025/10/
│   │   │   │
│   │   │   ├── dist/                        # 📦 Compiled JS
│   │   │   ├── docs/
│   │   │   │   └── API.md                   # 📚 API docs
│   │   │   ├── .env                         # 🔒 Environment vars
│   │   │   ├── package.json
│   │   │   └── tsconfig.json
│   │   │
│   │   └── 📄 Documentation Files
│   │       ├── README.md
│   │       ├── DEPLOYMENT_GUIDE.md
│   │       ├── MIGRATION_GUIDE.md
│   │       ├── FEATURES.md
│   │       └── ...
│   │
│   └── [future-apps]/                       # 🚀 Add more apps here
│       ├── app2/
│       ├── app3/
│       └── ...
│
├── deployment/                               # 🚢 Deployment Tools
│   ├── nginx/                               # Nginx configs
│   │   ├── finman-subdomain.conf           # Subdomain setup
│   │   └── main-site-pathbased.conf        # Path-based setup
│   │
│   ├── pm2/                                 # PM2 configs (optional)
│   │
│   ├── deploy.sh                            # 🐧 Linux deploy script
│   └── deploy.bat                           # 🪟 Windows deploy script
│
├── logs/                                     # 📋 Application logs
│   ├── finman-api-error.log
│   ├── finman-api-out.log
│   └── ...
│
├── ecosystem.config.js                       # 🎛️ PM2 multi-app config
├── README.md                                 # 📖 Main documentation
├── QUICK_REFERENCE.md                        # ⚡ Quick commands
├── RESTRUCTURE_COMPLETE.md                   # ✅ This restructure
├── .gitignore                                # 🚫 Git ignore rules
└── package.json                              # (optional) Root workspace
```

## 🌐 URL Architecture

### Subdomain Approach (Recommended)

```
Internet
    ↓
[Cloudflare/DNS]
    ↓
    ├── finman.yourdomain.com
    │   ↓
    │   [Ubuntu Server - Port 443]
    │   ↓
    │   [Nginx]
    │   ├── / → /var/www/apps/finman/frontend/dist/
    │   ├── /api/* → localhost:3000 (PM2: finman-api)
    │   └── /uploads/* → /var/www/apps/finman/backend/uploads/
    │
    ├── app2.yourdomain.com
    │   ↓
    │   [Nginx]
    │   ├── / → /var/www/apps/app2/frontend/dist/
    │   └── /api/* → localhost:3001 (PM2: app2-api)
    │
    └── app3.yourdomain.com
        └── ...
```

### Path-based Approach

```
Internet
    ↓
[DNS: yourdomain.com]
    ↓
[Ubuntu Server - Port 443]
    ↓
[Nginx]
    ├── /finman → /var/www/apps/finman/frontend/dist/
    ├── /finman/api/* → localhost:3000 (PM2)
    ├── /app2 → /var/www/apps/app2/frontend/dist/
    ├── /app2/api/* → localhost:3001 (PM2)
    └── / → Main landing page (optional)
```

## 🔄 Data Flow

### Frontend Request Flow

```
User Browser
    ↓
[React App - Port 5173 (dev) / 443 (prod)]
    ↓
[API Request to /api/transactions]
    ↓
[Nginx Proxy]
    ↓
[Express Server - Port 3000]
    ↓
[JWT Middleware] → Verify token
    ↓
[Route Handler] → transaction.routes.ts
    ↓
[Controller] → transaction.controller.ts
    ↓
[Service] → transaction.service.ts
    ↓
[Prisma ORM]
    ↓
[PostgreSQL Database - Port 5432]
    ↓
[Response back through chain]
    ↓
User Browser (updates UI)
```

### File Upload Flow

```
User selects receipt image
    ↓
[React - TransactionForm]
    ↓
FormData with file
    ↓
POST /api/transactions
    ↓
[Nginx] → proxy to backend
    ↓
[Multer Middleware]
    ├── Validate file type
    ├── Check file size
    └── Save to: /uploads/receipts/user-xxx/2025/10/
    ↓
[Transaction Controller]
    ↓
[Transaction Service] → Save path to database
    ↓
[PostgreSQL] → Store transaction with receiptPath
    ↓
Response with transaction data
    ↓
[React] → Display receipt from server URL
```

## 🗄️ Database Architecture

```
PostgreSQL Server (Port 5432)
    ├── finman_db
    │   ├── users
    │   ├── transactions
    │   ├── budgets
    │   └── recurring_transactions
    │
    ├── app2_db
    │   └── [app2 tables]
    │
    └── app3_db
        └── [app3 tables]
```

## 🔐 Security Layers

```
Request
    ↓
[1. Nginx]
    ├── HTTPS/SSL (Let's Encrypt)
    ├── Rate limiting
    └── Security headers
    ↓
[2. Express]
    ├── Helmet.js
    ├── CORS policy
    └── Body size limits
    ↓
[3. Auth Middleware]
    ├── JWT verification
    └── User identification
    ↓
[4. Route Handlers]
    ├── Input validation
    └── Authorization checks
    ↓
[5. Service Layer]
    ├── Business logic validation
    └── User-scoped queries
    ↓
[6. Database]
    ├── Prisma ORM (SQL injection prevention)
    └── User-based access control
```

## 🚀 Deployment Flow

```
Development Machine
    ↓
[Git Push to Repository]
    ↓
[GitHub/GitLab]
    ↓
    ├── [Option A: Manual Deploy]
    │   └── SSH to server → git pull → ./deploy.sh finman
    │
    ├── [Option B: CI/CD]
    │   └── GitHub Actions → Auto-deploy on push
    │
    └── [Option C: PM2 Deploy]
        └── pm2 deploy production
    ↓
[Ubuntu Server]
    ├── npm install (both frontend & backend)
    ├── npm run build (both)
    ├── npx prisma migrate deploy
    └── pm2 restart finman-api
    ↓
[Live Application Updated]
```

## 📊 Process Management (PM2)

```
PM2 (Process Manager)
    ├── finman-api
    │   ├── Script: apps/finman/backend/dist/server.js
    │   ├── Port: 3000
    │   ├── Instances: 1 (or cluster mode)
    │   └── Auto-restart: Yes
    │
    ├── app2-api
    │   ├── Script: apps/app2/backend/dist/server.js
    │   ├── Port: 3001
    │   └── ...
    │
    └── app3-api
        └── ...

[PM2 Features]
    ├── Auto-restart on crash
    ├── Log management
    ├── Cluster mode support
    ├── Startup script
    └── Monitoring
```

## 🔄 Development vs Production

### Development
```
Local Machine
├── Frontend: localhost:5173 (Vite dev server)
├── Backend: localhost:3000 (ts-node with nodemon)
├── Database: localhost:5432 (local PostgreSQL)
└── Files: Direct access to /apps/finman/
```

### Production
```
Ubuntu Server
├── Frontend: yourdomain.com (Nginx serves static files)
├── Backend: Internal port 3000 (PM2 runs compiled JS)
├── Database: localhost:5432 (production PostgreSQL)
└── Files: /var/www/apps/finman/
```

## 📦 Build Process

```
[Development Code]
    ↓
[TypeScript + React]
    ↓
    ├── Frontend Build
    │   ├── Vite build
    │   ├── TypeScript → JavaScript
    │   ├── Tailwind CSS → Optimized CSS
    │   ├── Tree shaking
    │   ├── Code splitting
    │   └── Output: dist/ (static files)
    │
    └── Backend Build
        ├── TypeScript → JavaScript
        ├── Type checking
        ├── Prisma client generation
        └── Output: dist/ (Node.js files)
    ↓
[Production-Ready Code]
    ├── Optimized bundles
    ├── Minified assets
    └── Source maps (optional)
```

## 🎯 This Architecture Supports

✅ Multiple independent applications
✅ Separate databases per app
✅ Independent deployment cycles
✅ Scalable to unlimited apps
✅ Clean URL structure (subdomain or path)
✅ Proper separation of concerns
✅ Easy to maintain and update
✅ Production-grade security
✅ Professional deployment workflow

---

**Visual guide complete!** Use this as reference when working with the multi-app structure. 📐
