# How FinMan Works - Complete System Explanation

> **Last Updated:** October 4, 2025  
> **Author:** Isuru Shamika

## 🎯 Overview

FinMan is a **full-stack financial management application** that runs as:
1. **Native Android App** (via Capacitor)
2. **Progressive Web App** (browser-based)
3. **Desktop Web App** (via browser)

All three versions share the same codebase and work **completely offline** with optional backend sync.

---

## 📱 Architecture

### High-Level Structure

```
┌─────────────────────────────────────────────────────┐
│                   USER INTERFACE                     │
│              (React Components + UI)                 │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│              APPLICATION LAYER                       │
│         (App.tsx - State Management)                 │
└──────────────────┬──────────────────────────────────┘
                   │
      ┌────────────┼────────────┐
      ▼            ▼            ▼
┌─────────┐  ┌──────────┐  ┌──────────┐
│ Storage │  │ Security │  │ Features │
│ Layer   │  │ Layer    │  │ Layer    │
└─────────┘  └──────────┘  └──────────┘
      │            │            │
      └────────────┴────────────┘
                   │
      ┌────────────▼────────────┐
      │   localStorage (Browser) │
      │   or Encrypted Storage   │
      └─────────────────────────┘
```

---

## 🔐 Security Layer - How Your Data is Protected

### 1. Authentication Flow

**First Time Setup:**
```
User Opens App
    ↓
No user exists?
    ↓
Show Setup Screen
    ↓
User creates PIN/Password
    ↓
Optional: Enable Biometric Auth
    ↓
Credentials Encrypted with AES-256-GCM
    ↓
Stored in localStorage
    ↓
App Unlocked
```

**Returning User:**
```
User Opens App
    ↓
User exists?
    ↓
Check session validity (24h expiry)
    ↓
Session valid?
    ├─ YES → Auto-login if within timeout
    └─ NO  → Show lock screen
         ↓
    User enters PIN/Password
         ↓
    Verify against encrypted hash
         ↓
    Correct? → Unlock app
```

**Biometric Authentication:**
```
User taps fingerprint icon
    ↓
Capacitor Native Biometric API
    ↓
Android Biometric Hardware
    ↓
Success? → Retrieve stored credentials
    ↓
Auto-login to app
```

### 2. Data Encryption

**Files Involved:**
- `utils/encryption.ts` - AES-256-GCM encryption/decryption
- `utils/auth.ts` - Credential management
- `utils/biometric.ts` - Biometric integration

**How Encryption Works:**

```typescript
// When saving sensitive data:
1. Generate random IV (Initialization Vector)
2. Use Web Crypto API with AES-256-GCM
3. Encrypt data with master key
4. Store: { encrypted: "...", iv: "..." }

// When loading:
1. Retrieve encrypted data + IV
2. Decrypt using same master key + IV
3. Return original data
```

**What Gets Encrypted:**
- ✅ User credentials (PIN/Password)
- ✅ Biometric credentials
- ✅ Session tokens
- ⚠️ Financial data (optional - currently plain text in localStorage)

### 3. Auto-Lock System

**How It Works:**

```javascript
// Track user activity
window.addEventListener('mousedown', updateActivity);
window.addEventListener('keydown', updateActivity);
window.addEventListener('touchstart', updateActivity);

// Every 1 second, check:
timeSinceLastActivity = now - lastActivity;

if (timeSinceLastActivity >= autoLockTimeout) {
  lockApp();
}
```

**Configurable Timeouts:**
- Never (0)
- 1 minute
- 5 minutes
- 15 minutes
- 30 minutes
- 1 hour

---

## 💾 Data Storage Layer

### Local Storage Architecture

**Storage Keys:**
```javascript
financial_transactions     // All income/expense transactions
financial_budgets         // Budget definitions
financial_recurring       // Recurring bills/income
financial_items           // Item tracking
financial_purchases       // Purchase history
financial_auth_user       // Encrypted credentials
financial_auth_state      // Session state
financial_notifications   // Notification queue
notification_settings     // Notification preferences
```

### How Data Flows

**Adding a Transaction:**

