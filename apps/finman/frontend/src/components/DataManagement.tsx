import React, { useRef } from 'react';
import { Transaction, Budget, RecurringTransaction } from '../types';
import { exportToCSV, exportToJSON, importFromJSON } from '../utils/export';
import { Download, Upload, FileText, Database, AlertTriangle } from 'lucide-react';

interface DataManagementProps {
  transactions: Transaction[];
  budgets: Budget[];
  recurring: RecurringTransaction[];
  onImport: (data: {
    transactions: Transaction[];
    budgets: Budget[];
    recurring: RecurringTransaction[];
  }) => void;
}

export const DataManagement: React.FC<DataManagementProps> = ({
  transactions,
  budgets,
  recurring,
  onImport,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = React.useState<string>('');
  const [importSuccess, setImportSuccess] = React.useState<string>('');

  const handleExportCSV = () => {
    exportToCSV(transactions);
  };

  const handleExportJSON = () => {
    exportToJSON({ transactions, budgets, recurring });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError('');
    setImportSuccess('');

    importFromJSON(
      file,
      (data) => {
        onImport(data);
        setImportSuccess(`Successfully imported ${data.transactions.length} transactions, ${data.budgets.length} budgets, and ${data.recurring.length} recurring transactions!`);
        setTimeout(() => setImportSuccess(''), 5000);
      },
      (error) => {
        setImportError(error);
        setTimeout(() => setImportError(''), 5000);
      }
    );

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="card">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Data Management</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Export, import, and backup your financial data</p>
      </div>

      {importError && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <strong className="font-semibold">Import Error:</strong>
            <p className="text-sm mt-1">{importError}</p>
          </div>
        </div>
      )}

      {importSuccess && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 flex items-start gap-3">
          <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <div>
            <strong className="font-semibold">Success!</strong>
            <p className="text-sm mt-1">{importSuccess}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Export Section */}
        <div className="p-6 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg border-2 border-primary-200 dark:border-primary-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary-600 rounded-lg">
              <Download className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Export Data</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Download your financial data</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={handleExportCSV}
              className="w-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-600 px-4 py-3 rounded-lg transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                <div className="text-left">
                  <div className="font-medium">Export to CSV</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Transactions only, Excel-compatible</div>
                </div>
              </div>
              <Download className="w-4 h-4 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
            </button>
            
            <button
              onClick={handleExportJSON}
              className="w-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-600 px-4 py-3 rounded-lg transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                <div className="text-left">
                  <div className="font-medium">Full Backup (JSON)</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Complete data with budgets & recurring</div>
                </div>
              </div>
              <Download className="w-4 h-4 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
            </button>
          </div>
        </div>

        {/* Import Section */}
        <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border-2 border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-600 rounded-lg">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Import Data</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Restore from a backup file</p>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <button
            onClick={handleImportClick}
            className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-3 font-medium mb-4"
          >
            <Upload className="w-5 h-5" />
            Import Backup (JSON)
          </button>
          
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-yellow-800 dark:text-yellow-300 font-medium mb-1">Important</p>
                <p className="text-xs text-yellow-700 dark:text-yellow-400">
                  Importing will merge with your current data. Duplicates may occur. Export current data first as a safety backup.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Database className="w-5 h-5" />
          Data Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{transactions.length}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Transactions</p>
          </div>
          <div className="text-center p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{budgets.length}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Budgets</p>
          </div>
          <div className="text-center p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{recurring.length}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Recurring</p>
          </div>
          <div className="text-center p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
              {(new Blob([JSON.stringify({ transactions, budgets, recurring })]).size / 1024).toFixed(1)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">KB Data Size</p>
          </div>
        </div>
      </div>
    </div>
  );
};
