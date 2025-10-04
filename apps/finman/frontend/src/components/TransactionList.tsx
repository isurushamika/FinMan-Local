import React, { useState } from 'react';
import { Transaction } from '../types';
import { DEFAULT_CATEGORIES } from '../utils/categories';
import { format } from 'date-fns';
import { Trash2, Eye, X, Filter } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete }) => {
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredTransactions = transactions.filter((t) => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (filterCategory !== 'all' && t.category !== filterCategory) return false;
    return true;
  });

  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getCategoryColor = (category: string) => {
    const cat = DEFAULT_CATEGORIES.find((c) => c.name === category);
    return cat?.color || '#64748b';
  };

  const allCategories = Array.from(new Set(transactions.map((t) => t.category)));

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Transactions
        </h2>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="input pl-10 pr-4 py-2"
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input flex-1 sm:flex-initial"
          >
            <option value="all">All Categories</option>
            {allCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {sortedTransactions.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p className="text-lg">No transactions found</p>
          <p className="text-sm mt-2">Add your first transaction to get started!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {/* Category Color Indicator */}
              <div
                className="w-1 h-12 rounded-full"
                style={{ backgroundColor: getCategoryColor(transaction.category) }}
              />

              {/* Transaction Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {transaction.description}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {transaction.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-lg font-bold ${
                        transaction.type === 'income'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {transaction.type === 'income' ? '+' : '-'}LKR {transaction.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {format(new Date(transaction.date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {transaction.receipt && (
                  <button
                    onClick={() => setSelectedReceipt(transaction.receipt!)}
                    className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                    title="View Receipt"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={() => onDelete(transaction.id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedReceipt(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl p-4 max-w-2xl max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Receipt</h3>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <img
              src={selectedReceipt}
              alt="Receipt"
              className="w-full rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionList;
