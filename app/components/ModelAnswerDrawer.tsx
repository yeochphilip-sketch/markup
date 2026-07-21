'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAutoDismiss } from '@/lib/useAutoDismiss';

interface ModelAnswerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  confidence: number;
  a1Upgrade: string;
  suggestedAnswer: string;
}

// ── Text parsing helpers ──

interface ParsedSegment {
  text: string;
  type: 'normal' | 'lorms-label' | 'peel-marker' | 'quote' | 'part-header' | 'assessment-point';
}

/**
 * Parse a model answer string into coloured segments for syntax highlighting.
 */
function parseModelAnswer(text: string): ParsedSegment[] {
  if (!text || text.length === 0) return [{ text, type: 'normal' }];

  const segments: ParsedSegment[] = [];
  
  // Regex patterns ordered by priority (most specific first)
  const patterns: { regex: RegExp; type: ParsedSegment['type'] }[] = [
    // LORMS level labels: "L4 Message (4-5m):" or "L5 Will not work based on Perspective (7m):"
    { regex: /(L[1-8][^:]*?:)/g, type: 'lorms-label' },
    // PEEL markers
    { regex: /\b(Point:|Evidence:|Explanation:|Link:)/g, type: 'peel-marker' },
    // SRQ/SEQ section headers
    { regex: /(SRQ\s*\([ab]\)|SEQ\s+\d+)/gi, type: 'part-header' },
    // Assessment bullet points
    { regex: /(✅|❌|✔|✘)/g, type: 'assessment-point' },
  ];

  // First, split by quotes to preserve quoted text
  const quoteRegex = /("(?:[^"\\]|\\.)*")/g;
  const quoteParts = text.split(quoteRegex);

  for (const part of quoteParts) {
    if (part.startsWith('"') && part.endsWith('"')) {
      // This is a direct quote — highlight it
      segments.push({ text: part, type: 'quote' });
    } else {
      // Parse this non-quote segment for other patterns
      const subSegments = parseNonQuoteSegment(part, patterns);
      segments.push(...subSegments);
    }
  }

  return segments;
}

function parseNonQuoteSegment(
  text: string,
  patterns: { regex: RegExp; type: ParsedSegment['type'] }[],
): ParsedSegment[] {
  if (!text.trim()) return [];

  // Sort patterns by length of match for greedy matching
  const matches: { index: number; length: number; text: string; type: ParsedSegment['type'] }[] = [];

  for (const { regex, type } of patterns) {
    // Reset regex state
    regex.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        index: match.index,
        length: match[0].length,
        text: match[0],
        type,
      });
    }
  }

  // Sort by position, then by length (longer matches first for overlaps)
  matches.sort((a, b) => a.index - b.index || b.length - a.length);

  if (matches.length === 0) {
    return [{ text, type: 'normal' }];
  }

  const segments: ParsedSegment[] = [];
  let lastEnd = 0;

  // Remove overlapping matches
  const cleanMatches = matches.filter((match, i) => {
    // Check if this match overlaps with any earlier match
    for (let j = 0; j < i; j++) {
      if (match.index < matches[j].index + matches[j].length && match.index >= matches[j].index) {
        return false;
      }
    }
    return true;
  });

  for (const match of cleanMatches) {
    if (match.index > lastEnd) {
      segments.push({ text: text.slice(lastEnd, match.index), type: 'normal' });
    }
    segments.push({ text: match.text, type: match.type });
    lastEnd = match.index + match.length;
  }

  if (lastEnd < text.length) {
    segments.push({ text: text.slice(lastEnd), type: 'normal' });
  }

  return segments;
}

function segmentToClassName(type: ParsedSegment['type']): string {
  switch (type) {
    case 'lorms-label':
      return 'text-emerald-400 font-bold';
    case 'peel-marker':
      return 'text-indigo-400 font-bold';
    case 'quote':
      return 'text-amber-300 italic';
    case 'part-header':
      return 'text-cyan-400 font-black';
    case 'assessment-point':
      return '';
    default:
      return 'text-slate-300';
  }
}

// ── Copy hook ──

function useCopyToClipboard(resetMs = 2000) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), resetMs);
    }).catch(() => {
      // Fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), resetMs);
    });
  }, [resetMs]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return { copied, copy };
}

// ── Component ──

