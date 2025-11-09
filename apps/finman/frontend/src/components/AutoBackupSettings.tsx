import React, { useState, useEffect } from 'react';
import { HardDrive, Clock, FolderOpen, CheckCircle, AlertCircle, Save } from 'lucide-react';
import {
  getBackupConfig,
  saveBackupConfig,
  selectBackupLocation,
  performBackup,
  listBackups,
  BackupConfig
} from '../utils/autoBackup';
import { logger } from '../utils/logger';

const AutoBackupSettings: React.FC = () => {
  const [isElectron] = useState(typeof (window as any).electron !== 'undefined');
  const [config, setConfig] = useState<BackupConfig>({
    enabled: false,
    location: '',
    frequency: 'daily',
    keepCount: 7
  });
  const [backups, setBackups] = useState<Array<{ name: string; date: Date; size: number }>>([]);
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const savedConfig = getBackupConfig();
    if (savedConfig) {
      setConfig(savedConfig);
      if (savedConfig.location) {
        loadBackupList(savedConfig.location);
      }
    }
  }, []);

  const loadBackupList = (location: string) => {
    try {
      const list = listBackups(location);
      setBackups(list);
    } catch (error) {
      logger.error('Failed to load backup list:', error);
    }
  };

  const handleSelectLocation = async () => {
    try {
      const location = await selectBackupLocation();
      if (location) {
        setConfig(prev => ({ ...prev, location }));
        loadBackupList(location);
        setMessage('Backup location selected');
      }
    } catch (error) {
      setMessage('Failed to select location');
      logger.error('Failed to select backup location:', error);
    }
  };

  const handleSave = () => {
    try {
      saveBackupConfig(config);
      setStatus('success');
      setMessage('Backup settings saved successfully');
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 3000);
    } catch (error) {
      setStatus('error');
      setMessage('Failed to save settings');
      logger.error('Failed to save backup settings:', error);
    }
  };

  const handleBackupNow = async () => {
    if (!config.location) {
      setMessage('Please select a backup location first');
      return;
    }

    setStatus('saving');
    setMessage('Creating backup...');

    try {
      const electron = (window as any).electron;
      const dataPath = electron.path.join(electron.app.getAppPath(), 'data', 'finman-data.enc');
      
      await performBackup(dataPath, config);
      setStatus('success');
      setMessage('Backup created successfully');
      loadBackupList(config.location);
      
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 3000);
    } catch (error: any) {
      setStatus('error');
      setMessage(`Backup failed: ${error.message}`);
      logger.error(error);
    }
  };

  if (!isElectron) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <p className="text-yellow-800 dark:text-yellow-200">
          Auto backup is only available in the desktop app. You can manually export your data from the Data Storage tab.
        </p>
      </div>
    );
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <HardDrive className="w-5 h-5" />
          Auto Backup Configuration
        </h3>

        {/* Enable/Disable */}
        <div className="mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => setConfig(prev => ({ ...prev, enabled: e.target.checked }))}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              Enable Automatic Backups
            </span>
          </label>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-6">
            Automatically backup your encrypted data to a safe location
          </p>
        </div>

        {/* Backup Location */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Backup Location
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={config.location}
              readOnly
              placeholder="No location selected"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              onClick={handleSelectLocation}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <FolderOpen className="w-4 h-4" />
              Browse
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Recommended: OneDrive, Dropbox, or external drive folder
          </p>
        </div>

        {/* Frequency */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Clock className="w-4 h-4 inline mr-1" />
            Backup Frequency
          </label>
          <select
            value={config.frequency}
            onChange={(e) => setConfig(prev => ({ ...prev, frequency: e.target.value as any }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="hourly">Every Hour</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>

        {/* Keep Count */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Number of Backups to Keep
          </label>
          <input
            type="number"
            min="1"
            max="30"
            value={config.keepCount}
            onChange={(e) => setConfig(prev => ({ ...prev, keepCount: parseInt(e.target.value) || 7 }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Older backups will be automatically deleted
          </p>
        </div>

        {/* Last Backup */}
        {config.lastBackup && (
          <div className="mb-6 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Last backup: <span className="font-medium">{new Date(config.lastBackup).toLocaleString()}</span>
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={status === 'saving'}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </button>
          <button
            onClick={handleBackupNow}
            disabled={!config.location || status === 'saving'}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <HardDrive className="w-4 h-4" />
            Backup Now
          </button>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
            status === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' :
            status === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200' :
            'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
          }`}>
            {status === 'success' && <CheckCircle className="w-5 h-5" />}
            {status === 'error' && <AlertCircle className="w-5 h-5" />}
            <span>{message}</span>
          </div>
        )}
      </div>

      {/* Backup List */}
      {backups.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Available Backups ({backups.length})
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {backups.map((backup, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {backup.date.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(backup.size)}
                  </p>
                </div>
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoBackupSettings;
