import { Transaction, Budget, RecurringTransaction, Item, ItemPurchase } from '../types';
import { encryptData, decryptData, generateSalt } from './encryption';
import { logger } from './logger';

// Check if running in Electron
const isElectron = typeof window !== 'undefined' && (window as any).electron;

interface AppData {
  transactions: Transaction[];
  budgets: Budget[];
  recurring: RecurringTransaction[];
  items: Item[];
  purchases: ItemPurchase[];
  version: string;
  lastModified: string;
}

class FileStorage {
  private dataFilePath: string = '';
  private encryptionKey: string = '';
  private salt: string = '';
  private cache: AppData | null = null;

  constructor() {
    if (isElectron) {
      // Will be set after user logs in with their password
      this.dataFilePath = this.getDataFilePath();
    }
  }

  private getDataFilePath(): string {
    if (!isElectron) return '';
    
    // In Electron, use portable mode - store data in same folder as executable
    const electron = (window as any).electron;
    const path = electron.path;
    
    // Get the app's installation directory (where .exe is located)
    const appPath = electron.app.getAppPath();
    console.log('FileStorage - App Path:', appPath);
    
    const dataPath = path.join(appPath, 'data', 'finman-data.enc');
    console.log('FileStorage - Data File Path:', dataPath);
    
    return dataPath;
  }

  /**
   * Initialize encryption key from user password
   */
  public async initializeEncryption(password: string, salt?: string): Promise<void> {
    // Use password as base for encryption key
    this.encryptionKey = password;
    this.salt = salt || generateSalt();
  }

  /**
   * Load all data from encrypted file
   */
  public async loadData(): Promise<AppData | null> {
    if (!isElectron) {
      return this.loadFromLocalStorage();
    }

    try {
      const electron = (window as any).electron;
      const fs = electron.fs;

      // Check if file exists
      if (!fs.existsSync(this.dataFilePath)) {
        logger.info('Data file does not exist, starting fresh');
        return this.getEmptyData();
      }

      // Read encrypted file
      const encryptedData = fs.readFileSync(this.dataFilePath, 'utf8');
      
      if (!encryptedData) {
        return this.getEmptyData();
      }

      // Decrypt data
      const decryptedJson = await decryptData(encryptedData, this.encryptionKey, this.salt);
      const data = JSON.parse(decryptedJson) as AppData;
      
      this.cache = data;
      logger.info('Data loaded from encrypted file');
      return data;
    } catch (error) {
      logger.error('Error loading data from file:', error);
      throw new Error('Failed to load data. Check your password or file integrity.');
    }
  }

  /**
   * Save all data to encrypted file
   */
  public async saveData(data: Partial<AppData>): Promise<void> {
    if (!isElectron) {
      this.saveToLocalStorage(data);
      return;
    }

    try {
      // Merge with cached data
      const currentData = this.cache || this.getEmptyData();
      const updatedData: AppData = {
        ...currentData,
        ...data,
        version: '1.0.0',
        lastModified: new Date().toISOString(),
      };

      // Encrypt data
      const jsonData = JSON.stringify(updatedData, null, 2);
      const encryptedData = await encryptData(jsonData, this.encryptionKey, this.salt);

      // Write to file
      const electron = (window as any).electron;
      const fs = electron.fs;
      
      // Ensure directory exists
      const path = electron.path;
      const dir = path.dirname(this.dataFilePath);
      console.log('FileStorage - Saving to directory:', dir);
      console.log('FileStorage - Full path:', this.dataFilePath);
      
      if (!fs.existsSync(dir)) {
        console.log('FileStorage - Creating directory:', dir);
        fs.mkdirSync(dir, { recursive: true });
      } else {
        console.log('FileStorage - Directory already exists');
      }

      console.log('FileStorage - Writing encrypted data...');
      fs.writeFileSync(this.dataFilePath, encryptedData, 'utf8');
      console.log('FileStorage - Data written successfully!');
      
      this.cache = updatedData;
      logger.info('Data saved to encrypted file');
    } catch (error) {
      logger.error('Error saving data to file:', error);
      throw new Error('Failed to save data to file.');
    }
  }

