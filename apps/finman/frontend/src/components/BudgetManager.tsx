import React, { useState } from 'react';
import { Budget, BudgetProgress, Transaction } from '../types';
import { EXPENSE_CATEGORIES } from '../utils/categories';
import { Wallet } from 'lucide-react';

interface BudgetManagerProps {
  budgets: Budget[];
  transactions: Transaction[];
  onAddBudget: (budget: Omit<Budget, 'id'>) => void;
  onDeleteBudget: (id: string) => void;
}

export const BudgetManager: React.FC<BudgetManagerProps> = ({
  budgets,
  transactions,
  onAddBudget,
  onDeleteBudget,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const calculateBudgetProgress = (): BudgetProgress[] => {
    const currentDate = new Date();
    const currentMonth = currentDate.toISOString().slice(0, 7);
    const currentYear = currentDate.getFullYear().toString();

    return budgets.map((budget) => {
      const relevantTransactions = transactions.filter((t) => {
        if (t.type !== 'expense' || t.category !== budget.category) return false;

        if (budget.period === 'monthly') {
          return t.date.startsWith(currentMonth);
        } else {
          return t.date.startsWith(currentYear);
        }
      });

      const spent = relevantTransactions.reduce((sum, t) => sum + t.amount, 0);
      const remaining = budget.amount - spent;
      const percentage = (spent / budget.amount) * 100;

      let status: 'safe' | 'warning' | 'exceeded' = 'safe';
      if (percentage >= 100) status = 'exceeded';
      else if (percentage >= 80) status = 'warning';

      return {
        category: budget.category,
        budgeted: budget.amount,
        spent,
        remaining,
        percentage: Math.min(percentage, 100),
        status,
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !amount) return;

    onAddBudget({
      category,
      amount: parseFloat(amount),
      period,
      startDate: new Date().toISOString().split('T')[0],
    });

    setCategory('');
    setAmount('');
    setShowForm(false);
  };

  const budgetProgress = calculateBudgetProgress();

  const getStatusColor = (status: 'safe' | 'warning' | 'exceeded') => {
    switch (status) {
      case 'safe':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'exceeded':
        return 'bg-red-500';
    }
  };

  const getStatusBgColor = (status: 'safe' | 'warning' | 'exceeded') => {
    switch (status) {
      case 'safe':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'exceeded':
        return 'bg-red-50 border-red-200';
    }
  };

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Budget Management</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Set spending limits and track your budget progress</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={showForm ? 'btn btn-secondary' : 'btn btn-primary'}
        >
          {showForm ? 'Cancel' : '+ New Budget'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-2 border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create New Budget</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input"
                required
              >
                <option value="">Select Category</option>
                {EXPENSE_CATEGORIES.filter(
                  (cat) => !budgets.some((b) => b.category === cat.name)
                ).map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Budget Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input"
                placeholder="0.00"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="label">Period</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as 'monthly' | 'yearly')}
                className="input"
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="mt-4 btn btn-primary w-full"
          >
            Add Budget
          </button>
        </form>
      )}

      {budgetProgress.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <Wallet className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
          <p className="text-lg font-medium mb-2">No budgets set</p>
          <p className="text-sm">Create your first budget to start tracking your spending limits</p>
        </div>
      ) : (
        <div className="space-y-4">
          {budgetProgress.map((progress) => {
            const budget = budgets.find((b) => b.category === progress.category);
            return (
              <div
                key={progress.category}
                className={`p-5 rounded-lg border-2 transition-all hover:shadow-md ${getStatusBgColor(progress.status)}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{progress.category}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {budget?.period === 'monthly' ? 'Monthly' : 'Yearly'} Budget
                    </p>
                  </div>
                  <button
                    onClick={() => budget && onDeleteBudget(budget.id)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium px-3 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Delete
                  </button>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      ${progress.spent.toFixed(2)} of ${progress.budgeted.toFixed(2)}
                    </span>
                    <span className={`font-semibold ${progress.status === 'exceeded' ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      {progress.percentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                    <div
                      className={`h-4 rounded-full transition-all duration-500 ${getStatusColor(progress.status)}`}
                      style={{ width: `${Math.min(progress.percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className={`font-medium ${progress.remaining < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                    {progress.remaining >= 0 ? 'Remaining' : 'Over Budget'}: $
                    {Math.abs(progress.remaining).toFixed(2)}
                  </span>
                  {progress.status === 'warning' && (
                    <span className="text-yellow-700 dark:text-yellow-400 font-medium flex items-center gap-1">
                      <span>⚠️</span> Approaching Limit
                    </span>
                  )}
                  {progress.status === 'exceeded' && (
                    <span className="text-red-700 dark:text-red-400 font-medium flex items-center gap-1">
                      <span>❌</span> Budget Exceeded
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
