'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import Image from 'next/image';

interface Segment {
  text: string;
  type: 'correct' | 'weak' | 'error';
}

export default function DashboardPage() {
  const [activeSubject, setActiveSubject] = useState('Social Studies');
  const [selectedTopic, setSelectedTopic] = useState('Issue 1: Citizenship & Governance');
  const [selectedSkill, setSelectedSkill] = useState('SBQ: Comparison & Contrast');
  
  // Custom vetting states
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  
  const [studentAnswer, setStudentAnswer] = useState('');
  const [userAvatar, setUserAvatar] = useState('/default-avatar.png');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);

  const [challenge, setChallenge] = useState({
    backgroundContext: '',
    sourceA: '',
    sourceB: '',
    questionPrompt: '',
    suggestedAnswer: ''
  });

  const [evaluation, setEvaluation] = useState({
    scoreEstimate: '',
    critique: [] as string[],
    segments: [] as Segment[]
  });

  useEffect(() => {
    async function initUserSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.user_metadata?.avatar_url) {
        setUserAvatar(session.user.user_metadata.avatar_url);
      }
    }
    initUserSession();
  }, []);

  const handleGenerateChallenge = async () => {
    setIsGenerating(true);
    setHasScanned(false);
    setEvaluation({ scoreEstimate: '', critique: [], segments: [] });
    
    try {
      const res = await fetch('/api/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: activeSubject, topic: selectedTopic, questionType: selectedSkill }),
      });
      const data = await res.json();
      
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
        body: JSON.stringify({ 
          studentAnswer, 
          questionPrompt: isCustomMode ? customPrompt : challenge.questionPrompt,
          questionType: selectedSkill, 
          subject: activeSubject 
        }),
      });
      const data = await res.json();
      
      setEvaluation({
        scoreEstimate: data.scoreEstimate || 'L1/1',
        critique: data.critique || [],
        segments: data.highlightedSegments || []
      });
      setHasScanned(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGrading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans">
      <header className="border-b border-slate-900 px-6 py-4 flex items-center justify-between bg-slate-950/40 backdrop-blur-sm">
        <h1 className="text-xl font-black text-indigo-500 tracking-wider">MARKUP</h1>
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-900 p-1 rounded-xl gap-1">
            {['Social Studies', 'Elective History'].map((sub) => (
              <button key={sub} onClick={() => setActiveSubject(sub)} className={`text-xs font-bold px-4 py-2 rounded-lg transition ${activeSubject === sub ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>
                {sub}
              </button>
            ))}
          </div>
          <div className="relative w-9 h-9 rounded-full overflow-hidden border border-slate-800">
            <Image src={userAvatar} alt="Avatar" fill sizes="36px" className="object-cover" referrerPolicy="no-referrer" />
          </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-5 p-6 gap-6 overflow-hidden">
        
        {/* Left Config Panel */}
        <div className="xl:col-span-1 flex flex-col space-y-4">
          <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4 space-y-4">
            <h2 className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Workflow Mode</h2>
            
            {/* Mode Selector Toggle Switches */}
            <div className="grid grid-cols-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button onClick={() => { setIsCustomMode(false); setHasScanned(false); }} className={`text-[10px] font-bold py-2 rounded-lg transition ${!isCustomMode ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>AI Paper</button>
              <button onClick={() => { setIsCustomMode(true); setHasScanned(false); }} className={`text-[10px] font-bold py-2 rounded-lg transition ${isCustomMode ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>Vet Homework</button>
            </div>

            {!isCustomMode ? (
              <div className="space-y-3 pt-2">
                <select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)} className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-xs font-medium text-slate-200">
                  <option value="Issue 1: Citizenship & Governance">Issue 1</option>
                  <option value="Issue 2: Diverse Society Harmony">Issue 2</option>
                </select>
                <button onClick={handleGenerateChallenge} disabled={isGenerating} className="w-full bg-indigo-600 text-white text-xs font-bold py-2.5 rounded-xl transition">
                  {isGenerating ? 'Drafting...' : '⚡ Generate Practice'}
                </button>
              </div>
            ) : (
              <div className="pt-1 text-xs text-slate-400 leading-relaxed">
                Paste your custom question prompt directly in the workspace assignment panel to vet standalone responses.
              </div>
            )}
          </div>
        </div>

        {/* Source Text Context / Metadata Panel */}
        <div className="xl:col-span-1 space-y-3">
          {!isCustomMode ? (
            challenge.backgroundContext ? (
              <div className="space-y-3 max-h-[75vh] overflow-y-auto">
                <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 text-xs">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase">Contextual Background</span>
                  <p className="text-slate-400 mt-1">{challenge.backgroundContext}</p>
                </div>
                <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 text-xs">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase">Source A</span>
                  <p className="text-slate-300 mt-1 italic">{challenge.sourceA}</p>
                </div>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center border border-dashed border-slate-900 rounded-xl text-xs text-slate-600 p-4 text-center">Generate a task to reveal parameters.</div>
            )
          ) : (
            <div className="bg-indigo-950/10 border border-indigo-900/20 rounded-xl p-4 text-xs text-slate-400">
              <span className="font-bold text-indigo-400 block mb-1">Homework Mode Enabled</span>
              You don't need any pre-generated context. Simply copy-paste any school assignment question and essay response draft into the workspace area.
            </div>
          )}
        </div>

        {/* Center Canvas with Dynamic Highlights */}
        <div className="xl:col-span-2 flex flex-col space-y-4">
          <div className="bg-indigo-950/20 border border-indigo-900/30 rounded-2xl p-4">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Question Assignment Prompt</span>
            {isCustomMode ? (
              <input type="text" value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} placeholder="Type or paste your custom school assignment question here..." className="w-full bg-slate-900 border border-slate-800 p-2.5 mt-2 rounded-xl text-xs text-slate-200 focus:outline-none" />
            ) : (
              <p className="text-xs font-bold text-slate-200 mt-1">{challenge.questionPrompt || 'No assignment generated yet.'}</p>
            )}
          </div>

          <div className="flex-1 flex flex-col bg-slate-950/40 border border-slate-900 rounded-2xl p-5 relative min-h-[300px]">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Essay Input Workspace</span>
            
            {!hasScanned ? (
              <textarea value={studentAnswer} onChange={(e) => setStudentAnswer(e.target.value)} placeholder="Draft your PEEL response paragraph essay structural layout here..." className="w-full flex-1 bg-transparent text-slate-300 font-mono text-xs leading-relaxed resize-none focus:outline-none" />
            ) : (
              // The Secret Sauce: Inline segment renderer for red/yellow styling overrides
              <div className="w-full flex-1 font-mono text-xs leading-relaxed overflow-y-auto whitespace-pre-wrap select-text text-slate-300">
                {evaluation.segments.map((seg, idx) => {
                  if (seg.type === 'error') {
                    return <span key={idx} className="underline decoration-red-500 decoration-wavy bg-red-500/10 px-0.5 rounded text-red-200" title="Critical analytical/fact failure">{seg.text}</span>;
                  }
                  if (seg.type === 'weak') {
                    return <span key={idx} className="bg-yellow-500/20 underline decoration-yellow-500 text-yellow-100 px-0.5 rounded" title="Vague statement or missing link">{seg.text}</span>;
                  }
                  return <span key={idx}>{seg.text}</span>;
                })}
                <div className="mt-6 pt-4 border-t border-slate-900">
                  <button onClick={() => setHasScanned(false)} className="text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-400 font-bold px-3 py-1.5 rounded-lg border border-slate-800 transition">✏️ Edit Response Text</button>
                </div>
              </div>
            )}
          </div>

          <button onClick={handleScanStructure} disabled={isGrading || !studentAnswer} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-xs transition">
            {isGrading ? 'Scanning response layers...' : 'Scan Answer Structure'}
          </button>
        </div>

        {/* Right Panel: Grading Metrics */}
        <div className="xl:col-span-1">
          <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-5 space-y-4 h-full flex flex-col">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Estimated Banding</span>
              <div className="text-sm font-black text-indigo-400 tracking-tight mt-1">{evaluation.scoreEstimate || 'Awaiting Submission...'}</div>
            </div>
            {evaluation.critique.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-900">
                <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase block">Diagnostics Checklist</span>
                <ul className="space-y-2">
                  {evaluation.critique.map((bullet, idx) => (
                    <li key={idx} className="text-[11px] text-slate-400 flex items-start gap-2"><span className="text-indigo-500">•</span><span>{bullet}</span></li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
