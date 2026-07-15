'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getLevelConfig } from '@/lib/gamification';
import LoadingSpinner from '@/app/components/LoadingSpinner';

interface Settings {
  email_reminders_enabled: boolean;
  practice_receipt_enabled: boolean;
  ss_goal_level: string | null;
  history_goal_level: string | null;
  takes_history: boolean;
  exam_date: string | null;
  exam_goal_level: string | null;
  streak: number;
  xp: number;
  level: string;
  evaluations: number;
}

const GOAL_LEVELS = [
  { value: 'Novice', label: 'Novice (Target: C6-C5)' },
  { value: 'Apprentice', label: 'Apprentice (Target: B4-B3)' },
  { value: 'Scholar', label: 'Scholar (Target: A2)' },
  { value: 'Expert', label: 'Expert (Target: A1)' },
  { value: 'Master', label: 'Master (Target: A1+)' },
];

export default function SettingsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Settings state
  const [settings, setSettings] = useState<Settings>({
    email_reminders_enabled: true,
    practice_receipt_enabled: true,
    ss_goal_level: null,
    history_goal_level: null,
    takes_history: false,
    exam_date: null,
    exam_goal_level: null,
    streak: 0,
    xp: 0,
    level: 'Novice',
    evaluations: 0,
  });

  // Referral
  const [referralCode, setReferralCode] = useState('');
  const [referralCount, setReferralCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // ── Initialize sound from localStorage after mount ──
  useEffect(() => {
    const stored = localStorage.getItem('sound_enabled');
    if (stored === 'false') {
      setSoundEnabled(false);
    } else if (!stored) {
      localStorage.setItem('sound_enabled', 'true');
    }
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchSettings = async (uid: string) => {
    try {
      const res = await fetch(`/api/user/settings?userId=${uid}`);
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {
      console.warn('Failed to load settings:', err);
    }
  };

  const fetchReferral = async (uid: string) => {
    try {
      const res = await fetch(`/api/referral?userId=${uid}`);
      if (res.ok) {
        const data = await res.json();
        setReferralCode(data.referralCode ?? '');
        setReferralCount(data.referralCount ?? 0);
      }
    } catch {}
  };

  const updateSetting = async (field: string, value: any) => {
    if (!userId) return;
    setSaving(field);
    try {
      const res = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, [field]: value }),
      });
      if (res.ok) {
        showToast('Setting updated', 'success');
      } else {
        showToast('Failed to save', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    } finally {
      setSaving(null);
    }
  };

  useEffect(() => {
    async function init() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const uid = session?.user?.id;
        if (!uid) { router.replace('/auth'); return; }
        setUserId(uid);
        setUserEmail(session.user.email || '');
        await fetchSettings(uid);
        await fetchReferral(uid);
      } catch {} finally {
        setLoading(false);
      }
    }
    init();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center gap-6">
        <LoadingSpinner size="lg" label="Loading settings..." color="indigo" />
      </div>
    );
  }

  const levelConfig = getLevelConfig(settings.level);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-indigo-500/30">
      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl text-xs font-bold shadow-2xl border transition-all duration-300 animate-in slide-in-from-right ${
          toast.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <header className="border-b border-slate-900 px-6 py-4 flex items-center justify-between bg-slate-950/60 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-[11px] text-slate-500 hover:text-slate-300 transition font-bold"
          >
            ← Dashboard
          </Link>
          <h1 className="text-xl font-black text-indigo-500 tracking-wider">MARKUP</h1>
        </div>
        <div className="text-[11px] text-slate-500 font-mono">
          {userEmail}
        </div>
      </header>

      <div className="max-w-3xl mx-auto p-6 space-y-6 pb-16">
        {/* ── Account Overview ── */}
        <div className="bg-gradient-to-br from-indigo-600/5 to-purple-600/5 border border-indigo-500/20 rounded-3xl p-6">
          <div className="flex items-center gap-4">
            <div className="text-4xl">{levelConfig.icon}</div>
            <div className="flex-1">
              <h2 className="text-lg font-black text-white">{userEmail || 'Student'}</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className={`text-[10px] font-black font-mono ${levelConfig.color}`}>{settings.level}</span>
                <span className="text-[10px] text-slate-500 font-mono">{settings.xp} XP</span>
                <span className="text-[10px] text-slate-500 font-mono">{settings.evaluations} papers graded</span>
              </div>
            </div>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold px-2.5 py-1 rounded-full">
              Beta · Free
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ── Notifications ── */}
          <div className="bg-slate-950/80 border border-slate-900 rounded-2xl p-5 space-y-4">
            <h3 className="text-[10px] font-black tracking-widest text-slate-400 uppercase flex items-center gap-2">
              🔔 Notifications
            </h3>

            {/* Email Reminders */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-200">Daily Practice Reminders</p>
                <p className="text-[9px] text-slate-500 mt-0.5">
                  Get an email ~5 min before your usual practice time
                </p>
              </div>
              <button
                onClick={() => {
                  const newVal = !settings.email_reminders_enabled;
                  setSettings(prev => ({ ...prev, email_reminders_enabled: newVal }));
                  updateSetting('email_reminders_enabled', newVal);
                }}
                disabled={saving === 'email_reminders_enabled'}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  settings.email_reminders_enabled ? 'bg-indigo-600' : 'bg-slate-700'
                } ${saving === 'email_reminders_enabled' ? 'opacity-50' : ''}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    settings.email_reminders_enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Practice Receipts */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-200">Practice Receipt Emails</p>
                <p className="text-[9px] text-slate-500 mt-0.5">
                  Get a summary email after each practice session
                </p>
              </div>
              <button
                onClick={() => {
                  const newVal = !settings.practice_receipt_enabled;
                  setSettings(prev => ({ ...prev, practice_receipt_enabled: newVal }));
                  updateSetting('practice_receipt_enabled', newVal);
                }}
                disabled={saving === 'practice_receipt_enabled'}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  settings.practice_receipt_enabled ? 'bg-indigo-600' : 'bg-slate-700'
                } ${saving === 'practice_receipt_enabled' ? 'opacity-50' : ''}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    settings.practice_receipt_enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-3">
              <p className="text-[9px] text-slate-500 leading-relaxed">
                💡 Emails are sent via Resend. You can disable them anytime.
                Daily reminders run on a schedule and respect your timezone (SGT).
              </p>
            </div>
          </div>

          {/* ── Exam Goals ── */}
          <div className="bg-slate-950/80 border border-slate-900 rounded-2xl p-5 space-y-4">
            <h3 className="text-[10px] font-black tracking-widest text-slate-400 uppercase flex items-center gap-2">
              🎯 Exam Goals
            </h3>

            {/* Takes History */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-200">Taking Elective History?</p>
                <p className="text-[9px] text-slate-500 mt-0.5">
                  Show History-specific SEQ & goal tracking
                </p>
              </div>
              <button
                onClick={() => {
                  const newVal = !settings.takes_history;
                  setSettings(prev => ({ ...prev, takes_history: newVal, history_goal_level: newVal ? prev.history_goal_level : null }));
                  updateSetting('takes_history', newVal);
                }}
                disabled={saving === 'takes_history'}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  settings.takes_history ? 'bg-indigo-600' : 'bg-slate-700'
                } ${saving === 'takes_history' ? 'opacity-50' : ''}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    settings.takes_history ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* SS Goal Level */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-500 uppercase">Social Studies Target</label>
              <select
                value={settings.ss_goal_level || ''}
                onChange={(e) => {
                  const val = e.target.value || null;
                  setSettings(prev => ({ ...prev, ss_goal_level: val }));
                  updateSetting('ss_goal_level', val);
                }}
                className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="">Not set</option>
                {GOAL_LEVELS.map(g => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>

            {/* History Goal Level (conditional) */}
            {settings.takes_history && (
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-500 uppercase">History Target</label>
                <select
                  value={settings.history_goal_level || ''}
                  onChange={(e) => {
                    const val = e.target.value || null;
                    setSettings(prev => ({ ...prev, history_goal_level: val }));
                    updateSetting('history_goal_level', val);
                  }}
                  className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                >
                  <option value="">Not set</option>
                  {GOAL_LEVELS.map(g => (
                    <option key={g.value} value={g.value}>{g.label}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Exam Date */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-500 uppercase">Exam Date (Optional)</label>
              <input
                type="date"
                value={settings.exam_date || ''}
                onChange={(e) => {
                  const val = e.target.value || null;
                  setSettings(prev => ({ ...prev, exam_date: val }));
                  updateSetting('exam_date', val);
                }}
                className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition [color-scheme:dark]"
              />
            </div>
          </div>

          {/* ── Account & Referral ── */}
          <div className="bg-slate-950/80 border border-slate-900 rounded-2xl p-5 space-y-4">
            <h3 className="text-[10px] font-black tracking-widest text-slate-400 uppercase flex items-center gap-2">
              👤 Account
            </h3>

            <div className="space-y-3">
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-3">
                <p className="text-[9px] text-slate-500 font-bold uppercase">Email</p>
                <p className="text-xs text-slate-200 font-mono mt-0.5">{userEmail}</p>
              </div>

              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-3">
                <p className="text-[9px] text-slate-500 font-bold uppercase">Plan</p>
                <p className="text-xs text-emerald-400 font-bold mt-0.5">Beta — Free</p>
                <p className="text-[9px] text-slate-500 mt-0.5">
                  All features are free during beta. Pricing announced at launch.
                </p>
              </div>

              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-3">
                <p className="text-[9px] text-slate-500 font-bold uppercase">Streak</p>
                <p className="text-xs text-amber-400 font-bold font-mono mt-0.5">
                  🔥 {settings.streak} day{settings.streak !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Referral */}
            <div className="border-t border-slate-800 pt-3">
              <p className="text-[9px] font-bold text-indigo-400 uppercase mb-2">Share & Earn</p>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={referralCode}
                  className="flex-1 bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-xs text-indigo-400 font-mono font-bold text-center tracking-widest focus:outline-none"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(referralCode);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs px-3 rounded-xl transition"
                >
                  {copied ? '✅' : '📋'}
                </button>
              </div>
              <p className="text-[9px] text-slate-600 mt-1.5">{referralCount} friend{referralCount !== 1 ? 's' : ''} referred · +{referralCount * 200} XP earned</p>
            </div>
          </div>

          {/* ── Preferences ── */}
          <div className="bg-slate-950/80 border border-slate-900 rounded-2xl p-5 space-y-4">
            <h3 className="text-[10px] font-black tracking-widest text-slate-400 uppercase flex items-center gap-2">
              ⚙️ Preferences
            </h3>

            {/* Subject */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-500 uppercase">Default Subject</label>
              <p className="text-[10px] text-slate-500">
                Set in the dashboard configurator. Currently supports Social Studies & Elective History.
              </p>
            </div>

            {/* Sound (stored in localStorage like in dashboard) */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-200">Sound Effects</p>
                <p className="text-[9px] text-slate-500 mt-0.5">
                  Play sounds for grading, level-ups & achievements
                </p>
              </div>
              <button
                onClick={() => {
                  const current = localStorage.getItem('sound_enabled') !== 'false';
                  const newVal = !current;
                  localStorage.setItem('sound_enabled', String(newVal));
                  setSoundEnabled(newVal);
                  showToast(newVal ? 'Sound enabled' : 'Sound disabled');
                }}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  soundEnabled ? 'bg-indigo-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    soundEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Dashboard link */}
            <Link
              href="/dashboard"
              className="block bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 text-indigo-400 text-center text-xs font-bold py-2.5 rounded-xl transition mt-2"
            >
              ← Back to Dashboard
            </Link>
          </div>

          {/* ── Danger Zone ── */}
          <div className="md:col-span-2 bg-rose-950/10 border border-rose-900/30 rounded-2xl p-5 space-y-4">
            <h3 className="text-[10px] font-black tracking-widest text-rose-400 uppercase flex items-center gap-2">
              ⚠️ Data Zone
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={async () => {
                  if (!userId || !confirm('Export your data as JSON?')) return;
                  try {
                    const [metricsRes, evalsRes] = await Promise.all([
                      fetch(`/api/user/settings?userId=${userId}`),
                      supabase.from('essay_evaluations').select('*').eq('user_id', userId),
                    ]);
                    const metrics = await metricsRes.json();
                    const blob = new Blob([JSON.stringify({ metrics, evaluations: evalsRes.data }, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url; a.download = `markup-data-${new Date().toISOString().split('T')[0]}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                    showToast('Data exported');
                  } catch { showToast('Export failed', 'error'); }
                }}
                className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold py-2.5 rounded-xl transition"
              >
                📥 Export My Data
              </button>
              <button
                onClick={() => {
                  supabase.auth.signOut();
                  router.push('/auth');
                }}
                className="flex-1 bg-rose-600/10 hover:bg-rose-600/20 border border-rose-600/30 text-rose-400 text-xs font-bold py-2.5 rounded-xl transition"
              >
                🚪 Sign Out
              </button>
            </div>
            <p className="text-[9px] text-rose-500/60 text-center">
              Your data is stored securely in Supabase. Export anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
