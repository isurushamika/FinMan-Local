export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  receipt?: string; // Base64 encoded image
  account?: string; // Account name (Cash, Bank, Credit Card, etc.)
  recurringId?: string; // Link to recurring transaction template
}

export interface Category {
  name: string;
  type: 'income' | 'expense';
  color: string;
}

export interface MonthlyStats {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

export interface CategoryStats {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  period: 'monthly' | 'yearly';
  startDate: string;
}

export interface BudgetProgress {
  category: string;
  budgeted: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: 'safe' | 'warning' | 'exceeded';
}

export interface RecurringTransaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  account?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  lastGenerated?: string;
  isActive: boolean;
}

export interface SearchFilters {
  searchTerm: string;
  type?: 'income' | 'expense' | 'all';
  category?: string;
  account?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface Item {
  id: string;
  name: string;
  category: string;
  unit?: string; // e.g., "kg", "liters", "pieces"
  description?: string;
}

export interface ItemPurchase {
  id: string;
  itemId: string;
  itemName: string;
  transactionId: string;
  price: number;
  quantity: number;
  unit?: string;
  purchaseDate: string;
  store?: string;
  notes?: string;
}

export interface PriceHistory {
  itemId: string;
  itemName: string;
  purchases: ItemPurchase[];
  averagePrice: number;
  lowestPrice: number;
  highestPrice: number;
  priceChange: number; // Percentage change from first to last purchase
}

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
  lastLogin?: string;
  securitySettings: SecuritySettings;
}

export interface SecuritySettings {
  autoLockEnabled: boolean;
  autoLockTimeout: number; // minutes
  biometricEnabled: boolean;
  encryptionEnabled: boolean;
  requirePasswordOnStartup: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLocked: boolean;
  user: User | null;
  lastActivity: number;
}

export interface Notification {
  id: string;
  type: 'bill_reminder' | 'budget_alert' | 'spending_summary';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  date: string;
  read: boolean;
  data?: any; // Additional data specific to notification type
}

export interface NotificationSettings {
  billReminders: {
    enabled: boolean;
    daysBefore: number; // Days before bill due date
    time: string; // HH:mm format (e.g., "09:00")
  };
  budgetAlerts: {
    enabled: boolean;
    thresholdPercentage: number; // Alert when spending reaches this % of budget (e.g., 80)
    warningPercentage: number; // Warning when spending reaches this % (e.g., 90)
  };
  spendingSummary: {
    enabled: boolean;
    frequency: 'daily' | 'weekly';
    time: string; // HH:mm format
    dayOfWeek?: number; // 0-6 for weekly (0 = Sunday)
  };
}

export interface NotificationPreferences extends NotificationSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  showBadge: boolean;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingCycle: 'monthly' | 'yearly' | 'weekly' | 'quarterly';
  nextBillingDate: string;
  category: string;
  description?: string;
  isActive: boolean;
  autoRenew: boolean;
}
