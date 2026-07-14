'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import { getLevelConfig, getLevelTitle, getNextLevelXp, getPrevLevelXp, LEVEL_THRESHOLDS, ACHIEVEMENT_DEFS, calculateXpDecay } from '@/lib/gamification';

export default function ProfilePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);

  // Statistics
  const [masteryPoints, setMasteryPoints] = useState(0);
  const [levelTitle, setLevelTitle] = useState('Novice');
  const [xpProgress, setXpProgress] = useState({ current: 0, nextLevel: 500 });
  const [totalEvaluations, setTotalEvaluations] = useState(0);
  const [streakData, setStreakData] = useState({ current: 0, longest: 0 });
  const [achievements, setAchievements] = useState<string[]>([]);
  const [xpDecayed, setXpDecayed] = useState(0);
  const [lastPracticeDate, setLastPracticeDate] = useState<string | null>(null);

  const [skillRatings, setSkillRatings] = useState({
    inference: 1,
    comparison: 1,
    reliability: 1,
    essay: 1,
    conclusion: 0,
  });

  const [recentEvaluations, setRecentEvaluations] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const uid = session?.user?.id;
        if (!uid) {
          router.replace('/auth');
          return;
        }
        setUserId(uid);
        setUserEmail(session.user.email || '');

        // Fetch metrics
        const { data: metrics } = await supabase
          .from('user_skill_metrics')
          .select('*')
          .eq('user_id', uid)
          .single();

        if (metrics) {
          const xp = metrics.total_xp ?? 0;
          setMasteryPoints(xp);
          setLevelTitle(metrics.level_title ?? 'Novice');
          setTotalEvaluations(metrics.total_evaluations ?? 0);
          setStreakData({
            current: metrics.current_streak ?? 0,
            longest: metrics.longest_streak ?? 0,
          });
          setAchievements(metrics.achievements ?? []);
          setXpDecayed(metrics.total_xp_decayed ?? 0);
          setLastPracticeDate(metrics.last_practice_date);

          setSkillRatings({
            inference: metrics.sbq_inference_score || 1,
            comparison: metrics.sbq_comparison_score || 1,
            reliability: metrics.sbq_reliability_score || 1,
            essay: metrics.seq_essay_score || 1,
            conclusion: metrics.seq_conclusion_score ?? 0,
          });

          const nextLevelXp = getNextLevelXp(xp);
          const prevLevelXp = getPrevLevelXp(xp);
          setXpProgress({ current: xp - prevLevelXp, nextLevel: nextLevelXp - prevLevelXp });
        }

        // Fetch recent evaluations
        const { data: evals } = await supabase
          .from('essay_evaluations')
          .select('created_at, subject, question_type, score_estimate, confidence_score')
          .eq('user_id', uid)
          .order('created_at', { ascending: false })
          .limit(10);
        if (evals) setRecentEvaluations(evals);
      } catch (err) {
        console.warn('Profile load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  const getSkillColorClass = (val: number) => {
    return val >= 3 ? 'text-emerald-400' : 'text-rose-500';
  };

  const calcDecay = calculateXpDecay(lastPracticeDate, masteryPoints);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090e] text-slate-500 font-mono flex items-center justify-center text-xs">
        Loading profile...
      </div>
    );
  }

  const unlockedCount = achievements.length;
  const totalCount = ACHIEVEMENT_DEFS.length;

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans">
      {/* Header */}
      <header className="border-b border-slate-900 px-6 py-4 flex items-center justify-between bg-slate-950/60 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-[11px] text-slate-500 hover:text-slate-300 transition font-bold"
          >
            ← Back
          </button>
          <h1 className="text-xl font-black text-indigo-500 tracking-wider">MARKUP</h1>
        </div>
        <div className="text-[11px] text-slate-500 font-mono">
          {userEmail}
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* ── Overview Card ── */}
        <div className="bg-gradient-to-br from-indigo-600/5 to-purple-600/5 border border-indigo-500/20 rounded-3xl p-6">
          <div className="flex items-center gap-5">
            <div className="text-5xl">{getLevelConfig(levelTitle).icon}</div>
            <div className="flex-1">
              <h2 className="text-2xl font-black text-white">{levelTitle}</h2>
              <p className="text-sm text-slate-400 font-mono mt-1">{masteryPoints} total XP</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Member Since</p>
              <p className="text-xs text-slate-400 font-mono">Active</p>
            </div>
          </div>

          {/* XP Progress */}
          {levelTitle !== 'Master' && (
            <div className="mt-5">
              <div className="flex justify-between text-[10px] text-slate-600 font-mono mb-1">
                <span>{getPrevLevelXp(masteryPoints)} pts</span>
                <span className="text-slate-500">{getNextLevelXp(masteryPoints)} pts</span>
              </div>
              <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700"
                  style={{ width: `${Math.min((xpProgress.current / Math.max(xpProgress.nextLevel, 1)) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Decay warning */}
          {calcDecay > 0 && (
            <div className="mt-3 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              <p className="text-[11px] text-rose-400 font-medium">
                {calcDecay} XP decayed from inactivity. Practice to earn it back!
              </p>
            </div>
          )}
        </div>

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-950/80 border border-slate-900 rounded-2xl p-5 text-center">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Essays Graded</p>
            <p className="text-2xl font-black text-indigo-400 font-mono mt-1">{totalEvaluations}</p>
          </div>
          <div className="bg-slate-950/80 border border-slate-900 rounded-2xl p-5 text-center">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Current Streak</p>
            <p className="text-2xl font-black text-amber-400 font-mono mt-1">{streakData.current}<span className="text-sm text-slate-500">d</span></p>
            {streakData.longest > 1 && (
              <p className="text-[9px] text-slate-600 mt-1">Best: {streakData.longest}d</p>
            )}
          </div>
          <div className="bg-slate-950/80 border border-slate-900 rounded-2xl p-5 text-center">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Achievements</p>
            <p className="text-2xl font-black text-emerald-400 font-mono mt-1">{unlockedCount}<span className="text-sm text-slate-500">/{totalCount}</span></p>
          </div>
          <div className="bg-slate-950/80 border border-slate-900 rounded-2xl p-5 text-center">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">XP Decayed</p>
            <p className="text-2xl font-black text-rose-400 font-mono mt-1">{xpDecayed}</p>
          </div>
        </div>

        {/* ── Skill Radar ── */}
        <div className="bg-slate-950/80 border border-slate-900 rounded-2xl p-5">
          <h3 className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-4">Skill Radar</h3>
          <div className="grid grid-cols-5 gap-4">
            {[
              { key: 'inference', label: 'Inference', max: 5 },
              { key: 'comparison', label: 'Comparison', max: 6 },
              { key: 'reliability', label: 'Reliability', max: 6 },
              { key: 'essay', label: 'SEQ Essay', max: 8 },
              { key: 'conclusion', label: 'Conclusion', max: 2 },
            ].map((skill) => {
              const val = (skillRatings as any)[skill.key];
              const pct = Math.min((val / skill.max) * 100, 100);
              return (
                <div key={skill.key} className="text-center">
                  <p className="text-[9px] font-bold text-slate-500 uppercase mb-2">{skill.label}</p>
                  <div className="h-24 bg-slate-800 rounded-lg overflow-hidden relative flex items-end">
                    <div
                      className={`w-full rounded-t transition-all duration-700 ${
                        val >= Math.ceil(skill.max / 2) ? 'bg-gradient-to-t from-indigo-500 to-purple-500' : 'bg-gradient-to-t from-rose-500 to-orange-500'
                      }`}
                      style={{ height: `${pct}%` }}
                    />
                  </div>
                  <p className={`text-xs font-black font-mono mt-1 ${getSkillColorClass(val)}`}>
                    L{val}/{skill.max}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Achievements ── */}
        <div className="bg-slate-950/80 border border-slate-900 rounded-2xl p-5">
          <h3 className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-4">
            🏅 Achievements ({unlockedCount}/{totalCount})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {ACHIEVEMENT_DEFS.map((ach) => {
              const unlocked = achievements.includes(ach.id);
              return (
                <div
                  key={ach.id}
                  className={`rounded-xl p-3 border flex items-center gap-3 transition ${
                    unlocked
                      ? 'bg-emerald-500/5 border-emerald-500/20'
                      : 'bg-slate-900/30 border-slate-800/50 opacity-50'
                  }`}
                >
                  <span className={`text-lg ${unlocked ? '' : 'grayscale'}`}>{ach.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[11px] font-bold ${unlocked ? 'text-white' : 'text-slate-500'}`}>
                      {ach.title}
                    </p>
                    <p className="text-[9px] text-slate-500 truncate">{ach.description}</p>
                  </div>
                  {unlocked && <span className="text-[9px] text-emerald-400">✅</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Recent Activity ── */}
        <div className="bg-slate-950/80 border border-slate-900 rounded-2xl p-5">
          <h3 className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-4">📝 Recent Evaluations</h3>
          {recentEvaluations.length === 0 ? (
            <p className="text-xs text-slate-600 font-mono italic">No evaluations yet. Start practicing!</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {recentEvaluations.map((ev, i) => (
                <div key={i} className="bg-slate-900/30 border border-slate-800/50 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] bg-slate-900 px-2 py-0.5 rounded text-indigo-400 font-bold uppercase">
                      {ev.subject === 'Social Studies' ? 'SS' : 'HIST'}
                    </span>
                    <div>
                      <p className="text-[10px] text-slate-400 font-medium">{ev.question_type || 'General'}</p>
                      <p className="text-[9px] text-slate-600 font-mono">
                        {new Date(ev.created_at).toLocaleDateString('en-SG', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black font-mono text-indigo-400">{ev.score_estimate}</p>
                    {ev.confidence_score && (
                      <p className="text-[8px] text-slate-600">{(ev.confidence_score * 100).toFixed(0)}% confident</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
