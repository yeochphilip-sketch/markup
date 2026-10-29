'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  /** Size variant — defaults to 'md' */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Color theme — defaults to 'slate' */
  color?: 'slate' | 'indigo' | 'emerald' | 'amber' | 'rose';
  /** Whether to show as a wide bar */
  bar?: boolean;
  /** Whether to show as a circle */
  circle?: boolean;
  /** Whether to show as a rounded rectangle */
  rounded?: boolean;
  /** Custom width as a fraction of parent (0-1) */
  widthFraction?: number;
  /** Optional label shown below the skeleton */
  label?: string;
  /** Animation duration in seconds */
  duration?: number;
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

const colorMap = {
  slate: 'bg-slate-900/30',
  indigo: 'bg-indigo-900/20',
  emerald: 'bg-emerald-900/20',
  amber: 'bg-amber-900/20',
  rose: 'bg-rose-900/20',
};

export default function Skeleton({
  size = 'md',
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
        `rounded-md ${sizeClass} ${colorClass} ${animationClass}`,
        bar && 'animate-shimmer-bar',
        circle && 'animate-shimmer-circle',
        rounded && 'animate-shimmer-rect',
        label && 'animate-pulse-skeleton'
      )}
      style={widthStyle}
    >
      {label && label.length > 0 && (
        <p className="text-[10px] text-slate-500/50 font-mono animate-pulse font-medium tracking-wider">{label}</p>
      )}
    </div>
  );
}