// Notification Management Utilities
import { 
  Notification, 
  NotificationSettings, 
  Transaction, 
  RecurringTransaction, 
  BudgetProgress 
} from '../types';
import { format, parseISO, differenceInDays, startOfDay, endOfDay, startOfWeek, endOfWeek, isAfter, isBefore, addDays } from 'date-fns';

const STORAGE_KEY = 'finman_notifications';
const SETTINGS_KEY = 'finman_notification_settings';

/**
 * Get default notification settings
 */
export function getDefaultNotificationSettings(): NotificationSettings {
  return {
    billReminders: {
      enabled: true,
      daysBefore: 3,
      time: '09:00'
    },
    budgetAlerts: {
      enabled: true,
      thresholdPercentage: 80,
      warningPercentage: 90
    },
    spendingSummary: {
      enabled: true,
      frequency: 'weekly',
      time: '18:00',
      dayOfWeek: 0 // Sunday
    }
  };
}

/**
 * Load notification settings from localStorage
 */
export function loadNotificationSettings(): NotificationSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load notification settings:', error);
  }
  return getDefaultNotificationSettings();
}

/**
 * Save notification settings to localStorage
 */
export function saveNotificationSettings(settings: NotificationSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save notification settings:', error);
  }
}

/**
 * Load notifications from localStorage
 */
export function loadNotifications(): Notification[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load notifications:', error);
  }
  return [];
}

/**
 * Save notifications to localStorage
 */
export function saveNotifications(notifications: Notification[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  } catch (error) {
    console.error('Failed to save notifications:', error);
  }
}

/**
 * Generate unique notification ID
 */
function generateNotificationId(type: string, data: string): string {
  return `${type}_${data}_${Date.now()}`;
}

/**
 * Check for upcoming bills and generate reminders
 */
export function checkUpcomingBills(
  recurringTransactions: RecurringTransaction[],
  settings: NotificationSettings
): Notification[] {
  if (!settings.billReminders.enabled) {
    return [];
  }

  const notifications: Notification[] = [];
  const today = startOfDay(new Date());

  // Filter for expense recurring transactions (bills)
  const bills = recurringTransactions.filter(
    rt => rt.type === 'expense' && rt.isActive
  );

  bills.forEach(bill => {
    // Calculate next due date based on frequency
    const startDate = parseISO(bill.startDate);
    const lastGen = bill.lastGenerated ? parseISO(bill.lastGenerated) : startDate;
    
    let nextDueDate: Date;
    
    switch (bill.frequency) {
      case 'daily':
        nextDueDate = addDays(lastGen, 1);
        break;
      case 'weekly':
        nextDueDate = addDays(lastGen, 7);
        break;
      case 'monthly':
        const nextMonth = new Date(lastGen);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        nextDueDate = nextMonth;
        break;
      case 'yearly':
        const nextYear = new Date(lastGen);
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        nextDueDate = nextYear;
        break;
    }

    // Check if bill is due within reminder window
    const daysUntilDue = differenceInDays(nextDueDate, today);
    
    if (daysUntilDue >= 0 && daysUntilDue <= settings.billReminders.daysBefore) {
      const notification: Notification = {
        id: generateNotificationId('bill', bill.id),
        type: 'bill_reminder',
        title: '💳 Upcoming Bill Reminder',
        message: `${bill.description} (LKR ${bill.amount.toLocaleString()}) is due ${
          daysUntilDue === 0 ? 'today' : 
          daysUntilDue === 1 ? 'tomorrow' : 
          `in ${daysUntilDue} days`
        }`,
        priority: daysUntilDue === 0 ? 'high' : daysUntilDue === 1 ? 'medium' : 'low',
        date: new Date().toISOString(),
        read: false,
        data: {
          billId: bill.id,
          dueDate: nextDueDate.toISOString(),
          amount: bill.amount,
          category: bill.category
        }
      };
      notifications.push(notification);
    }
  });

  return notifications;
}

/**
 * Check budgets and generate alerts when thresholds are exceeded
 */
