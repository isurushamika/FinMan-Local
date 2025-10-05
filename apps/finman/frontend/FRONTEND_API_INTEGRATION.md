# Frontend API Integration Guide

## Overview
The frontend now has a complete API service layer that's ready to replace localStorage calls with backend sync. All API modules are created and TypeScript compilation is successful.

## Created Files

### API Layer (`src/api/`)
1. **config.ts** - API configuration and auth token management
2. **client.ts** - Base HTTP client with auth headers
3. **auth.ts** - Authentication API (login, register, logout)
4. **transactions.ts** - Transactions CRUD operations
5. **budgets.ts** - Budget management operations
6. **recurring.ts** - Recurring transactions operations
7. **items.ts** - Item tracking operations
8. **purchases.ts** - Purchase history operations
9. **index.ts** - Central export point for all APIs

### Authentication (`src/contexts/`)
1. **AuthContext.tsx** - React context for auth state management

### Components (`src/components/`)
1. **Login.tsx** - Login screen with email/password
2. **Register.tsx** - Registration screen with validation

### Configuration
1. **vite-env.d.ts** - TypeScript definitions for Vite env variables
2. **.env** - Development environment variables
3. **.env.example** - Environment variables template

## API Configuration

### Environment Variables
Create `.env` file in `apps/finman/frontend/`:

```env
# Development (local backend)
VITE_API_URL=http://localhost:3000

# Production (VPS)
# VITE_API_URL=https://yourdomain.com

# Android (local network - replace with your computer's IP)
# VITE_API_URL=http://192.168.1.XXX:3000
```

## API Usage Examples

### Authentication
```typescript
import { authApi, useAuth } from '../api';

// In a component
const { login, register, logout, isAuthenticated, user } = useAuth();

// Login
await login('user@example.com', 'password');

// Register
await register('user@example.com', 'password', 'John Doe');

// Logout
logout();
```

### Transactions
```typescript
import { transactionsApi } from '../api';

// Get all transactions
const transactions = await transactionsApi.getAll();

// Create transaction
const newTransaction = await transactionsApi.create({
  type: 'expense',
  amount: 50.00,
  category: 'Groceries',
  description: 'Weekly shopping',
  date: '2025-10-04',
  account: 'Cash'
});

// Update transaction
const updated = await transactionsApi.update(id, {
  amount: 55.00,
  description: 'Weekly shopping - updated'
});

// Delete transaction
await transactionsApi.delete(id);

// Bulk create (for migration)
await transactionsApi.bulkCreate(localStorageTransactions);
```

### Items
```typescript
import { itemsApi } from '../api';

// Get all items
const items = await itemsApi.getAll();

// Create item
const newItem = await itemsApi.create({
  name: 'Tomatoes',
  category: 'Vegetables',
  quantity: 0,
  unitPrice: 2.50,
  notes: 'Roma tomatoes'
});

// Update item
const updated = await itemsApi.update(id, {
  unitPrice: 2.75,
  quantity: 5
});

// Delete item
await itemsApi.delete(id);
```

### Purchases
```typescript
import { purchasesApi } from '../api';

// Get all purchases
const purchases = await purchasesApi.getAll();

// Get purchases for specific item
const itemPurchases = await purchasesApi.getByItem(itemId);

// Create purchase
const newPurchase = await purchasesApi.create({
  itemId: 'item-123',
  quantity: 2,
  unitPrice: 2.75,
  totalCost: 5.50,
  purchaseDate: '2025-10-04',
  store: 'Local Market',
  notes: 'Fresh produce'
});

// Delete purchase
await purchasesApi.delete(id);
```

## Migration Strategy

### Phase 1: Add AuthProvider (Already Available)
Wrap your app in AuthProvider in `main.tsx`:

```typescript
import { AuthProvider } from './contexts/AuthContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
```

### Phase 2: Replace Storage Layer (Gradual Migration)

#### Current (localStorage):
```typescript
import { loadTransactions, saveTransactions } from './utils/storage';

const transactions = loadTransactions();
saveTransactions(newTransactions);
```

#### New (API):
```typescript
import { transactionsApi } from './api';

const transactions = await transactionsApi.getAll();
await transactionsApi.create(newTransaction);
```

### Phase 3: Data Migration
Before switching to API-only mode, migrate existing localStorage data:

```typescript
import { loadTransactions, loadItems, loadPurchases } from './utils/storage';
import { transactionsApi, itemsApi, purchasesApi } from './api';

async function migrateData() {
  try {
    // Get localStorage data
    const localTransactions = loadTransactions();
    const localItems = loadItems();
    const localPurchases = loadPurchases();

    // Migrate to backend
    if (localTransactions.length > 0) {
      await transactionsApi.bulkCreate(localTransactions);
    }
    
    if (localItems.length > 0) {
      await itemsApi.bulkCreate(localItems);
    }
    
    if (localPurchases.length > 0) {
      await purchasesApi.bulkCreate(localPurchases);
    }

    console.log('Migration complete!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}
```

## Error Handling

All API calls return typed errors:

```typescript
try {
  const transactions = await transactionsApi.getAll();
} catch (error: any) {
  if (error.status === 401) {
    // Unauthorized - redirect to login
    logout();
  } else if (error.status === 404) {
    // Not found
    console.error('Resource not found');
  } else {
    // Other errors
    console.error('API Error:', error.message);
  }
}
```

## Offline Support (Future Enhancement)

To add offline support with queue system:

1. **Create Queue Manager** (`utils/syncQueue.ts`):
   - Store failed API calls in IndexedDB
   - Retry on network reconnection
   - Show sync status to user

2. **Network Status Detection**:
   ```typescript
   window.addEventListener('online', () => {
     // Sync queued operations
     syncQueuedOperations();
   });
   
   window.addEventListener('offline', () => {
     // Switch to offline mode
     setOfflineMode(true);
   });
   ```

3. **Optimistic Updates**:
   - Update UI immediately
   - Queue API call for background sync
   - Rollback on failure

## Android Configuration

For Android app to connect to backend:

1. **Update `.env`** with your computer's IP:
   ```env
   VITE_API_URL=http://192.168.1.XXX:3000
   ```

2. **Network Permissions** (already in `AndroidManifest.xml`):
   ```xml
   <uses-permission android:name="android.permission.INTERNET" />
   <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
   ```

3. **Clear application data** before testing:
   - Settings → Apps → FinMan → Storage → Clear Data

## Testing Checklist

- [ ] Backend API running (`npm run dev` in backend folder)
- [ ] Frontend can connect to backend (check browser console)
- [ ] Login/Register working
- [ ] Transactions CRUD operations
- [ ] Items CRUD operations
- [ ] Purchases CRUD operations
- [ ] Budgets CRUD operations
- [ ] Recurring transactions CRUD operations
- [ ] Data migration from localStorage
- [ ] Android app can connect to backend
- [ ] Authentication persists after app reload
- [ ] Logout clears all data

## Next Steps

1. ✅ Backend API complete (Items, Purchases, Transactions, Budgets, Recurring)
2. ✅ Frontend API service layer created
3. ✅ Authentication context and components created
4. ⏳ Integrate auth into App.tsx
5. ⏳ Replace storage calls with API calls
6. ⏳ Add offline queue system
7. ⏳ Test on Android
8. ⏳ Deploy to VPS

## Build Status

✅ Frontend builds successfully with all API modules
- Build time: 4.10s
- Bundle size: 479 KB (145 KB gzipped)
- No TypeScript errors
- All API types properly defined
