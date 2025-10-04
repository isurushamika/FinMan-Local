import { Transaction, Budget, RecurringTransaction } from '../types';

export const exportToCSV = (transactions: Transaction[], filename: string = 'transactions.csv') => {
  const headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Account', 'Has Receipt'];
  const rows = transactions.map((t) => [
    t.date,
    t.type,
    t.category,
    t.description,
    t.amount.toFixed(2),
    t.account || '',
    t.receipt ? 'Yes' : 'No',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  downloadFile(csvContent, filename, 'text/csv');
};

export const exportToJSON = (data: {
  transactions: Transaction[];
  budgets: Budget[];
  recurring: RecurringTransaction[];
}) => {
  const jsonContent = JSON.stringify(data, null, 2);
  const filename = `financial-backup-${new Date().toISOString().split('T')[0]}.json`;
  downloadFile(jsonContent, filename, 'application/json');
};

export const importFromJSON = (
  file: File,
  onSuccess: (data: {
    transactions: Transaction[];
    budgets: Budget[];
    recurring: RecurringTransaction[];
  }) => void,
  onError: (error: string) => void
) => {
  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const content = e.target?.result as string;
      const data = JSON.parse(content);

      // Validate the data structure
      if (!data.transactions || !Array.isArray(data.transactions)) {
        throw new Error('Invalid backup file: missing transactions');
      }

      onSuccess({
        transactions: data.transactions || [],
        budgets: data.budgets || [],
        recurring: data.recurring || [],
      });
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to parse backup file');
    }
  };

  reader.onerror = () => {
    onError('Failed to read file');
  };

  reader.readAsText(file);
};

const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
