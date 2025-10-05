/**
 * Development-only logger utility
 * Console logs are stripped from production builds
 */

const isDevelopment = process.env.NODE_ENV !== 'production';

export const logger = {
  error: (message: string, error?: unknown) => {
    if (isDevelopment) {
      console.error(message, error);
    }
  },
  
  warn: (message: string, data?: unknown) => {
    if (isDevelopment) {
      console.warn(message, data);
    }
  },
  
  info: (message: string, data?: unknown) => {
    if (isDevelopment) {
      console.log(message, data);
    }
  },
  
  debug: (message: string, data?: unknown) => {
    if (isDevelopment) {
      console.debug(message, data);
    }
  }
};
