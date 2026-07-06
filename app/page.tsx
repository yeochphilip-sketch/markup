'use client';

import { useState } from 'react';

export default function Home() {
  const [subject, setSubject] = useState('Social Studies');
  const [questionType, setQuestionType] = useState('SBCS: Comparison');
  const [studentAnswer, setStudentAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);

  const handleGrade = async () => {
    if (!studentAnswer.trim()) return alert('Please paste or write an answer first!');
    setLoading(true);
    setFeedback(null);

    try {
      const response = await fetch('/api/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentAnswer, questionType, subject }),
      });
      const data = await response.json();
      setFeedback(data);
    } catch (error) {
      alert('Something went wrong processing your request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Top Navigation Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl font-black tracking-tight text-indigo-400">MARKUP</span>
          <span className="bg-indigo-500/10 text-indigo-400 text-xs px-2.5 py-0.5 rounded-full font-medium border border-indigo-500/20">
            SEAB O-Level Engine
          </span>
        </div>
        
        {/* Subject Toggles */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button 
            onClick={() => setSubject('Social Studies')}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition ${subject === 'Social Studies' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Social Studies
          </button>
          <button 
            onClick={() => setSubject('History')}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition ${subject === 'History' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Elective History
          </button>
        </div>
      </header>

      {/* Main Split-Screen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 h-[calc(100vh-69px)]">
        
        {/* Left Side: Input Workspace */}
        <section className="p-8 border-r border-slate-800 flex flex-col gap-6 overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Question Framework</label>
            <select 
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 font-medium focus:outline-none focus:border-indigo-500 transition"
            >
              <option>SBCS: Comparison</option>
              <option>SBCS: Inference</option>
              <option>SBCS: Reliability / Purpose</option>
              <option>Section B: Structured Essay (SEQ)</option>
            </select>
          </div>

          <div className="flex-1 flex flex-col min-h-[300px]">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Your Answer Draft</label>
            <textarea
              value={studentAnswer}
              onChange={(e) => setStudentAnswer(e.target.value)}
              placeholder="Paste your PEEL paragraphs or source evaluations here..."
              className="w-full flex-1 bg-slate-950 border border-slate-800 rounded-xl p-6 text-slate-300 font-normal leading-relaxed resize-none focus:outline-none focus:border-indigo-500 transition font-mono text-sm"
            />
          </div>

          <button
            onClick={handleGrade}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="flex items-center gap-2 animate-pulse">
                Analyzing Rubrics...
              </span>
            ) : 'Scan Answer Structure'}
          </button>
        </section>

        {/* Right Side: AI Diagnostic Panels */}
        <section className="p-8 bg-slate-950/40 overflow-y-auto flex flex-col gap-6">
          {!feedback && !loading && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-slate-800 rounded-2xl">
              <p className="text-slate-400 font-medium max-w-sm">
                Submit an answer on the left to receive an instant LORMS diagnostic and a step-by-step framework upgrade.
              </p>
            </div>
          )}

          {loading && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
              <p className="text-sm text-slate-400 animate-pulse font-medium">Kopi is examining your structural parameters...</p>
            </div>
          )}

          {feedback && (
            <div className="space-y-6 animate-fadeIn">
              {/* Score Header Widget */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Estimated Banding</h3>
                  <p className="text-3xl font-black text-indigo-400">{feedback.scoreEstimate}</p>
                </div>
                
                {/* Structural Status Pills */}
                <div className="flex flex-col gap-2 text-right">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <span className="text-slate-400">Point Statement:</span>
                    <span className={`px-2 py-0.5 rounded ${feedback.pointStatus === 'Pass' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      {feedback.pointStatus}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <span className="text-slate-400">Source Evidence:</span>
                    <span className={`px-2 py-0.5 rounded ${feedback.evidenceStatus === 'Pass' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      {feedback.evidenceStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Critique Panel */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Structural Diagnostics</h4>
                <ul className="space-y-3">
                  {feedback.critique?.map((item: string, idx: number) => (
                    <li key={idx} className="text-sm text-slate-300 flex gap-2.5">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Premium A1 Upgrade Canvas */}
              <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">A1 Exemplar Upgrade</h4>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-bold uppercase tracking-wide">
                    PEEL Aligned
                  </span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed font-mono bg-slate-950/60 p-4 rounded-xl border border-slate-800/60 whitespace-pre-line">
                  {feedback.a1Upgrade}
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
