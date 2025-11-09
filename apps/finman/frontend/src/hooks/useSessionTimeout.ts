import { useState, useEffect, useCallback } from 'react';

interface SessionConfig {
  timeoutMinutes: number;
  requireReauth: boolean;
}

const DEFAULT_TIMEOUT = 15; // 15 minutes

export const useSessionTimeout = (
  onTimeout: () => void,
  config: SessionConfig = { timeoutMinutes: DEFAULT_TIMEOUT, requireReauth: true }
) => {
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [isLocked, setIsLocked] = useState(false);

  const resetTimer = useCallback(() => {
    setLastActivity(Date.now());
    if (isLocked) {
      setIsLocked(false);
    }
  }, [isLocked]);

  useEffect(() => {
    if (!config.requireReauth) return;

    const checkTimeout = () => {
      const now = Date.now();
      const elapsed = now - lastActivity;
      const timeoutMs = config.timeoutMinutes * 60 * 1000;

      if (elapsed >= timeoutMs && !isLocked) {
        setIsLocked(true);
        onTimeout();
      }
    };

    // Check every 30 seconds
    const interval = setInterval(checkTimeout, 30000);

    // Activity listeners
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    return () => {
      clearInterval(interval);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [lastActivity, config, onTimeout, resetTimer, isLocked]);

  return { isLocked, resetTimer };
};

export const getSessionConfig = (): SessionConfig => {
  const stored = localStorage.getItem('sessionConfig');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // Fall through to default
    }
  }
  return { timeoutMinutes: DEFAULT_TIMEOUT, requireReauth: true };
};

export const saveSessionConfig = (config: SessionConfig) => {
  localStorage.setItem('sessionConfig', JSON.stringify(config));
};
