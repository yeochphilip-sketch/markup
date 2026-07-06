'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import Image from 'next/image';

interface HistoryItem {
  id: string;
  subject: string;
  topic: string;
  question_type: string;
  question_prompt: string;
  background_context: string;
  source_a: string;
  source_b: string;
  suggested_answer: string;
  created_at: string;
}

export default function DashboardPage() {
  const [activeSubject, setActiveSubject] = useState('Social Studies');
  const [selectedTopic, setSelectedTopic] = useState('Governance');
  const [selectedSkill, setSelectedSkill] = useState('SBCS: Comparison');
  const [studentAnswer, setStudentAnswer] = useState('');
  const [userAvatar, setUserAvatar] = useState('/default-avatar.png');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const [challenge, setChallenge] = useState({
    backgroundContext: '',
    sourceA: '',
    sourceB: '',
    questionPrompt: '',
    suggestedAnswer: ''
  });

  const [evaluation, setEvaluation] = useState({
    scoreEstimate: '',
    critique: [] as string[]
  });

  const loadHistoryLogs = async () => {
    const { data } = await supabase
      .from('practice_history')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setHistory(data);
  };

  useEffect(() => {
    async function initUserSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.user_metadata?.avatar_url) {
        setUserAvatar(session.user.user_metadata.avatar_url);
      }
      loadHistoryLogs();
    }
    initUserSession();
  }, []);

  const handleGenerateChallenge = async () => {
    setIsGenerating(true);
    setHasScanned(false);
    setEvaluation({ scoreEstimate: '', critique: [] });
    
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
      loadHistoryLogs(); // Instantly refresh sidebar logs
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
        scoreEstimate: data.scoreEstimate || 'L1/1',
        critique: data.critique || []
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
      {/* Top Navigation */}
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

      {/* Main Workspace Frame */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-5 p-6 gap-6 overflow-hidden">
        
        {/* Expanded Spiced Panel: Configurator & Chat/Prompt Log History */}
        <div className="xl:col-span-1 flex flex-col space-y-4 max-h-[85vh] overflow-y-auto pr-1">
          <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4 space-y-4">
            <h2 className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Configurator</h2>
            <div className="space-y-3">
              <select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)} className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500">
                <option value="Governance">Governance</option>
                <option value="Conflict and Harmony">Conflict and Harmony</option>
              </select>
              <select value={selectedSkill} onChange={(e) => setSelectedSkill(e.target.value)} className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500">
                <option value="SBCS: Comparison">SBCS: Comparison</option>
                <option value="SBCS: Inference">SBCS: Inference</option>
              </select>
              <button onClick={handleGenerateChallenge} disabled={isGenerating} className="w-full bg-indigo-600 text-white text-xs font-bold py-2.5 rounded-xl transition disabled:opacity-50">
                {isGenerating ? 'Drafting...' : '⚡ Generate Practice'}
              </button>
            </div>
          </div>

          {/* Dynamic Challenge History List */}
          <div className="flex-1 flex flex-col min-h-[250px]">
            <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase mb-2">Practice Challenge Logs</span>
            <div className="flex-1 space-y-2 overflow-y-auto max-h-[50vh] pr-1">
              {history.length === 0 ? (
                <div className="text-[11px] text-slate-600 italic p-2">No historical submissions registered.</div>
              ) : (
                history.map((item) => (
                  <div key={item.id} onClick={() => setChallenge({ backgroundContext: item.background_context, sourceA: item.source_a, sourceB: item.source_b, questionPrompt: item.question_prompt, suggestedAnswer: item.suggested_answer })} className="bg-slate-950/30 hover:bg-slate-900/60 border border-slate-900 p-3 rounded-xl cursor-pointer transition text-left space-y-1.5 group">
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-[9px] bg-slate-900 px-2 py-0.5 rounded text-indigo-400 font-bold uppercase tracking-wider">{item.subject === 'Social Studies' ? 'SS' : 'HIST'}</span>
                      <span className="text-[8px] text-slate-500">{item.question_type.replace('SBCS: ', '')}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 font-medium group-hover:text-slate-200 transition">{item.question_prompt}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Left-Middle: Active Challenge Text Display */}
        <div className="xl:col-span-1 space-y-3 max-h-[85vh] overflow-y-auto pr-1">
          {challenge.backgroundContext ? (
            <>
              <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 text-xs space-y-1">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Contextual Background</span>
                <p className="text-slate-400 leading-relaxed">{challenge.backgroundContext}</p>
              </div>
              <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 text-xs space-y-1">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Source A</span>
                <p className="text-slate-300 italic leading-relaxed">{challenge.sourceA}</p>
              </div>
              <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 text-xs space-y-1">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Source B</span>
                <p className="text-slate-300 italic leading-relaxed">{challenge.sourceB}</p>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center border border-dashed border-slate-900 rounded-xl text-xs text-slate-600 p-4 text-center">Select or generate a challenge task configuration block to initialize context resources.</div>
          )}
        </div>

        {/* Center: Canvas Workspace area */}
        <div className="xl:col-span-2 flex flex-col space-y-4">
          {challenge.questionPrompt && (
            <div className="bg-indigo-950/20 border border-indigo-900/30 rounded-2xl p-4">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Exam Prompt Assignment</span>
              <p className="text-xs font-bold text-slate-200 mt-1">{challenge.questionPrompt}</p>
            </div>
          )}
          <div className="flex-1 flex flex-col bg-slate-950/40 border border-slate-900 rounded-2xl p-5">
            <textarea value={studentAnswer} onChange={(e) => setStudentAnswer(e.target.value)} placeholder="Draft your structural analytical PEEL answer response structure paragraph here..." className="w-full flex-1 bg-transparent text-slate-300 font-mono text-xs leading-relaxed resize-none focus:outline-none" />
          </div>
          <button onClick={handleScanStructure} disabled={isGrading || !studentAnswer} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-xs transition disabled:opacity-40">
            {isGrading ? 'Evaluating Framework Layout Matrix...' : 'Scan Answer Structure'}
          </button>
        </div>

        {/* Right Sidebar: Marks Banding & Post-Scan Model Solution display */}
        <div className="xl:col-span-1 space-y-4 max-h-[85vh] overflow-y-auto pr-1">
          <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-5 space-y-4 flex flex-col h-full">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Estimated Banding</span>
              <div className="text-sm font-black text-indigo-400 tracking-tight mt-1">{evaluation.scoreEstimate || 'Awaiting Submission...'}</div>
            </div>
            {evaluation.critique.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-900">
                <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase block">Structural Diagnostics</span>
                <ul className="space-y-2">
                  {evaluation.critique.map((bullet, idx) => (
                    <li key={idx} className="text-[11px] text-slate-400 leading-relaxed flex items-start gap-2">
                      <span className="text-indigo-500">•</span><span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {hasScanned && challenge.suggestedAnswer && (
              <div className="space-y-2 pt-3 border-t border-slate-900 flex-1 flex flex-col">
                <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase block">Suggested Model Answer</span>
                <div className="flex-1 bg-slate-900/40 border border-slate-800/80 rounded-xl p-3 text-[11px] text-slate-400 leading-relaxed overflow-y-auto max-h-[220px]">{challenge.suggestedAnswer}</div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
