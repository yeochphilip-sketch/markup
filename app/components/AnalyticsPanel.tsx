'use client';

import { getLevelConfig, getNextLevelXp, getPrevLevelXp, ACHIEVEMENT_DEFS } from '@/lib/gamification';
import ExamCountdown from './ExamCountdown';

interface SkillRatings {
  inference: number;
  comparison: number;
  reliability: number;
  essay: number;
  conclusion: number;
}

interface DecayWarning {
  show: boolean;
  message: string;
  severity: 'warning' | 'danger';
}

interface AnalyticsPanelProps {
  userId: string | null;
  levelTitle: string;
  masteryPoints: number;
  xpProgress: { current: number; nextLevel: number };
  streakData: { current: number; longest: number };
  streakBonus: number;
  dailyGoalMet: boolean;
  decayWarning: DecayWarning;
  skillRatings: SkillRatings;
  achievements: string[];
  ssGoalLevel: string | null;
  historyGoalLevel: string | null;
  takesHistory: boolean;
  onFetchLeaderboard: () => void;
  onSetExamGoal: (subject: 'ss' | 'history', goalLevel: string) => void;
  onSetTakesHistory: (takes: boolean) => void;
}

function getSkillColorClass(val: number) {
  return val >= 3 ? 'text-emerald-400' : 'text-rose-500';
}

export default function AnalyticsPanel({
  levelTitle,
  masteryPoints,
  xpProgress,
  streakData,
  streakBonus,
  dailyGoalMet,
  decayWarning,
  skillRatings,
  userId,
  onFetchLeaderboard,
  onSetExamGoal,
  onSetTakesHistory,
  ssGoalLevel,
  historyGoalLevel,
  takesHistory,
}: AnalyticsPanelProps) {
  return (
    <div className="px-6 pt-4 grid grid-cols-1 md:grid-cols-8 gap-4">
      {/* Focus Target */}
      <div className="md:col-span-1 bg-indigo-600/10 border border-indigo-500/20 p-4 rounded-2xl flex items-center gap-4 relative overflow-hidden group">
        <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center text-xl">🎯</div>
        <div>
          <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Focus Target</h4>
          <p className="text-[11px] font-bold text-slate-300 leading-tight">Cross-reference carefully to build band ranks.</p>
        </div>
      </div>

      {/* Level Title + XP Progress */}
      <div className="md:col-span-2 bg-slate-950/80 border border-slate-900 p-4 rounded-2xl flex flex-col justify-center relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getLevelConfig(levelTitle).icon}</span>
            <div>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{levelTitle}</span>
              <span className="text-lg font-black text-indigo-400 font-mono block">{masteryPoints} <span className="text-[10px] text-slate-600 font-normal">pts</span></span>
            </div>
          </div>
          <button
            onClick={onFetchLeaderboard}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[9px] font-bold px-2 py-1.5 rounded-lg transition text-slate-400 hover:text-slate-200"
          >
            🏆 Rank
          </button>
        </div>
        {levelTitle !== 'Master' && (
          <div className="mt-2">
            <div className="flex justify-between text-[8px] text-slate-600 font-mono mb-0.5">
              <span>{getPrevLevelXp(masteryPoints)}pts</span>
              <span>{getNextLevelXp(masteryPoints)}pts</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700 ease-out"
                style={{ width: `${Math.min((xpProgress.current / Math.max(xpProgress.nextLevel, 1)) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Daily Goal */}
      <div className={`md:col-span-1 bg-slate-950/80 border p-4 rounded-2xl flex flex-col justify-center items-center text-center transition ${
        dailyGoalMet ? 'border-emerald-500/30' : 'border-slate-900'
      }`}>
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
          {dailyGoalMet ? '✅ Done' : '📋 Goal'}
        </span>
        <div className="flex items-baseline gap-1 mt-1">
          <span className={`text-lg font-black font-mono ${dailyGoalMet ? 'text-emerald-400' : 'text-slate-500'}`}>
            {dailyGoalMet ? 'Complete!' : '1 paper'}
          </span>
        </div>
        <span className="text-[8px] text-slate-600 font-mono">
          {dailyGoalMet ? '+25 pts earned' : 'Scan 1 paper today'}
        </span>
      </div>

      {/* Streak Counter */}
      <div className="md:col-span-1 bg-slate-950/80 border border-slate-900 p-4 rounded-2xl flex flex-col justify-center items-center text-center relative">
        {streakBonus > 0 && (
          <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full animate-in zoom-in-95">
            +{streakBonus}
          </div>
        )}
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
          {streakData.current > 0 ? '🔥 Streak' : 'Streak'}
        </span>
        <div className="flex items-baseline gap-1">
          <span className={`text-lg font-black font-mono ${streakData.current >= 3 ? 'text-amber-400' : 'text-slate-400'}`}>
            {streakData.current}
          </span>
          <span className="text-[9px] text-slate-600 font-normal">days</span>
        </div>
        {streakData.longest > 1 && (
          <span className="text-[8px] text-slate-600 font-mono">Best: {streakData.longest}</span>
        )}
      </div>

      {/* XP Decay Warning */}
      {decayWarning.show && (
        <div className={`md:col-span-2 flex items-center gap-3 p-3 rounded-2xl border ${
          decayWarning.severity === 'danger' ? 'bg-rose-500/10 border-rose-500/20' : 'bg-amber-500/10 border-amber-500/20'
        }`}>
          <span className={`text-lg ${decayWarning.severity === 'danger' ? 'animate-pulse' : ''}`}>⚠️</span>
          <p className={`text-[10px] font-medium ${decayWarning.severity === 'danger' ? 'text-rose-300' : 'text-amber-300'}`}>
            {decayWarning.message}
          </p>
        </div>
      )}

      {/* Exam Countdowns */}
      {userId && (
        <ExamCountdown
          userId={userId}
          ssGoalLevel={ssGoalLevel}
          historyGoalLevel={historyGoalLevel}
          takesHistory={takesHistory}
          currentLevel={levelTitle}
          onSetGoal={onSetExamGoal}
          onSetTakesHistory={onSetTakesHistory}
        />
      )}

      {/* Skill Radar */}
      <div className="md:col-span-4 bg-slate-950/80 border border-slate-900 p-4 rounded-2xl grid grid-cols-5 gap-2">
        {[
          { label: 'Inference', key: 'inference' as const },
          { label: 'Compare', key: 'comparison' as const },
          { label: 'Reliability', key: 'reliability' as const },
          { label: 'SEQ Essay', key: 'essay' as const },
          { label: 'Conclusion', key: 'conclusion' as const },
        ].map((s, i) => (
          <div key={s.key} className={`text-center ${i > 0 ? 'border-l border-slate-900' : ''}`}>
            <p className="text-[8px] font-bold text-slate-500 uppercase">{s.label}</p>
            <p className={`text-xs font-black font-mono ${getSkillColorClass(skillRatings[s.key])}`}>
              L{skillRatings[s.key]}/{s.key === 'essay' ? 8 : s.key === 'conclusion' ? 2 : s.key === 'inference' ? 5 : 6}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