export default function ModelAnswerDrawer({
  isOpen,
  onClose,
  confidence,
  a1Upgrade,
  suggestedAnswer,
}: ModelAnswerDrawerProps) {
  const { dismiss, startTimer, handleMouseEnter, handleMouseLeave, isHovered } = useAutoDismiss(onClose, 12000);
  const contentRef = useRef<HTMLDivElement>(null);
  const { copied, copy } = useCopyToClipboard(2000);

  const displayText = a1Upgrade || suggestedAnswer;
  const parsed = parseModelAnswer(displayText);

  // Auto-scroll to top when opened
  useEffect(() => {
    if (isOpen && contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [isOpen]);

  // Start auto-dismiss timer when modal opens
  useEffect(() => {
    if (isOpen) {
      startTimer();
    }
  }, [isOpen, startTimer]);

  // Keyboard: Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, dismiss]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-6 sm:pt-12 bg-black/70 backdrop-blur-sm"
      onClick={dismiss}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="bg-gradient-to-b from-slate-950 to-[#0b0d16] border border-emerald-500/20 rounded-2xl w-full max-w-2xl mx-4 shadow-2xl shadow-emerald-950/30 relative flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Progress bar */}
        <div className="h-0.5 bg-slate-900 shrink-0 rounded-t-2xl overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r from-emerald-400 to-emerald-600 animate-shrink-width-12s ${isHovered ? 'animate-paused' : ''}`}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs font-black">✓</div>
            <div>
              <h3 className="text-sm font-black text-emerald-400 tracking-wide">Model Answer</h3>
              <p className="text-[9px] text-slate-500 font-medium">MOE Teacher Standard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Confidence badge */}
            {confidence > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-lg px-2.5 py-1.5">
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Confidence</span>
                <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      confidence >= 0.8 ? 'bg-emerald-500' :
                      confidence >= 0.6 ? 'bg-amber-500' : 'bg-orange-500'
                    }`}
                    style={{ width: `${Math.min(confidence * 100, 100)}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  {(confidence * 100).toFixed(0)}%
                </span>
              </div>
            )}
            {/* Copy button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                copy(displayText);
              }}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-emerald-950/30 transition text-xs font-bold"
              title="Copy model answer"
            >
              {copied ? '✓' : '📋'}
            </button>
            {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              dismiss();
            }}
            aria-label="Close modal"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition text-sm font-bold"
          >
            ✕
          </button>
          </div>
        </div>

        {/* Content */}
        <div
          ref={contentRef}
          className="overflow-y-auto p-5 space-y-4 flex-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent"
        >
          {/* Confidence bar (mobile) */}
          {confidence > 0 && (
            <div className="flex sm:hidden items-center gap-2 px-1">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Confidence</span>
              <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden max-w-[100px]">
                <div
                  className={`h-full rounded-full ${
                    confidence >= 0.8 ? 'bg-emerald-500' :
                    confidence >= 0.6 ? 'bg-amber-500' : 'bg-orange-500'
                  }`}
                  style={{ width: `${Math.min(confidence * 100, 100)}%` }}
                />
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-400">
                {(confidence * 100).toFixed(0)}%
              </span>
            </div>
          )}

          {/* Model answer content with syntax highlighting */}
          <div className="bg-slate-900/40 rounded-xl p-5 border border-slate-800/60">
            <div className="space-y-1">
              {parsed.map((segment, i) => {
                // Add line breaks between PEEL markers or section headers
                const isBreakBefore =
                  (segment.type === 'peel-marker' || segment.type === 'part-header') &&
                  i > 0;

                return (
                  <span
                    key={i}
                    className={`leading-relaxed text-[12px] sm:text-[13px] whitespace-pre-wrap break-words ${
                      segmentToClassName(segment.type)
                    } ${isBreakBefore ? 'block mt-3 first:mt-0' : ''}`}
                  >
                    {segment.text}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 text-[9px] text-slate-600 border-t border-slate-800/40 pt-4">
            <span className="font-medium text-slate-500 uppercase tracking-widest">Legend:</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500/60 inline-block" />
              <span>LORMS Level</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500/60 inline-block" />
              <span>PEEL Marker</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500/60 inline-block" />
              <span>Direct Quote</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-500/60 inline-block" />
              <span>Section</span>
            </span>
          </div>

          {/* Copy feedback */}
          {copied && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-bold px-4 py-2 rounded-full shadow-lg shadow-emerald-950/50 animate-in fade-in slide-in-from-bottom-2">
              ✓ Copied to clipboard
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
