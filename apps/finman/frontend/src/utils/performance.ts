/**
 * Performance Optimization Utilities
 * Improves app responsiveness with large datasets
 */

// Debounce function for search and filter operations
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Throttle function for scroll and resize events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Lazy load large lists with pagination
export interface PaginationOptions {
  page: number;
  pageSize: number;
}

export function paginateArray<T>(
  array: T[],
  options: PaginationOptions
): { data: T[]; total: number; pages: number } {
  const { page, pageSize } = options;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  return {
    data: array.slice(startIndex, endIndex),
    total: array.length,
    pages: Math.ceil(array.length / pageSize)
  };
}

// Memoization for expensive calculations
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map();
  
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

// Index transactions by date for faster queries
export function createDateIndex<T extends { date: string }>(
  items: T[]
): Map<string, T[]> {
  const index = new Map<string, T[]>();
  
  items.forEach(item => {
    const dateKey = item.date.split('T')[0]; // YYYY-MM-DD
    const existing = index.get(dateKey) || [];
    index.set(dateKey, [...existing, item]);
  });
  
  return index;
}

// Batch updates to localStorage to reduce I/O
let batchUpdateTimer: NodeJS.Timeout | null = null;
const pendingUpdates = new Map<string, any>();

export function batchLocalStorageUpdate(key: string, value: any, delay = 500): void {
  pendingUpdates.set(key, value);
  
  if (batchUpdateTimer) {
    clearTimeout(batchUpdateTimer);
  }
  
  batchUpdateTimer = setTimeout(() => {
    pendingUpdates.forEach((val, k) => {
      localStorage.setItem(k, JSON.stringify(val));
    });
    pendingUpdates.clear();
  }, delay);
}

// Virtual scroll helper for large lists
export function calculateVisibleRange(
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  totalItems: number,
  overscan = 3
): { startIndex: number; endIndex: number } {
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const endIndex = Math.min(totalItems - 1, startIndex + visibleCount + overscan * 2);
  
  return { startIndex, endIndex };
}

// Check if data is stale and needs refresh
export function isDataStale(lastUpdated: string, maxAgeMinutes = 5): boolean {
  const now = Date.now();
  const updated = new Date(lastUpdated).getTime();
  const ageMinutes = (now - updated) / (1000 * 60);
  return ageMinutes > maxAgeMinutes;
}

// Compress large JSON data before storing
export function compressJSON(data: any): string {
  // Simple compression: remove whitespace
  return JSON.stringify(data);
}

export function decompressJSON<T>(data: string): T {
  return JSON.parse(data);
}
