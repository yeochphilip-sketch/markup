// ═══════════════════════════════════════════════════════════════
//  MARKUP — Shared gamification constants & helpers
//  Imported by: grade route, leaderboard route, dashboard
// ═══════════════════════════════════════════════════════════════

// ── XP scaling by LORMS level ──
export const XP_PER_LEVEL: Record<number, number> = {
  1: 50,
  2: 100,
  3: 150,
  4: 200,
};

export function getXpForLevel(level: number): number {
  return XP_PER_LEVEL[level] ?? level * 50;
}

// ── Level title thresholds ──
export interface LevelThreshold {
  title: string;
  minXp: number;
  icon: string;
  color: string;
}

export const LEVEL_THRESHOLDS: LevelThreshold[] = [
  { title: 'Novice',     minXp: 0,     icon: '🌱', color: 'text-slate-400' },
  { title: 'Apprentice', minXp: 500,   icon: '🔥', color: 'text-amber-400' },
  { title: 'Scholar',    minXp: 1500,  icon: '📚', color: 'text-indigo-400' },
  { title: 'Expert',     minXp: 3000,  icon: '⚡', color: 'text-purple-400' },
  { title: 'Master',     minXp: 5000,  icon: '👑', color: 'text-emerald-400' },
];

export function getLevelTitle(xp: number): string {
  let title = LEVEL_THRESHOLDS[0].title;
  for (const threshold of LEVEL_THRESHOLDS) {
    if (xp >= threshold.minXp) title = threshold.title;
  }
  return title;
}

export function getLevelConfig(title: string): LevelThreshold {
  return LEVEL_THRESHOLDS.find(l => l.title === title) ?? LEVEL_THRESHOLDS[0];
}

export function getNextLevelXp(xp: number): number {
  for (let i = 0; i < LEVEL_THRESHOLDS.length - 1; i++) {
    if (xp >= LEVEL_THRESHOLDS[i].minXp && xp < LEVEL_THRESHOLDS[i + 1].minXp) {
      return LEVEL_THRESHOLDS[i + 1].minXp;
    }
  }
  return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1].minXp;
}

export function getPrevLevelXp(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i].minXp) {
      return LEVEL_THRESHOLDS[i].minXp;
    }
  }
  return 0;
}

// ═══════════════════════════════════════════════════════════════
//  DAILY PRACTICE GOAL
// ═══════════════════════════════════════════════════════════════

export const DAILY_GOAL_BONUS_XP = 25;

export function isDailyGoalMet(lastPracticeDate: string | null): boolean {
  if (!lastPracticeDate) return false;
  const today = new Date().toISOString().split('T')[0];
  return lastPracticeDate === today;
}

// ═══════════════════════════════════════════════════════════════
//  ACHIEVEMENTS
// ═══════════════════════════════════════════════════════════════

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  /** Condition function — return true if the achievement should be granted */
  condition: (ctx: AchievementCtx) => boolean;
}

export interface AchievementCtx {
  newLevel: number;
  newXp: number;
  totalEvalCount: number;
  currentStreak: number;
  subject: string;
  previousAchivements: string[];
  /** True if the daily goal was just met */
  dailyGoalMet: boolean;
}

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  {
    id: 'first_submission',
    title: 'First Steps',
    description: 'Submit your first essay for grading',
    icon: '🌟',
    condition: () => true, // granted on first submission always
  },
  {
    id: 'first_a1',
    title: 'First A1',
    description: 'Achieve the highest LORMS level (L4)',
    icon: '🏅',
    condition: (ctx) => ctx.newLevel >= 4,
  },
  {
    id: 'persistent_5',
    title: 'Persistent',
    description: 'Submit 5 essays for grading',
    icon: '💪',
    condition: (ctx) => ctx.totalEvalCount >= 5,
  },
  {
    id: 'persistent_10',
    title: 'Dedicated',
    description: 'Submit 10 essays for grading',
    icon: '🔥',
    condition: (ctx) => ctx.totalEvalCount >= 10,
  },
  {
    id: 'streak_3',
    title: 'Momentum',
    description: 'Maintain a 3-day practice streak',
    icon: '📅',
    condition: (ctx) => ctx.currentStreak >= 3,
  },
  {
    id: 'streak_7',
    title: 'Unstoppable',
    description: 'Maintain a 7-day practice streak',
    icon: '⚡',
    condition: (ctx) => ctx.currentStreak >= 7,
  },
  {
    id: 'level_apprentice',
    title: 'Rising Star',
    description: 'Reach Apprentice tier (500 XP)',
    icon: '🔥',
    condition: (ctx) => ctx.newXp >= 500,
  },
  {
    id: 'level_scholar',
    title: 'Scholar',
    description: 'Reach Scholar tier (1500 XP)',
    icon: '📚',
    condition: (ctx) => ctx.newXp >= 1500,
  },
  {
    id: 'level_expert',
    title: 'Expert Analyst',
    description: 'Reach Expert tier (3000 XP)',
    icon: '⚡',
    condition: (ctx) => ctx.newXp >= 3000,
  },
  {
    id: 'level_master',
    title: 'Grand Master',
    description: 'Reach Master tier (5000 XP)',
    icon: '👑',
    condition: (ctx) => ctx.newXp >= 5000,
  },
  {
    id: 'history_buff',
    title: 'History Buff',
    description: 'Complete 5 History papers',
    icon: '🏛️',
    condition: (ctx) => ctx.subject === 'Elective History' && ctx.totalEvalCount >= 5,
  },
  {
    id: 'daily_goal_first',
    title: 'On Track',
    description: 'Complete your first daily practice goal',
    icon: '✅',
    condition: (ctx) => ctx.dailyGoalMet,
  },
];

export function checkNewAchievements(ctx: AchievementCtx): AchievementDef[] {
  return ACHIEVEMENT_DEFS.filter(
    (a) => !ctx.previousAchivements.includes(a.id) && a.condition(ctx),
  );
}

// ═══════════════════════════════════════════════════════════════
//  SOUND EFFECTS (Web Audio API)
// ═══════════════════════════════════════════════════════════════

let audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = frequency;
    osc.type = type;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio not available — silently ignore
  }
}

/** Short rising chime — played after grade completes */
export function playGradeCompleteSound() {
  playTone(523.25, 0.15, 'sine', 0.12);
  setTimeout(() => playTone(659.25, 0.15, 'sine', 0.12), 100);
  setTimeout(() => playTone(783.99, 0.3, 'sine', 0.12), 200);
}

/** Fanfare — played on level-up */
export function playLevelUpSound() {
  playTone(523.25, 0.2, 'triangle', 0.15);
  setTimeout(() => playTone(659.25, 0.2, 'triangle', 0.15), 150);
  setTimeout(() => playTone(783.99, 0.2, 'triangle', 0.15), 300);
  setTimeout(() => playTone(1046.50, 0.5, 'triangle', 0.18), 450);
}

/** Celebration ding — played when an achievement is unlocked */
export function playAchievementSound() {
  playTone(880, 0.1, 'sine', 0.12);
  setTimeout(() => playTone(1108.73, 0.1, 'sine', 0.12), 80);
  setTimeout(() => playTone(1318.51, 0.3, 'sine', 0.15), 160);
}
