'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
}

/**
 * Wraps page content with a smooth fade-in-up animation on route changes.
 * Key increment forces React to remount the wrapper on navigation → animation plays.
 *
 * No `animationFillMode: backwards` — avoids the white flash from pre-applying
 * opacity:0 before the animation begins. The `forwards` in the CSS animation
 * shorthand already holds the final state once the animation completes.
 *
 * Variants:
 *   - /auth       → fade-in (opacity only, cleaner for auth flow)
 *   - /admin/*    → scale-in (subtle zoom)
 *   - everything  → fade-in-up (slide + opacity)
 */
export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [animClass, setAnimClass] = useState('');
  const [transitionKey, setTransitionKey] = useState(0);
  const isFirstRender = useRef(true);

  // Pick animation variant based on path
  function getAnimClass(path: string) {
    if (path === '/auth') return 'animate-fade-in';
    if (path.startsWith('/admin')) return 'animate-scale-in';
    return 'animate-fade-in-up';
  }

  // Detect route changes → force remount with new animation
  useEffect(() => {
    if (isFirstRender.current) {
      // On first mount, don't animate — just render normally
      isFirstRender.current = false;
      return;
    }

    // On navigation, update anim class and increment key to remount
    setAnimClass(getAnimClass(pathname));
    setTransitionKey((k) => k + 1);
  }, [pathname]);

  return (
    <div
      key={transitionKey}
      className={`bg-[#07090e] w-full ${animClass}`}
    >
      {children}
    </div>
  );
}
