# FinMan App Categorization & Structure

## Navigation Categories

The FinMan application is organized into **5 logical categories** to provide intuitive navigation and better user experience:

---

## 📊 **1. OVERVIEW**

### Dashboard
**Icon:** 📊 BarChart3  
**Purpose:** High-level financial overview and insights

**Features:**
- Summary cards (Total Income, Total Expenses, Net Balance, Monthly Change)
- Monthly trend charts
- Category distribution charts
- Quick insights and analytics

**Use Case:** Get a bird's-eye view of your financial health at a glance

---

## 💰 **2. TRANSACTIONS**

### Transactions
**Icon:** 📋 List  
**Purpose:** View and manage all financial transactions

**Features:**
- Search and filter transactions
- View transaction history
- Delete transactions
- See receipt images
- Sort by date, amount, category

**Use Case:** Review past transactions and manage your financial records

### Add New
**Icon:** ➕ Plus  
**Purpose:** Create new income or expense transactions

**Features:**
- Add income/expense
- Select category
- Add description
- Upload receipt images
- Select account (Cash, Bank, Credit Card, etc.)
- Set transaction date

**Use Case:** Record new financial activities as they happen

---

## 📅 **3. PLANNING**

### Budgets
**Icon:** 💼 Wallet  
**Purpose:** Set and track spending budgets

**Features:**
- Create monthly/yearly budgets per category
- Track budget progress
- View spending vs. budget
- Status indicators (safe/warning/exceeded)
- Budget analytics

**Use Case:** Control spending and stay within budget limits

### Recurring Transactions
**Icon:** 🔄 Repeat  
**Purpose:** Manage recurring income and expenses

**Features:**
- Set up automatic recurring transactions
- Configure frequency (daily, weekly, monthly, yearly)
- Set start/end dates
- Toggle active/inactive
- Auto-generation of transactions

**Use Case:** Automate regular bills, subscriptions, salary, rent, etc.

---

## 📦 **4. TRACKING**

### Price Tracker
**Icon:** 📦 Package  
**Purpose:** Monitor item prices over time

**Features:**
- Add items to track (groceries, gas, etc.)
- Record purchase prices
- View price history and trends
- Price analytics (average, min, max, change %)
- Interactive price charts
- Store comparison

**Use Case:** Track inflation, find best deals, monitor cost of living

---

## 💾 **5. DATA MANAGEMENT**

### Data
**Icon:** 💾 Download  
**Purpose:** Import, export, and backup financial data

**Features:**
- Export to CSV (transactions)
- Export to JSON (full backup)
- Import from JSON
- Data backup and restore
- Clear all data

**Use Case:** Backup data, transfer to another device, or migrate data

---

## Visual Organization

### Navigation Bar Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│  OVERVIEW  │  TRANSACTIONS       │  PLANNING          │  TRACKING  │  DATA  │
│            │                     │                    │            │        │
│ Dashboard  │ Transactions | Add  │ Budgets | Recurring│ Price      │  Data  │
│            │              | New  │         |          │ Tracker    │        │
└─────────────────────────────────────────────────────────────────────┘
```

### With Visual Separators

```
Dashboard  ║  Transactions  |  Add New  ║  Budgets  |  Recurring  ║  Price Tracker  ║  Data
```

---

## Category Descriptions

### 1. **OVERVIEW** 
*Understand your finances*
- Quick summary of financial health
- Visual charts and trends
- Key metrics and insights

### 2. **TRANSACTIONS**
*Record and review*
- Log daily financial activities
- Browse transaction history
- Search and filter records

### 3. **PLANNING**
*Control and automate*
- Set spending limits
- Automate regular payments
- Plan future finances

### 4. **TRACKING**
*Monitor trends*
- Track item prices over time
- Identify price changes
- Make informed purchasing decisions

### 5. **DATA MANAGEMENT**
*Backup and organize*
- Export reports
- Create backups
- Import/migrate data

---

## User Journey Examples

### **New User Path:**
1. **Dashboard** → See empty state
2. **Add New** → Create first transaction
3. **Dashboard** → View updated summary
4. **Budgets** → Set spending limits
5. **Recurring** → Add monthly bills

### **Daily Use Path:**
1. **Add New** → Record expense
2. **Price Tracker** → Log item purchase
3. **Dashboard** → Check budget status

### **Monthly Review Path:**
1. **Dashboard** → Review monthly summary
2. **Transactions** → Analyze spending patterns
3. **Budgets** → Adjust next month's budgets
4. **Data** → Export monthly report

### **Planning Path:**
1. **Budgets** → Set category limits
2. **Recurring** → Setup automatic bills
3. **Dashboard** → Monitor progress

---

## Color Coding (Optional Future Enhancement)

```
📊 Overview      → Blue     (Information)
💰 Transactions  → Green    (Money/Activity)
📅 Planning      → Purple   (Strategy)
📦 Tracking      → Orange   (Monitoring)
💾 Data          → Gray     (Utility)
```

---

## Responsive Behavior

### Desktop (Large Screens)
- All tabs visible with full text labels
- Horizontal navigation bar
- Visual separators between categories

### Tablet (Medium Screens)
- Icons + abbreviated text
- Scrollable horizontal navigation
- Compact separators

### Mobile (Small Screens)
- Icons only
- Horizontal scroll
- Active tab highlighted
- Tooltips on hover/long-press

---

## Future Enhancements

### Potential Additional Categories:

#### **REPORTS & ANALYTICS**
- Custom reports
- Tax summaries
- Yearly comparisons
- Export templates

#### **GOALS**
- Savings goals
- Debt payoff trackers
- Financial milestones

#### **INSIGHTS**
- AI-powered suggestions
- Spending patterns
- Anomaly detection
- Predictions

#### **SETTINGS**
- User preferences
- Categories management
- Accounts configuration
- App customization

---

## Implementation Details

### Current Structure
- **Simple horizontal tabs** with visual separators
- **Border dividers** between category groups
- **Consistent iconography** for easy recognition
- **Responsive design** with hidden text on small screens

### Technical Organization
```typescript
Categories = {
  overview: ['dashboard'],
  transactions: ['transactions', 'add'],
  planning: ['budgets', 'recurring'],
  tracking: ['items'],
  data: ['data']
}
```

---

## Benefits of Categorization

✅ **Better UX**: Intuitive grouping reduces cognitive load  
✅ **Scalability**: Easy to add new features within categories  
✅ **Navigation**: Users can predict where to find features  
✅ **Organization**: Logical structure for future expansion  
✅ **Clarity**: Clear separation of concerns

---

**Last Updated:** October 4, 2025  
**Version:** 2.0 (with Item Price Tracking)
