import { useState, useEffect } from 'react';
import { Transaction, Budget, RecurringTransaction } from './types';
import { loadTransactions, saveTransactions, loadBudgets, saveBudgets, loadRecurring, saveRecurring } from './utils/storage';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import SummaryCards from './components/SummaryCards';
import Charts from './components/Charts';
import { BudgetManager } from './components/BudgetManager';
import { RecurringTransactions } from './components/RecurringTransactions';
import { SearchAndFilter } from './components/SearchAndFilter';
import { DataManagement } from './components/DataManagement';
import { BarChart3, Plus, List, Wallet, Repeat, Download } from 'lucide-react';
import './index.css';

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'add' | 'budgets' | 'recurring' | 'data'>('dashboard');

  useEffect(() => {
    const loaded = loadTransactions();
    setTransactions(loaded);
    setFilteredTransactions(loaded);
    
    const loadedBudgets = loadBudgets();
    setBudgets(loadedBudgets);
    
    const loadedRecurring = loadRecurring();
    setRecurring(loadedRecurring);
  }, []);

  useEffect(() => {
    saveTransactions(transactions);
    setFilteredTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveBudgets(budgets);
  }, [budgets]);

  useEffect(() => {
    saveRecurring(recurring);
  }, [recurring]);

  // Auto-generate recurring transactions
  useEffect(() => {
    const checkRecurring = () => {
      const today = new Date().toISOString().split('T')[0];
      const newTransactions: Transaction[] = [];

      recurring.forEach((rec) => {
        if (!rec.isActive) return;
        if (rec.endDate && today > rec.endDate) return;

        const lastGen = rec.lastGenerated ? new Date(rec.lastGenerated) : new Date(rec.startDate);
        const next = new Date(lastGen);

        switch (rec.frequency) {
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

        if (next.toISOString().split('T')[0] <= today) {
          newTransactions.push({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            type: rec.type,
            amount: rec.amount,
            category: rec.category,
            description: rec.description,
            date: today,
            account: rec.account,
            recurringId: rec.id,
          });

          // Update last generated date
          setRecurring((prev) =>
            prev.map((r) => (r.id === rec.id ? { ...r, lastGenerated: today } : r))
          );
        }
      });

      if (newTransactions.length > 0) {
        setTransactions((prev) => [...prev, ...newTransactions]);
      }
    };

    checkRecurring();
    const interval = setInterval(checkRecurring, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [recurring]);

  const handleAddTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    setTransactions([...transactions, newTransaction]);
    setActiveTab('transactions');
  };

  const handleDeleteTransaction = (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      setTransactions(transactions.filter((t) => t.id !== id));
    }
  };

  const handleAddBudget = (budget: Omit<Budget, 'id'>) => {
    const newBudget: Budget = {
      ...budget,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    setBudgets([...budgets, newBudget]);
  };

  const handleDeleteBudget = (id: string) => {
    if (confirm('Are you sure you want to delete this budget?')) {
      setBudgets(budgets.filter((b) => b.id !== id));
    }
  };

  const handleAddRecurring = (rec: Omit<RecurringTransaction, 'id'>) => {
    const newRecurring: RecurringTransaction = {
      ...rec,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    setRecurring([...recurring, newRecurring]);
  };

  const handleToggleRecurring = (id: string) => {
    setRecurring(recurring.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r)));
  };

  const handleDeleteRecurring = (id: string) => {
    if (confirm('Are you sure you want to delete this recurring transaction?')) {
      setRecurring(recurring.filter((r) => r.id !== id));
    }
  };

  const handleImportData = (data: {
    transactions: Transaction[];
    budgets: Budget[];
    recurring: RecurringTransaction[];
  }) => {
    setTransactions([...transactions, ...data.transactions]);
    setBudgets([...budgets, ...data.budgets]);
    setRecurring([...recurring, ...data.recurring]);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary-600 p-2 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                FinMan
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-[72px] z-10 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 min-w-max">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-3 font-medium transition-all border-b-2 flex items-center gap-2 ${
                activeTab === 'dashboard'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-4 py-3 font-medium transition-all border-b-2 flex items-center gap-2 ${
                activeTab === 'transactions'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Transactions</span>
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`px-4 py-3 font-medium transition-all border-b-2 flex items-center gap-2 ${
                activeTab === 'add'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add New</span>
            </button>
            <button
              onClick={() => setActiveTab('budgets')}
              className={`px-4 py-3 font-medium transition-all border-b-2 flex items-center gap-2 ${
                activeTab === 'budgets'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:inline">Budgets</span>
            </button>
            <button
              onClick={() => setActiveTab('recurring')}
              className={`px-4 py-3 font-medium transition-all border-b-2 flex items-center gap-2 ${
                activeTab === 'recurring'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Repeat className="w-4 h-4" />
              <span className="hidden sm:inline">Recurring</span>
            </button>
            <button
              onClick={() => setActiveTab('data')}
              className={`px-4 py-3 font-medium transition-all border-b-2 flex items-center gap-2 ${
                activeTab === 'data'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Data</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <SummaryCards transactions={transactions} />
            <Charts transactions={transactions} />
            
            {transactions.length === 0 && (
              <div className="card text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Welcome to Financial Manager!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Start by adding your first transaction to see your financial data visualized.
                </p>
                <button
                  onClick={() => setActiveTab('add')}
                  className="btn btn-primary"
                >
                  Add Your First Transaction
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="space-y-6">
            <SearchAndFilter 
              transactions={transactions}
              onFilterChange={setFilteredTransactions}
            />
            <TransactionList
              transactions={filteredTransactions}
              onDelete={handleDeleteTransaction}
            />
          </div>
        )}

        {activeTab === 'add' && (
          <TransactionForm
            onAdd={handleAddTransaction}
            onCancel={() => setActiveTab('transactions')}
          />
        )}

        {activeTab === 'budgets' && (
          <BudgetManager
            budgets={budgets}
            transactions={transactions}
            onAddBudget={handleAddBudget}
            onDeleteBudget={handleDeleteBudget}
          />
        )}

        {activeTab === 'recurring' && (
          <RecurringTransactions
            recurring={recurring}
            onAdd={handleAddRecurring}
            onToggle={handleToggleRecurring}
            onDelete={handleDeleteRecurring}
          />
        )}

        {activeTab === 'data' && (
          <DataManagement
            transactions={transactions}
            budgets={budgets}
            recurring={recurring}
            onImport={handleImportData}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
            Financial Manager - Track your finances with ease
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
