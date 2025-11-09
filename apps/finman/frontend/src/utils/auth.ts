import { User, AuthState, SecuritySettings } from '../types';
import { encryptData, decryptData } from './encryption';

const USER_KEY = 'financial_user';
const AUTH_STATE_KEY = 'financial_auth_state';
const SESSION_KEY = 'financial_session';

const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
  autoLockEnabled: true,
  autoLockTimeout: 5, // 5 minutes
  encryptionEnabled: true,
  requirePasswordOnStartup: true,
};

/**
 * Save user to storage
 */
export const saveUser = (user: User): void => {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user:', error);
  }
};

/**
 * Load user from storage
 */
export const loadUser = (): User | null => {
  try {
    const data = localStorage.getItem(USER_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading user:', error);
    return null;
  }
};

/**
 * Create a new user
 */
export const createUser = (username: string, passwordHash: string, salt: string): User => {
  return {
    id: Date.now().toString(),
    username,
    passwordHash,
    salt,
    createdAt: new Date().toISOString(),
    securitySettings: DEFAULT_SECURITY_SETTINGS,
  };
};

/**
 * Update user
 */
export const updateUser = (user: User): void => {
  saveUser(user);
};

/**
 * Delete user (logout and clear all data)
 */
export const deleteUser = (): void => {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(AUTH_STATE_KEY);
  localStorage.removeItem(SESSION_KEY);
};

/**
 * Save auth state
 */
export const saveAuthState = (authState: AuthState): void => {
  try {
    // Don't persist the full user object in auth state
    const stateToSave = {
      ...authState,
      user: authState.user ? { id: authState.user.id } : null,
    };
    localStorage.setItem(AUTH_STATE_KEY, JSON.stringify(stateToSave));
  } catch (error) {
    console.error('Error saving auth state:', error);
  }
};

/**
 * Load auth state
 */
export const loadAuthState = (): AuthState | null => {
  try {
    const data = localStorage.getItem(AUTH_STATE_KEY);
    if (!data) return null;
    
    const state = JSON.parse(data);
    const user = loadUser();
    
    return {
      ...state,
      user,
    };
  } catch (error) {
    console.error('Error loading auth state:', error);
    return null;
  }
};

/**
 * Clear auth state
 */
export const clearAuthState = (): void => {
  localStorage.removeItem(AUTH_STATE_KEY);
  localStorage.removeItem(SESSION_KEY);
};

/**
 * Check if user exists
 */
export const userExists = (): boolean => {
  return loadUser() !== null;
};

/**
 * Create session token
 */
export const createSession = (userId: string): string => {
  const session = {
    userId,
    createdAt: Date.now(),
    expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
  };
  const sessionToken = btoa(JSON.stringify(session));
  localStorage.setItem(SESSION_KEY, sessionToken);
  return sessionToken;
};

/**
 * Validate session
 */
export const validateSession = (): boolean => {
  try {
    const sessionToken = localStorage.getItem(SESSION_KEY);
    if (!sessionToken) return false;
    
    const session = JSON.parse(atob(sessionToken));
    return session.expiresAt > Date.now();
  } catch (error) {
    return false;
  }
};

/**
 * Clear session
 */
export const clearSession = (): void => {
  localStorage.removeItem(SESSION_KEY);
};

/**
 * Check if encryption is enabled
 */
export const isEncryptionEnabled = (): boolean => {
  const user = loadUser();
  return user?.securitySettings.encryptionEnabled ?? false;
};

/**
 * Encrypt sensitive data if encryption is enabled
 */
export const encryptIfEnabled = async (
  data: string,
  password: string
): Promise<string> => {
  const user = loadUser();
  if (user && user.securitySettings.encryptionEnabled) {
    return await encryptData(data, password, user.salt);
  }
  return data;
};

/**
 * Decrypt sensitive data if it was encrypted
 */
export const decryptIfNeeded = async (
  data: string,
  password: string
): Promise<string> => {
  const user = loadUser();
  if (user && user.securitySettings.encryptionEnabled) {
    try {
      return await decryptData(data, password, user.salt);
    } catch (error) {
      // Data might not be encrypted, return as is
      return data;
    }
  }
  return data;
};

/**
 * Update security settings
 */
export const updateSecuritySettings = (settings: Partial<SecuritySettings>): void => {
  const user = loadUser();
  if (user) {
    user.securitySettings = {
      ...user.securitySettings,
      ...settings,
    };
    saveUser(user);
  }
};

/**
 * Get auto-lock timeout in milliseconds
 */
export const getAutoLockTimeout = (): number => {
  const user = loadUser();
  if (user && user.securitySettings.autoLockEnabled) {
    return user.securitySettings.autoLockTimeout * 60 * 1000; // Convert minutes to ms
  }
  return 0; // Disabled
};

/**
 * Update last login time
 */
export const updateLastLogin = (): void => {
  const user = loadUser();
  if (user) {
    user.lastLogin = new Date().toISOString();
    saveUser(user);
  }
};