```
User fills TransactionForm
    ↓
handleAddTransaction(transaction)
    ↓
Add to transactions array
    ↓
saveTransactions(transactions)
    ↓
localStorage.setItem('financial_transactions', JSON.stringify(transactions))
    ↓
Update UI (React state)
    ↓
Check for budget alerts
    ↓
Generate notifications if needed
```

**Loading Data on App Start:**

```
App.tsx useEffect() runs
    ↓
loadTransactions()
    ↓
const data = localStorage.getItem('financial_transactions')
    ↓
JSON.parse(data)
    ↓
setTransactions(parsed data)
    ↓
Display in UI
```

### Storage Utilities (`utils/storage.ts`)

```typescript
// Simple wrapper functions:
export const saveTransactions = (transactions: Transaction[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch (error) {
    logger.error('Error saving transactions:', error);
  }
};

export const loadTransactions = (): Transaction[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    logger.error('Error loading transactions:', error);
    return [];
  }
};
```

---

## 🔔 Notification System

### How Notifications Work

**1. Notification Checking (Automatic)**

```
Data Changes (transaction/budget/recurring modified)
    ↓
useEffect triggers in App.tsx
    ↓
Run notification checks:
    ├─ checkUpcomingBills(recurring)
    ├─ checkBudgetAlerts(budgets, transactions)
    └─ generateSpendingSummary(transactions)
    ↓
New notifications generated?
    ↓
addNotifications(newNotifications)
    ↓
localStorage.setItem('financial_notifications', ...)
    ↓
Update unread count badge
```

**2. Bill Reminders**

```javascript
// Example: Rent due on 1st of every month
checkUpcomingBills(recurring) {
  recurring.forEach(bill => {
    nextDueDate = calculateNextDueDate(bill);
    daysUntilDue = daysBetween(today, nextDueDate);
    
    if (daysUntilDue <= settings.billReminderDays) {
      createNotification({
        type: 'bill_reminder',
        title: `Bill Due Soon: ${bill.description}`,
        message: `${bill.description} is due in ${daysUntilDue} days`,
        priority: daysUntilDue <= 1 ? 'high' : 'medium'
      });
    }
  });
}
```

**3. Budget Alerts**

```javascript
// Example: Groceries budget $500/month
checkBudgetAlerts(budgets, transactions) {
  budgets.forEach(budget => {
    spent = calculateSpentAmount(budget, transactions);
    percentage = (spent / budget.amount) * 100;
    
    if (percentage >= 100) {
      createNotification({
        type: 'budget_alert',
        title: `Budget Exceeded: ${budget.category}`,
        priority: 'high'
      });
    } else if (percentage >= settings.budgetWarningThreshold) {
      createNotification({
        type: 'budget_alert',
        title: `Budget Warning: ${budget.category}`,
        priority: 'medium'
      });
    }
  });
}
```

**4. Spending Summaries**

```javascript
// Weekly summary (every Sunday at 6 PM)
generateSpendingSummary() {
  if (shouldGenerateSummary(settings)) {
    const period = getPeriodTransactions(transactions, settings.frequency);
    
    const summary = {
      totalIncome: sum(period.income),
      totalExpenses: sum(period.expenses),
      balance: income - expenses,
      topCategory: getMostSpentCategory(period)
    };
    
    createNotification({
      type: 'spending_summary',
      title: 'Weekly Spending Summary',
      data: summary
    });
  }
}
```

### Notification Lifecycle

```
Notification Created
    ↓
Stored in localStorage
    ↓
Displayed in Notifications tab
    ↓
User Actions:
    ├─ Mark as Read → read: true
    ├─ Delete → Remove from array
    └─ Ignore → Auto-cleanup after 30 days
```

---

## 📊 Core Features Explained

### 1. Transactions

**Data Structure:**
```typescript
interface Transaction {
  id: string;              // Unique ID (UUID)
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;            // ISO date string
  recurring?: boolean;
}
```

