'use client';

/**
 * DashboardSkeleton — animated placeholder grid that mimics the real dashboard layout.
 * Shown while the user's session and data are loading.
 */
export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#07090e] flex flex-col font-sans animate-fade-in">
      {/* Header skeleton */}
      <header className="border-b border-slate-900/50 px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Hamburger placeholder */}
          <div className="sm:hidden w-10 h-10 rounded-lg bg-slate-900 animate-pulse" />
          {/* Logo */}
          <div className="h-6 w-24 bg-slate-900 rounded-lg animate-pulse" />
          {/* Settings button (desktop) */}
          <div className="hidden sm:block h-8 w-20 bg-slate-900 rounded-lg animate-pulse" />
        </div>
        <div className="flex items-center gap-3">
          {/* Notification bell */}
          <div className="w-8 h-8 rounded-full bg-slate-900 animate-pulse" />
          {/* Sound toggle */}
          <div className="w-8 h-8 rounded-lg bg-slate-900 animate-pulse" />
          {/* Achievements */}
          <div className="h-8 w-16 bg-slate-900 rounded-lg animate-pulse" />
          {/* Profile avatar */}
          <div className="w-10 h-10 rounded-full bg-slate-900 animate-pulse" />
        </div>
      </header>

      {/* Analytics panel skeleton (desktop) */}
      <div className="hidden md:block px-4 sm:px-6 pt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-slate-950/60 border border-slate-900 rounded-xl p-4 space-y-2">
              <div className="h-3 w-16 bg-slate-900 rounded animate-pulse" />
              <div className="h-5 w-12 bg-slate-900 rounded animate-pulse" />
              <div className="h-2 w-24 bg-slate-900 rounded animate-pulse" />
            </div>
          ))}
        </div>
        {/* XP progress bar */}
        <div className="mt-3 bg-slate-950/60 border border-slate-900 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="h-3 w-20 bg-slate-900 rounded animate-pulse" />
            <div className="h-3 w-16 bg-slate-900 rounded animate-pulse" />
          </div>
          <div className="h-2 bg-slate-900 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Main grid skeleton */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-6 p-4 sm:p-6 gap-4 sm:gap-6">
        {/* Left sidebar — Configurator + History */}
        <div className="xl:col-span-1 space-y-4">
          {/* Configurator card */}
          <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4 space-y-4">
            <div className="h-3 w-24 bg-slate-900 rounded animate-pulse" />
            {/* Subject toggle */}
            <div className="grid grid-cols-2 gap-1">
              <div className="h-8 bg-slate-900 rounded-xl animate-pulse" />
              <div className="h-8 bg-slate-900 rounded-xl animate-pulse" />
            </div>
            {/* Mode toggle */}
            <div className="grid grid-cols-2 gap-1">
              <div className="h-8 bg-slate-900 rounded-xl animate-pulse" />
              <div className="h-8 bg-slate-900 rounded-xl animate-pulse" />
            </div>
            {/* Selects */}
            <div className="space-y-2">
              <div className="h-3 w-20 bg-slate-900 rounded animate-pulse" />
              <div className="h-10 bg-slate-900 rounded-xl animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-16 bg-slate-900 rounded animate-pulse" />
              <div className="h-10 bg-slate-900 rounded-xl animate-pulse" />
            </div>
            {/* Generate button */}
            <div className="h-10 bg-indigo-900/40 rounded-xl animate-pulse" />
          </div>

          {/* History logs placeholder */}
          <div className="space-y-2">
            <div className="h-3 w-28 bg-slate-900 rounded animate-pulse" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-slate-950/30 border border-slate-900 rounded-xl p-3 space-y-2">
                <div className="flex gap-2">
                  <div className="h-4 w-8 bg-slate-900 rounded animate-pulse" />
                  <div className="h-4 w-12 bg-slate-900 rounded animate-pulse" />
                </div>
                <div className="h-3 w-full bg-slate-900 rounded animate-pulse" />
                <div className="h-3 w-3/4 bg-slate-900 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Center — Sources */}
        <div className="xl:col-span-2 space-y-4">
          {/* Background context */}
          <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 space-y-2">
            <div className="h-3 w-24 bg-slate-900 rounded animate-pulse" />
            <div className="h-3 w-full bg-slate-900 rounded animate-pulse" />
            <div className="h-3 w-5/6 bg-slate-900 rounded animate-pulse" />
            <div className="h-3 w-4/6 bg-slate-900 rounded animate-pulse" />
          </div>
          {/* Source A */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-5 w-16 bg-slate-900 rounded-full animate-pulse" />
              <div className="h-3 w-48 bg-slate-900 rounded animate-pulse" />
            </div>
            <div className="border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="h-3 w-full bg-slate-900 rounded animate-pulse" />
              <div className="h-3 w-11/12 bg-slate-900 rounded animate-pulse" />
              <div className="h-3 w-4/6 bg-slate-900 rounded animate-pulse" />
            </div>
          </div>
          {/* Source B */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-5 w-16 bg-slate-900 rounded-full animate-pulse" />
              <div className="h-3 w-48 bg-slate-900 rounded animate-pulse" />
            </div>
            <div className="border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="h-3 w-full bg-slate-900 rounded animate-pulse" />
              <div className="h-3 w-10/12 bg-slate-900 rounded animate-pulse" />
              <div className="h-3 w-3/6 bg-slate-900 rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Right — Writing Canvas */}
        <div className="xl:col-span-2 space-y-4">
          {/* Question prompt */}
          <div className="bg-indigo-950/20 border border-indigo-900/30 rounded-2xl p-4 space-y-2">
            <div className="h-3 w-28 bg-indigo-900/30 rounded animate-pulse" />
            <div className="h-3 w-full bg-indigo-900/20 rounded animate-pulse" />
            <div className="h-3 w-3/4 bg-indigo-900/20 rounded animate-pulse" />
          </div>

          {/* SBCS textarea */}
          <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-3 w-48 bg-slate-900 rounded animate-pulse" />
              <div className="flex gap-2">
                <div className="h-6 w-12 bg-slate-900 rounded-lg animate-pulse" />
                <div className="h-6 w-12 bg-slate-900 rounded-lg animate-pulse" />
              </div>
            </div>
            <div className="h-20 bg-slate-900/50 rounded-xl animate-pulse" />
          </div>

          {/* SEQ textarea */}
          <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-3 w-36 bg-slate-900 rounded animate-pulse" />
              <div className="flex gap-2">
                <div className="h-6 w-12 bg-slate-900 rounded-lg animate-pulse" />
                <div className="h-6 w-12 bg-slate-900 rounded-lg animate-pulse" />
              </div>
            </div>
            <div className="h-16 bg-slate-900/50 rounded-xl animate-pulse" />
          </div>

          {/* SRQ textarea */}
          <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-3 w-28 bg-slate-900 rounded animate-pulse" />
              <div className="flex gap-2">
                <div className="h-6 w-12 bg-slate-900 rounded-lg animate-pulse" />
                <div className="h-6 w-12 bg-slate-900 rounded-lg animate-pulse" />
              </div>
            </div>
            <div className="h-16 bg-slate-900/50 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
