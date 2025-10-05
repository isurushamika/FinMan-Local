# Backend Sync Implementation Plan

## 🎯 Overview

Transitioning from localStorage-only to centralized backend sync system.

**Current:** All data stored locally in browser/Android localStorage  
**New:** All data stored in PostgreSQL on VPS, synced to clients via REST API

---

## 🏗️ Architecture Changes

### Old Architecture
```
Mobile/Web App
    ↓
localStorage (client-side only)
    ↓
No sync, no multi-device
```

### New Architecture
```
Mobile App ←──────→ REST API ←──────→ Web App
    ↓                  ↓                  ↓
localStorage       PostgreSQL        localStorage
(cache only)      (source of truth)  (cache only)
```

---

## 🔐 Authentication Flow

### User Registration
```
1. User enters email + password
2. POST /api/auth/register
3. Backend: Hash password (bcrypt)
4. Backend: Create user in database
5. Backend: Generate JWT token
6. Return: { token, user }
7. Frontend: Store token in secure storage
8. Frontend: Redirect to app
```

### User Login
```
1. User enters email + password (or biometric)
2. POST /api/auth/login
3. Backend: Verify credentials
4. Backend: Generate JWT token (expires 7 days)
5. Return: { token, user }
6. Frontend: Store token securely
7. Frontend: Fetch all user data
8. Frontend: Cache in localStorage
```

### Token Management
```
Every API Request:
    ↓
Add header: Authorization: Bearer <token>
    ↓
Backend verifies token
    ↓
If expired: Return 401
    ↓
Frontend: Clear token, redirect to login
```

---

## 📊 Data Sync Strategy

### Initial Sync (After Login)
```
1. Login successful, have JWT token
2. Fetch all data in parallel:
   - GET /api/transactions
   - GET /api/budgets
   - GET /api/recurring
   - GET /api/items
   - GET /api/purchases
3. Cache in localStorage (for offline access)
4. Mark last sync timestamp
5. App ready to use
```

### Real-Time Sync (On Every Change)
```
User adds transaction:
    ↓
POST /api/transactions (optimistic UI update)
    ↓
Backend saves to database
    ↓
Returns saved transaction with ID
    ↓
Update localStorage cache
    ↓
Update UI with server ID
```

### Conflict Resolution
```
If offline changes:
    ↓
Queue changes locally
    ↓
When back online:
    ↓
Send queued changes to server
    ↓
Server timestamp > client timestamp?
    ├─ Yes: Server wins, update local
    └─ No: Client wins, update server
```

---

## 🔄 Offline Support

### Offline Queue System
```typescript
// When offline:
1. Detect network failure
2. Save change to offline queue
3. Show "Syncing when online" message
4. Update localStorage cache

// When online:
1. Detect network connection
2. Process offline queue
3. Retry failed requests
4. Show sync progress
5. Clear queue when done
```

---

## 🛡️ Security Enhancements

### Token Storage
- **Web App:** HttpOnly cookie (if same-domain) or secure localStorage
- **Android App:** Capacitor Secure Storage or encrypted SharedPreferences
- **Encryption:** All tokens encrypted at rest

### API Security
- ✅ JWT authentication on all endpoints
- ✅ CORS configured for your domains only
- ✅ Rate limiting (prevent abuse)
- ✅ Input validation (all fields)
- ✅ SQL injection protection (Prisma)
- ✅ HTTPS only (enforce in production)

---

## 📝 Implementation Steps

### Phase 1: Backend Updates (2-3 hours)
- [x] Backend already has basic API
- [ ] Add missing endpoints (items, purchases, notifications)
- [ ] Enhance authentication (JWT refresh tokens)
- [ ] Add user profile endpoints
- [ ] Add sync timestamp tracking
- [ ] Add data validation
- [ ] Test all endpoints

### Phase 2: Frontend API Layer (3-4 hours)
- [ ] Create API client service
- [ ] Replace storage.ts calls with API calls
- [ ] Add authentication context
- [ ] Implement login/register screens
- [ ] Add loading states
- [ ] Add error handling
- [ ] Implement offline queue

### Phase 3: Sync Logic (2-3 hours)
- [ ] Implement sync state management
- [ ] Add conflict resolution
- [ ] Cache API responses locally
- [ ] Sync on app startup
- [ ] Sync on data changes
- [ ] Handle network errors

### Phase 4: Android Updates (1-2 hours)
- [ ] Configure Capacitor HTTP plugin
- [ ] Add network detection
- [ ] Configure secure token storage
- [ ] Test on device

### Phase 5: Testing & Deployment (2-3 hours)
- [ ] Test multi-device sync
- [ ] Test offline/online transitions
- [ ] Deploy backend to VPS
- [ ] Configure HTTPS/SSL
- [ ] Update mobile app with API URL
- [ ] Test production deployment

