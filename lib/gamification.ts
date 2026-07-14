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
