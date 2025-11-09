/**
 * Auto Backup System
 * Automatically backs up encrypted data to a user-selected location
 */

import { logger } from './logger';

export interface BackupConfig {
  enabled: boolean;
  location: string;
  frequency: 'hourly' | 'daily' | 'weekly';
  keepCount: number; // Number of backups to keep
  lastBackup?: string; // ISO timestamp
}

const BACKUP_CONFIG_KEY = 'backupConfig';
const isElectron = typeof (window as any).electron !== 'undefined';

export const getBackupConfig = (): BackupConfig | null => {
  const stored = localStorage.getItem(BACKUP_CONFIG_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      logger.error('Failed to parse backup config:', error);
    }
  }
  return null;
};

export const saveBackupConfig = (config: BackupConfig): void => {
  localStorage.setItem(BACKUP_CONFIG_KEY, JSON.stringify(config));
  logger.info('Backup configuration saved');
};

export const selectBackupLocation = async (): Promise<string | null> => {
  if (!isElectron) {
    throw new Error('Backup location selection only available in Electron app');
  }

  try {
    const electron = (window as any).electron;
    const result = await electron.dialog.showOpenDialog({
      title: 'Select Backup Location',
      properties: ['openDirectory', 'createDirectory'],
      buttonLabel: 'Select Folder'
    });

    if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
      return null;
    }

    return result.filePaths[0];
  } catch (error) {
    logger.error('Failed to select backup location:', error);
    throw error;
  }
};

export const performBackup = async (
  dataFilePath: string,
  config: BackupConfig
): Promise<boolean> => {
  if (!isElectron) {
    throw new Error('Backup only available in Electron app');
  }

  try {
    const electron = (window as any).electron;
    const fs = electron.fs;
    const path = electron.path;

    // Check if source file exists
    if (!fs.existsSync(dataFilePath)) {
      logger.warn('No data file to backup');
      return false;
    }

    // Create backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const backupFileName = `finman-backup-${timestamp}.enc`;
    const backupPath = path.join(config.location, backupFileName);

    // Read source data
    const data = fs.readFileSync(dataFilePath, 'utf8');

    // Write to backup location
    fs.writeFileSync(backupPath, data, 'utf8');

    logger.info(`Backup created: ${backupPath}`);

    // Update last backup time
    config.lastBackup = new Date().toISOString();
    saveBackupConfig(config);

    // Clean up old backups
    await cleanOldBackups(config);

    return true;
  } catch (error) {
    logger.error('Backup failed:', error);
    throw error;
  }
};

const cleanOldBackups = async (config: BackupConfig): Promise<void> => {
  if (!isElectron) return;

  try {
    const electron = (window as any).electron;
    const fs = electron.fs;
    const path = electron.path;

    // Get all backup files
    const files = fs.readdirSync(config.location);
    const backupFiles = files
      .filter((f: string) => f.startsWith('finman-backup-') && f.endsWith('.enc'))
      .map((f: string) => {
        const fullPath = path.join(config.location, f);
        const stats = fs.statSync(fullPath);
        return {
          name: f,
          path: fullPath,
          time: stats.mtimeMs
        };
      })
      .sort((a: any, b: any) => b.time - a.time); // Newest first

    // Delete old backups beyond keepCount
    if (backupFiles.length > config.keepCount) {
      const toDelete = backupFiles.slice(config.keepCount);
      toDelete.forEach((file: any) => {
        try {
          fs.unlinkSync(file.path);
          logger.info(`Deleted old backup: ${file.name}`);
        } catch (error) {
          logger.error(`Failed to delete backup ${file.name}:`, error);
        }
      });
    }
  } catch (error) {
    logger.error('Failed to clean old backups:', error);
  }
};

export const shouldBackup = (config: BackupConfig): boolean => {
  if (!config.enabled || !config.lastBackup) {
    return config.enabled;
  }

  const lastBackup = new Date(config.lastBackup);
  const now = new Date();
  const hoursSinceBackup = (now.getTime() - lastBackup.getTime()) / (1000 * 60 * 60);

  switch (config.frequency) {
    case 'hourly':
      return hoursSinceBackup >= 1;
    case 'daily':
      return hoursSinceBackup >= 24;
    case 'weekly':
      return hoursSinceBackup >= 24 * 7;
    default:
      return false;
  }
};

export const checkAndPerformAutoBackup = async (dataFilePath: string): Promise<void> => {
  const config = getBackupConfig();
  if (!config || !config.enabled) {
    return;
  }

  if (shouldBackup(config)) {
    try {
      await performBackup(dataFilePath, config);
      logger.info('Auto backup completed successfully');
    } catch (error) {
      logger.error('Auto backup failed:', error);
    }
  }
};

export const restoreFromBackup = async (backupFilePath: string): Promise<string> => {
  if (!isElectron) {
    throw new Error('Restore only available in Electron app');
  }

  try {
    const electron = (window as any).electron;
    const fs = electron.fs;

    if (!fs.existsSync(backupFilePath)) {
      throw new Error('Backup file not found');
    }

    const data = fs.readFileSync(backupFilePath, 'utf8');
    logger.info(`Restored from backup: ${backupFilePath}`);
    return data;
  } catch (error) {
    logger.error('Restore failed:', error);
    throw error;
  }
};

export const listBackups = (location: string): Array<{ name: string; date: Date; size: number }> => {
  if (!isElectron) {
    return [];
  }

  try {
    const electron = (window as any).electron;
    const fs = electron.fs;
    const path = electron.path;

    const files = fs.readdirSync(location);
    return files
      .filter((f: string) => f.startsWith('finman-backup-') && f.endsWith('.enc'))
      .map((f: string) => {
        const fullPath = path.join(location, f);
        const stats = fs.statSync(fullPath);
        return {
          name: f,
          path: fullPath,
          date: new Date(stats.mtime),
          size: stats.size
        };
      })
      .sort((a: any, b: any) => b.date.getTime() - a.date.getTime());
  } catch (error) {
    logger.error('Failed to list backups:', error);
    return [];
  }
};
