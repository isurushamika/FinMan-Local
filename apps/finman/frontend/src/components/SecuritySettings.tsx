import React, { useState } from 'react';
import { Shield, Lock, Eye, EyeOff, Clock, AlertCircle, CheckCircle, Key } from 'lucide-react';
import { SecuritySettings as SecuritySettingsType } from '../types';
import { loadUser, updateSecuritySettings, updateUser } from '../utils/auth';
import { hashPassword, verifyPassword, validatePasswordStrength, generateSalt } from '../utils/encryption';

const SecuritySettings: React.FC = () => {
  const user = loadUser();
  const [settings, setSettings] = useState<SecuritySettingsType>(
    user?.securitySettings || {
      autoLockEnabled: true,
      autoLockTimeout: 5,
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

  const newPasswordStrength = validatePasswordStrength(newPassword);

  const handleSettingChange = (key: keyof SecuritySettingsType, value: boolean | number) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <Shield className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          Security Settings
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Manage password, encryption, and security features
        </p>
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
            onClick={() => handleSettingChange('encryptionEnabled', !settings.encryptionEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.encryptionEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.encryptionEnabled ? 'translate-x-6' : 'translate-x-1'
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
              onClick={() => handleSettingChange('autoLockEnabled', !settings.autoLockEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.autoLockEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.autoLockEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {settings.autoLockEnabled && (
            <div>
              <label className="label text-sm">Timeout (minutes)</label>
              <select
                value={settings.autoLockTimeout}
                onChange={(e) => handleSettingChange('autoLockTimeout', parseInt(e.target.value))}
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

        {/* Require Password on Startup */}
        <div className="flex items-start justify-between py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Lock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <h4 className="font-medium text-gray-800 dark:text-white">Require Password on Startup</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Always ask for password when opening the app
            </p>
          </div>
          <button
            onClick={() =>
              handleSettingChange('requirePasswordOnStartup', !settings.requirePasswordOnStartup)
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.requirePasswordOnStartup ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.requirePasswordOnStartup ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Change Password */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <Key className="w-5 h-5" />
            Change Password
          </h3>
          <button
            onClick={() => setShowChangePassword(!showChangePassword)}
            className="btn btn-secondary text-sm"
          >
            {showChangePassword ? 'Cancel' : 'Change Password'}
          </button>
        </div>

        {showChangePassword && (
          <form onSubmit={handleChangePassword} className="space-y-4 mt-4">
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
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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

            {/* Password Strength */}
            {newPassword && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        newPasswordStrength.strength === 'weak'
                          ? 'bg-red-500 w-1/3'
                          : newPasswordStrength.strength === 'medium'
                          ? 'bg-yellow-500 w-2/3'
                          : 'bg-green-500 w-full'
                      }`}
                    />
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      newPasswordStrength.strength === 'weak'
                        ? 'text-red-600'
                        : newPasswordStrength.strength === 'medium'
                        ? 'text-yellow-600'
                        : 'text-green-600'
                    }`}
                  >
                    {newPasswordStrength.strength}
                  </span>
                </div>
                {newPasswordStrength.messages.length > 0 && (
                  <ul className="text-xs text-gray-600 dark:text-gray-400">
                    {newPasswordStrength.messages.map((msg, idx) => (
                      <li key={idx}>• {msg}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !newPasswordStrength?.isValid}
              className="btn btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'Changing Password...' : 'Change Password'}
            </button>
          </form>
        )}
      </div>

      {/* Security Info */}
      <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Security Information
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
          <li>• Your data is encrypted using industry-standard AES-256 encryption</li>
          <li>• Passwords are hashed with PBKDF2 (100,000 iterations)</li>
          <li>• All data stays on your device - nothing is sent to external servers</li>
          <li>• There is no password recovery - make sure to remember your password</li>
        </ul>
      </div>
    </div>
  );
};

export default SecuritySettings;
