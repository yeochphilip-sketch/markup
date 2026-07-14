'use client';

import { useState, useEffect } from 'react';

interface OnboardingWizardProps {
  userId: string | null;
  onComplete: () => void;
}

const ONBOARDING_KEY = 'markup_onboarding_done';

export default function OnboardingWizard({ userId, onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if user has seen onboarding
    if (typeof window === 'undefined') return;
    const done = localStorage.getItem(ONBOARDING_KEY);
    if (!done) {
      setShow(true);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShow(false);
    onComplete();
  };

  const handleSkip = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShow(false);
    onComplete();
  };

  if (!show) return null;

  const steps = [
    {
      icon: '🎯',
      title: 'Generate a Practice Paper',
      description: 'Configure your subject, topic, and skill in the left panel. Then hit "⚡ Generate Practice" to get a Singapore-standard O-Level paper with sources and questions.',
      highlight: 'Configurator',
    },
    {
      icon: '✍️',
      title: 'Write Your Answers',
      description: 'Type your SBCS, SEQ, and SRQ answers in the Writing Canvas. Use the timer to simulate exam conditions. Then click "Scan All Answers" to get instant LORMS-aligned feedback.',
      highlight: 'Writing Canvas',
    },
    {
      icon: '📈',
      title: 'Track Your Progress',
      description: 'Every grade earns XP and levels up your skills. Keep a streak going for bonus XP. Check the leaderboard, unlock achievements, and monitor your skill radar in the analytics panel.',
      highlight: 'Level Up',
    },
  ];

  const totalSteps = steps.length;

  return (
    <div className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-md flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        {/* Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-indigo-500/10">
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-6">
            {steps.map((_, i) => (
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
            <div className="text-6xl mb-2 animate-bounce">{steps[step].icon}</div>
            <h2 className="text-xl font-black text-white">{steps[step].title}</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              {steps[step].description}
            </p>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3">
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">
                Tip: {steps[step].highlight}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {step === 0 && 'Try selecting "Social Studies" → "Any Topic" → "All Formats" for your first paper.'}
                {step === 1 && "Don't worry about writing a perfect answer — just get your ideas down and see how the AI evaluates them."}
                {step === 2 && 'Your first goal: Complete 3 papers this week to unlock the bronze achievement! 🏅'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={handleSkip}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold text-xs py-2.5 rounded-xl transition"
            >
              Skip Tour
            </button>
            <button
              onClick={() => {
                if (step < totalSteps - 1) {
                  setStep(step + 1);
                } else {
                  handleComplete();
                }
              }}
              className="flex-[2] bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-lg"
            >
              {step < totalSteps - 1 ? 'Next →' : '🚀 Start Practicing!'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
