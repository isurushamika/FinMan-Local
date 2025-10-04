import { Category } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  // Income categories
  { name: 'Salary', type: 'income', color: '#10b981' },
  { name: 'Freelance', type: 'income', color: '#34d399' },
  { name: 'Investments', type: 'income', color: '#6ee7b7' },
  { name: 'Other Income', type: 'income', color: '#a7f3d0' },
  
  // Expense categories
  { name: 'Food & Dining', type: 'expense', color: '#ef4444' },
  { name: 'Transportation', type: 'expense', color: '#f59e0b' },
  { name: 'Shopping', type: 'expense', color: '#8b5cf6' },
  { name: 'Entertainment', type: 'expense', color: '#ec4899' },
  { name: 'Bills & Utilities', type: 'expense', color: '#3b82f6' },
  { name: 'Healthcare', type: 'expense', color: '#06b6d4' },
  { name: 'Education', type: 'expense', color: '#14b8a6' },
  { name: 'Other Expenses', type: 'expense', color: '#64748b' },
];

export const EXPENSE_CATEGORIES = DEFAULT_CATEGORIES.filter(cat => cat.type === 'expense');
export const INCOME_CATEGORIES = DEFAULT_CATEGORIES.filter(cat => cat.type === 'income');

export const ACCOUNT_TYPES = [
  'Cash',
  'Checking Account',
  'Savings Account',
  'Credit Card',
  'Debit Card',
  'Digital Wallet',
  'Other',
];

