'use client';

import { cn } from '@/lib/utils';

type SkeletonSize = 'sm' | 'md' | 'lg' | 'xl';

interface SkeletonItemProps {
  /** Width as a fraction of parent (0-1) */
  widthFraction?: number;
  /** Height as a fraction of fixed height */
  heightFraction?: number;
  /** Custom height in CSS values (px, rem, etc) */
  height?: string;
  /** Animation variant — applies shimmer animation */
  animated?: boolean;
  /** Color theme */
  color?: 'slate' | 'indigo' | 'emerald' | 'amber' | 'rose';
}

/** A single skeleton item (row or cell) */
export function SkeletonItem({
  widthFraction,
  heightFraction,
  height,
  animated = true,
  color = 'slate',
}: SkeletonItemProps) {
  const colorClass = colorMap[color];
  const animationClass = animated ? 'animate-shimmer-rect' : '';

  // Calculate width
  const widthStyle = widthFraction !== undefined
    ? { width: `${widthFraction * 100}%` }
    : {};

  // Calculate height
  const heightStyle = heightFraction !== undefined
    ? { height: `${heightFraction * 100}%` }
    : height
      ? { height }
      : {};

  return (
    <div
      className={
        cn(
          `rounded-md bg-${colorMap[color] as string} ${animationClass}`,
          widthFraction !== undefined && 'w-[calc(100%_*_${widthFraction})]',
          heightFraction !== undefined && 'h-[calc(100%_*_${heightFraction})]',
          height && `h-[${height}]`,
        )}
      style={{ ...widthStyle, ...heightStyle }}
    />
  );
}

/** Skeleton size type */
const sizeMap: Record<SkeletonSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

/** Color theme map */
const colorMap: Record<
  'slate' | 'indigo' | 'emerald' | 'amber' | 'rose',
  string
> = {
  slate: 'bg-slate-900/30',
  indigo: 'bg-indigo-900/20',
  emerald: 'bg-emerald-900/20',
  amber: 'bg-amber-900/20',
  rose: 'bg-rose-900/20',
};

/** Main Skeleton component — can be used as a page-level loading placeholder */
interface SkeletonProps {
  /** Layout mode — 'grid' for dashboard-style grid, 'default' for simple box */
  layout?: 'grid' | 'default';
  /** Size variant — defaults to 'md' */
  size: SkeletonSize;
  /** Color theme — defaults to 'slate' */
  color?: 'slate' | 'indigo' | 'emerald' | 'amber' | 'rose';
  /** Whether to show as a wide bar */
  bar?: boolean;
  /** Whether to show as a circle */
  circle?: boolean;
  /** Whether to show as a rounded rectangle (default) */
  rounded?: boolean;
  /** Custom width as a fraction of parent (0-1) */
  widthFraction?: number;
  /** Optional label shown below the skeleton */
  label?: string;
  /** Animation duration in seconds */
  duration?: number;
}

/** Generates appropriate skeleton items for a grid layout */
function generateGridItems(
  count: number,
  size: SkeletonSize = 'md',
): React.ReactNode {
  return Array.from({ length: count }).map((_, i) => (
    <SkeletonItem
      key={i}
      widthFraction={1}
      heightFraction={1}
    />
  ));
}

export default function Skeleton({
  layout = 'default',
  size = 'md' as SkeletonSize,
  color = 'slate',
  bar = false,
  circle = false,
  rounded = true,
  widthFraction,
  label,
  duration = 1.5,
}: SkeletonProps) {
  const sizeClass = sizeMap[size];
  const colorClass = colorMap[color];

  // Generate appropriate animation class based on type
  const getAnimationClass = (): string => {
    if (bar) {
      return 'animate-shimmer-bar';
    }
    if (circle) {
      return 'animate-shimmer-circle';
    }
    if (rounded) {
      return 'animate-shimmer-rect';
    }
    return 'spin-skeleton-md';
  };

  const animationClass = getAnimationClass();

  // Apply custom width if fraction provided
  const widthStyle = widthFraction !== undefined
    ? { width: `${widthFraction * 100}%` }
    : {};

  return (
    <div
      className={cn(
        ` ${sizeClass} ${colorClass} ${animationClass}`,
        bar && 'animate-shimmer-bar',
        circle && 'animate-shimmer-circle',
        rounded && 'animate-shimmer-rect',
        label && 'animate-pulse-skeleton',
      )}
      style={widthStyle}
    >
      {label && label.length > 0 && (
        <p
          className="text-[10px] text-slate-500/50 font-mono animate-pulse font-medium tracking-wider"
        >
          {label}
        </p>
      )}
    </div>
  );
}