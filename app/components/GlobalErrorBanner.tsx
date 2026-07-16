'use client';

import { useState, useEffect, useCallback } from 'react';

interface GlobalErrorBannerProps {
  /** Callback to retry failed operations */
  onRetry?: () => void;
}

/**
 * Global error banner that shows when the device is offline or API calls fail.
 * Monitors navigator.onLine and dispatches a custom event for API errors.
 */
export default function GlobalErrorBanner({ onRetry }: GlobalErrorBannerProps) {
  const [isOffline, setIsOffline] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  // Monitor online/offline status
  useEffect(() => {
    function handleOnline() {
      setIsOffline(false);
    }
    function handleOffline() {
      setIsOffline(true);
      setDismissed(false);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Listen for API error events
  useEffect(() => {
    let autoClearTimer: ReturnType<typeof setTimeout> | null = null;

    function handleApiError(e: CustomEvent) {
      setApiError(e.detail?.message || 'Something went wrong. Please try again.');
      setDismissed(false);
      if (autoClearTimer) clearTimeout(autoClearTimer);
      autoClearTimer = setTimeout(() => setApiError(null), 8000);
    }

    window.addEventListener('api-error', handleApiError as EventListener);
    return () => {
      window.removeEventListener('api-error', handleApiError as EventListener);
      if (autoClearTimer) clearTimeout(autoClearTimer);
    };
  }, []);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    setApiError(null);
  }, []);

  const handleRetry = useCallback(() => {
    if (isOffline) return;
    if (onRetry) {
      onRetry();
    } else {
      // Default retry: refresh the page
      window.location.reload();
    }
    setApiError(null);
  }, [isOffline, onRetry]);

  if (dismissed) return null;
  if (!isOffline && !apiError) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] animate-slide-down">
      {isOffline ? (
        <div className="bg-rose-950/90 border-b border-rose-500/30 px-4 py-2.5 flex items-center justify-between gap-3 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs text-rose-200">
            <span className="text-lg">📡</span>
            <span><strong className="text-rose-300">No internet connection.</strong> Your work will be saved locally.</span>
          </div>
          <button
            onClick={handleDismiss}
            className="text-rose-400/70 hover:text-rose-300 text-sm transition p-1"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      ) : apiError ? (
        <div className="bg-amber-950/90 border-b border-amber-500/30 px-4 py-2.5 flex items-center justify-between gap-3 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs text-amber-200">
            <span className="text-lg">⚠️</span>
            <span>{apiError}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRetry}
              className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold px-3 py-1 rounded-lg text-[10px] transition"
            >
              Retry
            </button>
            <button
              onClick={handleDismiss}
              className="text-amber-400/70 hover:text-amber-300 text-sm transition p-1"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Dispatch an API error event so the GlobalErrorBanner can display it.
 */
export function dispatchApiError(message: string) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('api-error', { detail: { message } }));
}
