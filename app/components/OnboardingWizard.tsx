'use client';

import { useState, useEffect } from 'react';
import type { HistoryTrack } from '@/lib/syllabus';

interface OnboardingWizardProps {
  userId: string | null;
  onComplete: () => void;
}

const ONBOARDING_KEY = 'markup_onboarding_done';
const HISTORY_KEY = 'markup_takes_history';
const HISTORY_TRACK_KEY = 'markup_history_track';
const SS_GOAL_KEY = 'markup_ss_goal';
const HISTORY_GOAL_KEY = 'markup_history_goal';

/** 'none' = takes no History; a HistoryTrack = takes that paper. */
type HistoryChoice = HistoryTrack | 'none';

const HISTORY_CHOICES: { id: HistoryChoice; label: string; hint: string }[] = [
  { id: 'none', label: 'No History', hint: 'Social Studies only' },
  { id: 'Elective History', label: 'Elective History', hint: '2261 Paper 2 — The Making of the 20th Century Modern World' },
  { id: 'Pure History', label: 'Pure History', hint: '2174 Papers 1 & 2 — Southeast Asia and the post-WWII world' },
];

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
  // null = not answered yet. Elective and Pure are mutually exclusive.
  const [historyChoice, setHistoryChoice] = useState<HistoryChoice | null>(null);
  const [ssGoal, setSsGoal] = useState('Scholar');
  const [historyGoal, setHistoryGoal] = useState('Scholar');
  const [saving, setSaving] = useState(false);

  // 'none' and null both mean "no History" — only a real track gets a goal step.
  const historyTrackChoice: HistoryTrack | null =
    historyChoice && historyChoice !== 'none' ? historyChoice : null;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const done = localStorage.getItem(ONBOARDING_KEY);
    if (!done) {
      setShow(true);
    }
  }, []);

  const handleComplete = async () => {
    setSaving(true);

    // Persist locally regardless of sign-in, so the tour does not reappear for
    // signed-out visitors (the backend save below needs a user).
    localStorage.setItem(HISTORY_KEY, historyTrackChoice ? 'true' : 'false');
    localStorage.setItem(SS_GOAL_KEY, ssGoal);
    if (historyTrackChoice) {
      localStorage.setItem(HISTORY_TRACK_KEY, historyTrackChoice);
      localStorage.setItem(HISTORY_GOAL_KEY, historyGoal);
    } else {
      localStorage.removeItem(HISTORY_TRACK_KEY);
      localStorage.removeItem(HISTORY_GOAL_KEY);
    }

    // Save subject preferences and goals to backend
    if (userId) {
      try {
        // Save SS goal
        await fetch('/api/exam-goal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, subject: 'ss', goalLevel: ssGoal }),
        });

        // Save which History paper they take (if any) and its goal.
        // The API derives takes_history from history_track, so a student who
        // takes History but sets no target still records as taking History.
        await fetch('/api/exam-goal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            subject: 'history',
            goalLevel: historyTrackChoice ? historyGoal : null,
            historyTrack: historyTrackChoice,
          }),
        });
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
    // If they skip mid-way, default: no History, ss goal = Scholar
    if (historyChoice === null) setHistoryChoice('none');
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
      icon: 'Goal',
      title: 'Generate a Practice Paper',
      description: 'Configure your subject, topic, and skill in the left panel. Then hit "Generate Practice" to get a Singapore-standard O-Level paper with sources and questions.',
      highlight: 'Configurator',
      tip: 'Try selecting "Social Studies" → "Any Topic" → "All Formats" for your first paper.',
    },
    {
      icon: 'Writing',
      title: 'Write Your Answers',
      description: 'Type your SBCS, SEQ, and SRQ answers in the Writing Canvas. Use the timer to simulate exam conditions. Then click "Scan All Answers" to get instant LORMS-aligned feedback.',
      highlight: 'Writing Canvas',
      tip: "Don't worry about writing a perfect answer — just get your ideas down and see how the AI evaluates them.",
    },
    {
      icon: 'Up',
      title: 'Track Your Progress',
      description: 'Every grade earns XP and levels up your skills. Keep a streak going for bonus XP. Check the leaderboard, unlock achievements, and monitor your skill radar.',
      highlight: 'Level Up',
      tip: 'Your first goal: Complete 3 papers this week to unlock your first achievement! ',
    },
  ];

  // Config steps (subject + goals)
  const configSteps = [
    {
 icon: 'Guide',
      title: 'Which History do you take?',
      description: 'Social Studies is taken by everyone. Elective History and Pure History are alternatives — you take at most one, or neither. Let us know so we can track the right goal.',
      highlight: 'Subject Selection',
      content: (
        <div className="flex flex-col gap-2 mt-4">
          {HISTORY_CHOICES.map((choice) => (
            <button
              key={choice.id}
              onClick={() => setHistoryChoice(choice.id)}
              aria-pressed={historyChoice === choice.id}
              className={`w-full text-left px-4 py-3 rounded-xl transition border ${
                historyChoice === choice.id
                  ? 'bg-slate-800 border-indigo-500 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="block text-xs font-bold">{choice.label}</span>
              <span className="block text-[10px] text-slate-500 mt-0.5">{choice.hint}</span>
            </button>
          ))}
        </div>
      ),
    },
    {
      icon: 'Goal',
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

  // History goal step — only for the History paper they actually take
  const historyGoalStep = historyTrackChoice
    ? [
        {
 icon: 'Guide',
          title: `Set Your ${historyTrackChoice} Goal`,
          description: `Since you take ${historyTrackChoice}, set a target grade. This will appear on your dashboard alongside your SS goal.`,
          highlight: historyTrackChoice,
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
    if (step === tutorialSteps.length && historyChoice === null) return false;
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
              className="flex-[2] bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-lg disabled:opacity-40"
            >
              {saving
                ? 'Saving...'
                : isLastStep
                ? 'Start Practicing!'
                : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
