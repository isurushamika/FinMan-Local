# Migration Guide: localStorage to Backend API

This guide helps you migrate from the current localStorage-based system to the new backend API.

## Overview

**Current System:**
- Data stored in browser localStorage
- Receipt images stored as Base64 strings
- No user authentication
- Single-device access only
- 5-10 MB storage limit

**New System:**
- Data stored in PostgreSQL database
- Receipt images stored as files on server
- JWT authentication required
- Multi-device access with sync
- Unlimited storage capacity

## Migration Steps

### Phase 1: Setup Backend (Complete ✅)

The backend is ready! Just need to:

1. Setup PostgreSQL database
2. Run migrations: `npx prisma migrate dev --name init`
3. Start backend: `npm run dev`

### Phase 2: Update Frontend

#### Step 1: Create API Service Layer

Create `src/utils/api.ts`:

```typescript
const API_URL = 'http://localhost:3000/api';

// Get token from localStorage
const getToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Set auth header
const authHeader = () => ({
  'Authorization': `Bearer ${getToken()}`
});

export const api = {
  // Auth
  register: async (email: string, password: string, name: string) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('authToken', data.token);
    }
    return data;
  },

  login: async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('authToken', data.token);
    }
    return data;
  },

  // Transactions
  getTransactions: async () => {
    const res = await fetch(`${API_URL}/transactions`, {
      headers: authHeader()
    });
    return res.json();
  },

  createTransaction: async (transaction: FormData) => {
    const res = await fetch(`${API_URL}/transactions`, {
      method: 'POST',
      headers: authHeader(),
      body: transaction
    });
    return res.json();
  },

  updateTransaction: async (id: string, transaction: FormData) => {
    const res = await fetch(`${API_URL}/transactions/${id}`, {
      method: 'PUT',
      headers: authHeader(),
      body: transaction
    });
    return res.json();
  },

  deleteTransaction: async (id: string) => {
    const res = await fetch(`${API_URL}/transactions/${id}`, {
      method: 'DELETE',
      headers: authHeader()
    });
    return res.json();
  },

  // Budgets
  getBudgets: async () => {
    const res = await fetch(`${API_URL}/budgets`, {
      headers: authHeader()
    });
    return res.json();
  },

  getBudgetProgress: async () => {
    const res = await fetch(`${API_URL}/budgets/progress`, {
      headers: authHeader()
    });
    return res.json();
  },

  // Recurring
  getRecurring: async () => {
    const res = await fetch(`${API_URL}/recurring`, {
      headers: authHeader()
    });
    return res.json();
  },

  processRecurring: async () => {
    const res = await fetch(`${API_URL}/recurring/process`, {
      method: 'POST',
      headers: authHeader()
    });
    return res.json();
  }
};
```

#### Step 2: Update TransactionForm Component

Change from storing Base64 to sending files:

```typescript
// OLD - Base64 storage
const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      setReceipt(reader.result as string); // Base64
    };
    reader.readAsDataURL(file);
  }
};

// NEW - Send file directly
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const formData = new FormData();
  formData.append('type', type);
  formData.append('amount', amount);
  formData.append('category', category);
  formData.append('description', description);
  formData.append('date', date);
  formData.append('account', account);
  
  if (receiptFile) {
    formData.append('receipt', receiptFile);
  }
  
  const result = await api.createTransaction(formData);
  // Handle result...
};
```

#### Step 3: Update Receipt Display

Change from Base64 to server URLs:

```typescript
// OLD - Base64
{transaction.receipt && (
  <img src={transaction.receipt} alt="Receipt" />
)}

// NEW - Server URL
{transaction.receiptPath && (
  <img 
    src={`http://localhost:3000/uploads/${transaction.receiptPath}`} 
    alt="Receipt" 
  />
)}
```

#### Step 4: Add Authentication UI

Create `src/components/Auth.tsx`:

```typescript
import { useState } from 'react';
import { api } from '../utils/api';

