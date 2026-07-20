'use client';

interface WeakestSkillCardProps {
  skillRatings: {
    inference: number;
    comparison: number;
    reliability: number;
    essay: number;
    conclusion: number;
    purpose: number;
    synthesis: number;
    utility: number;
  };
  activeSubject: string;
  onSelectSkill: (skill: string) => void;
}

export default function WeakestSkillCard({ skillRatings, activeSubject, onSelectSkill }: WeakestSkillCardProps) {
  // Map skillRatings keys to human-readable names
  const skillLabels: { key: keyof typeof skillRatings; label: string; skillOption: string }[] = [
    { key: 'inference', label: 'SBQ Inference', skillOption: activeSubject === 'Social Studies' ? 'SBQ: Inference / Message (AO2)' : 'SBQ: Inference / Message (AO3)' },
    { key: 'comparison', label: 'SBQ Comparison', skillOption: activeSubject === 'Social Studies' ? 'SBQ: Comparison & Contrast (AO2)' : 'SBQ: Comparison & Contrast (AO3)' },
    { key: 'reliability', label: 'SBQ Reliability', skillOption: activeSubject === 'Social Studies' ? 'SBQ: Utility & Reliability Limits (AO2)' : 'SBQ: Reliability & Cross-Referencing (AO3)' },
    { key: 'purpose', label: 'SBQ Purpose', skillOption: activeSubject === 'Social Studies' ? 'SBQ: Purpose / Motive Evolution (AO2)' : 'SBQ: Target Purpose Analysis (AO3)' },
    { key: 'synthesis', label: 'SBQ Synthesis', skillOption: activeSubject === 'Social Studies' ? 'SBQ: Synthesis Matrix Assertion (AO2)' : 'SBQ: Evaluation of Utility (AO3)' },
    { key: 'essay', label: 'SEQ Essay', skillOption: 'SEQ: Structured Essay Questions (AO1)' },
  ];

  // Find the lowest skill score (only consider active subjects)
  const lowest = skillLabels.reduce((min, curr) => {
    const val = skillRatings[curr.key] ?? 1;
    const minVal = skillRatings[min.key] ?? 1;
    return val < minVal ? curr : min;
  }, skillLabels[0]);

  const lowestScore = skillRatings[lowest.key] ?? 1;

  // Don't show if all skills are at max (L4+) or already at L3+
  if (lowestScore >= 4) return null;

  const levelLabel = lowestScore <= 1 ? 'L1 - Beginner' : lowestScore === 2 ? 'L2 - Developing' : 'L3 - Proficient';

  return (
    <div className="bg-gradient-to-r from-amber-950/20 via-amber-950/10 to-transparent border border-amber-500/20 rounded-xl p-3 hover-lift">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px]">🎯</span>
            <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">
              Weakest Skill
            </span>
          </div>
          <p className="text-[11px] font-bold text-slate-200 truncate">
            {lowest.label}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[9px] font-mono text-rose-400 font-bold">{levelLabel}</span>
            <span className="text-[9px] text-slate-600">· Score: {lowestScore}/4</span>
          </div>
        </div>
        <button
          onClick={() => onSelectSkill(lowest.skillOption)}
          className="shrink-0 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[9px] font-bold px-2.5 py-1.5 rounded-lg transition flex items-center gap-1"
        >
          Practice Now →
        </button>
      </div>
    </div>
  );
}
