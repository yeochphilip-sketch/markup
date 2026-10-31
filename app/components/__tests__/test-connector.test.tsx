import { render, screen } from '@testing-library/react';
import React from 'react';

describe('test-connector', () => {
  const Skeleton = ({
    size = 'md',
    color = 'slate',
    bar = false,
    circle = false,
    label,
  }: {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    color?: 'slate' | 'indigo' | 'emerald' | 'amber' | 'rose';
    bar?: boolean;
    circle?: boolean;
    label?: string;
  }) => {
    const sizeMap = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12', xl: 'w-16 h-16' };
    const colorMap = {
      slate: 'bg-slate-900/30',
      indigo: 'bg-indigo-900/20',
      emerald: 'bg-emerald-900/20',
      amber: 'bg-amber-900/20',
      rose: 'bg-rose-900/20',
    };
    const sizeClass = sizeMap[size];
    const colorClass = colorMap[color];
    const animationClass = bar ? 'animate-shimmer-bar' : circle ? 'animate-shimmer-circle' : 'animate-shimmer-rect';

    return React.createElement(
      'div',
      {
        className: `rounded-md ${sizeClass} ${colorClass} ${animationClass}`,
      },
      label && label.length > 0 &&
        React.createElement(
          'p',
          { className: 'text-[10px] text-slate-500/50 font-mono animate-pulse font-medium tracking-wider' },
          label,
        ),
    );
  };

  it('renders the expected skeleton markup', () => {
    const { container } = render(React.createElement(Skeleton, { label: 'Loading...' }));
    const div = container.firstChild as HTMLElement;

    expect(div.tagName).toBe('DIV');
    expect(div.classList.contains('rounded-md')).toBe(true);
    expect(div.classList.contains('w-8')).toBe(true);
    expect(div.classList.contains('h-8')).toBe(true);
    expect(div.classList.contains('bg-slate-900/30')).toBe(true);
    expect(div.classList.contains('animate-shimmer-rect')).toBe(true);
  });

  it('renders the label through screen.getByText', () => {
    render(React.createElement(Skeleton, { label: 'Loading...' }));
    expect(screen.getByText('Loading...')).toBeVisible();
  });
});
