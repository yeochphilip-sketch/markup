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
}

export default function DashboardPage() {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [activeSubject, setActiveSubject] = useState('Social Studies');
  const [selectedTopic, setSelectedTopic] = useState('Issue 1: Exploring Citizenship and Governance');
  const [selectedSkill, setSelectedSkill] = useState('SBQ: Extracting & Inferring (AO2)');
  
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

  // Source Highlight Selection State
  const [selectedQuote, setSelectedQuote] = useState('');
  const [popoverCoords, setPopoverCoords] = useState({ top: 0, left: 0 });
  const [showHighlightPopover, setShowHighlightPopover] = useState(false);

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

  const emailInitial = userEmail ? userEmail.charAt(0).toUpperCase() : 'S';

  useEffect(() => {
    if (activeSubject === 'Social Studies') {
      setSelectedTopic('Issue 1: Exploring Citizenship and Governance');
      setSelectedSkill('SBQ: Extracting & Inferring (AO2)');
    } else {
      setSelectedTopic('Case Study: Nazi Germany (*SBQ)');
      setSelectedSkill('SBQ: Inference & Cross-Referencing (AO3)');
    }
  }, [activeSubject]);

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
      if (session?.user) {
        setUserId(session.user.id);
        setUserEmail(session.user.email || '');
        if (session.user.user_metadata?.avatar_url) {
          setUserAvatar(session.user.user_metadata.avatar_url);
        }
      }
      loadHistoryLogs();
    }
    initUserSession();

    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Monitor text selections to trigger highlighters
  const handleSourceMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    const selection = window.getSelection();
    if (!selection) return;
    const text = selection.toString().trim();
    
    if (text.length > 3) {
      setSelectedQuote(text);
      setPopoverCoords({
        top: e.clientY + window.scrollY - 40,
        left: e.clientX + window.scrollX - 60
      });
      setShowHighlightPopover(true);
    } else {
      setShowHighlightPopover(false);
    }
  };

  const injectQuoteIntoWorkspace = () => {
    if (!selectedQuote) return;
    setStudentAnswer((prev) => prev + ` "${selectedQuote}" `);
    setShowHighlightPopover(false);
    window.getSelection()?.removeAllRanges();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

  const handleGenerateChallenge = async () => {
    if (!userId) return;
    setIsGenerating(true);
    setHasScanned(false);
    setShowHighlightPopover(false);
    setEvaluation({ scoreEstimate: '', critique: [], segments: [] });
    
    try {
      const res = await fetch('/api/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: activeSubject, topic: selectedTopic, questionType: selectedSkill }),
      });
      const data = await res.json();
      
      const updatedChallenge = {
        backgroundContext: data.backgroundContext || '',
        sourceA: data.sourceA || '',
        sourceB: data.sourceB || '',
        questionPrompt: data.questionPrompt || '',
        suggestedAnswer: data.suggestedAnswer || 'No model answer provided.'
      };
      
      setChallenge(updatedChallenge);

      const { data: savedRecord } = await supabase
        .from('practice_history')
        .insert([{
          user_id: userId,
          subject: activeSubject,
          topic: selectedTopic,
          question_type: selectedSkill,
          question_prompt: updatedChallenge.questionPrompt,
          background_context: updatedChallenge.backgroundContext,
          source_a: updatedChallenge.sourceA,
          source_b: updatedChallenge.sourceB,
          suggested_answer: updatedChallenge.suggestedAnswer
        }])
        .select()
        .single();

      if (savedRecord) setCurrentChallengeId(savedRecord.id);
      loadHistoryLogs();
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleScanStructure = async () => {
    if (!studentAnswer.trim() || !userId) return;
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
          subject: activeSubject 
        }),
      });
      const data = await res.json();
      
      setEvaluation({
        scoreEstimate: data.scoreEstimate || 'L1/1',
        critique: data.critique || [],
        segments: data.highlightedSegments || []
      });

      await supabase
        .from('essay_evaluations')
        .insert([{
          user_id: userId,
          practice_history_id: isCustomMode ? null : currentChallengeId,
          custom_question_prompt: isCustomMode ? activePrompt : null,
          student_essay: studentAnswer,
          score_estimate: data.scoreEstimate || 'L1/1',
          critique_bullets: data.critique || []
        }]);

      setHasScanned(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGrading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans" onClick={() => { if(showHighlightPopover) setShowHighlightPopover(false); }}>
      {/* Floating Interactive Popover Badge */}
      {showHighlightPopover && (
        <div 
          style={{ top: popoverCoords.top, left: popoverCoords.left }} 
          className="absolute z-50 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] py-1.5 px-3 rounded-xl shadow-xl border border-indigo-400 flex items-center gap-1.5 cursor-pointer transition"
          onClick={(e) => { e.stopPropagation(); injectQuoteIntoWorkspace(); }}
        >
          <span>✍️ Cite Quote</span>
        </div>
      )}

      {/* Top Navbar Header */}
      <header className="border-b border-slate-900 px-6 py-4 flex items-center justify-between bg-slate-950/60 backdrop-blur-md relative z-40">
        <h1 className="text-xl font-black text-indigo-500 tracking-wider">MARKUP</h1>
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-900 p-1 rounded-xl gap-1">
            {['Social Studies', 'Elective History'].map((sub) => (
              <button key={sub} onClick={() => setActiveSubject(sub)} className={`text-xs font-bold px-4 py-2 rounded-lg transition ${activeSubject === sub ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>
                {sub}
              </button>
            ))}
          </div>
          
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="w-9 h-9 rounded-full flex items-center justify-center border border-slate-800 hover:border-indigo-500 focus:outline-none transition relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 shadow-lg group"
            >
              {userAvatar ? (
                <Image src={userAvatar} alt="Profile Image" fill sizes="36px" className="object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-sm font-black text-white tracking-tighter group-hover:scale-105 transition duration-150">{emailInitial}</span>
              )}
            </button>

            {isSettingsOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-slate-950/95 border border-slate-900 p-4 rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] backdrop-blur-xl flex flex-col space-y-3 transition transform origin-top-right duration-150">
                <div>
                  <h3 className="text-[10px] font-black tracking-widest text-slate-500 uppercase">Account Profile</h3>
                  <p className="text-xs text-slate-200 font-semibold truncate mt-1 bg-slate-900/60 px-2.5 py-1.5 rounded-xl border border-slate-900">{userEmail || 'Active Student'}</p>
                </div>
                <div className="pt-1.5 space-y-2">
                  <div className="flex justify-between items-center text-[11px] text-slate-400 px-0.5">
                    <span>Curriculum Tier:</span>
                    <span className="text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded-md text-[10px]">O-Level (2026)</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-400 px-0.5">
                    <span>Engine Standard:</span>
                    <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md text-[10px]">Llama 3.1</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-900">
                  <button onClick={handleSignOut} className="w-full bg-red-950/30 hover:bg-red-900/50 text-red-400 border border-red-900/30 font-bold py-2 rounded-xl text-xs transition duration-150 shadow-inner">
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Grid Content Panels */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-5 p-6 gap-6 overflow-hidden">
        
        {/* Configurator */}
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
                  <label className="text-[9px] font-bold uppercase text-slate-500">Syllabus Topic</label>
                  <select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)} className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-xs font-medium text-slate-200 focus:outline-none">
                    {activeSubject === 'Social Studies' ? (
                      <>
                        <option value="Issue 1: Exploring Citizenship and Governance">Issue 1: Citizenship & Governance</option>
                        <option value="Issue 2: Living in a Diverse Society">Issue 2: Living in a Diverse Society</option>
                        <option value="Issue 3: Responding to a Globalised World">Issue 3: Responding to a Globalised World</option>
                      </>
                    ) : (
                      <>
                        <option value="Case Study: Nazi Germany (*SBQ)">Case Study: Nazi Germany (*SBQ)</option>
                        <option value="Case Study: Militarist Japan">Case Study: Militarist Japan</option>
                        <option value="WWII: Outbreak in Europe (*SBQ)">WWII: Outbreak in Europe (*SBQ)</option>
                        <option value="WWII: Outbreak in Asia-Pacific">WWII: Outbreak in Asia-Pacific</option>
                        <option value="Cold War: Origins in Europe (*SBQ)">Cold War: Origins in Europe (*SBQ)</option>
                        <option value="Cold War Extension: Korean War (*SBQ)">Cold War Extension: Korean War (*SBQ)</option>
                        <option value="Cold War Extension: Vietnam War">Cold War Extension: Vietnam War</option>
                        <option value="Decline & End of USSR">Decline & End of USSR</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-slate-500">Target Skill Type</label>
                  <select value={selectedSkill} onChange={(e) => setSelectedSkill(e.target.value)} className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-xs font-medium text-slate-200 focus:outline-none">
                    {activeSubject === 'Social Studies' ? (
                      <>
                        <option value="SBQ: Extracting & Inferring (AO2)">SBQ: Extracting & Inferring (AO2)</option>
                        <option value="SBQ: Comparison & Contrast (AO2)">SBQ: Comparison & Contrast (AO2)</option>
                        <option value="SBQ: Identifying Value Bias (AO2)">SBQ: Identifying Value Bias (AO2)</option>
                        <option value="SBQ: Evaluation of Multiple Sources (AO2)">SBQ: Evaluation Matrix Assertion (AO2)</option>
                        <option value="SRQ: Multi-causal Explanation (AO3)">SRQ: Multi-Causal Explanation (AO3)</option>
                        <option value="SRQ: Balanced Conclusion Weighting (AO3)">SRQ: Factor Weighting Assessment (AO3)</option>
                      </>
                    ) : (
                      <>
                        <option value="SBQ: Inference & Cross-Referencing (AO3)">SBQ: Inference & Cross-Referencing (AO3)</option>
                        <option value="SBQ: Analyzing Purpose & Intent (AO3)">SBQ: Purpose-Motive Evaluation (AO3)</option>
                        <option value="SBQ: Testing Utility & Reliability (AO3)">SBQ: Utility & Reliability Limits (AO3)</option>
                        <option value="SBQ: Multiple Source Synthesis (AO3)">SBQ: Synthesis Assertion Matrix (AO3)</option>
                        <option value="SEQ: Constructing Historical Explanations (AO2)">SEQ: Structured Essay Question (AO2)</option>
                      </>
                    )}
                  </select>
                </div>

                <button onClick={handleGenerateChallenge} disabled={isGenerating} className="w-full bg-indigo-600 text-white text-xs font-bold py-2.5 rounded-xl transition disabled:opacity-50 mt-1">
                  {isGenerating ? 'Drafting...' : '⚡ Generate Practice'}
                </button>
              </div>
            )}

            {isCustomMode && (
              <div className="pt-1 text-xs text-slate-400 leading-relaxed">
                Paste your school assignment prompt and essay directly in the canvas workspace layout fields to vet standalone drafts.
              </div>
            )}
          </div>

          {/* History Logger Side-panel */}
          <div className="flex-1 flex flex-col min-h-[220px]">
            <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase mb-2">Practice History Logs</span>
            <div className="flex-1 space-y-2 overflow-y-auto max-h-[420px] pr-1">
              {history.length === 0 ? (
                <div className="text-[11px] text-slate-600 italic p-2">No historical submissions logged.</div>
              ) : (
                history.map((item) => (
                  <div key={item.id} onClick={() => { setChallenge({ backgroundContext: item.background_context, sourceA: item.source_a, sourceB: item.source_b, questionPrompt: item.question_prompt, suggestedAnswer: item.suggested_answer }); setCurrentChallengeId(item.id); setHasScanned(false); }} className="bg-slate-950/30 hover:bg-slate-900/60 border border-slate-900 p-3 rounded-xl cursor-pointer transition text-left space-y-1.5 group">
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-[9px] bg-slate-900 px-2 py-0.5 rounded text-indigo-400 font-bold uppercase tracking-wider">{item.subject === 'Social Studies' ? 'SS' : 'HIST'}</span>
                      <span className="text-[8px] text-slate-500 truncate max-w-[80px]">{item.question_type.replace('SBQ: ', '').replace('SRQ: ', '').replace('SEQ: ', '')}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 font-medium group-hover:text-slate-200 transition">{item.question_prompt}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Source Text Container with Highlight Listeners */}
        <div className="xl:col-span-1 space-y-3 max-h-[85vh] overflow-y-auto pr-1">
          {!isCustomMode ? (
            challenge.backgroundContext ? (
              <div onMouseUp={handleSourceMouseUp}>
                <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 text-xs space-y-1 mb-3">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Contextual Background</span>
                  <p className="text-slate-400 leading-relaxed select-text">{challenge.backgroundContext}</p>
                </div>
                <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 text-xs space-y-1 mb-3 hover:border-slate-800 transition">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex justify-between items-center">
                    <span>Source A</span>
                    <span className="text-[8px] text-slate-600 font-normal normal-case">Highlight to cite</span>
                  </span>
                  <p className="text-slate-300 italic leading-relaxed select-text">{challenge.sourceA}</p>
                </div>
                <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 text-xs space-y-1 hover:border-slate-800 transition">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex justify-between items-center">
                    <span>Source B</span>
                    <span className="text-[8px] text-slate-600 font-normal normal-case">Highlight to cite</span>
                  </span>
                  <p className="text-slate-300 italic leading-relaxed select-text">{challenge.sourceB}</p>
                </div>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center border border-dashed border-slate-900 rounded-xl text-xs text-slate-600 p-4 text-center">Generate a core challenge task block to view contextual source resources.</div>
            )
          ) : (
            <div className="bg-indigo-950/10 border border-indigo-900/20 rounded-xl p-4 text-xs text-slate-400">
              <span className="font-bold text-indigo-400 block mb-1">Homework Vetting Mode</span>
              Standalone assessment mode enabled. Source text boxes are bypassed. Copy your essay prompt assignment directly into the center field panel.
            </div>
          )}
        </div>

        {/* Center Writing Workspace Canvas */}
        <div className="xl:col-span-2 flex flex-col space-y-4">
          <div className="bg-indigo-950/20 border border-indigo-900/30 rounded-2xl p-4">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Question Assignment Prompt</span>
            {isCustomMode ? (
              <input type="text" value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} placeholder="Type or paste your custom school assignment question here..." className="w-full bg-slate-900 border border-slate-800 p-2.5 mt-2 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500" />
            ) : (
              <p className="text-xs font-bold text-slate-200 mt-1">{challenge.questionPrompt || 'No assignment generated yet.'}</p>
            )}
          </div>

          <div className="flex-1 flex flex-col bg-slate-950/40 border border-slate-900 rounded-2xl p-5 relative min-h-[300px]">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Essay Input Workspace</span>
            
            {!hasScanned ? (
              <textarea value={studentAnswer} onChange={(e) => setStudentAnswer(e.target.value)} placeholder="Draft your PEEL response paragraph essay structure here..." className="w-full flex-1 bg-transparent text-slate-300 font-mono text-xs leading-relaxed resize-none focus:outline-none" />
            ) : (
              <div className="w-full flex-1 font-mono text-xs leading-relaxed overflow-y-auto whitespace-pre-wrap select-text text-slate-300">
                {evaluation.segments.map((seg, idx) => {
                  if (seg.type === 'error') {
                    return <span key={idx} className="underline decoration-red-500 decoration-wavy bg-red-500/10 px-0.5 rounded text-red-200" title="Critical structural breakdown">{seg.text}</span>;
                  }
                  if (seg.type === 'weak') {
                    return <span key={idx} className="bg-yellow-500/20 underline decoration-yellow-500 text-yellow-100 px-0.5 rounded" title="Missing link/elaboration layer">{seg.text}</span>;
                  }
                  return <span key={idx}>{seg.text}</span>;
                })}
                <div className="mt-6 pt-4 border-t border-slate-900">
                  <button onClick={() => setHasScanned(false)} className="text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-400 font-bold px-3 py-1.5 rounded-lg border border-slate-800 transition">✏️ Resume Editing Essay</button>
                </div>
              </div>
            )}
          </div>

          <button onClick={handleScanStructure} disabled={isGrading || !studentAnswer} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-xs transition">
            {isGrading ? 'Scanning response layers...' : 'Scan Answer Structure'}
          </button>
        </div>

        {/* Right Sidebar Metrics Panel */}
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
            {hasScanned && challenge.suggestedAnswer && (
              <div className="space-y-2 pt-3 border-t border-slate-900 flex-1 flex flex-col">
                <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase block">Top-Tier LORMS Exemplar Solution</span>
                <div className="flex-1 bg-slate-900/40 border border-slate-800/80 rounded-xl p-3 text-[11px] text-slate-400 leading-relaxed overflow-y-auto max-h-[220px] font-serif whitespace-pre-line">{challenge.suggestedAnswer}</div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
