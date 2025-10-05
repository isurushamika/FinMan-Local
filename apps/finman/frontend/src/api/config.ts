// API Configuration
export const API_CONFIG = {
  // Default to localhost for development, can be overridden with environment variable
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 30000, // 30 seconds
};

// Storage keys
export const TOKEN_KEY = 'finman_auth_token';
export const USER_KEY = 'finman_user';

// Get auth token from localStorage
export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

// Set auth token in localStorage
export const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

// Remove auth token from localStorage
export const removeAuthToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};
