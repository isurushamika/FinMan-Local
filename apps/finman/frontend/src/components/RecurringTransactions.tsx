import React, { useState } from 'react';
import { RecurringTransaction } from '../types';
import { DEFAULT_CATEGORIES, ACCOUNT_TYPES } from '../utils/categories';
import { Repeat, Calendar, DollarSign } from 'lucide-react';

interface RecurringTransactionsProps {
  recurring: RecurringTransaction[];
  onAdd: (transaction: Omit<RecurringTransaction, 'id'>) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const RecurringTransactions: React.FC<RecurringTransactionsProps> = ({
  recurring,
  onAdd,
  onToggle,
  onDelete,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    category: '',
    description: '',
    account: '',
    frequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onAdd({
      type: formData.type,
      amount: parseFloat(formData.amount),
      category: formData.category,
      description: formData.description,
      account: formData.account || undefined,
      frequency: formData.frequency,
      startDate: formData.startDate,
      endDate: formData.endDate || undefined,
      isActive: true,
    });

    setFormData({
      type: 'expense',
      amount: '',
      category: '',
      description: '',
      account: '',
      frequency: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
    });
    setShowForm(false);
  };

  const categories = DEFAULT_CATEGORIES.filter(cat => cat.type === formData.type);

  const getFrequencyIcon = (frequency: string) => {
    switch (frequency) {
      case 'daily': return '📅';
      case 'weekly': return '📆';
      case 'monthly': return '🗓️';
      case 'yearly': return '📊';
      default: return '🔄';
    }
  };

  const getNextOccurrence = (recurring: RecurringTransaction): string => {
    const lastGen = recurring.lastGenerated ? new Date(recurring.lastGenerated) : new Date(recurring.startDate);
    const next = new Date(lastGen);

    switch (recurring.frequency) {
      case 'daily':
        next.setDate(next.getDate() + 1);
        break;
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'yearly':
        next.setFullYear(next.getFullYear() + 1);
        break;
    }

    return next.toISOString().split('T')[0];
  };

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recurring Transactions</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Automate your regular income and expenses</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={showForm ? 'btn btn-secondary' : 'btn btn-primary'}
        >
          {showForm ? 'Cancel' : '+ New Recurring'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-2 border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create Recurring Transaction</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense', category: '' })}
                className="input"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>

            <div>
              <label className="label">Amount (LKR)</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="input"
                placeholder="0.00"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="label">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input"
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Account</label>
              <select
                value={formData.account}
                onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                className="input"
              >
                <option value="">Select Account (Optional)</option>
                {ACCOUNT_TYPES.map((acc) => (
                  <option key={acc} value={acc}>
                    {acc}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="label">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input"
                placeholder="e.g., Monthly rent payment"
                required
              />
            </div>

            <div>
              <label className="label">Frequency</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                className="input"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div>
              <label className="label">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="input"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="label">End Date (Optional)</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="input"
                min={formData.startDate}
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-4 btn btn-primary w-full"
          >
            Add Recurring Transaction
          </button>
        </form>
      )}

      {recurring.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <Repeat className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
          <p className="text-lg font-medium mb-2">No recurring transactions</p>
          <p className="text-sm">Set up recurring income or expenses to automate your financial tracking</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recurring.map((item) => (
            <div
              key={item.id}
              className={`p-5 rounded-lg border-2 transition-all hover:shadow-md ${
                item.isActive
                  ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  : 'bg-gray-50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-3xl mt-1">{getFrequencyIcon(item.frequency)}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{item.description}</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="text-sm px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                          {item.category}
                        </span>
                        <span className="text-sm px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                          {item.frequency.charAt(0).toUpperCase() + item.frequency.slice(1)}
                        </span>
                        {item.account && (
                          <span className="text-sm px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                            {item.account}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className={`font-semibold text-base ${item.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {item.type === 'income' ? '+' : '-'}LKR {item.amount.toFixed(2)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Started: {new Date(item.startDate).toLocaleDateString()}
                    </span>
                    {item.isActive && (
                      <span className="flex items-center gap-1 text-primary-600 dark:text-primary-400 font-medium">
                        <DollarSign className="w-3.5 h-3.5" />
                        Next: {new Date(getNextOccurrence(item)).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => onToggle(item.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      item.isActive
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                    }`}
                  >
                    {item.isActive ? 'Active' : 'Paused'}
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
