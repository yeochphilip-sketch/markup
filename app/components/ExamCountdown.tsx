'use client';

import { useState } from 'react';
import { HISTORY_TRACKS, type HistoryTrack } from '@/lib/syllabus';

// Display-only countdown targets. These are estimates — confirm them against
// the official SEAB examination calendar each year. Elective History (2261/02)
// and Pure History (2174) are separate papers and are not necessarily sat on
// the same day.
const SS_EXAM_DATE = '2026-10-26';
const HISTORY_EXAM_DATES: Record<HistoryTrack, string> = {
  'Elective History': '2026-10-20',
  'Pure History': '2026-10-22',
};

interface ExamCountdownProps {
  userId: string | null;
  ssGoalLevel: string | null;
  historyGoalLevel: string | null;
  /** Which History paper the student takes, or null if they take neither. */
  historyTrack: HistoryTrack | null;
  currentLevel: string;
  onSetGoal: (subject: 'ss' | 'history', goalLevel: string) => void;
  onSetHistoryTrack: (track: HistoryTrack | null) => void;
}

const LEVEL_TARGETS = [
  { label: 'Master (A1 equivalent)', minXp: 5000, short: 'Master' },
  { label: 'Expert (A2 equivalent)', minXp: 2500, short: 'Expert' },
  { label: 'Scholar (B3 equivalent)', minXp: 1000, short: 'Scholar' },
  { label: 'Apprentice (C5 equivalent)', minXp: 400, short: 'Apprentice' },
  { label: 'Novice (no target yet)', minXp: 0, short: 'Novice' },
];