export default function Auth({ onAuthSuccess }: { onAuthSuccess: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        await api.login(email, password);
      } else {
        await api.register(email, password, name);
      }
      onAuthSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="card max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">
          {isLogin ? 'Login to FinMan' : 'Create Account'}
        </h2>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input mb-4"
              required
            />
          )}
          
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input mb-4"
            required
          />
          
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input mb-6"
            required
          />

          <button type="submit" className="btn btn-primary w-full">
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <p className="text-center mt-4">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 hover:underline"
          >
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}
```

#### Step 5: Update App.tsx

Add authentication check:

```typescript
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Verify token is valid
      api.getTransactions()
        .then(() => setIsAuthenticated(true))
        .catch(() => {
          localStorage.removeItem('authToken');
          setIsAuthenticated(false);
        });
    }
  }, []);

  if (!isAuthenticated) {
    return <Auth onAuthSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    // Your existing app
  );
}
```

### Phase 3: Data Migration Tool

Create `src/utils/migrate.ts`:

```typescript
import { api } from './api';
import { loadTransactions, loadBudgets, loadRecurring } from './storage';

export async function migrateToBackend() {
  try {
    console.log('Starting migration...');

    // Get localStorage data
    const transactions = loadTransactions();
    const budgets = loadBudgets();
    const recurring = loadRecurring();

    // Migrate transactions
    for (const transaction of transactions) {
      const formData = new FormData();
      formData.append('type', transaction.type);
      formData.append('amount', transaction.amount.toString());
      formData.append('category', transaction.category);
      formData.append('description', transaction.description || '');
      formData.append('date', transaction.date);
      formData.append('account', transaction.account || '');

      // Note: Base64 receipts cannot be migrated automatically
      // Users need to re-upload receipt images

      await api.createTransaction(formData);
    }

    // Migrate budgets
    for (const budget of budgets) {
      await fetch('http://localhost:3000/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(budget)
      });
    }

    // Migrate recurring
    for (const rec of recurring) {
      await fetch('http://localhost:3000/api/recurring', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(rec)
      });
    }

    console.log('Migration complete!');
    alert('Migration successful! You can now use the backend API.');
  } catch (error) {
    console.error('Migration failed:', error);
    alert('Migration failed. Please try again.');
  }
}
```

Add a migration button to your app (one-time use):

```typescript
<button onClick={migrateToBackend} className="btn">
  Migrate Data to Backend
</button>
```

## Testing the Migration

### 1. Test Authentication
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'

# Save the token from response
```

### 2. Test Transaction Creation
```bash
# Create transaction with file
curl -X POST http://localhost:3000/api/transactions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "type=expense" \
  -F "amount=50.00" \
  -F "category=Food" \
  -F "date=2025-10-04" \
  -F "receipt=@path/to/image.jpg"
```

### 3. Test Data Retrieval
```bash
# Get all transactions
curl http://localhost:3000/api/transactions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Rollback Plan

If migration fails, your localStorage data is preserved:

1. Frontend still has localStorage code
2. Simply use the old version
3. Data is not deleted during migration

## Post-Migration Cleanup

After successful migration:

1. Remove localStorage utility functions
2. Remove Base64 conversion code
3. Update all components to use API
4. Remove migration tool
5. Test thoroughly

## Benefits After Migration

✅ **Unlimited Storage** - No 5-10 MB limit  
✅ **Better Performance** - Files not in Base64  
✅ **Multi-Device Sync** - Access from anywhere  
✅ **Secure Authentication** - JWT tokens  
✅ **Backup & Recovery** - Database backups  
✅ **Scalability** - Can handle thousands of transactions  

## Support

If you encounter issues:

1. Check backend logs
2. Verify PostgreSQL is running
3. Check network requests in browser DevTools
4. Review API documentation in `backend/docs/API.md`

---

**Ready to migrate?** Follow the steps above to transition to the robust backend system! 🚀
