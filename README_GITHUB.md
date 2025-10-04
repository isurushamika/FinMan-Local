# FinMan - Financial Management System

<div align="center">

![FinMan Logo](https://img.shields.io/badge/FinMan-Financial%20Manager-blue?style=for-the-badge)

A modern, full-stack financial management application with multi-app server architecture, designed for personal finance tracking, budgeting, and analytics.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?logo=postgresql&logoColor=white)](https://www.postgresql.org/)

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Deployment](#-deployment)

</div>

---

## 🌟 Features

### 💰 Financial Management
- **Income & Expense Tracking** - Record all transactions with categories and accounts
- **Budget Management** - Set monthly/yearly budgets with visual progress tracking
- **Recurring Transactions** - Auto-generate recurring income/expenses (daily/weekly/monthly/yearly)
- **Receipt Storage** - Upload and attach receipt images to transactions (server-side storage)

### 📊 Analytics & Visualization
- **Dashboard Overview** - Real-time financial statistics and balance
- **Beautiful Charts** - Income/expense trends with Chart.js visualizations
- **Budget Progress** - Color-coded status (green/yellow/red) for spending alerts
- **Monthly Reports** - Track spending patterns over time

### 🔍 Advanced Features
- **Search & Filter** - Find transactions by type, category, account, date range
- **Data Export/Import** - Export to CSV/JSON and import backup data
- **Multi-Account Support** - Track transactions across different accounts
- **Dark Mode** - Eye-friendly dark theme support

### 🔐 Security & Backend
- **JWT Authentication** - Secure user authentication
- **PostgreSQL Database** - Robust data storage with Prisma ORM
- **File Storage** - Server-side receipt image storage (up to 5MB per file)
- **RESTful API** - Complete Express.js backend with 20+ endpoints
- **Security Hardened** - Helmet, CORS, rate limiting, password hashing

### 🏗️ Multi-App Architecture
- **Scalable Structure** - Ready to host unlimited apps on single server
- **Independent Deployment** - Deploy apps separately
- **Flexible Routing** - Subdomain or path-based URL structure
- **Production Ready** - PM2 process management, Nginx configs included

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **PostgreSQL** 14+ (for backend)
- **npm** or **yarn**

### Frontend Only (Quick Demo)

```bash
# Clone repository
git clone https://github.com/isurushamika/FinMan.git
cd FinMan

# Install and run frontend
cd apps/finman/frontend
npm install
npm run dev

# Open http://localhost:5173
```

### Full Stack Setup

```bash
# 1. Clone repository
git clone https://github.com/isurushamika/FinMan.git
cd FinMan

# 2. Setup Backend
cd apps/finman/backend
npm install

# 3. Configure database
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# 4. Run database migrations
npx prisma migrate dev --name init
npx prisma generate

# 5. Start backend
npm run dev
# Backend runs on http://localhost:3000

# 6. Setup Frontend (new terminal)
cd ../frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

---

## 📁 Project Structure

```
FinMan/
├── apps/
│   └── finman/                 # Financial Manager App
│       ├── frontend/           # React + TypeScript + Vite
│       │   ├── src/
│       │   │   ├── components/ # UI components
│       │   │   ├── types/      # TypeScript types
│       │   │   └── utils/      # Utilities
│       │   └── package.json
│       │
│       └── backend/            # Node.js + Express + Prisma
│           ├── src/
│           │   ├── controllers/
│           │   ├── services/
│           │   ├── routes/
│           │   └── middleware/
│           ├── prisma/
│           └── package.json
│
├── deployment/                 # Nginx configs, deploy scripts
├── ecosystem.config.js         # PM2 multi-app config
└── README.md
```

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **Chart.js** - Data visualizations
- **Lucide React** - Icon library
- **date-fns** - Date utilities

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **PostgreSQL** - Database
- **Prisma** - Type-safe ORM
- **JWT** - Authentication
- **Multer** - File uploads
- **Bcrypt** - Password hashing

### DevOps
- **PM2** - Process management
- **Nginx** - Reverse proxy
- **Let's Encrypt** - SSL certificates

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [QUICK_REFERENCE.md](QUICK_REFERENCE.md) | Quick commands and troubleshooting |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Visual architecture diagrams |
| [apps/finman/DEPLOYMENT_GUIDE.md](apps/finman/DEPLOYMENT_GUIDE.md) | Ubuntu deployment guide |
| [apps/finman/backend/docs/API.md](apps/finman/backend/docs/API.md) | Complete API reference |

---

## 🚢 Deployment

### Production Build (Local Test)

```bash
# Test production build locally
./test-build.bat  # Windows
./test-build.sh   # Linux/Mac
```

### Ubuntu Server Deployment

```bash
# Quick deploy
cd /var/www
git clone https://github.com/isurushamika/FinMan.git apps
cd apps
./deployment/deploy.sh finman
pm2 start ecosystem.config.js --env production
```

See [DEPLOYMENT_GUIDE.md](apps/finman/DEPLOYMENT_GUIDE.md) for complete instructions.

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

---

<div align="center">

**Made with ❤️ for better financial management**

⭐ Star this repo if you find it helpful!

[Report Bug](https://github.com/isurushamika/FinMan/issues) • [Request Feature](https://github.com/isurushamika/FinMan/issues)

</div>
