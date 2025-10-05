# Development Guide

Guide for developing and contributing to FinMan.

---

## 🛠️ Setup

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- Git
- Android Studio (for Android development)

### Initial Setup

```bash
# Clone repository
git clone https://github.com/isurushamika/FinMan.git
cd FinMan

# Install backend dependencies
cd apps/finman/backend
npm install

# Setup database
createdb finman_development
npx prisma migrate dev

# Install frontend dependencies
cd ../frontend
npm install
```

---

## 🚀 Running Locally

### Backend

```bash
cd apps/finman/backend

# Development mode (auto-reload)
npm run dev

# Production mode
npm start

# API will be at: http://localhost:3000
```

### Frontend (Web)

```bash
cd apps/finman/frontend

# Development server
npm run dev

# App will be at: http://localhost:5173
```

### Android

```bash
cd apps/finman/frontend

# Build web assets
npm run build

# Sync to Android
npx cap sync

# Open in Android Studio
npx cap open android

# Or build APK
cd android
.\gradlew assembleDebug
```

---

## 📁 Project Structure

```
FinMan/
├── apps/finman/
│   ├── backend/              # Node.js API
│   │   ├── src/
│   │   │   ├── server.ts     # Entry point
│   │   │   ├── controllers/  # Request handlers
│   │   │   ├── middleware/   # Auth, validation
│   │   │   ├── routes/       # API routes
│   │   │   └── services/     # Business logic
│   │   ├── prisma/
│   │   │   └── schema.prisma # Database schema
│   │   └── package.json
│   │
│   └── frontend/             # React app
│       ├── src/
│       │   ├── App.tsx       # Main component
│       │   ├── components/   # UI components
│       │   ├── hooks/        # Custom hooks
│       │   ├── utils/        # Utilities
│       │   └── types/        # TypeScript types
│       ├── android/          # Android wrapper
│       ├── public/           # Static assets
│       └── package.json
│
├── deployment/               # Deployment configs
│   └── nginx/               # Nginx configs
│
└── docs/                    # Documentation
```

---

## 🔧 Common Tasks

### Add New API Endpoint

1. **Define Route** (`src/routes/`)
```typescript
import express from 'express';
const router = express.Router();

router.get('/my-endpoint', myController.handle);
export default router;
```

2. **Create Controller** (`src/controllers/`)
```typescript
export const myController = {
  async handle(req, res) {
    // Your logic
    res.json({ success: true });
  }
};
```

3. **Register Route** (`src/server.ts`)
```typescript
app.use('/api/my-endpoint', myRoute);
```

### Add New Database Table

1. **Update Schema** (`prisma/schema.prisma`)
```prisma
model MyModel {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
}
```

2. **Create Migration**
```bash
npx prisma migrate dev --name add_my_model
```

3. **Use in Code**
```typescript
const items = await prisma.myModel.findMany();
```

### Add New Frontend Component

1. **Create Component** (`src/components/MyComponent.tsx`)
```typescript
import React from 'react';

export const MyComponent: React.FC = () => {
  return <div>Hello</div>;
};
```

2. **Use Component**
```typescript
import { MyComponent } from './components/MyComponent';

function App() {
  return <MyComponent />;
}
```

---

## 🧪 Testing

### Backend Tests

```bash
cd apps/finman/backend
npm test
```

### Frontend Tests

```bash
cd apps/finman/frontend
npm test
```

### API Testing

```powershell
# Test all endpoints
.\test-backend-api.ps1
```

---

## 🔄 Git Workflow

### Daily Workflow

```bash
# Pull latest
git pull origin main

# Create feature branch (optional)
git checkout -b feature/my-feature

# Make changes...

# Commit
git add .
git commit -m "feat: Add my feature"

# Push
git push origin main
# or
git push origin feature/my-feature
```

### Commit Messages

Use conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Formatting
- `refactor:` - Code refactoring
- `test:` - Tests
- `chore:` - Maintenance

Examples:
```bash
git commit -m "feat: Add transaction filtering"
git commit -m "fix: Resolve sync indicator bug"
git commit -m "docs: Update API documentation"
```

---

## 🐛 Debugging

### Backend Debugging

```bash
# Enable debug logs
DEBUG=* npm run dev

# Check database queries
# Add to .env:
DATABASE_URL="...?debug=true"
```

### Frontend Debugging

```bash
# Check browser console
# Open DevTools → Console

# React DevTools
# Install browser extension

# Check network requests
# DevTools → Network tab
```

### Android Debugging

```bash
# View logs
npx cap run android

# Chrome inspect
# chrome://inspect

# View device logs
adb logcat
```

---

## 📦 Building

### Production Build

```bash
# Backend (already compiled TypeScript)
cd apps/finman/backend
npm run build

# Frontend
cd apps/finman/frontend
npm run build
# Output: dist/

# Android
cd apps/finman/frontend
npm run build
npx cap sync
cd android
.\gradlew assembleRelease
```

---

## 🔐 Environment Variables

### Development `.env` Files

**Backend** (`apps/finman/backend/.env.development`):
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/finman_development"
JWT_SECRET="dev-secret"
PORT=3000
NODE_ENV=development
```

**Frontend** (`apps/finman/frontend/.env.development`):
```env
VITE_API_URL=http://localhost:3000
```

---

## 🎨 Code Style

### TypeScript

- Use TypeScript for all new code
- Define proper types/interfaces
- Avoid `any` type

### Formatting

```bash
# Format code
npm run format

# Lint
npm run lint
```

### Best Practices

- Keep components small and focused
- Use hooks for state management
- Write descriptive variable names
- Comment complex logic
- Keep functions pure when possible

---

## 🔌 API Integration

### Making API Calls

```typescript
// Frontend example
const response = await fetch(`${import.meta.env.VITE_API_URL}/api/transactions`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(data)
});
```

### Authentication

All protected endpoints require JWT token:

```typescript
headers: {
  'Authorization': `Bearer ${token}`
}
```

---

## 📚 Resources

- [React Docs](https://react.dev)
- [Capacitor Docs](https://capacitorjs.com)
- [Prisma Docs](https://www.prisma.io/docs)
- [Express Docs](https://expressjs.com)

---

*Last Updated: October 5, 2025*
