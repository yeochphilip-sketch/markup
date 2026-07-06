'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMetadata, setUserMetadata] = useState<any>(null);
  
  // Existing baseline feature states
  const [subject, setSubject] = useState('Social Studies');
  const [questionType, setQuestionType] = useState('SBCS: Comparison');
  const [topic, setTopic] = useState('Governance');
  const [studentAnswer, setStudentAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [activeQuestion, setActiveQuestion] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserMetadata(user.user_metadata);
    };
    fetchUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleGenerateQuestion = async () => {
    setGenerating(true);
    try {
      const response = await fetch('/api/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, topic, questionType }),
      });
      const data = await response.json();
      setActiveQuestion(data);
      setFeedback(null);
    } catch (error) {
      alert('Failed to generate practice scenario.');
    } finally {
      setGenerating(false);
    }
  };

  const handleGrade = async () => {
    if (!studentAnswer.trim()) return alert('Please paste or write an answer first!');
    setLoading(true);
    setFeedback(null);
    try {
      const response = await fetch('/api/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentAnswer, questionType, subject, questionId: activeQuestion?.id || null }),
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
    <main className="min-h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden relative">
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur px-8 py-4 flex items-center justify-between relative z-30">
        <div className="flex items-center gap-3">
          <span className="text-xl font-black tracking-tight text-indigo-400">MARKUP</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button onClick={() => { setSubject('Social Studies'); setTopic('Governance'); }} className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition ${subject === 'Social Studies' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>Social Studies</button>
            <button onClick={() => { setSubject('History'); setTopic('Cold War'); }} className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition ${subject === 'History' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>Elective History</button>
          </div>

          {/* Profile Menu Dropdown */}
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)} className="w-8 h-8 rounded-full border border-indigo-500/30 overflow-hidden focus:outline-none bg-slate-800">
              <img src={userMetadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'} alt="User Profile" className="w-full h-full object-cover" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl py-2 z-50 animate-fadeIn">
                <Link href="/dashboard/settings" className="block px-4 py-2 text-xs text-slate-300 hover:bg-slate-900 font-medium">Settings</Link>
                <button onClick={handleSignOut} className="w-full text-left block px-4 py-2 text-xs text-rose-400 hover:bg-slate-900 font-medium border-t border-slate-900 mt-1">Log out</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Grid View Dashboard Container */}
      <div className="grid grid-cols-1 xl:grid-cols-3 h-[calc(100vh-69px)]">
        <section className="p-6 border-r border-slate-800 bg-slate-950/20 overflow-y-auto flex flex-col gap-6">
          <div>
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">Practice Configurator</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Syllabus Topic</label>
                <select value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-300 font-medium focus:outline-none focus:border-indigo-500">
                  {subject === 'Social Studies' ? (
                    <>
                      <option>Governance</option>
                      <option>Conflict and Harmony</option>
                      <option>Globalisation</option>
                    </>
                  ) : (
                    <>
                      <option>Cold War</option>
                      <option>Stalinist Russia</option>
                      <option>Nazi Germany</option>
                    </>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Question Skill Type</label>
                <select value={questionType} onChange={(e) => setQuestionType(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-300 font-medium focus:outline-none focus:border-indigo-500">
                  <option>SBCS: Comparison</option>
                  <option>SBCS: Inference</option>
                  <option>SBCS: Reliability / Purpose</option>
                  <option>Section B: Structured Essay (SEQ)</option>
                </select>
              </div>
              <button onClick={handleGenerateQuestion} disabled={generating} className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-indigo-400 font-bold py-3 rounded-xl transition">
                {generating ? 'Drafting Mock Paper...' : '⚡ Generate Practice Challenge'}
              </button>
            </div>
          </div>
          {activeQuestion && (
            <div className="border-t border-slate-800 pt-4 flex-1 space-y-4 text-sm animate-fadeIn">
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
                <span className="text-[10px] font-bold text-indigo-400 tracking-wider uppercase block mb-1">Contextual Background</span>
                <p className="text-slate-300 leading-relaxed text-xs">{activeQuestion.backgroundContext}</p>
              </div>
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80 max-h-42 overflow-y-auto">
                <span className="text-[10px] font-bold text-indigo-400 tracking-wider uppercase block mb-1">Source A</span>
                <p className="text-slate-300 italic text-xs">{activeQuestion.sourceA}</p>
              </div>
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80 max-h-42 overflow-y-auto">
                <span className="text-[10px] font-bold text-indigo-400 tracking-wider uppercase block mb-1">Source B</span>
                <p className="text-slate-300 italic text-xs">{activeQuestion.sourceB}</p>
              </div>
            </div>
          )}
        </section>

        <section className="p-6 border-r border-slate-800 flex flex-col gap-4 overflow-y-auto">
          {activeQuestion && (
            <div className="bg-indigo-600/10 border border-indigo-500/20 p-4 rounded-xl">
              <span className="text-[10px] font-bold text-indigo-400 tracking-wider uppercase block mb-0.5">Exam Prompt Assignment</span>
              <p className="text-sm font-bold text-slate-200">{activeQuestion.questionPrompt}</p>
            </div>
          )}
          <div className="flex-1 flex flex-col">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Write / Structural Draft Canvas</label>
            <textarea value={studentAnswer} onChange={(e) => setStudentAnswer(e.target.value)} placeholder="Structure your comparative claims using PEEL here..." className="w-full flex-1 bg-slate-950 border border-slate-800 rounded-xl p-5 text-slate-300 font-normal leading-relaxed resize-none focus:outline-none focus:border-indigo-500 font-mono text-xs" />
          </div>
          <button onClick={handleGrade} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-indigo-600/10">
            {loading ? 'Evaluating Structure against LORMS Matrix...' : 'Scan Answer Structure'}
          </button>
        </section>

        <section className="p-6 bg-slate-950/40 overflow-y-auto flex flex-col gap-5">
          {!feedback && !loading && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-800 rounded-xl">
              <p className="text-slate-400 font-medium text-xs max-w-xs">Submit your execution parameters to render evaluations.</p>
            </div>
          )}
          {loading && (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
              <p className="text-xs text-slate-400 animate-pulse font-medium">Examining parameters...</p>
            </div>
          )}
          {feedback && (
            <div className="space-y-5 animate-fadeIn text-xs">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-400 uppercase tracking-wider mb-0.5">Estimated Banding</h3>
                  <p className="text-2xl font-black text-indigo-400">{feedback.scoreEstimate}</p>
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-2">Structural Diagnostics</h4>
                <ul className="space-y-2">
                  {feedback.critique?.map((item: string, idx: number) => (
                    <li key={idx} className="text-slate-300 flex gap-2"><span className="text-amber-500 font-bold">•</span><span>{item}</span></li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
