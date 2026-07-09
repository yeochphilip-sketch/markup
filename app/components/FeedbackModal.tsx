'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase';

export default function FeedbackModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [type, setType] = useState('Bug');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    setStatus('idle');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { error } = await supabase.from('user_feedback').insert([{
        user_id: session?.user?.id || null,
        user_email: session?.user?.email || 'Anonymous',
        feedback_type: type,
        description: description.trim()
      }]);

      if (error) throw error;
      
      setStatus('success');
      setDescription('');
      setTimeout(() => { onClose(); setStatus('idle'); }, 2000);
    } catch (err) {
      console.error(err);
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-950 border border-slate-900 w-full max-w-md p-6 rounded-2xl shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition">✕</button>
        
        <h3 className="text-sm font-black tracking-wider text-indigo-400 uppercase mb-4">Submit Platform Feedback</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[9px] font-bold uppercase text-slate-500">Feedback Category</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-xs text-slate-200 focus:outline-none">
              <option value="Bug">Bug / Technical Issue</option>
              <option value="Syllabus Issue">Syllabus / Wrong Marking Criteria</option>
              <option value="Feature Request">Feature Request</option>
              <option value="Other">General Feedback</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold uppercase text-slate-500">Description</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What went wrong? Tell us what question or step you were on..." 
              rows={4}
              className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs text-slate-200 focus:outline-none resize-none font-mono leading-relaxed"
            />
          </div>

          {status === 'success' && <p className="text-xs text-emerald-400 font-bold">✓ Logged! Thank you for sharpening the engine.</p>}
          {status === 'error' && <p className="text-xs text-rose-400 font-bold">❌ Error uploading telemetry log. Retry?</p>}

          <button 
            type="submit" 
            disabled={isSubmitting || !description.trim()} 
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 rounded-xl transition disabled:opacity-40"
          >
            {isSubmitting ? 'Transmitting logs...' : 'Send Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
}
