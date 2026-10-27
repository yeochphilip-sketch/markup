"use client";

import { useCallback, useState, useRef } from 'react';

export interface ErrorToast {
  message: string;
  type: 'error' | 'warning';
  retryIn?: number | null;
  canRetry?: boolean;
  autoRetry?: boolean;
  longWaitEta?: string | null;
}

export interface UseErrorToastOptions {
  /** Default retry time in seconds (default: 60) */
  defaultRetrySeconds?: number;
  /** Default long wait threshold in seconds (default: 10 * 60) */
  longWaitThresholdSeconds?: number;
}

/**
 * Centralized error toast management hook.
 * 
 * Eliminates duplicated toast cleanup logic found across:
 * - app/dashboard/page.tsx (multiple useEffect closures and callbacks)
 * - app/components/NotificationBell.tsx
 * - API route handlers
 * 
 * All callers should import and use this hook instead of managing
 * errorToastTimerRef, capacityCountdownRef, and autoRetryFiredRef manually.
 */
export function useErrorToast(options: UseErrorToastOptions = {}) {
  const {
    defaultRetrySeconds = 60,
    longWaitThresholdSeconds = 10 * 60,
  } = options;

  const [errorToast, setErrorToast] = useState<ErrorToast | null>(null);
  const errorToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const capacityCountdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoRetryFiredRef = useRef<boolean>(false);
  const errorToastRemainingRef = useRef(12000);

  const dismissErrorToast = useCallback(() => {
    if (errorToastTimerRef.current) {
      clearTimeout(errorToastTimerRef.current);
      errorToastTimerRef.current = null;
    }
    if (capacityCountdownRef.current) {
      clearInterval(capacityCountdownRef.current);
      capacityCountdownRef.current = null;
    }
    autoRetryFiredRef.current = false;
    setErrorToast(null);
  }, []);

  const showErrorToast = useCallback((
    message: string,
    type: 'error' | 'warning' = 'error',
    options: {
      retryIn?: number;
      canRetry?: boolean;
      autoRetry?: boolean;
      longWaitEta?: string;
    }
  ) => {
    const {
      retryIn = defaultRetrySeconds,
      canRetry,
      autoRetry,
      longWaitEta,
    } = options;

    const seconds = Number.isFinite(retryIn) && retryIn > 0 ? Math.floor(retryIn) : defaultRetrySeconds;

    // Long wait handling (daily quota resets, hours away)
    if (seconds >= longWaitThresholdSeconds) {
      setErrorToast({
        message,
        type,
        retryIn: null,
        canRetry: autoRetry !== false,
        autoRetry: autoRetry !== false,
        longWaitEta,
      });
      // Auto-dismiss after 15s for long waits
      errorToastRemainingRef.current = 15000;
      if (errorToastTimerRef.current) {
        clearTimeout(errorToastTimerRef.current);
      }
      errorToastTimerRef.current = setTimeout(() => setErrorToast(null), 15000);
      return;
    }

    // Short wait handling (per-minute token limit)
    // Zero the remaining time so stale auto-dismiss can't fire on hover-out
    errorToastRemainingRef.current = 0;

    // Clear any existing timers
    if (errorToastTimerRef.current) {
      clearTimeout(errorToastTimerRef.current);
      errorToastTimerRef.current = null;
    }
    if (capacityCountdownRef.current) {
      clearInterval(capacityCountdownRef.current);
      capacityCountdownRef.current = null;
    }

    autoRetryFiredRef.current = false;
    errorToastRemainingRef.current = seconds * 1000;
    const startTime = Date.now();

    capacityCountdownRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, seconds - Math.floor(elapsed / 1000));
      errorToastRemainingRef.current = remaining * 1000;

      setErrorToast(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          retryIn: remaining,
        };
      });

      if (remaining <= 0) {
        if (capacityCountdownRef.current) {
          clearInterval(capacityCountdownRef.current);
          capacityCountdownRef.current = null;
        }
        // Auto-retry once when countdown hits zero, if guard allows
        if (!autoRetryFiredRef.current) {
          autoRetryFiredRef.current = true;
          setErrorToast(null);
        }
      }
    }, 1000);

    setErrorToast({
      message,
      type,
      retryIn: seconds,
      canRetry: autoRetry !== false,
      autoRetry: autoRetry !== false && !autoRetryFiredRef.current,
      longWaitEta,
    });
  }, [defaultRetrySeconds, longWaitThresholdSeconds]);

  return {
    errorToast,
    setErrorToast: showErrorToast, // alias for backwards compatibility
    dismissErrorToast,
    // Internal refs for advanced usage
    errorToastTimerRef,
    capacityCountdownRef,
    autoRetryFiredRef,
    errorToastRemainingRef,
  };
}