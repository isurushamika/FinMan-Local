import { useState, useEffect } from 'react';
import { Transaction, Budget, RecurringTransaction, Item, ItemPurchase, BudgetProgress, Subscription } from './types';
import { 
  loadTransactions, 
  saveTransactions, 
  loadBudgets, 
  saveBudgets, 
  loadRecurring, 
  saveRecurring,
  loadItems,
  saveItems,
  loadPurchases,
  savePurchases
} from './utils/storage';
import { 
  loadNotificationSettings, 
  checkUpcomingBills, 
  checkBudgetAlerts,
  addNotifications,
  getUnreadCount
} from './utils/notifications';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import SummaryCards from './components/SummaryCards';
import Charts from './components/Charts';
import { BudgetManager } from './components/BudgetManager';
import { RecurringTransactions } from './components/RecurringTransactions';
import { Subscriptions } from './components/Subscriptions';
import { SearchAndFilter } from './components/SearchAndFilter';
import { DataManagement } from './components/DataManagement';
import ItemTracker from './components/ItemTracker';
import SettingsComponent from './components/Settings';
import Notifications from './components/Notifications';
import { BarChart3, Plus, List, Wallet, Repeat, Download, Package, Bell, Settings, CreditCard } from 'lucide-react';
import './index.css';

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [purchases, setPurchases] = useState<ItemPurchase[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'add' | 'budgets' | 'recurring' | 'items' | 'subscriptions' | 'settings' | 'data'>('dashboard');
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  // Load initial data from localStorage
  useEffect(() => {
    setTransactions(loadTransactions());
    setBudgets(loadBudgets());
    setRecurring(loadRecurring());
    setItems(loadItems());
    setPurchases(loadPurchases());
    // Load subscriptions from localStorage (using a similar pattern)
    const storedSubs = localStorage.getItem('financial_subscriptions');
    if (storedSubs) {
      setSubscriptions(JSON.parse(storedSubs));
    }
  }, []);

  // Check notifications when data changes
  useEffect(() => {
    const checkNotifications = () => {
      const settings = loadNotificationSettings();
      const newNotifications = [];

      // Check upcoming bills
      const billReminders = checkUpcomingBills(recurring, settings);
      newNotifications.push(...billReminders);

      // Check budget alerts (calculate budget progress first)
      const budgetProgress = calculateBudgetProgress();
      const budgetNotifications = checkBudgetAlerts(budgetProgress, settings);
      newNotifications.push(...budgetNotifications);

      // Add notifications if any
      if (newNotifications.length > 0) {
        addNotifications(newNotifications);
        setUnreadNotifications(getUnreadCount());
      }
    };

    checkNotifications();
  }, [transactions, budgets, recurring]);

  // Update unread count when active tab changes to notifications
  useEffect(() => {
    if (showNotifications) {
      setUnreadNotifications(getUnreadCount());
    }
  }, [showNotifications]);

  // Calculate budget progress helper
  const calculateBudgetProgress = (): BudgetProgress[] => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return budgets.map(budget => {
      const spent = transactions
        .filter(t => {
          const tDate = new Date(t.date);
          if (budget.period === 'monthly') {
            return (
              t.type === 'expense' &&
              t.category === budget.category &&
              tDate.getMonth() === currentMonth &&
              tDate.getFullYear() === currentYear
            );
          } else {
            return (
              t.type === 'expense' &&
              t.category === budget.category &&
              tDate.getFullYear() === currentYear
            );
          }
        })
        .reduce((sum, t) => sum + t.amount, 0);

      const remaining = budget.amount - spent;
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      const status: 'safe' | 'warning' | 'exceeded' = 
        percentage >= 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'safe';

      return {
        category: budget.category,
        budgeted: budget.amount,
        spent,
        remaining,
        percentage,
        status
      };
    });
  };

  // Update filtered transactions when transactions change
  useEffect(() => {
    setFilteredTransactions(transactions);
  }, [transactions]);

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
    const updated = [...transactions, newTransaction];
    setTransactions(updated);
    saveTransactions(updated);
    setActiveTab('transactions');
  };

  const handleDeleteTransaction = (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    setFilteredTransactions(prev => prev.filter((t) => t.id !== id));
    saveTransactions(updated);
  };

  const handleAddBudget = (budget: Omit<Budget, 'id'>) => {
    const newBudget: Budget = {
      ...budget,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    const updated = [...budgets, newBudget];
    setBudgets(updated);
    saveBudgets(updated);
  };

  const handleDeleteBudget = (id: string) => {
    if (confirm('Are you sure you want to delete this budget?')) {
      const updated = budgets.filter((b) => b.id !== id);
      setBudgets(updated);
      saveBudgets(updated);
    }
  };

  const handleAddRecurring = (rec: Omit<RecurringTransaction, 'id'>) => {
    const newRecurring: RecurringTransaction = {
      ...rec,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    const updated = [...recurring, newRecurring];
    setRecurring(updated);
    saveRecurring(updated);
  };

  const handleToggleRecurring = (id: string) => {
    const updated = recurring.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r));
    setRecurring(updated);
    saveRecurring(updated);
  };

  const handleDeleteRecurring = (id: string) => {
    if (confirm('Are you sure you want to delete this recurring transaction?')) {
      const updated = recurring.filter((r) => r.id !== id);
      setRecurring(updated);
      saveRecurring(updated);
    }
  };

  const handleAddItem = (item: Omit<Item, 'id'>) => {
    const newItem: Item = {
      ...item,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    const updated = [...items, newItem];
    setItems(updated);
    saveItems(updated);
  };

  const handleDeleteItem = (id: string) => {
    const updatedItems = items.filter((item) => item.id !== id);
    const updatedPurchases = purchases.filter((purchase) => purchase.itemId !== id);
    setItems(updatedItems);
    setPurchases(updatedPurchases);
    saveItems(updatedItems);
    savePurchases(updatedPurchases);
  };

  // Subscription handlers
  const handleAddSubscription = (subscription: Omit<Subscription, 'id'>) => {
    const newSubscription: Subscription = {
      ...subscription,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    const updated = [...subscriptions, newSubscription];
    setSubscriptions(updated);
    localStorage.setItem('financial_subscriptions', JSON.stringify(updated));
  };

  const handleUpdateSubscription = (id: string, subscription: Partial<Subscription>) => {
    const updated = subscriptions.map(s => s.id === id ? { ...s, ...subscription } : s);
    setSubscriptions(updated);
    localStorage.setItem('financial_subscriptions', JSON.stringify(updated));
  };

  const handleDeleteSubscription = (id: string) => {
    const updated = subscriptions.filter(s => s.id !== id);
    setSubscriptions(updated);
    localStorage.setItem('financial_subscriptions', JSON.stringify(updated));
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
                FinMan - Personal Finance Manager
              </h1>
            </div>
            
            {/* User Actions */}
            <div className="flex items-center gap-4">
              {/* Notification Bell */}
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Notification Popup Panel */}
      {showNotifications && (
        <div className="fixed top-[72px] right-4 w-96 max-h-[80vh] bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ×
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <Notifications />
          </div>
        </div>
      )}

      {/* Click outside to close notification panel */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowNotifications(false)}
        />
      )}

      {/* Navigation Tabs */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-[72px] z-10 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 min-w-max">
            {/* Overview Section */}
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

            {/* Divider */}
            <div className="border-l border-gray-300 dark:border-gray-600 mx-2"></div>

            {/* Transactions Section */}
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

            {/* Divider */}
            <div className="border-l border-gray-300 dark:border-gray-600 mx-2"></div>

            {/* Planning Section */}
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
              onClick={() => setActiveTab('subscriptions')}
              className={`px-4 py-3 font-medium transition-all border-b-2 flex items-center gap-2 ${
                activeTab === 'subscriptions'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Subscriptions</span>
            </button>

            {/* Divider */}
            <div className="border-l border-gray-300 dark:border-gray-600 mx-2"></div>

            {/* Tracking Section */}
            <button
              onClick={() => setActiveTab('items')}
              className={`px-4 py-3 font-medium transition-all border-b-2 flex items-center gap-2 ${
                activeTab === 'items'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Price Tracker</span>
            </button>

            {/* Divider */}
            <div className="border-l border-gray-300 dark:border-gray-600 mx-2"></div>

            {/* Settings (Security + Notifications) */}
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-3 font-medium transition-all border-b-2 flex items-center gap-2 ${
                activeTab === 'settings'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </button>

            {/* Data Management */}
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

        {activeTab === 'items' && (
          <ItemTracker
            items={items}
            purchases={purchases}
            onAddItem={handleAddItem}
            onDeleteItem={handleDeleteItem}
          />
        )}

        {activeTab === 'settings' && <SettingsComponent />}

        {activeTab === 'subscriptions' && (
          <Subscriptions
            subscriptions={subscriptions}
            onAdd={handleAddSubscription}
            onUpdate={handleUpdateSubscription}
            onDelete={handleDeleteSubscription}
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
