'use client';

import { useState, useEffect } from 'react';

const DEFAULT_EXAM_DATE = '2026-10-15'; // Typical O-Level Humanities exam

interface ExamCountdownProps {
  userId: string | null;
  examDate: string | null; // From user_skill_metrics.exam_date
  examGoalLevel: string | null; // From user_skill_metrics.exam_goal_level
  currentLevel: string;
  onSetGoal: (date: string, level: string) => Promise<void>;
}

const O_LEVEL_GRADES = ['A1', 'A2', 'B3', 'B4', 'C5', 'C6', 'D7', 'E8', 'F9'];
const LEVEL_TARGETS = [
  { label: 'Master (A1 equivalent)', minXp: 5000 },
  { label: 'Expert (A2 equivalent)', minXp: 2500 },
  { label: 'Scholar (B3 equivalent)', minXp: 1000 },
  { label: 'Apprentice (C5 equivalent)', minXp: 400 },
  { label: 'Novice (no target yet)', minXp: 0 },
];

export default function ExamCountdown({
  userId,
  examDate,
  examGoalLevel,
  currentLevel,
  onSetGoal,
}: ExamCountdownProps) {
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalDate, setGoalDate] = useState(examDate || DEFAULT_EXAM_DATE);
  const [goalLevel, setGoalLevel] = useState(examGoalLevel || 'Novice');
  const [settingGoal, setSettingGoal] = useState(false);

  const targetDate = examDate || DEFAULT_EXAM_DATE;
  const now = new Date();
  const exam = new Date(targetDate);
  const diffMs = exam.getTime() - now.getTime();
  const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  const weeksLeft = Math.max(0, Math.floor(daysLeft / 7));

  const isUrgent = daysLeft <= 60;
  const isCritical = daysLeft <= 30;

  const handleSaveGoal = async () => {
    setSettingGoal(true);
    try {
      await onSetGoal(goalDate, goalLevel);
      setShowGoalModal(false);
    } catch {
      // silent
    } finally {
      setSettingGoal(false);
    }
  };

  const getTargetLevelStatus = () => {
    const targetIdx = LEVEL_TARGETS.findIndex((t) => t.label.startsWith(examGoalLevel || 'Novice'));
    const currentIdx = LEVEL_TARGETS.findIndex((t) => t.label.startsWith(currentLevel));
    if (targetIdx < 0) return { reached: false, gap: 0 };
    return {
      reached: currentIdx >= targetIdx,
      gap: Math.max(0, targetIdx - currentIdx),
    };
  };

  const status = getTargetLevelStatus();

  return (
    <>
      {/* Countdown widget */}
      <div
        className={`md:col-span-2 border rounded-2xl p-4 flex items-center gap-4 transition cursor-pointer hover:opacity-90 ${
          isCritical
            ? 'bg-rose-500/10 border-rose-500/20'
            : isUrgent
            ? 'bg-amber-500/10 border-amber-500/20'
            : 'bg-slate-950/80 border-slate-900'
        }`}
        onClick={() => setShowGoalModal(true)}
      >
        <span className={`text-2xl ${isCritical ? 'animate-pulse' : ''}`}>
          {isCritical ? '🚨' : isUrgent ? '⏰' : '📅'}
        </span>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                {examGoalLevel ? `Target: ${examGoalLevel}` : 'O-Levels'}
              </p>
              <p className={`text-lg font-black font-mono ${isCritical ? 'text-rose-400' : isUrgent ? 'text-amber-400' : 'text-indigo-400'}`}>
                {daysLeft}d <span className="text-[10px] text-slate-500 font-normal">({weeksLeft} weeks)</span>
              </p>
            </div>
            {examGoalLevel && (
              <div className="text-right">
                <p className="text-[8px] text-slate-600 uppercase tracking-widest">Goal Status</p>
                <p className={`text-xs font-black font-mono ${status.reached ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {status.reached ? '✅ On Track' : `⬆ ${status.gap} level${status.gap > 1 ? 's' : ''} to go`}
                </p>
              </div>
            )}
          </div>
          {!examGoalLevel && (
            <p className="text-[8px] text-slate-600 mt-1 italic">Click to set your O-Level goal</p>
          )}
        </div>
      </div>

      {/* Goal-setting modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowGoalModal(false)}>
          <div
            className="bg-slate-950 border border-slate-800 rounded-3xl p-6 max-w-sm w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-sm font-black tracking-widest text-slate-300 uppercase">🎯 Exam Goal</h3>
              <button onClick={() => setShowGoalModal(false)} className="text-slate-500 hover:text-white text-sm">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">
                  Target Grade / Level
                </label>
                <select
                  value={goalLevel}
                  onChange={(e) => setGoalLevel(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs text-slate-200 focus:outline-none"
                >
                  {LEVEL_TARGETS.map((t) => (
                    <option key={t.label} value={t.label.split(' ')[0]}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">
                  Exam Date
                </label>
                <input
                  type="date"
                  value={goalDate}
                  onChange={(e) => setGoalDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs text-slate-200 focus:outline-none"
                />
              </div>

              {examGoalLevel && (
                <div className={`rounded-xl p-3 border ${status.reached ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
                  <p className={`text-[10px] font-bold ${status.reached ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {status.reached
                      ? '✅ You\'ve already reached your target level!'
                      : `📈 You're at ${currentLevel} — ${status.gap} level${status.gap > 1 ? 's' : ''} away from ${examGoalLevel}`
                    }
                  </p>
                  <p className="text-[9px] text-slate-500 mt-1">
                    {examGoalLevel === 'Master'
                      ? 'Keep practicing to stay at the top!'
                      : `At your current pace, aim for ${Math.ceil(status.gap * 7)} papers to reach ${examGoalLevel}.`}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowGoalModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold text-xs py-2.5 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveGoal}
                  disabled={settingGoal}
                  className="flex-[2] bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 rounded-xl transition disabled:opacity-50"
                >
                  {settingGoal ? 'Saving...' : '💾 Save Goal'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
