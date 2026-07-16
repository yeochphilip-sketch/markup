'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  userEmail: string;
  isAdmin: boolean;
  achievementsCount: number;
  totalAchievements: number;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
  onOpenStudyGroups: () => void;
  onOpenAchievements: () => void;
  onOpenFeedback: () => void;
  onSignOut: () => void;
}

export default function MobileSidebar({
  isOpen,
  onClose,
  userId,
  userEmail,
  isAdmin,
  achievementsCount,
  totalAchievements,
  isSoundEnabled,
  onToggleSound,
  onOpenStudyGroups,
  onOpenAchievements,
  onOpenFeedback,
  onSignOut,
}: MobileSidebarProps) {
  const router = useRouter();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Close on escape key
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Sidebar panel */}
      <div
        ref={sidebarRef}
        className="fixed right-0 top-0 bottom-0 w-72 bg-slate-950/98 border-l border-slate-900 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-900">
          <h2 className="text-sm font-black text-indigo-500 tracking-wider">MARKUP</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 transition"
          >
            ✕
          </button>
        </div>

        {/* User info */}
        <div className="px-5 py-4 border-b border-slate-900">
          <p className="text-xs font-semibold text-slate-200 truncate">{userEmail || 'Student'}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Account</p>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <button
            onClick={() => { router.push('/dashboard'); onClose(); }}
            className="w-full text-left text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-900 px-3 py-2.5 rounded-xl transition flex items-center gap-3"
          >
            📝 Dashboard
          </button>

          <button
            onClick={() => { router.push('/dashboard/settings'); onClose(); }}
            className="w-full text-left text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-900 px-3 py-2.5 rounded-xl transition flex items-center gap-3"
          >
            ⚙️ Settings
          </button>

          <button
            onClick={() => { onOpenStudyGroups(); onClose(); }}
            className="w-full text-left text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-900 px-3 py-2.5 rounded-xl transition flex items-center gap-3"
          >
            👥 Study Groups
          </button>

          <button
            onClick={() => { onOpenAchievements(); onClose(); }}
            className="w-full text-left text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-900 px-3 py-2.5 rounded-xl transition flex items-center gap-3"
          >
            🏅 Achievements ({achievementsCount}/{totalAchievements})
          </button>

          <button
            onClick={() => { onToggleSound(); }}
            className="w-full text-left text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-900 px-3 py-2.5 rounded-xl transition flex items-center gap-3"
          >
            {isSoundEnabled ? '🔊 Sound On' : '🔇 Sound Off'}
          </button>

          {isAdmin && (
            <Link
              href="/admin/analytics"
              onClick={onClose}
              className="block text-sm font-semibold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/30 px-3 py-2.5 rounded-xl transition flex items-center gap-3"
            >
              📊 Platform Insights
            </Link>
          )}

          <div className="border-t border-slate-900 my-3" />

          <button
            onClick={() => { onOpenFeedback(); onClose(); }}
            className="w-full text-left text-sm font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-900 px-3 py-2.5 rounded-xl transition flex items-center gap-3"
          >
            🐛 Submit Feedback
          </button>

          <button
            onClick={() => { onSignOut(); onClose(); }}
            className="w-full text-left text-sm font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 px-3 py-2.5 rounded-xl transition flex items-center gap-3 mt-2"
          >
            🚪 Sign Out
          </button>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-900">
          <p className="text-[9px] text-slate-600 font-mono text-center">
            MARKUP v0.1 · Beta
          </p>
        </div>
      </div>
    </div>
  );
}
