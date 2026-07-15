'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

/**
 * A shared hook that encapsulates the auto-dismiss timer logic with
 * pause-on-hover and resume-on-leave behavior.
 *
 * Uses a ref to store the latest `onDismiss` callback so the timer
 * doesn't restart when the parent re-renders with a new inline function.
 *
 * Returns:
 *  - isHovered: true when the user is hovering (pauses the timer)
 *  - dismiss: immediately dismiss the modal (call on close/click-outside)
 *  - startTimer: call this when the modal becomes visible to start the countdown
 *  - handleMouseEnter: call onMouseEnter to pause the timer
 *  - handleMouseLeave: call onMouseLeave to resume the timer
 */
export function useAutoDismiss(
  onDismiss: () => void,
  durationMs = 12000,
) {
  // Store the latest callback in a ref to avoid restarting timer
  // when the parent passes a new inline function reference.
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startRef = useRef<number>(0);
  const remainingRef = useRef<number>(durationMs);
  const [isHovered, setIsHovered] = useState(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const pauseTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      const elapsed = Date.now() - startRef.current;
      remainingRef.current = Math.max(0, remainingRef.current - elapsed);
    }
  }, []);

  const resumeTimer = useCallback(() => {
    if (!timerRef.current && remainingRef.current > 0) {
      startRef.current = Date.now();
      timerRef.current = setTimeout(() => {
        onDismissRef.current();
      }, remainingRef.current);
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    remainingRef.current = durationMs;
    startRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      onDismissRef.current();
    }, durationMs);
  }, [clearTimer, durationMs]);

  const dismiss = useCallback(() => {
    clearTimer();
    onDismissRef.current();
  }, [clearTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    pauseTimer();
  }, [pauseTimer]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    resumeTimer();
  }, [resumeTimer]);

  return {
    isHovered,
    dismiss,
    startTimer,
    handleMouseEnter,
    handleMouseLeave,
  };
}
