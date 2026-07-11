'use client';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedType: string;
  setSelectedType: (val: string) => void;
  textInput: string;
  setTextInput: (val: string) => void;
  onSubmit: () => Promise<void>;
}

export default function FeedbackModal({
  isOpen,
  onClose,
  selectedType,
  setSelectedType,
  textInput,
  setTextInput,
  onSubmit
}: FeedbackModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-950 border border-slate-900 w-full max-w-md p-6 rounded-2xl shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-center border-b border-slate-900 pb-3">
          <h3 className="text-sm font-black tracking-wider text-indigo-400 uppercase">Submit Testing Notes</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-xs">✕</button>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-500 uppercase">Feedback Category</label>
            <select 
              value={selectedType} 
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 p-2 rounded-xl text-xs text-slate-200 focus:outline-none"
            >
              <option value="General">General Review</option>
              <option value="Bug">Technical Bug / Crash</option>
              <option value="AI Accuracy">Humanities LORMS Accuracy</option>
              <option value="UI Suggestion">UX / Visual Polish</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-500 uppercase">Description Details</label>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="What did you spot? Let us know what to tweak before launch..."
              rows={4}
              className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs text-slate-200 focus:outline-none font-sans resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-900">
          <button onClick={onClose} className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 font-bold px-4 py-2 rounded-xl text-xs transition">Cancel</button>
          <button onClick={onSubmit} disabled={!textInput.trim()} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2 rounded-xl text-xs transition disabled:opacity-40">Submit Log</button>
        </div>
      </div>
    </div>
  );
}