export function checkBudgetAlerts(
  budgets: BudgetProgress[],
  settings: NotificationSettings
): Notification[] {
  if (!settings.budgetAlerts.enabled) {
    return [];
  }

  const notifications: Notification[] = [];

  budgets.forEach(budget => {
    const percentage = budget.percentage;

    // Check if exceeded
    if (percentage >= 100) {
      const notification: Notification = {
        id: generateNotificationId('budget_exceeded', budget.category),
        type: 'budget_alert',
        title: '🚨 Budget Exceeded!',
        message: `You've spent LKR ${budget.spent.toLocaleString()} of your LKR ${budget.budgeted.toLocaleString()} budget for ${budget.category} (${percentage.toFixed(0)}%)`,
        priority: 'high',
        date: new Date().toISOString(),
        read: false,
        data: {
          category: budget.category,
          budgeted: budget.budgeted,
          spent: budget.spent,
          percentage
        }
      };
      notifications.push(notification);
    }
    // Check warning threshold
    else if (percentage >= settings.budgetAlerts.warningPercentage) {
      const notification: Notification = {
        id: generateNotificationId('budget_warning', budget.category),
        type: 'budget_alert',
        title: '⚠️ Budget Warning',
        message: `You've used ${percentage.toFixed(0)}% of your ${budget.category} budget. LKR ${budget.remaining.toLocaleString()} remaining.`,
        priority: 'medium',
        date: new Date().toISOString(),
        read: false,
        data: {
          category: budget.category,
          budgeted: budget.budgeted,
          spent: budget.spent,
          remaining: budget.remaining,
          percentage
        }
      };
      notifications.push(notification);
    }
    // Check alert threshold
    else if (percentage >= settings.budgetAlerts.thresholdPercentage) {
      const notification: Notification = {
        id: generateNotificationId('budget_alert', budget.category),
        type: 'budget_alert',
        title: '📊 Budget Alert',
        message: `You've reached ${percentage.toFixed(0)}% of your ${budget.category} budget. LKR ${budget.remaining.toLocaleString()} remaining.`,
        priority: 'low',
        date: new Date().toISOString(),
        read: false,
        data: {
          category: budget.category,
          budgeted: budget.budgeted,
          spent: budget.spent,
          remaining: budget.remaining,
          percentage
        }
      };
      notifications.push(notification);
    }
  });

  return notifications;
}

/**
 * Generate spending summary notification
 */
export function generateSpendingSummary(
  transactions: Transaction[],
  settings: NotificationSettings
): Notification | null {
  if (!settings.spendingSummary.enabled) {
    return null;
  }

  const now = new Date();
  let startDate: Date;
  let endDate: Date;
  let period: string;

  if (settings.spendingSummary.frequency === 'daily') {
    startDate = startOfDay(now);
    endDate = endOfDay(now);
    period = 'Today';
  } else {
    // Weekly
    const dayOfWeek = (settings.spendingSummary.dayOfWeek || 0) as 0 | 1 | 2 | 3 | 4 | 5 | 6;
    startDate = startOfWeek(now, { weekStartsOn: dayOfWeek });
    endDate = endOfWeek(now, { weekStartsOn: dayOfWeek });
    period = 'This Week';
  }

  // Filter transactions for the period
  const periodTransactions = transactions.filter(t => {
    const txDate = parseISO(t.date);
    return isAfter(txDate, startDate) && isBefore(txDate, endDate);
  });

  const income = periodTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = periodTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expenses;

  // Calculate top spending category
  const categorySpending: { [key: string]: number } = {};
  periodTransactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
    });

  const topCategory = Object.entries(categorySpending)
    .sort(([, a], [, b]) => b - a)[0];

  const notification: Notification = {
    id: generateNotificationId('summary', period),
    type: 'spending_summary',
    title: `📈 ${period}'s Summary`,
    message: `Income: LKR ${income.toLocaleString()} | Expenses: LKR ${expenses.toLocaleString()} | Balance: LKR ${balance.toLocaleString()}${
      topCategory ? ` | Top spending: ${topCategory[0]} (LKR ${topCategory[1].toLocaleString()})` : ''
    }`,
    priority: 'low',
    date: new Date().toISOString(),
    read: false,
    data: {
      period,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      income,
      expenses,
      balance,
      transactionCount: periodTransactions.length,
      topCategory: topCategory ? topCategory[0] : null,
      topCategoryAmount: topCategory ? topCategory[1] : 0
    }
  };

  return notification;
}

