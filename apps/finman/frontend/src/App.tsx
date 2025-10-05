import { useState, useEffect, useCallback } from 'react';
import { Transaction, Budget, RecurringTransaction, Item, ItemPurchase, BudgetProgress, Subscription } from './types';
import { transactionsApi } from './api/transactions';
import { budgetsApi } from './api/budgets';
import { recurringApi } from './api/recurring';
import { itemsApi } from './api/items';
import { purchasesApi } from './api/purchases';
import { subscriptionsApi } from './api/subscriptions';
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
import { SyncStatusIndicator, OfflineBanner } from './components/SyncStatus';
import { useAuth } from './contexts/AuthContext';
import { BarChart3, Plus, List, Wallet, Repeat, Download, Package, Bell, Settings, LogOut, User, CreditCard, RefreshCw } from 'lucide-react';
import './index.css';

function App() {
  const { user, logout } = useAuth();
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
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch all data from API
  const fetchAllData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [transactionsData, budgetsData, recurringData, itemsData, purchasesData, subscriptionsData] = await Promise.all([
        transactionsApi.getAll(),
        budgetsApi.getAll(),
        recurringApi.getAll(),
        itemsApi.getAll(),
        purchasesApi.getAll(),
        subscriptionsApi.getAll(),
      ]);
      
      setTransactions(transactionsData as any);
      setFilteredTransactions(transactionsData as any);
      setBudgets(budgetsData as any);
      setRecurring(recurringData as any);
      setItems(itemsData as any);
      setPurchases(purchasesData as any);
      setSubscriptions(subscriptionsData as any);
      
      // Clear localStorage since we're using API mode
      localStorage.removeItem('financial_transactions');
      localStorage.removeItem('financial_budgets');
      localStorage.removeItem('financial_recurring');
      localStorage.removeItem('financial_items');
      localStorage.removeItem('financial_purchases');
    } catch (error: any) {
      console.error('Failed to load data:', error);
      
      // Check if it's an authentication error
      if (error?.status === 401) {
        alert('Your session has expired. Please log in again.');
        logout();
      } else {
        alert(`Failed to sync data from server: ${error?.message || 'Unknown error'}. Please try again.`);
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [logout]);

  // Load initial data from API
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

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

  // Logout handler
  const handleLogout = useCallback(() => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
    }
  }, [logout]);

  const handleAddTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      const newTransaction = await transactionsApi.create(transaction as any);
      setTransactions([...transactions, newTransaction as any]);
      setActiveTab('transactions');
    } catch (error) {
      console.error('Failed to add transaction:', error);
      alert('Failed to add transaction. Please try again.');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      await transactionsApi.delete(id);
      setTransactions(prev => prev.filter((t) => t.id !== id));
      setFilteredTransactions(prev => prev.filter((t) => t.id !== id));
      
      // Optionally refresh all data to ensure sync
      try {
        const updatedTransactions = await transactionsApi.getAll();
        setTransactions(updatedTransactions as any);
        setFilteredTransactions(updatedTransactions as any);
      } catch (refreshError) {
        console.error('Failed to refresh transactions after delete:', refreshError);
      }
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      alert('Failed to delete transaction. Please check your connection and try again.');
      
      // Refresh to ensure we have latest state
      try {
        const updatedTransactions = await transactionsApi.getAll();
        setTransactions(updatedTransactions as any);
        setFilteredTransactions(updatedTransactions as any);
      } catch (refreshError) {
        console.error('Failed to refresh transactions:', refreshError);
      }
    }
  };

  const handleAddBudget = async (budget: Omit<Budget, 'id'>) => {
    try {
      const newBudget = await budgetsApi.create(budget as any);
      setBudgets([...budgets, newBudget as any]);
    } catch (error) {
      console.error('Failed to add budget:', error);
      alert('Failed to add budget. Please try again.');
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if (confirm('Are you sure you want to delete this budget?')) {
      try {
        await budgetsApi.delete(id);
        setBudgets(budgets.filter((b) => b.id !== id));
      } catch (error) {
        console.error('Failed to delete budget:', error);
        alert('Failed to delete budget. Please try again.');
      }
    }
  };

  const handleAddRecurring = async (rec: Omit<RecurringTransaction, 'id'>) => {
    try {
      const newRecurring = await recurringApi.create(rec as any);
      setRecurring([...recurring, newRecurring as any]);
    } catch (error) {
      console.error('Failed to add recurring transaction:', error);
      alert('Failed to add recurring transaction. Please try again.');
    }
  };

  const handleToggleRecurring = async (id: string) => {
    const item = recurring.find(r => r.id === id);
    if (item) {
      try {
        await recurringApi.update(id, { isActive: !item.isActive } as any);
        setRecurring(recurring.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r)));
      } catch (error) {
        console.error('Failed to toggle recurring transaction:', error);
        alert('Failed to toggle recurring transaction. Please try again.');
      }
    }
  };

  const handleDeleteRecurring = async (id: string) => {
    if (confirm('Are you sure you want to delete this recurring transaction?')) {
      try {
        await recurringApi.delete(id);
        setRecurring(recurring.filter((r) => r.id !== id));
      } catch (error) {
        console.error('Failed to delete recurring transaction:', error);
        alert('Failed to delete recurring transaction. Please try again.');
      }
    }
  };

  const handleAddItem = async (item: Omit<Item, 'id'>) => {
    try {
      const newItem = await itemsApi.create(item as any);
      setItems([...items, newItem as any]);
    } catch (error) {
      console.error('Failed to add item:', error);
      alert('Failed to add item. Please try again.');
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await itemsApi.delete(id);
      setItems(items.filter((item) => item.id !== id));
      setPurchases(purchases.filter((purchase) => purchase.itemId !== id));
    } catch (error) {
      console.error('Failed to delete item:', error);
      alert('Failed to delete item. Please try again.');
    }
  };

  // Subscription handlers
  const handleAddSubscription = async (subscription: Omit<Subscription, 'id'>) => {
    try {
      const newSubscription = await subscriptionsApi.create(subscription);
      setSubscriptions([...subscriptions, newSubscription as any]);
    } catch (error) {
      console.error('Failed to add subscription:', error);
    }
  };

  const handleUpdateSubscription = async (id: string, subscription: Partial<Subscription>) => {
    try {
      const updated = await subscriptionsApi.update(id, subscription);
      setSubscriptions(subscriptions.map(s => s.id === id ? updated as any : s));
    } catch (error) {
      console.error('Failed to update subscription:', error);
    }
  };

  const handleDeleteSubscription = async (id: string) => {
    try {
      await subscriptionsApi.delete(id);
      setSubscriptions(subscriptions.filter(s => s.id !== id));
    } catch (error) {
      console.error('Failed to delete subscription:', error);
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
      {/* Offline Banner */}
      <OfflineBanner />
      
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
            
            {/* Sync Status & User Info */}
            <div className="flex items-center gap-4">
              <SyncStatusIndicator />
              
              {/* Refresh/Sync Button */}
              <button
                onClick={fetchAllData}
                disabled={isRefreshing}
                className={`flex items-center gap-2 text-sm px-3 py-1 rounded-lg transition-colors ${
                  isRefreshing 
                    ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title="Refresh all data"
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden lg:inline">{isRefreshing ? 'Syncing...' : 'Sync'}</span>
              </button>
              
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <User className="w-4 h-4" />
                <span>{user?.name || user?.email}</span>
              </div>
              
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
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 px-3 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
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
