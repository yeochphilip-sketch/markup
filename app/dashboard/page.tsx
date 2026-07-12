'use client';

// 🚀 Forces Vercel to serve this page fresh on every single load, picking up active tokens
export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/utils/supabase';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import FeedbackModal from '@/app/components/FeedbackModal';

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
  source_a_provenance?: string;
  source_b: string;
  source_b_provenance?: string;
  suggested_answer: string;
  created_at: string;
}

const SYLLABUS_MAP: Record<string, { topics: string[]; skills: string[] }> = {
  'Social Studies': {
    topics: [
      'Any Topic (Random Mix)',
      'Issue 1: Exploring Citizenship and Governance',
      'Issue 2: Living in a Diverse Society',
      'Issue 3: Responding to a Globalised World'
    ],
    skills: [
      'SBQ: Inference / Message (AO2)',
      'SBQ: Comparison & Contrast (AO2)',
      'SBQ: Purpose / Motive Evolution (AO2)',
      'SBQ: Utility & Reliability Limits (AO2)',
      'SBQ: Synthesis Matrix Assertion (AO2)',
      'SRQ/SEQ: Structured Essay Explanations (AO1)'
    ]
  },
  'Elective History': {
    topics: [
      'Any Topic (Random Mix)',
      'Case Study: Nazi Germany (*SBCS)',
      'Case Study: Militarist Japan',
      'WWII: Outbreak in Europe (*SBCS)',
      'Cold War: Origins in Europe (*SBCS)'
    ],
    skills: [
      'SBQ: Inference / Message (AO3)',
      'SBQ: Comparison & Contrast (AO3)',
      'SBQ: Reliability & Cross-Referencing (AO3)',
      'SBQ: Evaluation of Utility (AO3)',
      'SBQ: Target Purpose Analysis (AO3)',
      'SEQ: High-Scoring Essay Factor Prioritization (AO1/AO2)'
    ]
  }
};

