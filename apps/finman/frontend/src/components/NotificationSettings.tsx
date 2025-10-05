import React, { useState } from 'react';
import { Clock, DollarSign, TrendingUp, Save, AlertCircle } from 'lucide-react';
import { NotificationSettings } from '../types';
import { loadNotificationSettings, saveNotificationSettings } from '../utils/notifications';

const NotificationSettingsComponent: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettings>(loadNotificationSettings());
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    saveNotificationSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Notification Settings
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Configure when and how you receive notifications about your finances
        </p>
      </div>

      {/* Bill Reminders */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Bill Reminders
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Get notified before your recurring bills are due
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.billReminders.enabled}
              onChange={(e) => setSettings({
                ...settings,
                billReminders: { ...settings.billReminders, enabled: e.target.checked }
              })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {settings.billReminders.enabled && (
          <div className="ml-13 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Remind me how many days before due date?
              </label>
              <select
                value={settings.billReminders.daysBefore}
                onChange={(e) => setSettings({
                  ...settings,
                  billReminders: { ...settings.billReminders, daysBefore: parseInt(e.target.value) }
                })}
                className="input w-full max-w-xs"
              >
                <option value="1">1 day before</option>
                <option value="2">2 days before</option>
                <option value="3">3 days before</option>
                <option value="5">5 days before</option>
                <option value="7">1 week before</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reminder time
              </label>
              <input
                type="time"
                value={settings.billReminders.time}
                onChange={(e) => setSettings({
                  ...settings,
                  billReminders: { ...settings.billReminders, time: e.target.value }
                })}
                className="input w-full max-w-xs"
              />
            </div>
          </div>
        )}
      </div>

      {/* Budget Alerts */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Budget Alerts
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Get notified when you're approaching or exceeding your budget
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.budgetAlerts.enabled}
              onChange={(e) => setSettings({
                ...settings,
                budgetAlerts: { ...settings.budgetAlerts, enabled: e.target.checked }
              })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {settings.budgetAlerts.enabled && (
          <div className="ml-13 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Alert when spending reaches
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="50"
                  max="95"
                  step="5"
                  value={settings.budgetAlerts.thresholdPercentage}
                  onChange={(e) => setSettings({
                    ...settings,
                    budgetAlerts: { ...settings.budgetAlerts, thresholdPercentage: parseInt(e.target.value) }
                  })}
                  className="flex-1"
                />
                <span className="text-lg font-semibold text-gray-900 dark:text-white w-16 text-right">
                  {settings.budgetAlerts.thresholdPercentage}%
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                You'll get an alert when you reach this percentage of your budget
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Warning when spending reaches
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="80"
                  max="100"
                  step="5"
                  value={settings.budgetAlerts.warningPercentage}
                  onChange={(e) => setSettings({
                    ...settings,
                    budgetAlerts: { ...settings.budgetAlerts, warningPercentage: parseInt(e.target.value) }
                  })}
                  className="flex-1"
                />
                <span className="text-lg font-semibold text-gray-900 dark:text-white w-16 text-right">
                  {settings.budgetAlerts.warningPercentage}%
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                You'll get a stronger warning at this percentage
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Spending Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Spending Summary
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Receive periodic summaries of your income and expenses
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.spendingSummary.enabled}
              onChange={(e) => setSettings({
                ...settings,
                spendingSummary: { ...settings.spendingSummary, enabled: e.target.checked }
              })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {settings.spendingSummary.enabled && (
          <div className="ml-13 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Summary frequency
              </label>
              <select
                value={settings.spendingSummary.frequency}
                onChange={(e) => setSettings({
                  ...settings,
                  spendingSummary: { ...settings.spendingSummary, frequency: e.target.value as 'daily' | 'weekly' }
                })}
                className="input w-full max-w-xs"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>

            {settings.spendingSummary.frequency === 'weekly' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Day of week
                </label>
                <select
                  value={settings.spendingSummary.dayOfWeek || 0}
                  onChange={(e) => setSettings({
                    ...settings,
                    spendingSummary: { ...settings.spendingSummary, dayOfWeek: parseInt(e.target.value) }
                  })}
                  className="input w-full max-w-xs"
                >
                  <option value="0">Sunday</option>
                  <option value="1">Monday</option>
                  <option value="2">Tuesday</option>
                  <option value="3">Wednesday</option>
                  <option value="4">Thursday</option>
                  <option value="5">Friday</option>
                  <option value="6">Saturday</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Summary time
              </label>
              <input
                type="time"
                value={settings.spendingSummary.time}
                onChange={(e) => setSettings({
                  ...settings,
                  spendingSummary: { ...settings.spendingSummary, time: e.target.value }
                })}
                className="input w-full max-w-xs"
              />
            </div>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-semibold mb-1">About Notifications</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Notifications are checked when you use the app</li>
              <li>Bill reminders are based on your recurring transactions</li>
              <li>Budget alerts appear when you add or edit transactions</li>
              <li>Spending summaries show your financial activity for the period</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleSave}
          className="btn btn-primary flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save Settings
        </button>

        {saved && (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-medium">Settings saved!</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationSettingsComponent;
