import { Transaction, Budget, RecurringTransaction } from '../types';

const STORAGE_KEY = 'financial_transactions';
const BUDGETS_KEY = 'financial_budgets';
const RECURRING_KEY = 'financial_recurring';

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
