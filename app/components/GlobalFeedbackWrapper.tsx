'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import FeedbackModal from './FeedbackModal';

export default function GlobalFeedbackWrapper({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState('General');
  const [description, setDescription] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        setUserEmail(session.user.email || '');
      }
    }
    fetchSession();
  }, []);

  const handleSubmit = async () => {
    if (!description.trim()) return;
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          userEmail: userEmail || 'anonymous@markup.edu',
          feedbackType,
          description,
        }),
      });
      
      if (res.ok) {
        setDescription('');
        setIsOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {children}
      
      {/* The single, site-wide floating feedback action trigger button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-safe-4 right-6 w-12 h-12 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-indigo-400 rounded-full flex items-center justify-center shadow-2xl transition-all duration-200 hover:scale-105 group z-50"
        title="Submit feedback or flag a bug"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 group-hover:scale-110 transition">
          <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.237.18 2.165 1.259 2.165 2.511v7.41c0 1.253-.928 2.332-2.165 2.513a48.11 48.11 0 0 1 -3.125.328L12 19.539V15.53c-1.396-.01-2.775-.113-4.125-.303-1.237-.174-2.165-1.253-2.165-2.51v-7.44c0-1.25.928-2.329 2.165-2.507Zm7.152 6.479a1.125 1.125 0 1 0 0-2.25 1.125 1.125 0 0 0 0 2.25Zm3.375-1.125a1.125 1.125 0 1 1-2.25 0 1.125 1.125 0 0 1 2.25 0ZM9.75 9.25a1.125 1.125 0 1 0 0-2.25 1.125 1.125 0 0 0 0 2.25Z" clipRule="evenodd" />
        </svg>
      </button>

      <FeedbackModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        selectedType={feedbackType}
        setSelectedType={setFeedbackType}
        textInput={description}
        setTextInput={setDescription}
        onSubmit={handleSubmit}
      />
    </>
  );
}
