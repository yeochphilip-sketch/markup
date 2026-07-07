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

  const [timeLeft, setTimeLeft] = useState(3600); 
  const [isTimerActive, setIsTimerActive] = useState(false);

  const [contextMenuCoords, setContextMenuCoords] = useState({ top: 0, left: 0 });
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [currentSelectionRange, setCurrentSelectionRange] = useState<Range | null>(null);
  const [rightClickedElement, setRightClickedElement] = useState<HTMLElement | null>(null);

  const [challenge, setChallenge] = useState({
    backgroundContext: 'Click Generate Practice to load Singapore standard materials.',
    sourceA: 'Source A contents appear here.',
    sourceB: 'Source B contents appear here.',
    questionPrompt: '',
    suggestedAnswer: ''
  });

  const [evaluation, setEvaluation] = useState({
    scoreEstimate: '',
    critique: [] as string[],
    segments: [] as Segment[]
  });

  const sourceARef = useRef<HTMLParagraphElement>(null);
  const sourceBRef = useRef<HTMLParagraphElement>(null);
  const emailInitial = userEmail ? userEmail.charAt(0).toUpperCase() : 'S';

  useEffect(() => {
    setSelectedTopic('Any Topic (Random Mix)');
    if (activeSubject === 'Social Studies') {
      setSelectedSkill('SBQ: Inference / Message (AO2)');
    } else {
      setSelectedSkill('SBQ: Inference / Message (AO3)');
    }
  }, [activeSubject]);

  useEffect(() => {
    let interval: any = null;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const loadHistoryLogs = async () => {
    try {
      const { data } = await supabase
        .from('practice_history')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setHistory(data);
    } catch (e) {
      console.warn("History loading bypassed safely:", e);
    }
  };

  useEffect(() => {
    async function initUserSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUserId(session.user.id);
          setUserEmail(session.user.email || '');
          if (session.user.user_metadata?.avatar_url) {
            setUserAvatar(session.user.user_metadata.avatar_url);
          }
        }
      } catch (err) {
        console.warn("Session check bypassed safely:", err);
      }
      loadHistoryLogs();
    }
    initUserSession();

    function handleClickOutside() {
      setIsSettingsOpen(false);
      setShowContextMenu(false);
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSourceContextMenu = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    setRightClickedElement(target);

    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      e.preventDefault();
      e.stopPropagation();
      setCurrentSelectionRange(selection.getRangeAt(0));
      setContextMenuCoords({ top: e.clientY + window.scrollY, left: e.clientX + window.scrollX });
      setShowContextMenu(true);
    } else if (target.classList.contains('source-hl') || target.closest('.source-hl')) {
      e.preventDefault();
      e.stopPropagation();
      setContextMenuCoords({ top: e.clientY + window.scrollY, left: e.clientX + window.scrollX });
      setShowContextMenu(true);
    }
  };

  const applyHighlightColor = async (colorClass: string) => {
    if (colorClass === 'clear') {
      if (rightClickedElement) {
        const hlSpan = rightClickedElement.closest('.source-hl');
        if (hlSpan) {
          hlSpan.replaceWith(document.createTextNode(hlSpan.textContent || ''));
          await syncAnnotationsToSupabase();
        }
      }
    } else if (currentSelectionRange) {
      const span = document.createElement('span');
      span.className = `source-hl px-0.5 rounded transition ${colorClass} cursor-pointer`;
      try {
        currentSelectionRange.surroundContents(span);
        await syncAnnotationsToSupabase();
      } catch (err) {
        console.warn("Wrapped complex subset nodes bypassed.", err);
      }
    }
    window.getSelection()?.removeAllRanges();
    setShowContextMenu(false);
  };

  const syncAnnotationsToSupabase = async () => {
    if (!currentChallengeId || !userId) return;
    const annotatedA = sourceARef.current?.innerHTML || '';
    const annotatedB = sourceBRef.current?.innerHTML || '';
    
    try {
      await supabase
        .from('practice_history')
        .update({
          annotated_source_a: annotatedA,
          annotated_source_b: annotatedB
        })
        .eq('id', currentChallengeId);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

  const handleGenerateChallenge = async () => {
    setIsGenerating(true);
    setHasScanned(false);
    setTimeLeft(3600);
    setIsTimerActive(true);
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

      try {
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
          loadHistoryLogs();
        }
      } catch (dbErr) {
        console.warn("Database storage skipped safely:", dbErr);
      }

    } catch (err) {
      console.error("Fetch pipeline exception details:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleScanStructure = async () => {
    if (!studentAnswer.trim()) return;
    setIsGrading(true);
    setIsTimerActive(false);
    try {
      const activePrompt = isCustomMode ? customPrompt : challenge.questionPrompt;
      const res = await fetch('/api/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          studentAnswer, 
          questionPrompt: activePrompt,
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

      try {
        if (userId) {
          await supabase
            .from('essay_evaluations')
            .insert([{
              user_id: userId,
              student_essay: studentAnswer,
              score_estimate: data.scoreEstimate || 'L1/1',
              critique_bullets: data.critique || []
            }]);
        }
      } catch (dbErr) {
        console.warn("Grading sync bypassed safely:", dbErr);
      }

      setHasScanned(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGrading(false);
    }
  };

  const loadHistoricalItem = (item: HistoryItem) => {
    setCurrentChallengeId(item.id);
    setHasScanned(false);
    setChallenge({
      backgroundContext: item.background_context,
      sourceA: item.source_a,
      sourceB: item.source_b,
      questionPrompt: item.question_prompt,
      suggestedAnswer: item.suggested_answer
    });
    
    setTimeout(() => {
      if (item.annotated_source_a && sourceARef.current) sourceARef.current.innerHTML = item.annotated_source_a;
      if (item.annotated_source_b && sourceBRef.current) sourceBRef.current.innerHTML = item.annotated_source_b;
    }, 50);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans relative">
      
      {showContextMenu && (
        <div 
          style={{ top: contextMenuCoords.top, left: contextMenuCoords.left }}
          className="absolute z-50 bg-slate-950 border border-slate-800 p-2 rounded-xl shadow-2xl flex flex-col min-w-[160px] space-y-1"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-[9px] font-bold text-slate-500 uppercase px-2 py-0.5">Apply Marker</span>
          <button onClick={() => applyHighlightColor('bg-yellow-500/30 text-yellow-100')} className="text-left text-xs font-semibold px-2 py-1 hover:bg-slate-900 rounded-md flex items-center gap-2"><span className="w-2 h-2 bg-yellow-400 rounded-full"></span> Highlight Yellow</button>
          <button onClick={() => applyHighlightColor('bg-emerald-500/30 text-emerald-100')} className="text-left text-xs font-semibold px-2 py-1 hover:bg-slate-900 rounded-md flex items-center gap-2"><span className="w-2 h-2 bg-emerald-400 rounded-full"></span> Highlight Green</button>
          <button onClick={() => applyHighlightColor('bg-sky-500/30 text-sky-100')} className="text-left text-xs font-semibold px-2 py-1 hover:bg-slate-900 rounded-md flex items-center gap-2"><span className="w-2 h-2 bg-sky-400 rounded-full"></span> Highlight Blue</button>
          <div className="border-t border-slate-900 my-1"></div>
          <button onClick={() => applyHighlightColor('clear')} className="text-left text-xs font-bold px-2 py-1 hover:bg-red-950/40 text-red-400 rounded-md">🧹 Clear Highlight</button>
        </div>
      )}

      <header className="border-b border-slate-900 px-6 py-4 flex items-center justify-between bg-slate-950/60 backdrop-blur-md relative z-40">
        <h1 className="text-xl font-black text-indigo-500 tracking-wider">MARKUP</h1>
        
        <div className="flex items-center gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 flex items-center gap-2 font-mono text-xs">
            <span className={timeLeft < 300 ? "text-red-500 animate-pulse font-bold" : "text-slate-400"}>⏱️ {formatTime(timeLeft)}</span>
            <button onClick={() => setIsTimerActive(!isTimerActive)} className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold ml-1">
              {isTimerActive ? "Pause" : "Start"}
            </button>
          </div>

          <div className="flex bg-slate-900 p-1 rounded-xl gap-1">
            {['Social Studies', 'Elective History'].map((sub) => (
              <button key={sub} onClick={() => setActiveSubject(sub)} className={`text-xs font-bold px-4 py-2 rounded-lg transition ${activeSubject === sub ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>
                {sub}
              </button>
            ))}
          </div>
          
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={(e) => { e.stopPropagation(); setIsSettingsOpen(!isSettingsOpen); }}
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
                <div className="pt-2 border-t border-slate-900">
                  <button onClick={handleSignOut} className="w-full bg-red-950/30 hover:bg-red-900/50 text-red-400 border border-red-900/30 font-bold py-2 rounded-xl text-xs transition">Sign Out</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-5 p-6 gap-6 overflow-hidden">
        
        <div className="xl:col-span-1 flex flex-col space-y-4 max-h-[85vh] overflow-y-auto pr-1">
          <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4 space-y-4">
            <h2 className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Configurator</h2>
            
            <div className="grid grid-cols-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button onClick={() => { setIsCustomMode(false); setHasScanned(false); }} className={`text-[10px] font-bold py-2 rounded-lg transition ${!isCustomMode ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>AI Paper</button>
              <button onClick={() => { setIsCustomMode(true); setHasScanned(false); }} className={`text-[10px] font-bold py-2 rounded-lg transition ${isCustomMode ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>Vet Homework</button>
            </div>

            {!isCustomMode && (
              <div className="space-y-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-slate-500">Syllabus Topic Focus</label>
                  <select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)} className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-xs font-medium text-slate-200 focus:outline-none">
                    <option value="Any Topic (Random Mix)">✨ Any Topic (Random Mix)</option>
                    {activeSubject === 'Social Studies' ? (
                      <>
                        <option value="Issue 1: Exploring Citizenship and Governance">Issue 1: Citizenship & Governance</option>
                        <option value="Issue 2: Living in a Diverse Society">Issue 2: Living in a Diverse Society</option>
                        <option value="Issue 3: Responding to a Globalised World">Issue 3: Responding to a Globalised World</option>
                      </>
                    ) : (
                      <>
                        <option value="Case Study: Nazi Germany (*SBCS)">Case Study: Nazi Germany</option>
                        <option value="Case Study: Militarist Japan">Case Study: Militarist Japan</option>
                        <option value="WWII: Outbreak in Europe (*SBCS)">WWII: Outbreak in Europe</option>
                        <option value="Cold War: Origins in Europe (*SBCS)">Cold War: Origins in Europe</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-slate-500">Target Skill Objectives</label>
                  <select value={selectedSkill} onChange={(e) => setSelectedSkill(e.target.value)} className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-xs font-medium text-slate-200 focus:outline-none">
                    <option value="All Skills (Full Portfolio Mix)">📚 All Questions / Complete Portfolio</option>
                    <option value="SBQ: Inference / Message (AO2)">SBQ: Inference / Message</option>
                    <option value="SBQ: Comparison & Contrast (AO2)">SBQ: Comparison & Contrast</option>
                    <option value="SBQ: Purpose / Motive Evolution (AO2)">SBQ: Purpose / Motive Evolution</option>
                    <option value="SBQ: Utility & Reliability Limits (AO2)">SBQ: Utility & Reliability Limits</option>
                    <option value="SBQ: Synthesis Matrix Assertion (AO2)">SBQ: Synthesis Assertion Matrix</option>
                    <option value="SRQ/SEQ: Structured Essay Explanations (AO1)">Structured Essay Question (SEQ / SRQ)</option>
                  </select>
                </div>

                <button onClick={handleGenerateChallenge} disabled={isGenerating} className="w-full bg-indigo-600 text-white text-xs font-bold py-2.5 rounded-xl transition disabled:opacity-50 mt-1">
                  {isGenerating ? 'Drafting Sheet...' : '⚡ Generate Practice'}
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col min-h-[200px]">
            <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase mb-2">Practice History Logs</span>
            <div className="flex-1 space-y-2 overflow-y-auto max-h-[380px] pr-1">
              {history.map((item) => (
                <div key={item.id} onClick={() => loadHistoricalItem(item)} className="bg-slate-950/30 hover:bg-slate-900/60 border border-slate-900 p-3 rounded-xl cursor-pointer transition text-left space-y-1.5 group">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-[9px] bg-slate-900 px-2 py-0.5 rounded text-indigo-400 font-bold uppercase">{item.subject === 'Social Studies' ? 'SS' : 'HIST'}</span>
                    <span className="text-[8px] text-slate-500 truncate max-w-[90px]">{item.question_type.replace('SBQ: ', '')}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 font-medium group-hover:text-slate-200 transition">{item.question_prompt}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="xl:col-span-1 space-y-3 max-h-[85vh] overflow-y-auto pr-1">
          {!isCustomMode ? (
            <div onContextMenu={handleSourceContextMenu}>
              <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 text-xs space-y-1 mb-3">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Contextual Background</span>
                <p className="text-slate-400 leading-relaxed select-text">{challenge.backgroundContext}</p>
              </div>
              <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 text-xs space-y-1 mb-3 hover:border-slate-800 transition">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex justify-between items-center">
                  <span>Source A</span>
                  <span className="text-[8px] text-slate-600 font-normal">Right-click text to tag</span>
                </span>
                <p ref={sourceARef} className="text-slate-300 italic leading-relaxed select-text whitespace-pre-line">{challenge.sourceA}</p>
              </div>
              <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 text-xs space-y-1 hover:border-slate-800 transition">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex justify-between items-center">
                  <span>Source B</span>
                  <span className="text-[8px] text-slate-600 font-normal">Right-click text to tag</span>
                </span>
                <p ref={sourceBRef} className="text-slate-300 italic leading-relaxed select-text whitespace-pre-line">{challenge.sourceB}</p>
              </div>
            </div>
          ) : (
            <div className="bg-indigo-950/10 border border-indigo-900/20 rounded-xl p-4 text-xs text-slate-400">
              Vetting Mode Active. Paste your assignment prompt in the canvas workspace.
            </div>
          )}
        </div>

        <div className="xl:col-span-2 flex flex-col space-y-4">
          <div className="bg-indigo-950/20 border border-indigo-900/30 rounded-2xl p-4">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Question Assignment Prompt</span>
            {isCustomMode ? (
              <input type="text" value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} placeholder="Type or paste question prompt here..." className="w-full bg-slate-900 border border-slate-800 p-2.5 mt-2 rounded-xl text-xs text-slate-200 focus:outline-none" />
            ) : (
              <p className="text-xs font-bold text-slate-200 mt-1">{challenge.questionPrompt || 'No assignment generated yet.'}</p>
            )}
          </div>

          <div className="flex-1 flex flex-col bg-slate-950/40 border border-slate-900 rounded-2xl p-5 relative min-h-[300px]">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Essay Input Workspace</span>
            {!hasScanned ? (
              <textarea value={studentAnswer} onChange={(e) => setStudentAnswer(e.target.value)} placeholder="Draft your structured PEEL response paragraph essay structure here..." className="w-full flex-1 bg-transparent text-slate-300 font-mono text-xs leading-relaxed resize-none focus:outline-none" />
            ) : (
              <div className="w-full flex-1 font-mono text-xs leading-relaxed overflow-y-auto whitespace-pre-wrap select-text text-slate-300">
                {evaluation.segments.map((seg, idx) => (
                  <span key={idx} className={seg.type === 'error' ? 'underline decoration-red-500 decoration-wavy bg-red-500/10' : seg.type === 'weak' ? 'bg-yellow-500/20 underline decoration-yellow-500' : ''}>{seg.text}</span>
                ))}
                <div className="mt-6 pt-4 border-t border-slate-900">
                  <button onClick={() => setHasScanned(false)} className="text-[10px] bg-slate-900 text-slate-400 font-bold px-3 py-1.5 rounded-lg border border-slate-800">✏️ Resume Editing</button>
                </div>
              </div>
            )}
          </div>

          <button onClick={handleScanStructure} disabled={isGrading || !studentAnswer} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-xs transition">
            {isGrading ? 'Scanning response layers...' : 'Scan Answer Structure'}
          </button>
        </div>

        <div className="xl:col-span-1 space-y-4 max-h-[85vh] overflow-y-auto pr-1">
          <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-5 space-y-4 flex flex-col h-full">
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
