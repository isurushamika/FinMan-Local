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