  /**
   * Export data to a custom location
   */
  public async exportData(exportPath: string): Promise<void> {
    if (!isElectron) {
      throw new Error('Export only available in Electron app');
    }

    try {
      const data = this.cache || await this.loadData();
      if (!data) {
        throw new Error('No data to export');
      }

      const jsonData = JSON.stringify(data, null, 2);
      const encryptedData = await encryptData(jsonData, this.encryptionKey, this.salt);

      const electron = (window as any).electron;
      const fs = electron.fs;
      fs.writeFileSync(exportPath, encryptedData, 'utf8');
      
      logger.info('Data exported to:', exportPath);
    } catch (error) {
      logger.error('Error exporting data:', error);
      throw new Error('Failed to export data.');
    }
  }

  /**
   * Import data from a custom location
   */
  public async importData(importPath: string): Promise<AppData> {
    if (!isElectron) {
      throw new Error('Import only available in Electron app');
    }

    try {
      const electron = (window as any).electron;
      const fs = electron.fs;
      
      const encryptedData = fs.readFileSync(importPath, 'utf8');
      const decryptedJson = await decryptData(encryptedData, this.encryptionKey, this.salt);
      const data = JSON.parse(decryptedJson) as AppData;
      
      // Save imported data
      await this.saveData(data);
      
      logger.info('Data imported from:', importPath);
      return data;
    } catch (error) {
      logger.error('Error importing data:', error);
      throw new Error('Failed to import data. Check file and password.');
    }
  }

  /**
   * Migrate data from localStorage to file
   */
  public async migrateFromLocalStorage(): Promise<void> {
    if (!isElectron) {
      logger.warn('Cannot migrate: not running in Electron');
      return;
    }

    try {
      const localData = this.loadFromLocalStorage();
      if (!localData) {
        logger.info('No localStorage data to migrate');
        return;
      }

      await this.saveData(localData);
      logger.info('Successfully migrated data from localStorage to encrypted file');
    } catch (error) {
      logger.error('Error migrating data:', error);
      throw error;
    }
  }

  private getEmptyData(): AppData {
    return {
      transactions: [],
      budgets: [],
      recurring: [],
      items: [],
      purchases: [],
      version: '1.0.0',
      lastModified: new Date().toISOString(),
    };
  }

  private loadFromLocalStorage(): AppData | null {
    try {
      const transactions = JSON.parse(localStorage.getItem('financial_transactions') || '[]');
      const budgets = JSON.parse(localStorage.getItem('financial_budgets') || '[]');
      const recurring = JSON.parse(localStorage.getItem('financial_recurring') || '[]');
      const items = JSON.parse(localStorage.getItem('financial_items') || '[]');
      const purchases = JSON.parse(localStorage.getItem('financial_purchases') || '[]');

      return {
        transactions,
        budgets,
        recurring,
        items,
        purchases,
        version: '1.0.0',
        lastModified: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Error loading from localStorage:', error);
      return null;
    }
  }

  private saveToLocalStorage(data: Partial<AppData>): void {
    try {
      if (data.transactions) {
        localStorage.setItem('financial_transactions', JSON.stringify(data.transactions));
      }
      if (data.budgets) {
        localStorage.setItem('financial_budgets', JSON.stringify(data.budgets));
      }
      if (data.recurring) {
        localStorage.setItem('financial_recurring', JSON.stringify(data.recurring));
      }
      if (data.items) {
        localStorage.setItem('financial_items', JSON.stringify(data.items));
      }
      if (data.purchases) {
        localStorage.setItem('financial_purchases', JSON.stringify(data.purchases));
      }
    } catch (error) {
      logger.error('Error saving to localStorage:', error);
    }
  }
}

// Singleton instance
export const fileStorage = new FileStorage();
