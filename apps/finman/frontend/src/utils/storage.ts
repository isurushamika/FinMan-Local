import { Transaction, Budget, RecurringTransaction, Item, ItemPurchase } from '../types';

const STORAGE_KEY = 'financial_transactions';
const BUDGETS_KEY = 'financial_budgets';
const RECURRING_KEY = 'financial_recurring';
const ITEMS_KEY = 'financial_items';
const PURCHASES_KEY = 'financial_purchases';

export const saveTransactions = (transactions: Transaction[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch (error) {
    console.error('Error saving transactions:', error);
  }
};

export const loadTransactions = (): Transaction[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading transactions:', error);
    return [];
  }
};

export const saveBudgets = (budgets: Budget[]): void => {
  try {
    localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
  } catch (error) {
    console.error('Error saving budgets:', error);
  }
};

export const loadBudgets = (): Budget[] => {
  try {
    const data = localStorage.getItem(BUDGETS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading budgets:', error);
    return [];
  }
};

export const saveRecurring = (recurring: RecurringTransaction[]): void => {
  try {
    localStorage.setItem(RECURRING_KEY, JSON.stringify(recurring));
  } catch (error) {
    console.error('Error saving recurring transactions:', error);
  }
};

export const loadRecurring = (): RecurringTransaction[] => {
  try {
    const data = localStorage.getItem(RECURRING_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading recurring transactions:', error);
    return [];
  }
};

// Items storage
export const saveItems = (items: Item[]): void => {
  try {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Error saving items:', error);
  }
};

export const loadItems = (): Item[] => {
  try {
    const data = localStorage.getItem(ITEMS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading items:', error);
    return [];
  }
};

// Purchases storage
export const savePurchases = (purchases: ItemPurchase[]): void => {
  try {
    localStorage.setItem(PURCHASES_KEY, JSON.stringify(purchases));
  } catch (error) {
    console.error('Error saving purchases:', error);
  }
};

export const loadPurchases = (): ItemPurchase[] => {
  try {
    const data = localStorage.getItem(PURCHASES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading purchases:', error);
    return [];
  }
};