**How Filtering Works:**
```javascript
// User types in search box
const filtered = transactions.filter(t => {
  const matchesSearch = t.description.includes(searchTerm);
  const matchesType = selectedType === 'all' || t.type === selectedType;
  const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
  const matchesDate = isWithinDateRange(t.date, startDate, endDate);
  
  return matchesSearch && matchesType && matchesCategory && matchesDate;
});
```

### 2. Budgets

**Budget Tracking:**
```javascript
// Calculate budget progress
const calculateProgress = (budget, transactions) => {
  const relevantTransactions = transactions.filter(t => {
    return t.category === budget.category &&
           t.type === 'expense' &&
           isInBudgetPeriod(t.date, budget.period);
  });
  
  const spent = relevantTransactions.reduce((sum, t) => sum + t.amount, 0);
  const percentage = (spent / budget.amount) * 100;
  
  return { spent, percentage, remaining: budget.amount - spent };
};
```

**Visual Indicators:**
```javascript
// Color coding
if (percentage >= 100) return 'red';    // Over budget
if (percentage >= 90) return 'orange';   // Warning
if (percentage >= 80) return 'yellow';   // Alert
return 'green';                          // Safe
```

### 3. Recurring Transactions

**Next Due Date Calculation:**
```javascript
const calculateNextDueDate = (recurring) => {
  const today = new Date();
  const lastProcessed = new Date(recurring.lastProcessed || recurring.startDate);
  
  switch(recurring.frequency) {
    case 'daily':
      return addDays(lastProcessed, 1);
    case 'weekly':
      return addWeeks(lastProcessed, 1);
    case 'monthly':
      return addMonths(lastProcessed, 1);
    case 'yearly':
      return addYears(lastProcessed, 1);
  }
};
```

**Auto-Processing (Manual Trigger):**
```javascript
// User clicks "Process Due" button
processDueRecurring() {
  recurring.forEach(r => {
    if (isOverdue(r.nextDueDate)) {
      createTransaction({
        ...r,
        date: r.nextDueDate,
        id: generateNewId()
      });
      
      updateRecurring({
        ...r,
        lastProcessed: today,
        nextDueDate: calculateNextDueDate(r)
      });
    }
  });
}
```

### 4. Item Tracking

**Purpose:** Track items you own and their purchase history

**Data Structure:**
```typescript
interface Item {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
  createdAt: string;
}

interface ItemPurchase {
  id: string;
  itemId: string;        // Links to Item
  quantity: number;
  unitPrice: number;
  totalCost: number;
  purchaseDate: string;
  store?: string;
  notes?: string;
}
```

**Use Case Example:**
```
Item: Coffee Beans
└─ Purchase 1: Jan 1, $12, Starbucks
└─ Purchase 2: Jan 15, $14, Local Roaster
└─ Purchase 3: Feb 1, $11, Amazon

Average Price: $12.33
Purchase Frequency: Every 15 days
```

---

## 🎨 User Interface Flow

### App Navigation Structure

```
┌─────────────────────────────────────┐
│          APP HEADER                  │
│  [Logo]  [Bell Icon]  [User Icon]   │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│      NAVIGATION TABS                 │
│ [📊 Dashboard] [📝 Transactions]    │
│ [➕ Add] [💰 Budgets] [🔄 Recurring]│
│ [📦 Items] [🔔 Notifications]       │
│ [⚙️ Settings] [🔒 Security]         │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│                                      │
│      ACTIVE TAB CONTENT              │
│                                      │
│   (Dynamically rendered based        │
│    on activeTab state)               │
│                                      │
└─────────────────────────────────────┘
```

### State Management (React)

```typescript
// App.tsx maintains all state
const [transactions, setTransactions] = useState<Transaction[]>([]);
const [budgets, setBudgets] = useState<Budget[]>([]);
const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
const [activeTab, setActiveTab] = useState('dashboard');
const [authState, setAuthState] = useState({ ... });

// State flows down to components as props
<TransactionList 
  transactions={filteredTransactions}
  onDelete={handleDeleteTransaction}
  onEdit={handleEditTransaction}
/>

// Components call handler functions to update state
const handleAddTransaction = (transaction: Transaction) => {
  const updated = [...transactions, transaction];
  setTransactions(updated);
  saveTransactions(updated);  // Persist to localStorage
};
```

