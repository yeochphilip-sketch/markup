'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/utils/supabase';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Segment {
  text: string;
  type: 'correct' | 'weak' | 'error';
}

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
  annotated_source_a?: string;
  annotated_source_b?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [activeSubject, setActiveSubject] = useState('Social Studies');
  const [selectedTopic, setSelectedTopic] = useState('Any Topic (Random Mix)');
  const [selectedSkill, setSelectedSkill] = useState('SBQ: Inference / Message (AO2)');
  
  const [studentAnswer, setStudentAnswer] = useState('');
  const [userAvatar, setUserAvatar] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentChallengeId, setCurrentChallengeId] = useState<string | null>(null);
  const [isExemplarOpen, setIsExemplarOpen] = useState(false);

  // Stats & XP
  const [streakCount, setStreakCount] = useState(3);
  const [masteryXP, setMasteryXP] = useState(1240);
  const [skillRatings, setSkillRatings] = useState({ inf: 4, cmp: 3, rel: 2, esy: 3 });

  const [challenge, setChallenge] = useState({
    backgroundContext: 'Generate a paper to see materials.',
    sourceA: '', sourceB: '', questionPrompt: '', suggestedAnswer: ''
  });

  const [evaluation, setEvaluation] = useState({ scoreEstimate: '', critique: [], segments: [] as Segment[] });

  const sourceARef = useRef<HTMLParagraphElement>(null);
  const sourceBRef = useRef<HTMLParagraphElement>(null);

  const loadHistoryLogs = async () => {
    const { data } = await supabase.from('practice_history').select('*').order('created_at', { ascending: false });
    if (data) setHistory(data);
  };

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        setUserEmail(session.user.email || '');
        setUserAvatar(session.user.user_metadata?.avatar_url || '');
      }
      loadHistoryLogs();
    }
    init();
  }, []);

  const handleGenerateChallenge = async () => {
    setIsGenerating(true); setHasScanned(false); setIsExemplarOpen(false);
    const res = await fetch('/api/generate-question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: activeSubject, topic: selectedTopic, questionType: selectedSkill }),
    });
    const data = await res.json();
    setChallenge({ ...data });
    
    if (userId) {
      const { data: saved } = await supabase.from('practice_history').insert([{
        user_id: userId, subject: activeSubject, topic: selectedTopic, question_type: selectedSkill,
        question_prompt: data.questionPrompt, background_context: data.backgroundContext,
        source_a: data.sourceA, source_b: data.sourceB, suggested_answer: data.suggestedAnswer
      }]).select().single();
      if (saved) setCurrentChallengeId(saved.id);
    }
    setIsGenerating(false);
    loadHistoryLogs();
  };

  const handleScanStructure = async () => {
    if (!studentAnswer.trim()) return;
    setIsGrading(true);
    const res = await fetch('/api/grade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentAnswer, questionPrompt: challenge.questionPrompt, questionType: selectedSkill, subject: activeSubject }),
    });
    const data = await res.json();
    setEvaluation({
      scoreEstimate: data.scoreEstimate || 'L1/1',
      critique: data.critique || [],
      segments: data.highlightedSegments || []
    });
    setHasScanned(true);
    setIsGrading(false);
    setMasteryXP(prev => prev + 150);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans relative overflow-hidden">
      
      {/* Top Navbar */}
      <header className="border-b border-slate-900 px-6 py-4 flex items-center justify-between bg-slate-950/60 backdrop-blur-md relative z-40">
        <h1 className="text-xl font-black text-indigo-500 tracking-wider">MARKUP</h1>
        <div className="flex bg-slate-900 p-1 rounded-xl gap-1">
          {['Social Studies', 'Elective History'].map((sub) => (
            <button key={sub} onClick={() => setActiveSubject(sub)} className={`text-[10px] font-bold px-4 py-2 rounded-lg transition ${activeSubject === sub ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>{sub}</button>
          ))}
        </div>
      </header>

      {/* Gamification / Smart Recommendation Banner */}
      <div className="px-6 pt-6 grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="md:col-span-2 bg-indigo-600/10 border border-indigo-500/30 p-4 rounded-[2rem] flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition">💡</div>
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-xl">🎯</div>
          <div>
            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Weak Spot Recommendation</h4>
            <p className="text-xs font-bold text-slate-200">You're trailing on <span className="text-indigo-400">Reliability Checks</span>. Focus there to hit L5.</p>
          </div>
        </div>

        <div className="md:col-span-1 bg-slate-950/80 border border-slate-900 p-4 rounded-[2rem] flex flex-col justify-center text-center">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">XP Mastery</span>
          <span className="text-xl font-black text-indigo-400">{masteryXP} <span className="text-[10px] text-slate-600 font-normal">pts</span></span>
        </div>

        <div className="md:col-span-3 bg-slate-950/80 border border-slate-900 p-4 rounded-[2rem] grid grid-cols-4 gap-2">
          <div className="text-center"><p className="text-[8px] font-bold text-slate-500 uppercase">Inference</p><p className="text-xs font-bold text-emerald-400">L{skillRatings.inf}/5</p></div>
          <div className="text-center"><p className="text-[8px] font-bold text-slate-500 uppercase">Compare</p><p className="text-xs font-bold text-emerald-400">L{skillRatings.cmp}/6</p></div>
          <div className="text-center"><p className="text-[8px] font-bold text-slate-500 uppercase">Reliability</p><p className="text-xs font-bold text-rose-400">L{skillRatings.rel}/6</p></div>
          <div className="text-center"><p className="text-[8px] font-bold text-slate-500 uppercase">SEQ Essay</p><p className="text-xs font-bold text-emerald-400">L{skillRatings.esy}/8</p></div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-6 p-6 gap-6">
        
        {/* Left Configurator */}
        <div className="xl:col-span-1 flex flex-col space-y-4">
          <div className="bg-slate-950/60 border border-slate-900 rounded-[2rem] p-5 space-y-4">
            <h2 className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Configurator</h2>
            <div className="space-y-4">
              <select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)} className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs font-bold text-slate-200">
                <option value="Any Topic (Random Mix)">✨ Any Topic</option>
                <option value="Issue 1: Citizenship">Citizenship & Governance</option>
              </select>
              <select value={selectedSkill} onChange={(e) => setSelectedSkill(e.target.value)} className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs font-bold text-slate-200">
                <option value="All Skills">📚 Complete Portfolio</option>
                <option value="SBQ: Inference">Inference / Message</option>
              </select>
              <button onClick={handleGenerateChallenge} disabled={isGenerating} className="w-full bg-indigo-600 text-white text-xs font-black py-4 rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 transition">
                {isGenerating ? 'Drafting...' : '⚡ Generate Practice'}
              </button>
            </div>
          </div>
          
          <div className="flex-1 bg-slate-950/40 border border-slate-900 rounded-[2rem] p-5">
            <h2 className="text-[10px] font-black tracking-widest text-slate-500 uppercase mb-4">Practice Logs</h2>
            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
              {history.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => setChallenge({
                    backgroundContext: item.background_context,
                    sourceA: item.source_a,
                    sourceB: item.source_b,
                    questionPrompt: item.question_prompt,
                    suggestedAnswer: item.suggested_answer
                  })} 
                  className="p-3 bg-slate-900/40 border border-slate-800 rounded-xl cursor-pointer hover:border-indigo-500 transition group"
                >
                  <p className="text-[10px] text-slate-400 font-bold group-hover:text-slate-100 line-clamp-2 leading-snug">{item.question_prompt}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Workspace */}
        <div className="xl:col-span-5 grid grid-cols-1 xl:grid-cols-5 gap-6 relative">
          
          {/* Main Writing Canvas */}
          <div className="xl:col-span-4 flex flex-col space-y-4">
            <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-6 min-h-[450px] flex flex-col relative">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Writing Workspace</span>
                {hasScanned && (
                  <button 
                    onClick={() => setIsExemplarOpen(true)}
                    className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black px-4 py-1.5 rounded-full hover:bg-emerald-500/20 transition"
                  >
                    💡 View Model Essay
                  </button>
                )}
              </div>
              
              {!hasScanned ? (
                <textarea 
                  value={studentAnswer} 
                  onChange={(e) => setStudentAnswer(e.target.value)} 
                  placeholder="Draft your structured PEEL argument here..." 
                  className="w-full flex-1 bg-transparent text-slate-200 font-mono text-sm leading-relaxed resize-none focus:outline-none"
                />
              ) : (
                <div className="flex-1 font-mono text-sm leading-relaxed overflow-y-auto select-text text-slate-300">
                  {evaluation.segments.map((seg, idx) => (
                    <span key={idx} className={seg.type === 'error' ? 'underline decoration-red-500' : seg.type === 'weak' ? 'bg-yellow-500/10' : ''}>{seg.text}</span>
                  ))}
                  <div className="mt-8 border-t border-slate-800 pt-6">
                    <button onClick={() => setHasScanned(false)} className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest">✏️ Resume Editing</button>
                  </div>
                </div>
              )}

              <button 
                onClick={handleScanStructure} 
                disabled={isGrading || !studentAnswer} 
                className="mt-6 w-full bg-slate-100 text-slate-950 font-black py-4 rounded-2xl shadow-xl transition active:scale-[0.98]"
              >
                {isGrading ? 'Scanning response...' : 'Scan Answer Structure'}
              </button>
            </div>
          </div>

          {/* Right Metrics Panel */}
          <div className="xl:col-span-1 bg-slate-950/60 border border-slate-900 rounded-[2rem] p-6">
            <span className="text-[10px] font-black text-slate-500 uppercase block mb-2">Banding</span>
            <div className="text-2xl font-black text-indigo-400 mb-6">{evaluation.scoreEstimate || 'Pending'}</div>
            <div className="space-y-4">
              <span className="text-[10px] font-black text-slate-500 uppercase block border-t border-slate-900 pt-4">Checks</span>
              <ul className="space-y-3">
                {evaluation.critique.map((b, i) => (
                  <li key={i} className="text-[11px] font-bold text-slate-400 leading-relaxed">• {b}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Exemplar Bank Sliding Panel */}
          {isExemplarOpen && (
            <div className="absolute inset-y-0 right-0 w-full xl:w-2/3 bg-slate-950 border-l border-slate-800 z-50 shadow-[0_0_100px_rgba(0,0,0,0.8)] p-10 animate-in slide-in-from-right duration-300 rounded-l-[3rem]">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-black">Top-Mark <span className="text-emerald-400">Exemplar</span></h3>
                <button onClick={() => setIsExemplarOpen(false)} className="w-10 h-10 rounded-full border border-slate-800 flex items-center justify-center hover:bg-slate-900 transition">✕</button>
              </div>
              <div className="bg-emerald-500/5 border border-emerald-500/20 p-8 rounded-[2rem] h-[calc(100%-120px)] overflow-y-auto">
                <p className="text-sm text-slate-300 font-serif leading-[1.8] whitespace-pre-line select-text">
                  {challenge.suggestedAnswer || "No exemplar provided for this task."}
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