**Total Estimated Time: 10-15 hours**

---

## 🗄️ Database Schema (Existing)

```prisma
model User {
  id            String   @id @default(uuid())
  email         String   @unique
  passwordHash  String
  name          String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  transactions  Transaction[]
  budgets       Budget[]
  recurring     RecurringTransaction[]
}

model Transaction {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  type        String   // 'income' or 'expense'
  amount      Float
  category    String
  description String
  date        DateTime
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Budget {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  category  String
  amount    Float
  period    String   // 'monthly' or 'yearly'
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model RecurringTransaction {
  id            String   @id @default(uuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  type          String
  amount        Float
  category      String
  description   String
  frequency     String   // 'daily', 'weekly', 'monthly', 'yearly'
  startDate     DateTime
  nextDueDate   DateTime
  lastProcessed DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

**Need to Add:**
- Item model
- ItemPurchase model
- Notification model (optional, could be client-only)

---

## 🔧 Configuration Changes

### Environment Variables (Backend)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/finman"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="production"
FRONTEND_URL="https://yourdomain.com"
ALLOWED_ORIGINS="https://yourdomain.com,https://app.yourdomain.com"
```

### Frontend Config
```typescript
// config/api.ts
export const API_CONFIG = {
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://yourdomain.com/api'
    : 'http://localhost:3001/api',
  timeout: 10000,
  retries: 3
};
```

---

## 📱 Mobile App Changes

### Capacitor Configuration
```typescript
// capacitor.config.ts
{
  server: {
    // Allow network requests
    allowNavigation: ['https://yourdomain.com']
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    }
  }
}
```

### Network Detection
```typescript
import { Network } from '@capacitor/network';

const status = await Network.getStatus();
console.log('Network status:', status.connected);

Network.addListener('networkStatusChange', status => {
  if (status.connected) {
    syncOfflineQueue();
  }
});
```

---

## 🎯 Migration Strategy

### For Existing Users (LocalStorage Data)
```
1. On first login after update:
   ↓
2. Detect existing localStorage data
   ↓
3. Show: "Upload existing data to cloud?"
   ↓
4. If Yes:
   - POST all transactions to /api/transactions/bulk
   - POST all budgets to /api/budgets/bulk
   - POST all recurring to /api/recurring/bulk
   ↓
5. Clear localStorage (now using backend)
   ↓
6. Fetch from server to confirm
```

---

## 🚨 Breaking Changes

### User Impact
- ❗ **Requires internet connection** for initial setup
- ❗ **Must create account** (email + password)
- ❗ **Existing localStorage data** needs migration
- ✅ **Benefit:** Multi-device sync
- ✅ **Benefit:** Data backup on server
- ✅ **Benefit:** Never lose data

### Developer Impact
- All storage.ts functions need replacement
- App.tsx needs authentication wrapper
- New loading/error states needed
- Offline queue implementation

---

## 🧪 Testing Checklist

### API Testing
- [ ] Register new user
- [ ] Login with credentials
- [ ] JWT token validation
- [ ] CRUD operations for all entities
- [ ] Offline queue processing
- [ ] Conflict resolution
- [ ] Token refresh
- [ ] Logout/session end

### Multi-Device Testing
- [ ] Login on web browser
- [ ] Add transaction on web
- [ ] Open Android app, verify sync
- [ ] Add transaction on Android
- [ ] Open web browser, verify sync
- [ ] Offline changes sync when online

### Security Testing
- [ ] Invalid token rejected
- [ ] Expired token refreshed
- [ ] User can only access own data
- [ ] SQL injection prevented
- [ ] XSS prevented
- [ ] CORS working correctly

---

## 📊 Performance Considerations

### Optimization Strategies
1. **Pagination:** Load 50 transactions at a time
2. **Caching:** Cache responses for 5 minutes
3. **Debouncing:** Batch rapid changes
4. **Lazy Loading:** Load old data on demand
5. **Compression:** Gzip API responses
6. **CDN:** Serve frontend from CDN

### Expected Performance
- Initial sync: 1-2 seconds (1000 transactions)
- Single transaction: 200-300ms
- Bulk upload: 2-3 seconds (100 items)
- Offline queue sync: 5-10 seconds (50 changes)

---

## 🎬 Next Steps

Ready to implement? I'll start with:

1. ✅ **Update Backend API** (add missing endpoints)
2. ✅ **Create API Service Layer** (replace localStorage)
3. ✅ **Add Authentication UI** (login/register screens)
4. ✅ **Implement Sync Logic** (real-time updates)
5. ✅ **Test & Deploy** (VPS deployment)

**Shall I proceed with implementation?** This will be a significant update but will make your app truly professional with cloud sync! 🚀
