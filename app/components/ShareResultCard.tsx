'use client';

import { useRef, useState, useCallback } from 'react';
import { toPng } from 'html-to-image';

interface ShareResultCardProps {
  scoreEstimate: string;
  confidence: number;
  subject: string;
  topic: string;
  skill: string;
  xpEarned: number;
  levelTitle: string;
  masteryPoints: number;
  streakDays: number;
  critiqueCount: number;
}

export default function ShareResultCard({
  scoreEstimate,
  confidence,
  subject,
  topic,
  skill,
  xpEarned,
  levelTitle,
  masteryPoints,
  streakDays,
  critiqueCount,
}: ShareResultCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleShare = useCallback(async () => {
    if (!cardRef.current) return;
    setIsSharing(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#0a0a1a',
      });

      // Try native share API first (mobile)
      if (navigator.share) {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], 'markup-grade.png', { type: 'image/png' });
        await navigator.share({
          title: 'My MARKUP Grade',
          text: `I scored ${scoreEstimate} on my ${subject} practice!`,
          files: [file],
        });
      } else {
        // Fallback: download + copy
        const link = document.createElement('a');
        link.download = `markup-grade-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();

        // Copy to clipboard
        try {
          const blob = await (await fetch(dataUrl)).blob();
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
        } catch {
          // Clipboard write not supported
        }
      }
    } catch (err) {
      console.warn('Share failed:', err);
    } finally {
      setIsSharing(false);
    }
  }, [scoreEstimate, subject]);

  const confidenceColor =
    confidence >= 0.8 ? '#10b981' : confidence >= 0.6 ? '#f59e0b' : '#f43f5e';
  const confidenceLabel =
    confidence >= 0.8 ? 'High' : confidence >= 0.6 ? 'Medium' : 'Low';

  return (
    <div className="relative">
      {/* Share button */}
      <button
        onClick={() => setShowPreview(!showPreview)}
        className="bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 text-[9px] font-bold px-2.5 py-1.5 rounded-lg transition flex items-center gap-1.5"
        title="Share your result"
      >
        📤 Share
      </button>

      {/* Preview / Card */}
      {showPreview && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowPreview(false)}>
          <div
            className="bg-[#0a0a1a] rounded-2xl p-4 max-w-sm w-full mx-4 shadow-2xl border border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* The card to render */}
            <div
              ref={cardRef}
              className="bg-[#0a0a1a] rounded-xl p-6 flex flex-col items-center text-center space-y-4 border border-slate-800"
              style={{ width: 340 }}
            >
              {/* Header */}
              <div className="w-full flex items-center justify-between">
                <span className="text-[9px] font-black tracking-widest text-indigo-500 uppercase">
                  MARKUP
                </span>
                <span className="text-[8px] font-mono text-slate-600">
                  markup-five.vercel.app
                </span>
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

              {/* Subject + Skill */}
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  {subject}
                </p>
                <p className="text-[9px] text-slate-600 font-mono mt-0.5">
                  {skill} · {topic}
                </p>
              </div>

              {/* Big grade score */}
              <div className="bg-slate-900/70 rounded-2xl px-6 py-3 border border-slate-800">
                <p className="text-3xl font-black text-indigo-400 tracking-tight">
                  {scoreEstimate}
                </p>
              </div>

              {/* Confidence */}
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${confidence * 100}%`,
                      backgroundColor: confidenceColor,
                    }}
                  />
                </div>
                <span
                  className="text-[9px] font-bold font-mono"
                  style={{ color: confidenceColor }}
                >
                  {confidenceLabel} ({(confidence * 100).toFixed(0)}%)
                </span>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 w-full">
                <div className="bg-slate-900/50 rounded-xl p-2 text-center">
                  <p className="text-[8px] text-slate-500 uppercase">XP Earned</p>
                  <p className="text-sm font-black font-mono text-emerald-400">
                    +{xpEarned}
                  </p>
                </div>
                <div className="bg-slate-900/50 rounded-xl p-2 text-center">
                  <p className="text-[8px] text-slate-500 uppercase">Level</p>
                  <p className="text-sm font-black font-mono text-indigo-400">
                    {levelTitle}
                  </p>
                </div>
                <div className="bg-slate-900/50 rounded-xl p-2 text-center">
                  <p className="text-[8px] text-slate-500 uppercase">Total XP</p>
                  <p className="text-sm font-black font-mono text-amber-400">
                    {masteryPoints}
                  </p>
                </div>
              </div>

              {/* Critique count + streak */}
              <div className="flex gap-4 text-[9px] text-slate-600 font-mono">
                <span>📝 {critiqueCount} diagnostics</span>
                {streakDays > 0 && <span>🔥 {streakDays}d streak</span>}
              </div>

              {/* Footer */}
              <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
              <p className="text-[7px] text-slate-700 font-mono">
                MARKUP — LORMS-aligned Humanities Practice
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleShare}
                disabled={isSharing}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 rounded-xl transition disabled:opacity-50"
              >
                {isSharing ? 'Generating...' : '📤 Share as Image'}
              </button>
              <button
                onClick={() => setShowPreview(false)}
                className="w-10 h-10 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold text-xs rounded-xl transition"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
