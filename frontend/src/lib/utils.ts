import { type ClassValue, clsx } from "clsx";
// import { twMerge } from "tailwind-merge"; // Removed for Material UI migration

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs); // Simplified for Material UI migration
}

// JSON formatting and validation utilities
export const formatJSON = (obj: any): string => {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(obj);
  }
};

export const parseJSON = (str: string): any => {
  try {
    return JSON.parse(str);
  } catch (error) {
    throw new Error(`Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const isValidJSON = (str: string): boolean => {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};

// Diff calculation for before/after comparison
export const calculateDiff = (original: any, modified: any) => {
  const changes: Array<{ path: string; type: 'added' | 'removed' | 'modified'; value: any; oldValue?: any }> = [];
  
  const compareObjects = (obj1: any, obj2: any, path: string = '') => {
    const keys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);
    
    for (const key of keys) {
      const currentPath = path ? `${path}.${key}` : key;
      const value1 = obj1?.[key];
      const value2 = obj2?.[key];
      
      if (value1 === undefined) {
        changes.push({ path: currentPath, type: 'added', value: value2 });
      } else if (value2 === undefined) {
        changes.push({ path: currentPath, type: 'removed', value: value1 });
      } else if (typeof value1 === 'object' && typeof value2 === 'object' && value1 !== null && value2 !== null) {
        compareObjects(value1, value2, currentPath);
      } else if (value1 !== value2) {
        changes.push({ path: currentPath, type: 'modified', value: value2, oldValue: value1 });
      }
    }
  };
  
  compareObjects(original, modified);
  return changes;
};

// Debounce function for search and auto-save
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Local storage utilities with type safety
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  },
  
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  },
};

// Copy to clipboard
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return result;
    } catch {
      return false;
    }
  }
};

// Generate unique IDs
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// Truncate text with ellipsis
export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  const sizes = ['B', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

// Format relative time
export const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diffMs = now - (timestamp * 1000);
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return new Date(timestamp * 1000).toLocaleDateString();
};

// Keyboard shortcut utilities
export const isModKey = (event: KeyboardEvent): boolean => {
  return event.metaKey || event.ctrlKey;
};

export const formatShortcut = (keys: string[]): string => {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  return keys
    .map(key => {
      if (key === 'mod') return isMac ? '⌘' : 'Ctrl';
      if (key === 'alt') return isMac ? '⌥' : 'Alt';
      if (key === 'shift') return isMac ? '⇧' : 'Shift';
      return key;
    })
    .join(isMac ? '' : '+');
};

// Error handling utilities
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unknown error occurred';
};

// Deep clone utility
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};