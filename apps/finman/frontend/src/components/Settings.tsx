import React, { useState } from 'react';
import { Shield, Lock, Eye, EyeOff, Clock, Fingerprint, AlertCircle, CheckCircle, Key, Bell, DollarSign, TrendingUp, Save } from 'lucide-react';
import { SecuritySettings as SecuritySettingsType, NotificationSettings as NotificationSettingsType } from '../types';
import { loadUser, updateSecuritySettings, updateUser } from '../utils/auth';
import { hashPassword, verifyPassword, validatePasswordStrength, generateSalt } from '../utils/encryption';
import { loadNotificationSettings, saveNotificationSettings } from '../utils/notifications';
import { SyncStatusIndicator } from './SyncStatus';

const Settings: React.FC = () => {
  const user = loadUser();
  const [activeSection, setActiveSection] = useState<'security' | 'notifications'>('security');
  
  // Security Settings State
  const [securitySettings, setSecuritySettings] = useState<SecuritySettingsType>(
    user?.securitySettings || {
      autoLockEnabled: true,
      autoLockTimeout: 5,
      biometricEnabled: false,
      encryptionEnabled: true,
      requirePasswordOnStartup: true,
    }
  );

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettingsType>(loadNotificationSettings());
  const [notifSaved, setNotifSaved] = useState(false);

  const newPasswordStrength = validatePasswordStrength(newPassword);

  const handleSecuritySettingChange = (key: keyof SecuritySettingsType, value: boolean | number) => {
    const newSettings = { ...securitySettings, [key]: value };
    setSecuritySettings(newSettings);
    updateSecuritySettings(newSettings);
    setMessage({ type: 'success', text: 'Settings updated successfully' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setMessage(null);

    try {
      // Verify current password
      const isValid = await verifyPassword(currentPassword, user.salt, user.passwordHash);
      if (!isValid) {
        throw new Error('Current password is incorrect');
      }

      // Validate new password
      if (newPassword !== confirmPassword) {
        throw new Error('New passwords do not match');
      }

      if (!newPasswordStrength.isValid) {
        throw new Error('New password does not meet security requirements');
      }

      // Hash new password
      const newSalt = generateSalt();
      const newPasswordHash = await hashPassword(newPassword, newSalt);

      // Update user
      const updatedUser = {
        ...user,
        passwordHash: newPasswordHash,
        salt: newSalt,
      };
      updateUser(updatedUser);

      setMessage({ type: 'success', text: 'Password changed successfully' });
      setShowChangePassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to change password',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotificationSettings = () => {
    saveNotificationSettings(notificationSettings);
    setNotifSaved(true);
    setTimeout(() => setNotifSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Settings
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Manage your security and notification preferences
        </p>
      </div>

      {/* Sync Status */}
      <div className="card p-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Sync Status
        </h3>
        <SyncStatusIndicator />
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveSection('security')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeSection === 'security'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Shield className="w-4 h-4 inline mr-2" />
          Security
        </button>
        <button
          onClick={() => setActiveSection('notifications')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeSection === 'notifications'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Bell className="w-4 h-4 inline mr-2" />
          Notifications
        </button>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`rounded-lg p-4 flex items-start gap-2 ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          )}
          <p
            className={`text-sm ${
              message.type === 'success'
                ? 'text-green-700 dark:text-green-300'
                : 'text-red-700 dark:text-red-300'
            }`}
          >
            {message.text}
          </p>
        </div>
      )}

      {/* Security Section */}
      {activeSection === 'security' && (
        <div className="space-y-6">
          {/* Security Settings */}
          <div className="card space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Protection Features
            </h3>

            {/* Encryption */}
            <div className="flex items-start justify-between py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Key className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <h4 className="font-medium text-gray-800 dark:text-white">Data Encryption</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Encrypt sensitive financial data using AES-256
                </p>
              </div>
              <button
                onClick={() => handleSecuritySettingChange('encryptionEnabled', !securitySettings.encryptionEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  securitySettings.encryptionEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    securitySettings.encryptionEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Auto-Lock */}
            <div className="py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <h4 className="font-medium text-gray-800 dark:text-white">Auto-Lock</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Automatically lock app after period of inactivity
                  </p>
                </div>
                <button
                  onClick={() => handleSecuritySettingChange('autoLockEnabled', !securitySettings.autoLockEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    securitySettings.autoLockEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      securitySettings.autoLockEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {securitySettings.autoLockEnabled && (
                <div>
                  <label className="label text-sm">Timeout (minutes)</label>
                  <select
                    value={securitySettings.autoLockTimeout}
                    onChange={(e) => handleSecuritySettingChange('autoLockTimeout', parseInt(e.target.value))}
                    className="input"
                  >
                    <option value="1">1 minute</option>
                    <option value="5">5 minutes</option>
                    <option value="10">10 minutes</option>
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                  </select>
                </div>
              )}
            </div>

            {/* Biometric Auth */}
            <div className="flex items-start justify-between py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Fingerprint className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <h4 className="font-medium text-gray-800 dark:text-white">Biometric Authentication</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Use fingerprint or face recognition to unlock
                </p>
              </div>
              <button
                onClick={() => handleSecuritySettingChange('biometricEnabled', !securitySettings.biometricEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  securitySettings.biometricEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    securitySettings.biometricEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Require Password on Startup */}
            <div className="flex items-start justify-between py-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Lock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <h4 className="font-medium text-gray-800 dark:text-white">Require Password on Startup</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Always ask for password when app starts
                </p>
              </div>
              <button
                onClick={() => handleSecuritySettingChange('requirePasswordOnStartup', !securitySettings.requirePasswordOnStartup)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  securitySettings.requirePasswordOnStartup ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    securitySettings.requirePasswordOnStartup ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Change Password */}
          <div className="card">
            <button
              onClick={() => setShowChangePassword(!showChangePassword)}
              className="w-full text-left flex items-center justify-between"
            >
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <Key className="w-5 h-5" />
                Change Password
              </h3>
              <span className="text-gray-600 dark:text-gray-400">
                {showChangePassword ? '−' : '+'}
              </span>
            </button>

            {showChangePassword && (
              <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
                <div>
                  <label className="label">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="input pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(!showPasswords)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      {showPasswords ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="label">New Password</label>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input"
                    required
                  />
                  {newPassword && (
                    <div className="mt-2 space-y-1 text-xs text-gray-600 dark:text-gray-400">
                      {newPasswordStrength.messages.length === 0 ? (
                        <div className="text-green-600 dark:text-green-400">
                          ✓ Password meets all requirements
                        </div>
                      ) : (
                        newPasswordStrength.messages.map((msg, idx) => (
                          <div key={idx} className="text-red-600 dark:text-red-400">
                            • {msg}
                          </div>
                        ))
                      )}
                      <div className="mt-1 text-gray-500">
                        Strength: <span className={`font-medium ${
                          newPasswordStrength.strength === 'strong' ? 'text-green-600' :
                          newPasswordStrength.strength === 'medium' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>{newPasswordStrength.strength}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="label">Confirm New Password</label>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input"
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading || !newPasswordStrength.isValid}
                    className="btn-primary"
                  >
                    {loading ? 'Changing...' : 'Change Password'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowChangePassword(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Notifications Section */}
      {activeSection === 'notifications' && (
        <div className="space-y-6">
          {/* Bill Reminders */}
          <div className="card">
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
                  checked={notificationSettings.billReminders.enabled}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    billReminders: { ...notificationSettings.billReminders, enabled: e.target.checked }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {notificationSettings.billReminders.enabled && (
              <div className="ml-13 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Remind me how many days before due date?
                  </label>
                  <select
                    value={notificationSettings.billReminders.daysBefore}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      billReminders: { ...notificationSettings.billReminders, daysBefore: parseInt(e.target.value) }
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
                    value={notificationSettings.billReminders.time}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      billReminders: { ...notificationSettings.billReminders, time: e.target.value }
                    })}
                    className="input w-full max-w-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Budget Alerts */}
          <div className="card">
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
                  checked={notificationSettings.budgetAlerts.enabled}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    budgetAlerts: { ...notificationSettings.budgetAlerts, enabled: e.target.checked }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {notificationSettings.budgetAlerts.enabled && (
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
                      value={notificationSettings.budgetAlerts.thresholdPercentage}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        budgetAlerts: { ...notificationSettings.budgetAlerts, thresholdPercentage: parseInt(e.target.value) }
                      })}
                      className="flex-1"
                    />
                    <span className="text-lg font-semibold text-gray-900 dark:text-white w-16 text-right">
                      {notificationSettings.budgetAlerts.thresholdPercentage}%
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
                      value={notificationSettings.budgetAlerts.warningPercentage}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        budgetAlerts: { ...notificationSettings.budgetAlerts, warningPercentage: parseInt(e.target.value) }
                      })}
                      className="flex-1"
                    />
                    <span className="text-lg font-semibold text-gray-900 dark:text-white w-16 text-right">
                      {notificationSettings.budgetAlerts.warningPercentage}%
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
          <div className="card">
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
                  checked={notificationSettings.spendingSummary.enabled}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    spendingSummary: { ...notificationSettings.spendingSummary, enabled: e.target.checked }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {notificationSettings.spendingSummary.enabled && (
              <div className="ml-13">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Frequency
                </label>
                <select
                  value={notificationSettings.spendingSummary.frequency}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    spendingSummary: { ...notificationSettings.spendingSummary, frequency: e.target.value as 'daily' | 'weekly' }
                  })}
                  className="input w-full max-w-xs"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveNotificationSettings}
              className="btn-primary flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Notification Settings
            </button>
            {notifSaved && (
              <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Saved!
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