---

## 📱 Mobile App (Capacitor)

### How Capacitor Works

```
React App (Web Code)
    ↓
Vite Build → dist/ folder
    ↓
Capacitor copies to android/app/src/main/assets/public/
    ↓
Android WebView loads index.html
    ↓
Capacitor Bridge provides native APIs:
    ├─ Biometric (fingerprint/face ID)
    ├─ Filesystem (future)
    ├─ Network (future)
    └─ Push Notifications (future)
```

### Build Process

```bash
# 1. Build web app
npm run build  # → Creates dist/ folder

# 2. Sync to Android
npx cap sync android  # → Copies dist/ to Android project

# 3. Build APK
cd android
./gradlew assembleDebug  # → Creates APK

# Result: app-debug.apk (5.3 MB)
```

### Biometric Authentication Flow

```
User taps fingerprint icon
    ↓
JavaScript: NativeBiometric.isAvailable()
    ↓
Capacitor Bridge → Android Native Code
    ↓
BiometricManager.canAuthenticate()
    ↓
Result sent back to JavaScript
    ↓
JavaScript: NativeBiometric.verifyIdentity()
    ↓
Android shows fingerprint dialog
    ↓
User scans finger
    ↓
Success/Failure → JavaScript callback
    ↓
On success: auto-login
```

---

## 🔄 Data Flow Example: Adding a Transaction

**Step-by-Step:**

1. **User fills form:**
   ```
   Type: Expense
   Category: Groceries
   Amount: $45.50
   Description: Walmart shopping
   Date: 2025-10-04
   ```

2. **Form submission:**
   ```typescript
   <TransactionForm onSubmit={handleAddTransaction} />
   ```

3. **App.tsx handler:**
   ```typescript
   const handleAddTransaction = (transaction: Transaction) => {
     // 1. Generate unique ID
     transaction.id = crypto.randomUUID();
     
     // 2. Add to state
     const updated = [...transactions, transaction];
     setTransactions(updated);
     
     // 3. Save to localStorage
     saveTransactions(updated);
     
     // 4. Switch to transactions view
     setActiveTab('transactions');
     
     // 5. Trigger notification checks
     checkBudgetAlerts(budgets, updated);
   };
   ```

4. **localStorage write:**
   ```javascript
   localStorage.setItem('financial_transactions', JSON.stringify(updated));
   ```

5. **Budget check triggered:**
   ```typescript
   // Check if this expense affects any budgets
   const groceryBudget = budgets.find(b => b.category === 'Groceries');
   const spent = calculateSpent(groceryBudget, updated);
   
   if (spent / groceryBudget.amount >= 0.8) {
     // Create budget alert notification
     addNotification({ ... });
   }
   ```

6. **UI updates:**
   ```
   - TransactionList shows new transaction
   - SummaryCards update total expenses
   - Charts update with new data point
   - Budget progress bar updates
   - Notification badge shows +1 if alert created
   ```

---

## 🌐 Optional Backend (API)

**Current Status:** Backend exists but app works fully offline

**How Sync Would Work (Future):**

```
Local App                          Backend API
    ↓                                  ↓
Add transaction                    POST /api/transactions
    ↓                                  ↓
Save to localStorage               Save to PostgreSQL
    ↓                                  ↓
Queue for sync                     Return success + ID
    ↓                                  ↓
When online:                       
Send to API ────────────────────► Merge with server data
    ↓                                  ↓
Receive updates ◄──────────────── Send any server changes
    ↓                                  ↓
Merge locally                      Update database
    ↓
Update UI
```

**API Endpoints (Available but unused):**
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/transactions
POST   /api/transactions
PUT    /api/transactions/:id
DELETE /api/transactions/:id
GET    /api/budgets
POST   /api/budgets
GET    /api/recurring
POST   /api/recurring
```

---

## 🛠️ Development vs Production

### Development Mode

```javascript
// Logger shows all console messages
logger.error('Error saving:', error);  // → Prints to console

// Hot reload enabled
// Source maps available
// Unminified code
```

### Production Mode

```javascript
// Logger is silenced
logger.error('Error saving:', error);  // → No output