export default function DashboardPage() {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [activeSubject, setActiveSubject] = useState('Social Studies');
  const [selectedTopic, setSelectedTopic] = useState('Any Topic (Random Mix)');
  const [selectedSkill, setSelectedSkill] = useState('SBQ: Inference / Message (AO2)');
  
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  
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
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const [selectedType, setSelectedType] = useState('General');
  const [textInput, setTextInput] = useState('');
  const [masteryPoints, setMasteryPoints] = useState(0); 

  const [timeLeft, setTimeLeft] = useState(1200); 
  const [isTimerActive, setIsTimerActive] = useState(false);
  
  const [skillRatings, setSkillRatings] = useState({
    inference: 1,
    comparison: 1,
    reliability: 1,
    essay: 1,
    conclusion: 0
  });

  const [challenge, setChallenge] = useState({
    backgroundContext: 'Click Generate Practice to load Singapore standard materials.',
    sourceAProvenance: 'Source A sample provenance information context.',
    sourceA: 'Source A contents appear here once generated.',
    sourceBProvenance: 'Source B sample provenance information context.',
    sourceB: 'Source B contents appear here once generated.',
    questionPrompt: 'No question active. Use the configurator panel on the left to start.',
    suggestedAnswer: ''
  });

  const [evaluation, setEvaluation] = useState({
    scoreEstimate: '',
    critique: [] as string[],
    segments: [] as Segment[]
  });

  useEffect(() => {
    let interval: any = null;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getSkillColorClass = (val: number) => {
    return val >= 3 ? 'text-emerald-400' : 'text-rose-500';
  };

  useEffect(() => {
    const config = SYLLABUS_MAP[activeSubject];
    if (config) {
      setSelectedTopic(config.topics[0]);
      setSelectedSkill(config.skills[0]);
    }
    setEvaluation({ scoreEstimate: '', critique: [], segments: [] });
  }, [activeSubject]);

  const loadHistoryLogs = async (uid?: string) => {
    try {
      const targetUid = uid || userId;
      if (!targetUid) return;
      const { data: historyData, error } = await supabase
        .from('practice_history')
        .select('*')
        .eq('user_id', targetUid)
        .order('created_at', { ascending: false });
      if (historyData && !error) setHistory(historyData);
    } catch (e) {
      console.warn(e);
    }
  };

  const loadUserMetrics = async (uid: string) => {
    try {
      const { data: metricsData } = await supabase
        .from('user_skill_metrics')
        .select('*')
        .eq('user_id', uid)
        .single();
      if (metricsData) {
        setSkillRatings({
          inference: metricsData.sbq_inference_score || 1,
          comparison: metricsData.sbq_comparison_score || 1,
          reliability: metricsData.sbq_reliability_score || 1,
          essay: metricsData.seq_essay_score || 1,
          conclusion: metricsData.seq_conclusion_score !== undefined ? metricsData.seq_conclusion_score : 0
        });
      }
    } catch (err) {
      console.warn("Metrics defaulted.");
    }
  };

  useEffect(() => {
    async function forceRetrieveSession() {
      try {
        // 1. Force fetch directly from the active client handler
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session?.user) {
          handleUserSession(session.user);
          return;
        }

        // 2. Backup: Look into your local storage directly if cookies failed to load
        const localStorageKey = Object.keys(localStorage).find(key => key.startsWith('sb-') && key.endsWith('-auth-token'));
        if (localStorageKey) {
          const rawData = localStorage.getItem(localStorageKey);
          if (rawData) {
            const parsed = JSON.parse(rawData);
            if (parsed?.user) {
              handleUserSession(parsed.user);
              return;
            }
          }
        }
      } catch (err) {
        console.warn("Session retrieval fallback failed:", err);
      }
    }

    function handleUserSession(user: any) {
      setUserId(user.id);
      const rawEmail = user.email || user.user_metadata?.email || '';
      setUserEmail(rawEmail.toLowerCase().trim());
      setUserAvatar(user.user_metadata?.avatar_url || '');
      loadUserMetrics(user.id);
      loadHistoryLogs(user.id);
    }

    forceRetrieveSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        handleUserSession(session.user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);
  const handleGenerateChallenge = async () => {
    setIsGenerating(true);
    setHasScanned(false);
    setIsExemplarOpen(false);
    setEvaluation({ scoreEstimate: '', critique: [], segments: [] });
    
    try {
      const res = await fetch('/api/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          subject: activeSubject, 
          topic: selectedTopic, 
          questionType: selectedSkill 
        }),
      });
      const data = await res.json();
      
      setChallenge({
        backgroundContext: data.backgroundContext || '',
        sourceAProvenance: data.sourceAProvenance || '',
        sourceA: data.sourceA || '',
        sourceBProvenance: data.sourceBProvenance || '',
        sourceB: data.sourceB || '',
        questionPrompt: data.questionPrompt || '',
        suggestedAnswer: data.suggestedAnswer || ''
      });

      if (userId) {
        const { data: savedRecord } = await supabase
          .from('practice_history')
          .insert([{
            user_id: userId,
            subject: activeSubject,
            topic: selectedTopic,
            question_type: selectedSkill,
            question_prompt: data.questionPrompt,
            background_context: data.backgroundContext,
            source_a: data.sourceA, 
            source_b: data.sourceB, 
            suggested_answer: data.suggestedAnswer
          }])
          .select()
          .single();

        if (savedRecord) setCurrentChallengeId(savedRecord.id);
        loadHistoryLogs(userId);
      }
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
      const activePrompt = isCustomMode ? customPrompt : challenge.questionPrompt;
      const res = await fetch('/api/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          studentAnswer, 
          questionPrompt: activePrompt,
          questionType: selectedSkill, 
          subject: activeSubject,
          topic: selectedTopic
        }),
      });
      const data = await res.json();
      
      setEvaluation({
        scoreEstimate: data.scoreEstimate || 'L2/3',
        critique: data.critique || [],
        segments: data.highlightedSegments || [{ text: studentAnswer, type: 'correct' }]
      });

      if (userId) {
        await supabase
          .from('essay_evaluations').insert([{
            user_id: userId,
            student_essay: studentAnswer,
            score_estimate: data.scoreEstimate || 'L2/3',
            critique_bullets: data.critique || []
          }]);
        setMasteryPoints(prev => prev + 120);
      }

      setHasScanned(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGrading(false);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setStudentAnswer(text);
    } catch (err) {
      console.warn("Clipboard access denied.");
    }
  };

  const handleInjectPeelFrame = () => {
    const frame = `Point: [State your direct claim matching the prompt parameters here]\nEvidence: [Quote historical or source cross-reference data here]\nExplanation: [Analyze why this evidence supports your argument using LORMS properties]\nLink: [Therefore, wrap back to the question statement...]`;
    setStudentAnswer(frame);
  };

  const handleSubmitFeedback = async () => {
    if (!textInput.trim()) return;
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          userEmail,
          feedbackType: selectedType,
          description: textInput,
        }),
      });
      
      if (res.ok) {
        setTextInput('');
        setIsFeedbackOpen(false);
        alert("Feedback submitted directly.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadHistoricalItem = (item: HistoryItem) => {
    setCurrentChallengeId(item.id);
    setHasScanned(false);
    setIsExemplarOpen(false);
    setChallenge({
      backgroundContext: item.background_context,
      sourceAProvenance: item.source_a_provenance || 'Source A Context:',
      sourceA: item.source_a,
      sourceBProvenance: item.source_b_provenance || 'Source B Context:',
      sourceB: item.source_b,
      questionPrompt: item.question_prompt,
      suggestedAnswer: item.suggested_answer || ''
    });
    setEvaluation({ scoreEstimate: '', critique: [], segments: [] });
  };

  const emailInitial = userEmail ? userEmail.charAt(0).toUpperCase() : 'S';
  const isQuestionPromptInactive = challenge.questionPrompt.includes('No question active');

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans relative selection:bg-indigo-500/30">
      
      {/* Navigation Header */}
      <header className="border-b border-slate-900 px-6 py-4 flex items-center justify-between bg-slate-950/60 backdrop-blur-md relative z-40">
        <h1 className="text-xl font-black text-indigo-500 tracking-wider">MARKUP</h1>
        
        <div className="flex items-center gap-6">
          {/* 📊 DIAGNOSTIC TOGGLE: This prints exactly what your app sees */}
          <div className="text-[10px] bg-slate-900 border border-slate-800 p-2 rounded-xl text-slate-400 font-mono">
            <div>ID: <span className="text-amber-400">{userId || 'NULL'}</span></div>
            <div>Email: <span className="text-emerald-400">"{userEmail || 'EMPTY'}"</span></div>
          </div>

          {/* 📊 PERMANENT LOCAL STORAGE BYPASS */}
          {(typeof window !== 'undefined' && localStorage.getItem('admin_override') === 'true') && (
            <a 
              href="/admin/analytics" 
              className="hidden sm:inline-flex bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 text-[11px] font-bold px-3 py-1.5 rounded-xl transition items-center gap-1.5"
            >
              📊 Platform Insights
            </a>
          )}
          
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="w-9 h-9 rounded-full flex items-center justify-center border border-slate-800 hover:border-indigo-500 focus:outline-none transition relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 shadow-lg"
            >
              {userAvatar ? (
                <Image src={userAvatar} alt="Profile" fill sizes="36px" className="object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-sm font-black text-white tracking-tighter">{emailInitial}</span>
              )}
            </button>

            {isSettingsOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-slate-950/95 border border-slate-900 p-4 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col space-y-3">
                <div>
                  <h3 className="text-[10px] font-black tracking-widest text-slate-500 uppercase">Account Profile</h3>
                  <p className="text-xs text-slate-200 font-semibold truncate mt-1 bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-900">{userEmail || 'Active Student'}</p>
                </div>
                <div className="pt-2 border-t border-slate-900 flex flex-col space-y-1">
                  {userEmail === 'your-actual-email@domain.com' && (
                    <button onClick={() => { router.push('/admin/analytics'); setIsSettingsOpen(false); }} className="w-full text-left text-amber-400 hover:text-amber-300 text-xs font-bold py-2 px-1 transition">
                      ⚡ View Admin Telemetry
                    </button>
                  )}
                  <button onClick={() => { setIsFeedbackOpen(true); setIsSettingsOpen(false); }} className="w-full text-left text-slate-400 hover:text-indigo-400 text-xs font-bold py-2 px-1 transition">
                    🐛 Submit Bug / Feedback
                  </button>
                  <button onClick={async () => { await supabase.auth.signOut(); router.push('/auth'); }} className="w-full bg-red-950/30 hover:bg-red-900/50 text-red-400 border border-red-900/30 font-bold py-2 rounded-xl text-xs transition mt-2">Sign Out</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Analytics Matrix Panel */}
      <div className="px-6 pt-4 grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="md:col-span-1 bg-indigo-600/10 border border-indigo-500/20 p-4 rounded-2xl flex items-center gap-4 relative overflow-hidden group">
          <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center text-xl">🎯</div>
          <div>
            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Focus Target</h4>
            <p className="text-[11px] font-bold text-slate-300 leading-tight">Cross-reference carefully to build band ranks.</p>
          </div>
        </div>

        <div className="md:col-span-1 bg-slate-950/80 border border-slate-900 p-4 rounded-2xl flex flex-col justify-center text-center">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">XP Mastery</span>
          <span className="text-lg font-black text-indigo-400 font-mono">{masteryPoints} <span className="text-[10px] text-slate-600 font-normal">pts</span></span>
        </div>

        <div className="md:col-span-4 bg-slate-950/80 border border-slate-900 p-4 rounded-2xl grid grid-cols-5 gap-2">
          <div className="text-center">
            <p className="text-[8px] font-bold text-slate-500 uppercase">Inference</p>
            <p className={`text-xs font-black font-mono ${getSkillColorClass(skillRatings.inference)}`}>L{skillRatings.inference}/5</p>
          </div>
          <div className="text-center">
            <p className="text-[8px] font-bold text-slate-500 uppercase">Compare</p>
            <p className={`text-xs font-black font-mono ${getSkillColorClass(skillRatings.comparison)}`}>L{skillRatings.comparison}/6</p>
          </div>
          <div className="text-center">
            <p className="text-[8px] font-bold text-slate-500 uppercase">Reliability</p>
            <p className={`text-xs font-black font-mono ${getSkillColorClass(skillRatings.reliability)}`}>L{skillRatings.reliability}/6</p>
          </div>
          <div className="text-center">
            <p className="text-[8px] font-bold text-slate-500 uppercase">SEQ Essay</p>
            <p className={`text-xs font-black font-mono ${getSkillColorClass(skillRatings.essay)}`}>L{skillRatings.essay}/8</p>
          </div>
          <div className="text-center border-l border-slate-900 pl-1">
            <p className="text-[8px] font-bold text-slate-400 uppercase">SEQ Conclusion</p>
            <p className={`text-xs font-black font-mono ${getSkillColorClass(skillRatings.conclusion)}`}>L{skillRatings.conclusion}/2</p>
          </div>
        </div>
      </div>

      {/* Main Work Grid Framework */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-6 p-6 gap-6 overflow-hidden">
        
        {/* Configurator Sidebar */}
        <div className="xl:col-span-1 flex flex-col space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4 space-y-4">
            <h2 className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Configurator</h2>
            
            <div className="grid grid-cols-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button onClick={() => { setIsCustomMode(false); setHasScanned(false); }} className={`text-[10px] font-bold py-2 rounded-lg transition ${!isCustomMode ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>AI Paper</button>
              <button onClick={() => { setIsCustomMode(true); setHasScanned(false); }} className={`text-[10px] font-bold py-2 rounded-lg transition ${isCustomMode ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>Vet Homework</button>
            </div>

            <div className="space-y-3 pt-1">
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-slate-500">Syllabus Topic Focus</label>
                <select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)} className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-xs font-medium text-slate-200 focus:outline-none">
                  {SYLLABUS_MAP[activeSubject]?.topics.map(topic => (
                    <option key={topic} value={topic}>{topic.replace('Issue ', 'Is. ').replace('Case Study: ', '')}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-slate-500">Target Skill Objectives</label>
                <select value={selectedSkill} onChange={(e) => setSelectedSkill(e.target.value)} className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-xs font-medium text-slate-200 focus:outline-none">
                  {SYLLABUS_MAP[activeSubject]?.skills.map(skill => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </select>
              </div>

              {!isCustomMode && (
                <button onClick={handleGenerateChallenge} disabled={isGenerating} className="w-full bg-indigo-600 text-white text-xs font-bold py-2.5 rounded-xl transition disabled:opacity-50 mt-1">
                  {isGenerating ? 'Drafting Sheet...' : '⚡ Generate Practice'}
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-[160px]">
            <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase mb-2">Practice Logs</span>
            <div className="flex-1 space-y-2 overflow-y-auto max-h-[220px] pr-1">
              {history.length === 0 ? (
                <div className="text-[10px] text-slate-600 font-mono italic p-2 border border-dashed border-slate-900 rounded-xl text-center">No logs recorded.</div>
              ) : (
                history.map((item) => (
                  <div key={item.id} onClick={() => loadHistoricalItem(item)} className="bg-slate-950/30 hover:bg-slate-900/60 border border-slate-900 p-3 rounded-xl cursor-pointer transition text-left space-y-1.5 group">
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-[9px] bg-slate-900 px-2 py-0.5 rounded text-indigo-400 font-bold uppercase">{item.subject === 'Social Studies' ? 'SS' : 'HIST'}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 font-medium group-hover:text-slate-200 transition">{item.question_prompt}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Source Material Columns Display Layout */}
        <div className="xl:col-span-2 space-y-4 max-h-[75vh] overflow-y-auto pr-1 select-text">
          <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 text-xs space-y-1">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Contextual Background</span>
            <p className="text-slate-400 leading-relaxed select-text">{isCustomMode ? 'Analyze school assignment files.' : challenge.backgroundContext}</p>
          </div>
          
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-200 block select-text">{isCustomMode ? 'Source A Provenance' : challenge.sourceAProvenance}</span>
            <div className="bg-transparent border border-slate-400 rounded-md p-4 text-xs">
              <p className="text-slate-300 leading-relaxed select-text whitespace-pre-line font-serif">{isCustomMode ? 'Paste school source texts here...' : challenge.sourceA}</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-200 block select-text">{isCustomMode ? 'Source B Provenance' : challenge.sourceBProvenance}</span>
            <div className="bg-transparent border border-slate-400 rounded-md p-4 text-xs">
              <p className="text-slate-300 leading-relaxed select-text whitespace-pre-line font-serif">{isCustomMode ? 'Reference document texts...' : challenge.sourceB}</p>
            </div>
          </div>
        </div>

        {/* Canvas Workspace Entry Layout */}
        <div className="xl:col-span-2 flex flex-col space-y-4">
          <div className="bg-indigo-950/20 border border-indigo-900/30 rounded-2xl p-4">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Question Assignment Prompt</span>
            {isCustomMode ? (
              <input type="text" value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} placeholder="Type or paste your school assignment question prompt here..." className="w-full bg-slate-900 border border-slate-800 p-2.5 mt-2 rounded-xl text-xs text-slate-200 focus:outline-none" />
            ) : (
              <p className="text-xs font-bold text-slate-200 mt-1 select-text">{challenge.questionPrompt}</p>
            )}
          </div>

          <div className="flex-1 flex flex-col bg-slate-950/40 border border-slate-900 rounded-2xl p-5 relative min-h-[250px]">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Writing Workspace</span>
                {!hasScanned && (
                  <>
                    <button onClick={handlePasteFromClipboard} type="button" className="text-[10px] text-indigo-400 hover:underline">📋 Paste</button>
                    <button onClick={handleInjectPeelFrame} type="button" className="text-[10px] text-slate-400 hover:underline ml-1">💡 PEEL Frame</button>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {studentAnswer && !hasScanned && (
                  <button onClick={() => setStudentAnswer('')} title="Clear draft text canvas" className="text-slate-600 hover:text-rose-400 text-xs px-1">🗑️</button>
                )}
                {challenge.suggestedAnswer && !isCustomMode && (
                  <button 
                    onClick={() => { setIsExemplarOpen(true); }}
                    className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-3 py-1 rounded-full transition"
                  >
                    💡 View Model Essay
                  </button>
                )}
              </div>
            </div>

            {!hasScanned ? (
              (!isCustomMode && isQuestionPromptInactive) ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-900 rounded-xl bg-slate-950/20">
                  <p className="text-sm font-bold text-indigo-400">Ready to evaluate your essay response?</p>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-xs leading-relaxed">
                    Pick a focus skill, generate a Cambridge standard mock sheet, and type your draft argument block.
                  </p>
                </div>
              ) : (
                <textarea 
                  value={studentAnswer} 
                  onChange={(e) => setStudentAnswer(e.target.value)} 
                  placeholder="Draft your structured PEEL argument string paragraphs here..." 
                  className="w-full flex-1 bg-transparent text-slate-300 font-mono text-xs leading-relaxed resize-none focus:outline-none select-text" 
                />
              )
            ) : (
              <div className="w-full flex-1 font-mono text-xs leading-relaxed overflow-y-auto whitespace-pre-wrap select-text text-slate-300 pr-1">
                {evaluation.segments.map((seg, idx) => (
                  <span key={idx} className={seg.type === 'error' ? 'underline decoration-red-500 decoration-wavy bg-red-500/10' : seg.type === 'weak' ? 'bg-yellow-500/20 underline decoration-yellow-500' : ''}>{seg.text}</span>
                ))}
                <div className="mt-6 pt-4 border-t border-slate-900">
                  <button onClick={() => setHasScanned(false)} className="text-[10px] bg-slate-900 text-slate-400 font-bold px-3 py-1.5 rounded-lg border border-slate-800">✏️ Resume Editing</button>
                </div>
              </div>
            )}

            {(!isQuestionPromptInactive || isCustomMode) && !hasScanned && (
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-900/60 text-[10px] font-mono text-slate-500">
                <span>Analytical Validation Frame</span>
                <span>
                  Words:{" "}
                  <span className="text-slate-300 font-bold">
                    {studentAnswer.trim() === "" ? 0 : studentAnswer.trim().split(/\s+/).length}
                  </span>
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {(!isQuestionPromptInactive || isCustomMode) && (
              <button 
                onClick={() => { setIsTimerActive(!isTimerActive); if(timeLeft === 0) setTimeLeft(1200); }}
                className={`px-4 rounded-xl text-xs font-mono font-bold transition whitespace-nowrap border ${isTimerActive ? 'bg-amber-600 border-amber-500 text-white' : 'bg-slate-950 border-slate-900 text-slate-400 hover:text-slate-200'}`}
              >
                ⏱️ {isTimerActive ? formatTime(timeLeft) : 'Start Timer'}
              </button>
            )}
            
            <button 
              onClick={handleScanStructure} 
              disabled={isGrading || !studentAnswer || (isCustomMode && !customPrompt.trim())} 
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-xs transition"
            >
              {isGrading ? 'Scanning structural criteria layers...' : 'Scan Answer Structure'}
            </button>
          </div>
        </div>

        {/* Diagnostic Grading Interface Column */}
        <div className="xl:col-span-1 space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-5 space-y-4 flex flex-col h-full min-h-[220px]">
            {!evaluation.scoreEstimate ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-2 text-slate-600 font-mono text-[10px] italic">
                Banding parameters will show up here after running an structural engine scan.
              </div>
            ) : (
              <>
                <div>
                  <div className="group relative flex items-center gap-1.5 cursor-help">
                    <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Estimated Banding</span>
                    <span className="text-[9px] text-indigo-400 font-bold bg-indigo-950/50 px-1.5 py-0.5 rounded border border-indigo-900/40" title="L1: Surface Details Only • L2: Source Content Used • L3: LORMS Target Objective Met">LORMS Criteria ⓘ</span>
                  </div>
                  <div className="text-xl font-black text-indigo-400 tracking-tight mt-1.5 font-mono select-text">{evaluation.scoreEstimate}</div>
                </div>
                {evaluation.critique.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-900">
                    <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase block">Diagnostics Checklist</span>
                    <ul className="space-y-2 select-text">
                      {evaluation.critique.map((bullet, idx) => (
                        <li key={idx} className="text-[11px] text-slate-400 flex items-start gap-2"><span className="text-indigo-500">•</span><span>{bullet}</span></li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

      </div>

      {/* Model Answer Drawer */}
      {isExemplarOpen && (
        <div className="fixed inset-y-0 right-0 w-full md:w-1/2 lg:w-1/3 bg-slate-950 border-l border-slate-900 z-50 shadow-2xl p-6 flex flex-col">
          <div className="flex justify-between items-center border-b border-slate-900 pb-4 mb-4">
            <h3 className="text-sm font-black tracking-wider text-emerald-400 uppercase">Syllabus Model Answer</h3>
            <button onClick={() => setIsExemplarOpen(false)} className="text-slate-400 hover:text-white font-bold text-xs">✕ Close</button>
          </div>
          <div className="flex-1 bg-slate-900/50 rounded-xl p-4 overflow-y-auto border border-slate-900">
            <p className="text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-wrap select-text">
              {challenge.suggestedAnswer}
            </p>
          </div>
        </div>
      )}

      <FeedbackModal 
        isOpen={isFeedbackOpen} 
        onClose={() => setIsFeedbackOpen(false)} 
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        textInput={textInput}
        setTextInput={setTextInput}
        onSubmit={handleSubmitFeedback}
      />

    </div>
  );
}
