import { useState, useEffect, useCallback } from 'react';
import { Transaction, Budget, RecurringTransaction, Item, ItemPurchase, BudgetProgress } from './types';
import { transactionsApi } from './api/transactions';
import { budgetsApi } from './api/budgets';
import { recurringApi } from './api/recurring';
import { itemsApi } from './api/items';
import { purchasesApi } from './api/purchases';
import { loadTransactions, saveTransactions, loadBudgets, saveBudgets, loadRecurring, saveRecurring, loadItems, saveItems, loadPurchases, savePurchases } from './utils/storage';
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
import { SearchAndFilter } from './components/SearchAndFilter';
import { DataManagement } from './components/DataManagement';
import ItemTracker from './components/ItemTracker';
import SecuritySettings from './components/SecuritySettings';
import Notifications from './components/Notifications';
import NotificationSettingsComponent from './components/NotificationSettings';
import { SyncStatusIndicator, OfflineBanner } from './components/SyncStatus';
import { useAuth } from './contexts/AuthContext';
import { BarChart3, Plus, List, Wallet, Repeat, Download, Package, Shield, Bell, Settings, LogOut, User } from 'lucide-react';
import './index.css';

function App() {
  const { user, logout } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [purchases, setPurchases] = useState<ItemPurchase[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'add' | 'budgets' | 'recurring' | 'items' | 'security' | 'notifications' | 'notification-settings' | 'data'>('dashboard');
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Load initial data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [transactionsData, budgetsData, recurringData, itemsData, purchasesData] = await Promise.all([
          transactionsApi.getAll(),
          budgetsApi.getAll(),
          recurringApi.getAll(),
          itemsApi.getAll(),
          purchasesApi.getAll(),
        ]);
        
        setTransactions(transactionsData as any);
        setFilteredTransactions(transactionsData as any);
        setBudgets(budgetsData as any);
        setRecurring(recurringData as any);
        setItems(itemsData as any);
        setPurchases(purchasesData as any);
      } catch (error) {
        console.error('Failed to load data:', error);
        // Fallback to local storage if API fails
        const loaded = loadTransactions();
        setTransactions(loaded);
        setFilteredTransactions(loaded);
        setBudgets(loadBudgets());
        setRecurring(loadRecurring());
        setItems(loadItems());
        setPurchases(loadPurchases());
      }
    };

    fetchData();
    
    // Load unread notification count
    setUnreadNotifications(getUnreadCount());
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
    if (activeTab === 'notifications' || activeTab === 'notification-settings') {
      setUnreadNotifications(getUnreadCount());
    }
  }, [activeTab]);

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

  useEffect(() => {
    saveItems(items);
  }, [items]);

  useEffect(() => {
    savePurchases(purchases);
  }, [purchases]);

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
    if (confirm('Are you sure you want to delete this transaction?')) {
      try {
        await transactionsApi.delete(id);
        setTransactions(transactions.filter((t) => t.id !== id));
      } catch (error) {
        console.error('Failed to delete transaction:', error);
        alert('Failed to delete transaction. Please try again.');
      }
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

  const handleAddItem = (item: Omit<Item, 'id'>) => {
    const newItem: Item = {
      ...item,
      id: Date.now().toString(),
    };
    setItems([...items, newItem]);
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
    setPurchases(purchases.filter((purchase) => purchase.itemId !== id));
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
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <User className="w-4 h-4" />
                <span>{user?.name || user?.email}</span>
              </div>
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

            {/* Notifications */}
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-4 py-3 font-medium transition-all border-b-2 flex items-center gap-2 relative ${
                activeTab === 'notifications'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </button>

            {/* Notification Settings */}
            <button
              onClick={() => setActiveTab('notification-settings')}
              className={`px-4 py-3 font-medium transition-all border-b-2 flex items-center gap-2 ${
                activeTab === 'notification-settings'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
              title="Notification Settings"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Notif. Settings</span>
            </button>

            {/* Security */}
            <button
              onClick={() => setActiveTab('security')}
              className={`px-4 py-3 font-medium transition-all border-b-2 flex items-center gap-2 ${
                activeTab === 'security'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Security</span>
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

        {activeTab === 'notifications' && <Notifications />}

        {activeTab === 'notification-settings' && <NotificationSettingsComponent />}

        {activeTab === 'security' && <SecuritySettings />}

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