// Minified code
// Tree-shaken (unused code removed)
// Optimized bundles
// No source maps
```

**Build Sizes:**
```
Development:  ~2 MB JavaScript
Production:   ~450 KB (gzipped: ~135 KB)
```

---

## 🚀 Performance Optimizations

### 1. **Code Splitting**
```javascript
// Vite automatically splits:
- React core → vendor chunk
- Chart.js → separate chunk
- Components → main chunk
```

### 2. **Lazy Loading**
```typescript
// Only load what's needed for current tab
{activeTab === 'dashboard' && <SummaryCards />}
{activeTab === 'charts' && <Charts />}
{activeTab === 'budgets' && <BudgetManager />}
```

### 3. **Memoization**
```typescript
const filteredTransactions = useMemo(() => {
  return transactions.filter(/* complex filter */);
}, [transactions, filters]);
```

### 4. **Efficient Storage**
```javascript
// Store only what's needed
// Clean old notifications (30 days)
cleanupOldNotifications();

// Compress large datasets (future)
```

---

## 🔍 Debugging & Logging

### Logger System

**File:** `utils/logger.ts`

```typescript
// Development: Full logging
logger.error('Failed to save', error);
logger.warn('Session expiring soon');
logger.info('Transaction added', transaction);
logger.debug('State update', state);

// Production: All silent (no console output)
```

**Error Handling Pattern:**

```typescript
try {
  // Risky operation
  localStorage.setItem(key, data);
} catch (error) {
  // Log in development, silent in production
  logger.error('Storage failed:', error);
  
  // Always show user-friendly message
  showErrorToast('Unable to save data');
  
  // Return safe default
  return false;
}
```

---

## 📊 Summary: Key Technologies

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 | UI framework |
| | TypeScript | Type safety |
| | Tailwind CSS | Styling |
| | Vite | Build tool |
| | Chart.js | Data visualization |
| **Mobile** | Capacitor | Native mobile wrapper |
| | Android SDK | Android platform |
| **Security** | Web Crypto API | AES-256 encryption |
| | Biometric API | Fingerprint/Face ID |
| **Storage** | localStorage | Client-side data |
| | IndexedDB | Future for large data |
| **Backend** | Node.js + Express | API server (optional) |
| | Prisma | Database ORM |
| | PostgreSQL | Database |
| **Deployment** | Nginx | Reverse proxy |
| | PM2 | Process manager |
| | Ubuntu | Server OS |

---

## 🎓 Learning Resources

Want to understand the code better? Check these files:

**Start Here:**
1. `App.tsx` - Main application logic
2. `types/index.ts` - All data structures
3. `utils/storage.ts` - How data is saved/loaded

**Security:**
4. `utils/auth.ts` - Authentication
5. `utils/encryption.ts` - Data encryption
6. `utils/biometric.ts` - Biometric auth

**Features:**
7. `utils/notifications.ts` - Notification system
8. `components/TransactionForm.tsx` - Form handling
9. `components/BudgetManager.tsx` - Budget logic

**Build:**
10. `vite.config.ts` - Build configuration
11. `capacitor.config.ts` - Mobile config

---

## 💡 Common Questions

**Q: Where is my data stored?**  
A: In your browser's localStorage. Each origin (domain) has isolated storage.

**Q: Is my data encrypted?**  
A: Yes, credentials are encrypted. Transaction data is currently plain text in localStorage (can be encrypted if needed).

**Q: Can I use this offline?**  
A: Yes! 100% offline capable. No internet needed.

**Q: How do I backup my data?**  
A: Use Data Management → Export to download a JSON file.

**Q: Will updates erase my data?**  
A: No. localStorage persists across app updates.

**Q: Can I sync across devices?**  
A: Not yet. Backend API exists for future sync feature.

**Q: Why is the APK 5 MB?**  
A: Includes React, Chart.js, and Capacitor runtime. Could be smaller with optimization.

---

**That's how FinMan works! 🎉**

Every feature, from security to notifications, works together to create a complete financial management system that runs entirely on your device.