/**
 * Check if it's time to send a spending summary
 */
export function shouldSendSpendingSummary(
  settings: NotificationSettings,
  lastSummaryDate?: string
): boolean {
  if (!settings.spendingSummary.enabled) {
    return false;
  }

  const now = new Date();
  const currentTime = format(now, 'HH:mm');
  
  // Check if current time matches settings time
  if (currentTime !== settings.spendingSummary.time) {
    return false;
  }

  // Check if summary was already sent today
  if (lastSummaryDate) {
    const lastSent = parseISO(lastSummaryDate);
    if (differenceInDays(now, lastSent) === 0) {
      return false;
    }
  }

  // For weekly summaries, check day of week
  if (settings.spendingSummary.frequency === 'weekly') {
    const currentDay = now.getDay();
    return currentDay === (settings.spendingSummary.dayOfWeek || 0);
  }

  return true;
}

/**
 * Add notification
 */
export function addNotification(notification: Notification): void {
  const notifications = loadNotifications();
  
  // Check if similar notification already exists (prevent duplicates)
  const exists = notifications.some(n => 
    n.type === notification.type && 
    n.title === notification.title &&
    differenceInDays(new Date(), parseISO(n.date)) === 0
  );

  if (!exists) {
    notifications.push(notification);
    saveNotifications(notifications);
  }
}

/**
 * Add multiple notifications
 */
export function addNotifications(newNotifications: Notification[]): void {
  const notifications = loadNotifications();
  
  newNotifications.forEach(newNotif => {
    // Check for duplicates
    const exists = notifications.some(n => 
      n.type === newNotif.type && 
      n.title === newNotif.title &&
      differenceInDays(new Date(), parseISO(n.date)) === 0
    );

    if (!exists) {
      notifications.push(newNotif);
    }
  });

  saveNotifications(notifications);
}

/**
 * Mark notification as read
 */
export function markNotificationAsRead(notificationId: string): void {
  const notifications = loadNotifications();
  const notification = notifications.find(n => n.id === notificationId);
  
  if (notification) {
    notification.read = true;
    saveNotifications(notifications);
  }
}

/**
 * Mark all notifications as read
 */
export function markAllNotificationsAsRead(): void {
  const notifications = loadNotifications();
  notifications.forEach(n => n.read = true);
  saveNotifications(notifications);
}

/**
 * Delete notification
 */
export function deleteNotification(notificationId: string): void {
  const notifications = loadNotifications();
  const filtered = notifications.filter(n => n.id !== notificationId);
  saveNotifications(filtered);
}

/**
 * Delete old notifications (older than 30 days)
 */
export function cleanupOldNotifications(): void {
  const notifications = loadNotifications();
  const now = new Date();
  const filtered = notifications.filter(n => {
    const notifDate = parseISO(n.date);
    return differenceInDays(now, notifDate) <= 30;
  });
  saveNotifications(filtered);
}

/**
 * Get unread notification count
 */
export function getUnreadCount(): number {
  const notifications = loadNotifications();
  return notifications.filter(n => !n.read).length;
}

/**
 * Get notifications sorted by priority and date
 */
export function getSortedNotifications(): Notification[] {
  const notifications = loadNotifications();
  
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  
  return notifications.sort((a, b) => {
    // First by read status (unread first)
    if (a.read !== b.read) {
      return a.read ? 1 : -1;
    }
    // Then by priority
    if (a.priority !== b.priority) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    // Finally by date (newest first)
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}
