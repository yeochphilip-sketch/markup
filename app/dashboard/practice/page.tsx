'use client';

import { useState, useEffect } from 'react';
import OllieMascot from '@/app/components/OllieMascot';
import { getOllieFeedback } from '@/lib/ollie-dialogue';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/app/components/LoadingSpinner';

export default function PracticePage() {
  const router = useRouter();

  // State for Ollie mascot
  const [ollieState, setOllieState] = useState<'neutral' | 'celebrating' | 'disappointed' | 'angry'>('neutral');
  const [ollieRoast, setOllieRoast] = useState<string>('');

  // Simulate grading API response - in real app, this comes from /api/grade
  const [gradingResult, setGradingResult] = useState<{
    score: number | null;
    errorType: string | null;
    feedback: string;
    scoreLevel: string;
    scoreLabel: string;
  } | null>(null);

  // Initialize with a sample grading result after a delay (simulating API call)
  useEffect(() => {
    const timer = setTimeout(() => {
      // Simulate grading a good essay with L3/L4 level
      const sampleScore = 7; // out of 10
      const sampleErrorType: string | null = null; // No errors

      setGradingResult({
        score: sampleScore,
        errorType: sampleErrorType,
        feedback: 'Good effort with clear reasoning. Add one more elaboration sentence to strengthen your L3 response.',
        scoreLevel: 'L3',
        scoreLabel: 'Good',
      });

      // Update Ollie's state based on the grading result
      const ollieFeedback = getOllieFeedback(sampleScore, sampleErrorType, 10);
      setOllieState(ollieFeedback.state);
      setOllieRoast(ollieFeedback.roast);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Function to simulate re-grading with different results
  const regrade = (score: number, errorType: string | null) => {
    setGradingResult({
      score,
      errorType,
      feedback: getOllieFeedback(score, errorType, 10).roast,
      scoreLevel: score >= 7 ? 'L4' : score >= 5 ? 'L3' : 'L2',
      scoreLabel: score >= 7 ? 'Excellent' : score >= 5 ? 'Good' : 'Limited',
    });
    const ollieFeedback = getOllieFeedback(score, errorType, 10);
    setOllieState(ollieFeedback.state);
    setOllieRoast(ollieFeedback.roast);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="border-b border-slate-900 px-4 py-3 sm:px-6 py-4 flex items-center justify-between bg-slate-950/60 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-black text-indigo-500 tracking-wider">PRACTICE</h1>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Essay Grading</span>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-[11px] text-slate-500 hover:text-slate-300 transition font-bold px-2 py-1.5 rounded-lg hover:bg-slate-900"
          >
            ← Back
          </button>
        </div>

        {/* Ollie Mascot Section */}
        <div className="mt-6 p-4 bg-slate-950/80 border border-slate-900/30 rounded-2xl text-center">
          <h3 className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-3">Ollie the Otter</h3>
          
          {/* Ollie Mascot - shows state based on grading result */}
          <OllieMascot
            state={ollieState}
            altText={gradingResult ? `Score: ${gradingResult.score}/10 - ${gradingResult.scoreLabel}` : 'Waiting for grading...'}
            onClick={() => setOllieState('neutral')}
          />
          
          {/* Ollie's roast/text bubble */}
          {gradingResult && (
            <div className="mt-4 max-w-xs mx-auto text-center">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Ollie says:</p>
              <p className={`text-sm font-medium ${ollieState === 'celebrating' ? 'text-emerald-400' : ollieState === 'disappointed' ? 'text-rose-400' : ollieState === 'angry' ? 'text-amber-400' : 'text-slate-400'}`}>
                {ollieRoast}
              </p>
            </div>
          )}
        </div>

        {/* grading Result Display */}
        {gradingResult && (
          <div className="mt-8 p-5 bg-slate-950/80 border border-indigo-500/30 rounded-2xl">
            <h3 className="text-[10px] font-black tracking-widest text-indigo-400 uppercase mb-3">Grade Result</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Score</p>
                <p className="text-2xl font-black text-indigo-400 font-mono">{gradingResult.score}/10</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Level</p>
                <p className="text-2xl font-black text-emerald-400 font-mono">{gradingResult.scoreLevel}</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">{gradingResult.feedback}</p>
          </div>
        )}

        {/* Re-grade Button */}
        {!gradingResult && (
          <div className="mt-8">
            <button
              onClick={() => {
                // Simulate initial grading with neutral state
                setGradingResult({
                  score: 5,
                  errorType: null,
                  feedback: 'Moderate performance - need more elaboration to strengthen your answer.',
                  scoreLevel: 'L3',
                  scoreLabel: 'Good',
                });
                const ollieFeedback = getOllieFeedback(5, null, 10);
                setOllieState(ollieFeedback.state);
              }}
              className="w-full py-3 rounded-xl font-bold transition bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              Grade Practice Essay
            </button>
          </div>
        )}

        {/* Re-grade with different scenarios */}
        {gradingResult && (
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={() => regrade(8, null)}
              className="col-span-2 py-2 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white transition"
            >
              ✨ High Score (L4) - No Errors
            </button>
            <button
              onClick={() => regrade(5, 'NO_ELABORATION')}
              className="py-2 rounded-xl font-bold text-sm bg-amber-600 hover:bg-amber-500 text-white transition"
            >
              📝 Moderate (L3) - No Elaboration
            </button>
            <button
              onClick={() => regrade(3, 'REPEATED_POINT')}
              className="py-2 rounded-xl font-bold text-sm bg-rose-600 hover:bg-rose-500 text-white transition"
            >
              ⚠️ Low (L2) - Repeated Point
            </button>
          </div>
        )}
      </div>
    </div>
  );
}