'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, useCallback } from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
}

/**
 * Wraps page content with a fade-in-up animation whenever the route changes.
 * Uses a key derived from the pathname to force React to remount the animated
 * container on navigation, giving a smooth enter transition each time.
 *
 * Variants:
 *   - fadeInUp:   opacity 0→1 + translateY(12px→0) — default
 *   - fadeIn:     opacity 0→1 only
 *   - scaleIn:    opacity 0→1 + scale(0.97→1)
 */
export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const prevPathRef = useRef(pathname);
  const [animClass, setAnimClass] = useState('animate-fade-in-up');
  const [transitionKey, setTransitionKey] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Track mount state to skip animation on initial render
  useEffect(() => {
    setMounted(true);
  }, []);

  // Detect route changes
  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      // Increment key to force remount of animated container
      setTransitionKey((k) => k + 1);
    }
  }, [pathname]);

  // Pick animation variant based on path
  const getAnimClass = useCallback((path: string) => {
    if (path === '/auth') return 'animate-fade-in';
    if (path.startsWith('/admin')) return 'animate-scale-in';
    return 'animate-fade-in-up';
  }, []);

  // Update anim class when path changes
  useEffect(() => {
    setAnimClass(getAnimClass(pathname));
  }, [pathname, getAnimClass]);

  return (
    <div
      key={transitionKey}
      className={`${mounted ? animClass : ''} w-full`}
      style={{ animationFillMode: 'backwards' }}
    >
      {children}
    </div>
  );
}
