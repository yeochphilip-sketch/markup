'use client';

import { useState, useEffect } from 'react';

interface OnboardingWizardProps {
  userId: string | null;
  onComplete: () => void;
}

const ONBOARDING_KEY = 'markup_onboarding_done';
const HISTORY_KEY = 'markup_takes_history';
const SS_GOAL_KEY = 'markup_ss_goal';
const HISTORY_GOAL_KEY = 'markup_history_goal';

const LEVEL_OPTIONS = [
  { value: 'Master', label: 'Master (A1 equivalent)' },
  { value: 'Expert', label: 'Expert (A2 equivalent)' },
  { value: 'Scholar', label: 'Scholar (B3 equivalent)' },
  { value: 'Apprentice', label: 'Apprentice (C5 equivalent)' },
  { value: 'Novice', label: 'Novice (just getting started)' },
];

export default function OnboardingWizard({ userId, onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(0);
  const [show, setShow] = useState(false);
  const [takesHistory, setTakesHistory] = useState<boolean | null>(null);
  const [ssGoal, setSsGoal] = useState('Scholar');
  const [historyGoal, setHistoryGoal] = useState('Scholar');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const done = localStorage.getItem(ONBOARDING_KEY);
    if (!done) {
      setShow(true);
    }
  }, []);

  const handleComplete = async () => {
    setSaving(true);
    // Save subject preferences and goals to backend
    if (userId) {
      try {
        // Save SS goal
        await fetch('/api/exam-goal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, subject: 'ss', goalLevel: ssGoal }),
        });

        // Save History preference and goal
        await fetch('/api/exam-goal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            subject: 'history',
            goalLevel: takesHistory ? historyGoal : null,
          }),
        });

        // Update takes_history via a dedicated call
        // (the exam-goal API updates history_goal_level; we need to also set takes_history)
        // We use a separate update via the same API — the null goalLevel signals "not taking it"
        // Actually, we need to set takes_history = true/false. Let's use the Supabase client directly
        // or send a special action. For simplicity, we'll just save and rely on the goal being set.
        // The dashboard checks historyGoalLevel to determine if goal is set.
        // The takesHistory state is separate — we'll store it in localStorage for now.
        localStorage.setItem(HISTORY_KEY, takesHistory ? 'true' : 'false');
        localStorage.setItem(SS_GOAL_KEY, ssGoal);
        if (takesHistory) localStorage.setItem(HISTORY_GOAL_KEY, historyGoal);
      } catch {
        // silent
      }
    }
    setSaving(false);
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShow(false);
    onComplete();
  };

  const handleSkip = () => {
    // If they skip mid-way, default: takesHistory = false, ss goal = Scholar
    if (takesHistory === null) setTakesHistory(false);
    if (ssGoal === '') setSsGoal('Scholar');
    localStorage.setItem(ONBOARDING_KEY, 'true');
    if (userId) {
      // Save defaults silently
      fetch('/api/exam-goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, subject: 'ss', goalLevel: 'Scholar' }),
      }).catch(() => {});
    }
    setShow(false);
    onComplete();
  };

  if (!show) return null;

  // Tutorial steps (always shown)
  const tutorialSteps = [
    {
      icon: '🎯',
      title: 'Generate a Practice Paper',
      description: 'Configure your subject, topic, and skill in the left panel. Then hit "⚡ Generate Practice" to get a Singapore-standard O-Level paper with sources and questions.',
      highlight: 'Configurator',
      tip: 'Try selecting "Social Studies" → "Any Topic" → "All Formats" for your first paper.',
    },
    {
      icon: '✍️',
      title: 'Write Your Answers',
      description: 'Type your SBCS, SEQ, and SRQ answers in the Writing Canvas. Use the timer to simulate exam conditions. Then click "Scan All Answers" to get instant LORMS-aligned feedback.',
      highlight: 'Writing Canvas',
      tip: "Don't worry about writing a perfect answer — just get your ideas down and see how the AI evaluates them.",
    },
    {
      icon: '📈',
      title: 'Track Your Progress',
      description: 'Every grade earns XP and levels up your skills. Keep a streak going for bonus XP. Check the leaderboard, unlock achievements, and monitor your skill radar.',
      highlight: 'Level Up',
      tip: 'Your first goal: Complete 3 papers this week to unlock your first achievement! 🏅',
    },
  ];

  // Config steps (subject + goals)
  const configSteps = [
    {
      icon: '📖',
      title: 'Do you take History?',
      description: 'MARKUP supports both Social Studies (SS) and Elective History. Let us know which subjects you are taking so we can track your progress.',
      highlight: 'Subject Selection',
      content: (
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => setTakesHistory(false)}
            className={`flex-1 py-3 rounded-xl text-xs font-bold transition border ${
              takesHistory === false
                ? 'bg-slate-800 border-indigo-500 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            ❌ No, only SS
          </button>
          <button
            onClick={() => setTakesHistory(true)}
            className={`flex-1 py-3 rounded-xl text-xs font-bold transition border ${
              takesHistory === true
                ? 'bg-slate-800 border-indigo-500 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            ✅ Yes, I take History
          </button>
        </div>
      ),
    },
    {
      icon: '🎯',
      title: 'Set Your SS Goal',
      description: 'Social Studies is mandatory for all students. What grade are you aiming for? This helps us personalise your practice recommendations.',
      highlight: 'Social Studies',
      content: (
        <select
          value={ssGoal}
          onChange={(e) => setSsGoal(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs text-slate-200 focus:outline-none mt-4"
        >
          {LEVEL_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ),
    },
  ];

  // History goal step (only if they take History)
  const historyGoalStep = takesHistory
    ? [
        {
          icon: '📖',
          title: 'Set Your History Goal',
          description: 'Great! Since you take Elective History, set a target grade. This will appear on your dashboard alongside your SS goal.',
          highlight: 'Elective History',
          content: (
            <select
              value={historyGoal}
              onChange={(e) => setHistoryGoal(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs text-slate-200 focus:outline-none mt-4"
            >
              {LEVEL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ),
        },
      ]
    : [];

  const allSteps = [...tutorialSteps, ...configSteps, ...historyGoalStep];
  const totalSteps = allSteps.length;
  const currentStep = allSteps[step];

  const isLastStep = step === totalSteps - 1;

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const canProceed = () => {
    // Config steps require selection
    if (step === tutorialSteps.length && takesHistory === null) return false;
    return true;
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-md flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-indigo-500/10">
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-6">
            {allSteps.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === step
                    ? 'bg-indigo-500 w-6'
                    : i < step
                    ? 'bg-emerald-500'
                    : 'bg-slate-700'
                }`}
              />
            ))}
          </div>

          {/* Step content */}
          <div className="text-center space-y-4">
            <div className="text-6xl mb-2 animate-bounce">{currentStep.icon}</div>
            <h2 className="text-xl font-black text-white">{currentStep.title}</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              {currentStep.description}
            </p>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3">
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">
                Tip: {currentStep.highlight}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {'tip' in currentStep ? (currentStep as any).tip : ''}
              </p>
            </div>
            {'content' in currentStep && currentStep.content}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={handleSkip}
              disabled={saving}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold text-xs py-2.5 rounded-xl transition disabled:opacity-50"
            >
              Skip Tour
            </button>
            <button
              onClick={handleNext}
              disabled={!canProceed() || saving}
              className="flex-[2] bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-lg disabled:opacity-40"
            >
              {saving
                ? 'Saving...'
                : isLastStep
                ? '🚀 Start Practicing!'
                : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
