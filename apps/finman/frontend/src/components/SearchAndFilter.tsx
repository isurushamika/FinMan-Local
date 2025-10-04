import React, { useState } from 'react';
import { Transaction, SearchFilters } from '../types';
import { DEFAULT_CATEGORIES, ACCOUNT_TYPES } from '../utils/categories';
import { Search, Filter, X } from 'lucide-react';

interface SearchAndFilterProps {
  transactions: Transaction[];
  onFilterChange: (filtered: Transaction[]) => void;
}

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  transactions,
  onFilterChange,
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    type: 'all',
    category: '',
    account: '',
    dateFrom: '',
    dateTo: '',
  });

  const [showFilters, setShowFilters] = useState(false);

  const applyFilters = (newFilters: SearchFilters) => {
    let filtered = [...transactions];

    // Search term filter
    if (newFilters.searchTerm) {
      const term = newFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.description.toLowerCase().includes(term) ||
          t.category.toLowerCase().includes(term) ||
          t.amount.toString().includes(term)
      );
    }

    // Type filter
    if (newFilters.type && newFilters.type !== 'all') {
      filtered = filtered.filter((t) => t.type === newFilters.type);
    }

    // Category filter
    if (newFilters.category) {
      filtered = filtered.filter((t) => t.category === newFilters.category);
    }

    // Account filter
    if (newFilters.account) {
      filtered = filtered.filter((t) => t.account === newFilters.account);
    }

    // Date range filter
    if (newFilters.dateFrom) {
      filtered = filtered.filter((t) => t.date >= newFilters.dateFrom!);
    }
    if (newFilters.dateTo) {
      filtered = filtered.filter((t) => t.date <= newFilters.dateTo!);
    }

    onFilterChange(filtered);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const resetFilters = () => {
    const emptyFilters: SearchFilters = {
      searchTerm: '',
      type: 'all',
      category: '',
      account: '',
      dateFrom: '',
      dateTo: '',
    };
    setFilters(emptyFilters);
    applyFilters(emptyFilters);
  };

  const activeFilterCount = [
    filters.searchTerm,
    filters.type !== 'all' ? filters.type : '',
    filters.category,
    filters.account,
    filters.dateFrom,
    filters.dateTo,
  ].filter(Boolean).length;

  const allCategories = DEFAULT_CATEGORIES.map(cat => cat.name);

  return (
    <div className="card mb-6">
      <div className="flex flex-col gap-4">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              placeholder="Search transactions by description, category, or amount..."
              className="input pl-10"
            />
            {filters.searchTerm && (
              <button
                onClick={() => handleFilterChange('searchTerm', '')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'} flex items-center justify-center gap-2 whitespace-nowrap`}
          >
            <Filter className="w-5 h-5" />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 rounded-full px-2 py-0.5 text-xs font-bold min-w-[1.5rem]">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Reset Button */}
          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="btn btn-secondary flex items-center gap-2"
              title="Clear all filters"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="pt-4 border-t-2 border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Advanced Filters
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="label">Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="input"
                >
                  <option value="all">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>

              <div>
                <label className="label">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="input"
                >
                  <option value="">All Categories</option>
                  {allCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Account</label>
                <select
                  value={filters.account}
                  onChange={(e) => handleFilterChange('account', e.target.value)}
                  className="input"
                >
                  <option value="">All Accounts</option>
                  {ACCOUNT_TYPES.map((acc) => (
                    <option key={acc} value={acc}>
                      {acc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">From Date</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="label">To Date</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="input"
                  min={filters.dateFrom}
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={resetFilters}
                  className="btn btn-secondary w-full"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Summary */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Active filters:</span>
            {filters.searchTerm && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded text-xs">
                Search: "{filters.searchTerm}"
                <button onClick={() => handleFilterChange('searchTerm', '')} className="hover:text-primary-900 dark:hover:text-primary-100">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.type && filters.type !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded text-xs capitalize">
                {filters.type}
                <button onClick={() => handleFilterChange('type', 'all')} className="hover:text-primary-900 dark:hover:text-primary-100">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.category && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded text-xs">
                {filters.category}
                <button onClick={() => handleFilterChange('category', '')} className="hover:text-primary-900 dark:hover:text-primary-100">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.account && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded text-xs">
                {filters.account}
                <button onClick={() => handleFilterChange('account', '')} className="hover:text-primary-900 dark:hover:text-primary-100">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.dateFrom && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded text-xs">
                From: {filters.dateFrom}
                <button onClick={() => handleFilterChange('dateFrom', '')} className="hover:text-primary-900 dark:hover:text-primary-100">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.dateTo && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded text-xs">
                To: {filters.dateTo}
                <button onClick={() => handleFilterChange('dateTo', '')} className="hover:text-primary-900 dark:hover:text-primary-100">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
