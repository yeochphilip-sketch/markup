import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

document.body.innerHTML = '';

const Skeleton = ({size = 'md', color = 'slate', bar = false, circle = false, rounded = true, widthFraction, label}) => {
  const sizeMap = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12', xl: 'w-16 h-16' };
  const colorMap = { slate: 'bg-slate-900/30', indigo: 'bg-indigo-900/20', emerald: 'bg-emerald-900/20', amber: 'bg-amber-900/20', rose: 'bg-rose-900/20' };
  const sizeClass = sizeMap[size];
  const colorClass = colorMap[color];
  const animationClass = 'animate-shimmer-rect';
  const widthStyle = widthFraction !== undefined ? { width: `${widthFraction * 100}%` } : {};
  
  return React.createElement('div', {
    className: `rounded-md ${sizeClass} ${colorClass} ${animationClass}`,
    style: widthStyle
  }, label && label.length > 0 && React.createElement('p', { className: 'text-[10px] text-slate-500/50 font-mono animate-pulse font-medium tracking-wider' }, label));
};

const { container } = render(React.createElement(Skeleton, { label: 'Loading...' }));
console.log('container type:', typeof container);
console.log('container:', container);
console.log('container.firstChild:', container?.firstChild);
console.log('container.innerHTML:', container?.innerHTML);

// Try screen queries
const byText = screen.getByText;
console.log('getByText works:', !!byText);
