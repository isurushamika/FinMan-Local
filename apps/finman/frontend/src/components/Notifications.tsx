import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Trash2, Check, AlertTriangle, Clock, TrendingUp, X } from 'lucide-react';
import { Notification } from '../types';
import {
  getSortedNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  cleanupOldNotifications
} from '../utils/notifications';
import { format, parseISO } from 'date-fns';

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadNotifications();
    // Cleanup old notifications on mount
    cleanupOldNotifications();
  }, []);

  const loadNotifications = () => {
    const allNotifications = getSortedNotifications();
    setNotifications(allNotifications);
  };

  const handleMarkAsRead = (id: string) => {
    markNotificationAsRead(id);
    loadNotifications();
  };

  const handleMarkAllAsRead = () => {
    markAllNotificationsAsRead();
    loadNotifications();
  };

  const handleDelete = (id: string) => {
    deleteNotification(id);
    loadNotifications();
  };

  const getNotificationIcon = (type: string, priority: string) => {
    if (type === 'bill_reminder') {
      return <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
    }
    if (type === 'budget_alert') {
      return priority === 'high' ? (
        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
      ) : (
        <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
      );
    }
    return <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />;
  };

  const getPriorityBorderColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      default:
        return 'border-l-blue-500';
    }
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Notifications
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="btn btn-secondary text-sm flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'all'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'unread'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              {filter === 'unread' ? (
                <BellOff className="w-8 h-8 text-gray-400" />
              ) : (
                <Bell className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filter === 'unread' 
                ? 'You\'re all caught up!' 
                : 'Notifications about bills, budgets, and spending will appear here'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border-l-4 ${getPriorityBorderColor(notification.priority)} ${
                !notification.read ? 'ring-2 ring-blue-100 dark:ring-blue-900/30' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                  {getNotificationIcon(notification.type, notification.priority)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className={`font-semibold ${
                      !notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {notification.title}
                    </h3>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        title="Delete"
                      >
                        <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                  </div>

                  <p className={`text-sm mb-2 ${
                    !notification.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-500'
                  }`}>
                    {notification.message}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>{format(parseISO(notification.date), 'MMM d, yyyy h:mm a')}</span>
                    <span className="capitalize">{notification.type.replace('_', ' ')}</span>
                    {notification.priority === 'high' && (
                      <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full font-medium">
                        High Priority
                      </span>
                    )}
                  </div>

                  {/* Additional Data Display */}
                  {notification.data && notification.type === 'spending_summary' && (
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400 block">Income</span>
                          <span className="text-green-600 dark:text-green-400 font-semibold">
                            LKR {notification.data.income.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400 block">Expenses</span>
                          <span className="text-red-600 dark:text-red-400 font-semibold">
                            LKR {notification.data.expenses.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400 block">Balance</span>
                          <span className={`font-semibold ${
                            notification.data.balance >= 0 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            LKR {notification.data.balance.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {notification.data && notification.type === 'budget_alert' && (
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          {notification.data.category}
                        </span>
                        <div className="flex items-center gap-4">
                          <span className="text-gray-600 dark:text-gray-400">
                            {notification.data.spent.toLocaleString()} / {notification.data.budgeted.toLocaleString()} LKR
                          </span>
                          <span className={`font-semibold ${
                            notification.data.percentage >= 100 
                              ? 'text-red-600 dark:text-red-400'
                              : notification.data.percentage >= 90
                              ? 'text-yellow-600 dark:text-yellow-400'
                              : 'text-blue-600 dark:text-blue-400'
                          }`}>
                            {notification.data.percentage.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Clear All Button */}
      {notifications.length > 0 && (
        <div className="flex justify-center pt-4">
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete all notifications?')) {
                notifications.forEach(n => deleteNotification(n.id));
                loadNotifications();
              }
            }}
            className="btn btn-secondary text-sm flex items-center gap-2 text-gray-600 dark:text-gray-400"
          >
            <Trash2 className="w-4 h-4" />
            Clear All Notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default Notifications;
