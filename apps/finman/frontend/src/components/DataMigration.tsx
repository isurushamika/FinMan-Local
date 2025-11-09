import React, { useState } from 'react';
import { Database, Download, Upload, HardDrive, AlertCircle, CheckCircle } from 'lucide-react';
import { fileStorage } from '../utils/fileStorage';

const DataMigration: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'migrating' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [isElectron] = useState(() => {
    const hasElectron = typeof (window as any).electron !== 'undefined';
    console.log('DataMigration - Checking Electron:', hasElectron);
    console.log('window.electron:', (window as any).electron);
    return hasElectron;
  });

  const handleMigrateToFile = async () => {
    if (!isElectron) {
      setStatus('error');
      setMessage('File storage is only available in the desktop app');
      return;
    }

    try {
      setStatus('migrating');
      setMessage('Migrating data from browser storage to encrypted file...');
      
      await fileStorage.migrateFromLocalStorage();
      
      setStatus('success');
      setMessage('Data successfully migrated to encrypted file! Your data is now stored in the "data" folder next to FinMan.exe');
    } catch (error) {
      setStatus('error');
      setMessage(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleExportData = async () => {
    if (!isElectron) {
      setStatus('error');
      setMessage('Export is only available in the desktop app');
      return;
    }

    try {
      const electron = (window as any).electron;
      const result = await electron.dialog.showSaveDialog({
        title: 'Export Data',
        defaultPath: `finman-backup-${new Date().toISOString().split('T')[0]}.enc`,
        filters: [
          { name: 'Encrypted Data', extensions: ['enc'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });

      if (!result.canceled && result.filePath) {
        await fileStorage.exportData(result.filePath);
        setStatus('success');
        setMessage(`Data exported successfully to: ${result.filePath}`);
      }
    } catch (error) {
      setStatus('error');
      setMessage(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleImportData = async () => {
    if (!isElectron) {
      setStatus('error');
      setMessage('Import is only available in the desktop app');
      return;
    }

    try {
      const electron = (window as any).electron;
      const result = await electron.dialog.showOpenDialog({
        title: 'Import Data',
        filters: [
          { name: 'Encrypted Data', extensions: ['enc'] },
          { name: 'All Files', extensions: ['*'] }
        ],
        properties: ['openFile']
      });

      if (!result.canceled && result.filePaths.length > 0) {
        await fileStorage.importData(result.filePaths[0]);
        setStatus('success');
        setMessage('Data imported successfully! Please refresh the app to see imported data.');
      }
    } catch (error) {
      setStatus('error');
      setMessage(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="card space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-2">
          <Database className="w-5 h-5" />
          Data Storage & Migration
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {isElectron 
            ? 'Manage your data storage and create backups'
            : 'Currently using browser localStorage. Install the desktop app for encrypted file storage.'}
        </p>
      </div>

      {/* Status Message */}
      {message && (
        <div
          className={`rounded-lg p-4 flex items-start gap-2 ${
            status === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : status === 'error'
              ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
          }`}
        >
          {status === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          ) : status === 'error' ? (
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          )}
          <p
            className={`text-sm ${
              status === 'success'
                ? 'text-green-700 dark:text-green-300'
                : status === 'error'
                ? 'text-red-700 dark:text-red-300'
                : 'text-blue-700 dark:text-blue-300'
            }`}
          >
            {message}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-4">
        {/* Migrate to File */}
        {isElectron && (
          <div className="flex items-start justify-between py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <HardDrive className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <h4 className="font-medium text-gray-800 dark:text-white">Migrate to Encrypted File</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Move data from browser storage to an encrypted file on your computer
              </p>
            </div>
            <button
              onClick={handleMigrateToFile}
              disabled={status === 'migrating'}
              className="btn btn-secondary whitespace-nowrap disabled:opacity-50"
            >
              {status === 'migrating' ? 'Migrating...' : 'Migrate Now'}
            </button>
          </div>
        )}

        {/* Export Data */}
        {isElectron && (
          <div className="flex items-start justify-between py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <h4 className="font-medium text-gray-800 dark:text-white">Export Data</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create an encrypted backup of your financial data
              </p>
            </div>
            <button
              onClick={handleExportData}
              className="btn btn-secondary whitespace-nowrap"
            >
              Export Backup
            </button>
          </div>
        )}

        {/* Import Data */}
        {isElectron && (
          <div className="flex items-start justify-between py-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Upload className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <h4 className="font-medium text-gray-800 dark:text-white">Import Data</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Restore data from an encrypted backup file
              </p>
            </div>
            <button
              onClick={handleImportData}
              className="btn btn-secondary whitespace-nowrap"
            >
              Import Backup
            </button>
          </div>
        )}

        {/* Browser Storage Info */}
        {!isElectron && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-700 dark:text-yellow-300">
                <p className="font-medium mb-1">Using Browser Storage</p>
                <p>
                  Your data is currently stored in your browser's localStorage. 
                  For better security and portability, download the desktop app to use encrypted file storage.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Storage Info */}
      {isElectron && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 dark:text-white mb-2">Storage Location</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-mono break-all">
            [FinMan.exe Location]\data\finman-data.enc
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            Portable mode: All data stays in the same folder as the executable
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Data is encrypted with your password using AES-256 encryption
          </p>
        </div>
      )}
    </div>
  );
};

export default DataMigration;
