'use client';

interface LoadingSpinnerProps {
  /** Size variant — defaults to 'md' */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Optional label shown below the spinner */
  label?: string;
  /** Whether to show as a full-page overlay (centered, with semi-transparent backdrop) */
  fullPage?: boolean;
  /** Color theme — defaults to 'indigo' */
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'slate';
}

const sizeMap = {
  sm: 'w-6 h-6 border-2',
  md: 'w-10 h-10 border-[3px]',
  lg: 'w-14 h-14 border-4',
  xl: 'w-20 h-20 border-4',
};

const colorMap = {
  indigo: 'border-indigo-500/20 border-t-indigo-400',
  emerald: 'border-emerald-500/20 border-t-emerald-400',
  amber: 'border-amber-500/20 border-t-amber-400',
  rose: 'border-rose-500/20 border-t-rose-400',
  slate: 'border-slate-600/20 border-t-slate-400',
};

export default function LoadingSpinner({
  size = 'md',
  label,
  fullPage = false,
  color = 'indigo',
}: LoadingSpinnerProps) {
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Spinning gear */}

      {/* Outer ring */}
      <div className="relative flex items-center justify-center">
        <div
          className={`${sizeMap[size]} rounded-full animate-spin-slow ${colorMap[color]} shadow-lg shadow-indigo-500/5`}
        />
        {/* Inner hub — toothed gear effect */}
        <div
          className={`absolute rounded-full ${
            size === 'sm' ? 'w-2 h-2' :
            size === 'md' ? 'w-3.5 h-3.5' :
            size === 'lg' ? 'w-5 h-5' :
            'w-7 h-7'
          } bg-slate-800 border border-slate-700 flex items-center justify-center`}
        >
          <div className={`rounded-full ${
            size === 'sm' ? 'w-1 h-1' :
            size === 'md' ? 'w-1.5 h-1.5' :
            size === 'lg' ? 'w-2.5 h-2.5' :
            'w-3.5 h-3.5'
          } bg-indigo-500/60`} />
        </div>
      </div>

      {/* Teeth marks (gear effect via rotating dots) */}
      <div className="relative flex items-center justify-center" style={{ marginTop: size === 'sm' ? '-1.5rem' : size === 'md' ? '-2.5rem' : size === 'lg' ? '-3.25rem' : '-4rem' }}>
        <div className="flex gap-1 animate-spin-slow-reverse">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={`rounded-full bg-indigo-500/30 ${
                size === 'sm' ? 'w-0.5 h-0.5' :
                size === 'md' ? 'w-1 h-1' :
                size === 'lg' ? 'w-1.5 h-1.5' :
                'w-2 h-2'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Label — only rendered when non-empty */}
      {label && label.length > 0 && (
        <p className="text-[10px] text-slate-500 font-mono animate-pulse font-medium tracking-wider">
          {label}
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
}
