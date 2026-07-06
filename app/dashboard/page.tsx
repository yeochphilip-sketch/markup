'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import Image from 'next/image';

export default function DashboardPage() {
  const [activeSubject, setActiveSubject] = useState('Social Studies');
  const [selectedTopic, setSelectedTopic] = useState('Governance');
  const [selectedSkill, setSelectedSkill] = useState('SBCS: Comparison');
  const [studentAnswer, setStudentAnswer] = useState('');
  const [userAvatar, setUserAvatar] = useState('/default-avatar.png');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGrading, setIsGrading] = useState(false);

  // Challenge State (Preserved explicitly during grading executions)
  const [challenge, setChallenge] = useState({
    backgroundContext: '',
    sourceA: '',
    sourceB: '',
    questionPrompt: '',
    suggestedAnswer: ''
  });

  // Evaluation Metrics State
  const [evaluation, setEvaluation] = useState({
    scoreEstimate: '',
    critique: [] as string[]
  });

  // Fetch Session data to secure the Google Profile Picture
  useEffect(() => {
    async function getUserData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.user_metadata?.avatar_url) {
        setUserAvatar(session.user.user_metadata.avatar_url);
      }
    }
    getUserData();
  }, []);

  const handleGenerateChallenge = async () => {
    setIsGenerating(true);
    setEvaluation({ scoreEstimate: '', critique: [] }); // Reset grading column
    
    try {
      const res = await fetch('/api/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: activeSubject, topic: selectedTopic, questionType: selectedSkill }),
      });
      const data = await res.json();
      
      // Fix: Direct mapping from API payload fields to challenge state parameters
      setChallenge({
        backgroundContext: data.backgroundContext || '',
        sourceA: data.sourceA || '',
        sourceB: data.sourceB || '',
        questionPrompt: data.questionPrompt || '',
        suggestedAnswer: data.suggestedAnswer || 'No model answer provided.'
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleScanStructure = async () => {
    if (!studentAnswer.trim()) return;
    setIsGrading(true);
    try {
      const res = await fetch('/api/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentAnswer, questionType: selectedSkill, subject: activeSubject }),
      });
      const data = await res.json();
      
      setEvaluation({
        scoreEstimate: data.scoreEstimate || 'L1/1 (Initial Attempt)',
        critique: data.critique || []
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsGrading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans">
      {/* Navbar Section */}
      <header className="border-b border-slate-900 px-6 py-4 flex items-center justify-between bg-slate-950/40 backdrop-blur-sm">
        <h1 className="text-xl font-black text-indigo-500 tracking-wider">MARKUP</h1>
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-900 p-1 rounded-xl gap-1">
            {['Social Studies', 'Elective History'].map((sub) => (
              <button
                key={sub}
                onClick={() => setActiveSubject(sub)}
                className={`text-xs font-bold px-4 py-2 rounded-lg transition ${activeSubject === sub ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {sub}
              </button>
            ))}
          </div>
          <div className="relative w-9 h-9 rounded-full overflow-hidden border border-slate-800">
            <Image src={userAvatar} alt="Google Avatar" fill sizes="36px" priority className="object-cover" referrerPolicy="no-referrer" />
          </div>
        </div>
      </header>

      {/* Main Framework Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 p-6 gap-6 overflow-hidden">
        {/* Left Hand: Configurator Panel */}
        <div className="lg:col-span-1 space-y-4 flex flex-col justify-between">
          <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-5 space-y-4">
            <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase">Practice Configurator</h2>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-500">Syllabus Topic</label>
              <select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)} className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs font-medium text-slate-200 focus:outline-none focus:border-indigo-500">
                <option value="Governance">Governance</option>
                <option value="Conflict and Harmony">Conflict and Harmony</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-500">Question Skill Type</label>
              <select value={selectedSkill} onChange={(e) => setSelectedSkill(e.target.value)} className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs font-medium text-slate-200 focus:outline-none focus:border-indigo-500">
                <option value="SBCS: Comparison">SBCS: Comparison</option>
                <option value="SBCS: Inference">SBCS: Inference</option>
              </select>
            </div>

            <button onClick={handleGenerateChallenge} disabled={isGenerating} className="w-full bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/20 text-xs font-bold py-3 rounded-xl transition shadow-sm disabled:opacity-50">
              {isGenerating ? 'Drafting Mock Paper...' : '⚡ Generate Practice Challenge'}
            </button>
          </div>

          {/* Sources Displays */}
          <div className="space-y-3 flex-1 mt-4">
            {challenge.backgroundContext && (
              <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 space-y-1.5 text-xs">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Contextual Background</span>
                <p className="text-slate-400 leading-relaxed">{challenge.backgroundContext}</p>
              </div>
            )}
            {challenge.sourceA && (
              <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 space-y-1.5 text-xs">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Source A</span>
                <p className="text-slate-300 italic leading-relaxed">{challenge.sourceA}</p>
              </div>
            )}
            {challenge.sourceB && (
              <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 space-y-1.5 text-xs">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Source B</span>
                <p className="text-slate-300 italic leading-relaxed">{challenge.sourceB}</p>
              </div>
            )}
          </div>
        </div>

        {/* Center: Evaluation Workspace */}
        <div className="lg:col-span-2 flex flex-col space-y-4">
          {challenge.questionPrompt && (
            <div className="bg-indigo-950/20 border border-indigo-900/30 rounded-2xl p-5">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Exam Prompt Assignment</span>
              <p className="text-sm font-bold text-slate-200 mt-1">{challenge.questionPrompt}</p>
            </div>
          )}

          <div className="flex-1 flex flex-col bg-slate-950/40 border border-slate-900 rounded-2xl p-5 relative">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Write / Structural Draft Canvas</span>
            <textarea
              value={studentAnswer}
              onChange={(e) => setStudentAnswer(e.target.value)}
              placeholder="Structure your PEEL response paragraph here..."
              className="w-full flex-1 bg-transparent text-slate-300 font-mono text-xs leading-relaxed resize-none focus:outline-none"
            />
          </div>

          <button onClick={handleScanStructure} disabled={isGrading || !studentAnswer} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl text-xs tracking-wide transition shadow-md shadow-indigo-950/40 disabled:opacity-40">
            {isGrading ? 'Analyzing PEEL Matrix Structures...' : 'Scan Answer Structure'}
          </button>
        </div>

        {/* Right Hand: LORMS Grading & Suggested Answer Container */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-5 space-y-4 h-full flex flex-col">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Estimated Banding</span>
              <div className="text-md font-black text-indigo-400 tracking-tight mt-1">
                {evaluation.scoreEstimate || 'Awaiting Paragraph Input...'}
              </div>
            </div>

            {/* Diagnostics Block */}
            {evaluation.critique.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-slate-900">
                <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase block">Structural Diagnostics</span>
                <ul className="space-y-2.5">
                  {evaluation.critique.map((bullet, idx) => (
                    <li key={idx} className="text-xs text-slate-400 leading-relaxed flex items-start gap-2">
                      <span className="text-indigo-500 mt-1">•</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Fixed New Section: Suggested Answer Block placed below Diagnostics */}
            {challenge.suggestedAnswer && (
              <div className="space-y-2 pt-3 border-t border-slate-900 flex-1 flex flex-col min-h-[180px]">
                <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase block">Suggested Model Answer</span>
                <div className="flex-1 bg-slate-900/40 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-400 leading-relaxed overflow-y-auto max-h-[300px]">
                  {challenge.suggestedAnswer}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