function CountdownWidget({
  subjectLabel,
  examDate,
  goalLevel,
  currentLevel,
  onClick,
  icon,
  isMandatory,
}: {
  subjectLabel: string;
  examDate: string;
  goalLevel: string | null;
  currentLevel: string;
  onClick: () => void;
  icon: string;
  isMandatory: boolean;
}) {
  const now = new Date();
  const exam = new Date(examDate);
  const diffMs = exam.getTime() - now.getTime();
  const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  const weeksLeft = Math.max(0, Math.floor(daysLeft / 7));

  const isUrgent = daysLeft <= 60;
  const isCritical = daysLeft <= 30;
  const needsGoal = !goalLevel && isMandatory;

  // Calculate goal status
  const targetIdx = LEVEL_TARGETS.findIndex((t) => t.label.startsWith(goalLevel || 'Novice'));
  const currentIdx = LEVEL_TARGETS.findIndex((t) => t.label.startsWith(currentLevel));
  const reached = currentIdx >= targetIdx;
  const gap = Math.max(0, targetIdx - currentIdx);

  return (
    <div
      className={`border rounded-2xl p-4 flex items-center gap-4 transition cursor-pointer hover:opacity-90 ${
        needsGoal
          ? 'bg-indigo-500/10 border-indigo-500/30 border-dashed'
          : isCritical
          ? 'bg-rose-500/10 border-rose-500/20'
          : isUrgent
          ? 'bg-amber-500/10 border-amber-500/20'
          : 'bg-slate-950/80 border-slate-900'
      }`}
      onClick={onClick}
    >
      <span className={`text-2xl ${isCritical ? 'animate-pulse' : ''}`}>
        {needsGoal ? 'Goal' : icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest truncate">
              {subjectLabel}
              {goalLevel ? ` · ${goalLevel}` : needsGoal ? ' · Set Goal' : ''}
            </p>
            <p className={`text-lg font-black font-mono ${needsGoal ? 'text-indigo-400' : isCritical ? 'text-rose-400' : isUrgent ? 'text-amber-400' : 'text-indigo-400'}`}>
              {daysLeft}d <span className="text-[10px] text-slate-500 font-normal">({weeksLeft} weeks)</span>
            </p>
          </div>
          {goalLevel && (
            <div className="text-right shrink-0">
              <p className="text-[8px] text-slate-600 uppercase tracking-widest">Status</p>
              <p className={`text-xs font-black font-mono ${reached ? 'text-emerald-400' : 'text-rose-400'}`}>
                {reached ? '✓ On Track' : `${gap} level${gap > 1 ? 's' : ''}`}
              </p>
            </div>
          )}
        </div>
        {!goalLevel && (
          <p className="text-[8px] text-slate-600 mt-1 italic">
            {isMandatory ? 'Set your goal for this subject' : 'Set your goal for this subject'}
          </p>
        )}
      </div>
    </div>
  );
}

export default function ExamCountdown({
  userId,
  ssGoalLevel,
  historyGoalLevel,
  historyTrack,
  currentLevel,
  onSetGoal,
  onSetHistoryTrack,
}: ExamCountdownProps) {
  const [showGoalModal, setShowGoalModal] = useState<'ss' | 'history' | null>(null);
  const [goalLevel, setGoalLevel] = useState('Scholar');
  const [settingGoal, setSettingGoal] = useState(false);

  const handleSaveGoal = async () => {
    if (!showGoalModal) return;
    setSettingGoal(true);
    try {
      await onSetGoal(showGoalModal, goalLevel);
      setShowGoalModal(null);
    } catch {
      // silent
    } finally {
      setSettingGoal(false);
    }
  };

  const openGoalModal = (subject: 'ss' | 'history') => {
    const current = subject === 'ss' ? ssGoalLevel : historyGoalLevel;
    setGoalLevel(current || 'Scholar');
    setShowGoalModal(subject);
  };

  const goalSubject = showGoalModal === 'ss' ? 'Social Studies' : historyTrack ?? 'History';
  const goalDate = showGoalModal === 'ss' ? SS_EXAM_DATE : HISTORY_EXAM_DATES[historyTrack ?? 'Elective History'];

  return (
    <>
      {/* SS countdown — always visible, mandatory goal */}
      <CountdownWidget
        subjectLabel="Social Studies"
        examDate={SS_EXAM_DATE}
        goalLevel={ssGoalLevel}
        currentLevel={currentLevel}
        onClick={() => openGoalModal('ss')}
        icon="Date"
        isMandatory={true}
      />

      {/* History countdown — only if the student takes a History paper */}
      {historyTrack ? (
        <CountdownWidget
          subjectLabel={historyTrack}
          examDate={HISTORY_EXAM_DATES[historyTrack]}
          goalLevel={historyGoalLevel}
          currentLevel={currentLevel}
          onClick={() => openGoalModal('history')}
          icon="Guide"
          isMandatory={true}
        />
      ) : (
        <div className="md:col-span-2 border border-dashed border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
          <span className="text-2xl text-slate-500">Guide</span>
          <div className="flex-1">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">History</p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Do you take Elective or Pure History? Pick one to set your exam goal and track progress.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            {HISTORY_TRACKS.map((track) => (
              <button
                key={track}
                onClick={() => onSetHistoryTrack(track)}
                disabled={!userId}
                className="text-[10px] font-bold px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:border-indigo-500 hover:text-white transition disabled:opacity-40"
              >
                {track === 'Elective History' ? 'Elective' : 'Pure'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Goal-setting modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowGoalModal(null)}>
          <div
            className="bg-slate-950 border border-slate-800 rounded-3xl p-6 max-w-sm w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-sm font-black tracking-widest text-slate-300 uppercase">
                {goalSubject} Goal
              </h3>
              <button onClick={() => setShowGoalModal(null)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-slate-900 transition text-sm font-bold">✕</button>
            </div>

            <div className="space-y-4">
              {/* Pre-filled date info */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-center">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Exam Date</p>
                <p className="text-sm font-black font-mono text-indigo-400 mt-0.5">
                  {new Date(goalDate).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>

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
                    <option key={t.label} value={t.short}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* Current status */}
              <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-3">
                <p className="text-[10px] text-slate-400">
                  You are currently <strong className="text-white">{currentLevel}</strong>. Setting a goal helps you stay on track for the {goalSubject} exam.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowGoalModal(null)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold text-xs py-2.5 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveGoal}
                  disabled={settingGoal}
                  className="flex-[2] bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 rounded-xl transition disabled:opacity-50"
                >
                  {settingGoal ? 'Saving...' : 'Save Goal'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
