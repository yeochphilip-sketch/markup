'use client';

import { useState } from 'react';
import Link from 'next/link';

export interface TipEntry {
  slug: string;
  title: string;
  description: string;
  icon: string;
  gradient: string;
  tag: string;
  tagColor: string;
  readTime: string;
  type: string[];
  subject: 'History' | 'Social Studies' | 'Both';
}

const TAG_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
};

const ALL_TYPES = ['SBQ', 'SRQ', 'SEQ'];
const ALL_SUBJECTS = ['History', 'Social Studies', 'Both'];

interface Filters {
  type: string | null;
  subject: string | null;
}

export default function TipsGrid({ tips }: { tips: TipEntry[] }) {
  const [filters, setFilters] = useState<Filters>({ type: null, subject: null });

  const filtered = tips.filter((tip) => {
    if (filters.type && !tip.type.includes(filters.type)) return false;
    if (filters.subject && tip.subject !== filters.subject && tip.subject !== 'Both') return false;
    return true;
  });

  const activeCount = [filters.type, filters.subject].filter(Boolean).length;

  function setFilter(key: keyof Filters, value: string | null) {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key] === value ? null : value,
    }));
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="space-y-3">
        {/* Type Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mr-1">
            Type:
          </span>
          <button
            onClick={() => setFilters({ type: null, subject: null })}
            className={`text-[10px] font-bold px-3 py-1.5 rounded-full border transition ${
              activeCount === 0
                ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/40'
                : 'bg-slate-900/50 text-slate-500 border-slate-800 hover:text-slate-300 hover:border-slate-600'
            }`}
          >
            All
          </button>
          {ALL_TYPES.map((t) => {
            const isActive = filters.type === t;
            const typeColors: Record<string, string> = {
              SBQ: isActive
                ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/40'
                : 'bg-slate-900/50 text-slate-500 border-slate-800 hover:text-indigo-400 hover:border-indigo-500/30',
              SRQ: isActive
                ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40'
                : 'bg-slate-900/50 text-slate-500 border-slate-800 hover:text-emerald-400 hover:border-emerald-500/30',
              SEQ: isActive
                ? 'bg-amber-600/20 text-amber-400 border-amber-500/40'
                : 'bg-slate-900/50 text-slate-500 border-slate-800 hover:text-amber-400 hover:border-amber-500/30',
            };
            return (
              <button
                key={t}
                onClick={() => setFilter('type', t)}
                className={`text-[10px] font-bold px-3 py-1.5 rounded-full border transition ${typeColors[t]}`}
              >
                {t}
              </button>
            );
          })}
        </div>

        {/* Subject Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mr-1">
            Subject:
          </span>
          {ALL_SUBJECTS.map((s) => {
            const isActive = filters.subject === s;
            const subjectColors: Record<string, string> = {
              History: isActive
                ? 'bg-rose-600/20 text-rose-400 border-rose-500/40'
                : 'bg-slate-900/50 text-slate-500 border-slate-800 hover:text-rose-400 hover:border-rose-500/30',
              'Social Studies': isActive
                ? 'bg-sky-600/20 text-sky-400 border-sky-500/40'
                : 'bg-slate-900/50 text-slate-500 border-slate-800 hover:text-sky-400 hover:border-sky-500/30',
              Both: isActive
                ? 'bg-purple-600/20 text-purple-400 border-purple-500/40'
                : 'bg-slate-900/50 text-slate-500 border-slate-800 hover:text-purple-400 hover:border-purple-500/30',
            };
            return (
              <button
                key={s}
                onClick={() => setFilter('subject', s)}
                className={`text-[10px] font-bold px-3 py-1.5 rounded-full border transition ${subjectColors[s]}`}
              >
                {s === 'Both' ? 'Both Subjects' : s}
              </button>
            );
          })}
        </div>

        {activeCount > 0 && (
          <p className="text-[10px] text-slate-600">
            Showing {filtered.length} of {tips.length} guides
            <button
              onClick={() => setFilters({ type: null, subject: null })}
              className="ml-2 text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
            >
              Clear filters
            </button>
          </p>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <p className="text-3xl mb-2">🔍</p>
          <p className="text-sm font-bold">No guides match your filters</p>
          <p className="text-xs mt-1">Try selecting a different combination</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filtered.map((tip) => {
            const style = TAG_STYLES[tip.tagColor] || TAG_STYLES.indigo;
            return (
              <Link
                key={tip.slug}
                href={`/tips/${tip.slug}`}
                className="group block bg-slate-950/80 border border-slate-900 rounded-2xl overflow-hidden hover:border-indigo-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-950/20 hover:scale-[1.02]"
              >
                <div
                  className={`h-40 bg-gradient-to-br ${tip.gradient} flex items-center justify-center text-5xl transition-transform duration-300 group-hover:scale-105`}
                >
                  {tip.icon}
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2 text-[8px] text-slate-600 font-mono flex-wrap">
                    <span
                      className={`${style.bg} ${style.text} ${style.border} border px-2 py-0.5 rounded-full`}
                    >
                      {tip.tag}
                    </span>
                    {tip.type.map((t) => (
                      <span
                        key={t}
                        className="bg-slate-800/50 text-slate-500 border border-slate-700/50 px-2 py-0.5 rounded-full"
                      >
                        {t}
                      </span>
                    ))}
                    <span>{tip.readTime}</span>
                  </div>
                  <h2 className="text-sm font-black text-slate-200 group-hover:text-white transition-colors leading-snug">
                    {tip.title}
                  </h2>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    {tip.description}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <span
                      className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${
                        tip.subject === 'History'
                          ? 'bg-rose-950/30 text-rose-500 border-rose-800/50'
                          : tip.subject === 'Social Studies'
                          ? 'bg-sky-950/30 text-sky-500 border-sky-800/50'
                          : 'bg-purple-950/30 text-purple-500 border-purple-800/50'
                      }`}
                    >
                      {tip.subject}
                    </span>
                    <span className="text-[10px] font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors inline-flex items-center gap-1 ml-auto">
                      Read Guide →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Count */}
      <p className="text-[10px] text-slate-700 text-center">
        {filtered.length} guide{filtered.length !== 1 ? 's' : ''} available
      </p>
    </div>
  );
}
