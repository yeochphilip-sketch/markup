'use client';

import { SKILL_LABELS, TOPIC_SUMMARIES, detectSubTopic, isCustomTopic } from '@/lib/summary-utils';
import { MARK_GUIDE, type SyllabusSubject } from '@/lib/syllabus';

/** Subjects shown in the configurator toggle, in display order. */
const SUBJECT_OPTIONS: { id: string; short: string; full: string }[] = [
  { id: 'Social Studies', short: 'SS', full: 'Social Studies — Paper 1 (2261)' },
  { id: 'Elective History', short: 'History', full: 'Elective History — Paper 2 (2261)' },
  { id: 'Pure History', short: 'Pure Hist', full: 'Pure History — Papers 1 & 2 (2174)' },
];

/** First entry of every subject's topic list — practice across any topic. */
const ANY_TOPIC = 'Any Topic (Random Mix)';

/** Shorten a canonical topic for display only; the option value stays canonical. */
function displayTopic(topic: string, groupLabel?: string): string {
  // Inside an Issue group, the Issue title itself just means "the whole issue".
  if (groupLabel && topic === groupLabel) return 'Whole issue — all guiding questions';
  return topic
    .replace(/^Issue \d+ · /, '') // the group label already names the Issue
    .replace('Case Study: ', '');
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
  metadata?: Record<string, any>;
}

interface ConfiguratorSidebarProps {
  activeSubject: string;
  selectedTopic: string;
  selectedSkill: string;
  isCustomMode: boolean;
  isGenerating: boolean;
  generateProgress: string | null;
  history: HistoryItem[];
  hasMoreHistory: boolean;
  isLoadingMore: boolean;
  historyPage: number;
  syllabusMap: Record<string, SyllabusSubject>;
  onSetActiveSubject: (subject: string) => void;
  onSetSelectedTopic: (topic: string) => void;
  onSetSelectedSkill: (skill: string) => void;
  onSetCustomMode: (mode: boolean) => void;
  onSetHasScanned: (scanned: boolean) => void;
  onGenerate: () => void;
  onLoadHistoricalItem: (item: HistoryItem) => void;
  onLoadMoreHistory: () => void;
  onJumpToRecent: () => void;
  /** Beta trial gate: tries used out of the limit (e.g. 2/3) */
  trialTriesUsed?: number;
  /** Beta trial gate: max free tries */
  trialLimit?: number;
  /** Beta trial gate: true once the user joined the waitlist (7-day unlock) */
  trialUnlocked?: boolean;
  /** Beta trial gate: called when a blocked user clicks Generate */
  onTrialBlocked?: () => void;
}

/** Generate a short readable summary of what the practice was about.
 *  Uses the stored summary from metadata first (most accurate), falls back to static mapping. */
function getTopicSummary(item: HistoryItem): string {
  const meta = item.metadata || {};
  // Priority 1: Use stored summary from metadata (set at generation time)
  if (meta.summary && typeof meta.summary === 'string') {
    return meta.summary;
  }

  const isAllFormats = meta.isAllFormats === true;
  const topic = item.topic || '';
  const ctx = item.background_context || '';
  const qType = item.question_type || '';

  // Priority 2: Handle custom/off-syllabus topics
  if (isCustomTopic(topic)) {
    const source = ctx || topic || 'General practice';
    return source.replace(/\s+/g, ' ').slice(0, 55).trim() + (source.length > 55 ? '…' : '');
  }

  let base = TOPIC_SUMMARIES[topic] || topic || 'General practice';

  // For any mixed-topic option (including the Pure History per-paper ones), append context
  if (topic.startsWith('Any Topic') && ctx) {
    base = ctx.replace(/\s+/g, ' ').slice(0, 60).trim() + (ctx.length > 60 ? '…' : '');
  }

  // Try to detect a more specific sub-topic from background context
  if (ctx) {
    const subTopic = detectSubTopic(ctx);
    if (subTopic && !base.includes(subTopic)) {
      base = `${base} > ${subTopic}`;
    }
  }

  // Use clean skill label
  if (qType && !qType.startsWith('All Formats')) {
    const skillLabel = SKILL_LABELS[qType];
    if (skillLabel) {
      return `${base} · ${skillLabel}`;
    }
    // Fall back to raw abbreviation
    const skillBrief = qType
      .replace(/^SBQ: /, '')
      .replace(/^SRQ\/SEQ: /, '')
      .replace(/^SEQ: /, '')
      .replace(/\(AO[123]\/?AO?[12]?\)/g, '')
      .trim();
    if (skillBrief && skillBrief.length < 40) {
      return `${base} · ${skillBrief}`;
    }
  }

  // For All Formats, show a more specific summary from question_prompt if possible
  if (isAllFormats) {
    const prompt = item.question_prompt || '';
    const cleaned = prompt.replace(/^.*?(Bundle|Comprehensive|Practice).*?[—–-]\s*/i, '').slice(0, 50).trim();
    if (cleaned && cleaned.length > 5) {
      return cleaned + (cleaned.length >= 50 ? '…' : '');
    }
  }

  return base;
}

export default function ConfiguratorSidebar({
  activeSubject,
  selectedTopic,
  selectedSkill,
  isCustomMode,
  isGenerating,
  generateProgress,
  history,
  hasMoreHistory,
  isLoadingMore,
  historyPage,
  syllabusMap,
  onSetActiveSubject,
  onSetSelectedTopic,
  onSetSelectedSkill,
  onSetCustomMode,
  onSetHasScanned,
  onGenerate,
  onLoadHistoricalItem,
  onLoadMoreHistory,
  onJumpToRecent,
  trialTriesUsed = 0,
  trialLimit = 3,
  trialUnlocked = false,
  onTrialBlocked,
}: ConfiguratorSidebarProps) {
  const subjectConfig = syllabusMap[activeSubject];
  // Pure History is examined as two separate papers. The active paper is derived
  // from the selected topic rather than held as separate state, so the paper
  // selector and the topic list can never disagree.
  const papers = subjectConfig?.papers;
  const activePaper = papers?.find((paper) => paper.topics.includes(selectedTopic)) ?? papers?.[0];

  return (
    <div className="xl:col-span-1 flex flex-col space-y-4 overflow-y-auto pr-1" data-section="configurator">
      {/* Configurator Card */}
      <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4 space-y-4 hover-lift">
        <h2 className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Configurator</h2>

        {/* Subject Toggle */}
        <div className="flex flex-col space-y-1">
          <label className="text-[9px] font-bold uppercase text-slate-500">Syllabus Subject</label>
          <div className="grid grid-cols-3 gap-0.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {SUBJECT_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => onSetActiveSubject(option.id)}
                title={option.full}
                aria-pressed={activeSubject === option.id}
                className={`text-[10px] font-bold py-2 rounded-lg transition whitespace-nowrap ${
                  activeSubject === option.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {option.short}
              </button>
            ))}
          </div>
        </div>

        {/* Paper Selector — only for subjects examined as more than one paper */}
        {papers && papers.length > 1 && (
          <div className="flex flex-col space-y-1">
            <label className="text-[9px] font-bold uppercase text-slate-500">Exam Paper</label>
            <div className="grid grid-cols-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
              {papers.map((paper) => (
                <button
                  key={paper.id}
                  onClick={() => onSetSelectedTopic(paper.topics[0])}
                  title={paper.markGuide}
                  aria-pressed={activePaper?.id === paper.id}
                  className={`text-[10px] font-bold py-2 rounded-lg transition whitespace-nowrap ${
                    activePaper?.id === paper.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {paper.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* AI Paper / Vet Homework toggle */}
        <div className="grid grid-cols-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => { onSetCustomMode(false); onSetHasScanned(false); }}
            className={`text-[10px] font-bold py-2 rounded-lg transition ${
              !isCustomMode ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            AI Paper
          </button>
          <button
            onClick={() => { onSetCustomMode(true); onSetHasScanned(false); }}
            className={`text-[10px] font-bold py-2 rounded-lg transition ${
              isCustomMode ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            Vet Homework
          </button>
        </div>

        <div className="space-y-3 pt-1">
          <div className="space-y-1">
            <label className="text-[9px] font-bold uppercase text-slate-500">Syllabus Topic Focus</label>
            <select
              value={selectedTopic}
              onChange={(e) => onSetSelectedTopic(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-xs font-medium text-slate-200 focus:outline-none"
            >
              {activePaper
                ? /* Paper-scoped list (Pure History) — the paper's own "any topic" option leads. */
                  activePaper.topics.map((topic) => (
                    <option key={topic} value={topic}>
                      {displayTopic(topic)}
                    </option>
                  ))
                : (
                    <>
                      {/* "Any Topic" stays outside the groups so it always sits on top. */}
                      {subjectConfig?.topics.includes(ANY_TOPIC) && (
                        <option value={ANY_TOPIC}>Any Topic (Random Mix)</option>
                      )}
                      {subjectConfig?.groups
                        ? subjectConfig.groups.map((group) => (
                            <optgroup key={group.label} label={group.label}>
                              {group.topics.map((topic) => (
                                <option key={topic} value={topic}>
                                  {displayTopic(topic, group.label)}
                                </option>
                              ))}
                            </optgroup>
                          ))
                        : subjectConfig?.topics
                            .filter((topic) => topic !== ANY_TOPIC)
                            .map((topic) => (
                              <option key={topic} value={topic}>
                                {displayTopic(topic)}
                              </option>
                            ))}
                    </>
                  )}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold uppercase text-slate-500">Target Skill Objectives</label>
            <select
              value={selectedSkill}
              onChange={(e) => onSetSelectedSkill(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-xs font-medium text-slate-200 focus:outline-none"
            >
              {subjectConfig?.skills.map(skill => (
                <option key={skill} value={skill}>{SKILL_LABELS[skill] || skill}</option>
              ))}
            </select>
          </div>

          {/* Official paper format — marks and timing for the selected subject */}
          {(activePaper?.markGuide ?? MARK_GUIDE[activeSubject]) && (
            <p className="text-[9px] leading-relaxed text-slate-600 font-medium">
              {activePaper?.markGuide ?? MARK_GUIDE[activeSubject]}
            </p>
          )}



          {/* Beta trial gate — remaining tries indicator */}
          {!isCustomMode && !trialUnlocked && trialTriesUsed >= 1 && (
            <div className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-[10px] font-bold ${
              trialTriesUsed >= trialLimit
                ? 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                : 'bg-amber-950/30 border-amber-500/20 text-amber-300'
            }`}>
 <span>Free tries</span>
              <span className="font-mono">
                {trialTriesUsed >= trialLimit ? 'Used up' : `${trialTriesUsed}/${trialLimit} used`}
              </span>
            </div>
          )}

          {!isCustomMode && (
            <button
              onClick={() => {
                if (!trialUnlocked && trialTriesUsed >= trialLimit) {
                  onTrialBlocked?.();
                  return;
                }
                onGenerate();
              }}
              // NOTE: not disabled when blocked — the click routes to onTrialBlocked() so the
              // user can always reopen the gate modal after dismissing it.
              disabled={isGenerating}
              className={`w-full text-white text-xs font-bold py-2.5 rounded-xl transition mt-1 flex items-center justify-center gap-2 ${
                !trialUnlocked && trialTriesUsed >= trialLimit
                  ? 'bg-slate-800 text-slate-400 hover:bg-slate-700 cursor-pointer'
                  : 'bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50'
              }`}
            >
              {!trialUnlocked && trialTriesUsed >= trialLimit ? (
 <span className="inline-flex items-center gap-2">Join Waitlist to Continue</span>
              ) : isGenerating ? (
                <span className="inline-flex flex-col items-center gap-1 w-full">
                  <span className="inline-flex items-center gap-2 text-[10px]">
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin-fast shrink-0" />
                    Generating…
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[8px] sm:text-[9px] opacity-80">
                    <span className={`px-1.5 py-0.5 rounded transition-all duration-300 text-[8px] sm:text-[9px] ${
                      generateProgress === 'sources' 
                        ? 'bg-indigo-500/20 text-indigo-200 font-bold shadow-lg shadow-indigo-500/20 animate-pulse' 
                        : ['questions', 'formatting'].includes(generateProgress || '') 
                          ? 'text-indigo-400/60' 
                          : 'text-slate-500'
                    }`}>SRC</span>
                    <span className="text-slate-600 text-[8px] sm:text-[9px]">→</span>
                    <span className={`px-1.5 py-0.5 rounded transition-all duration-300 text-[8px] sm:text-[9px] ${
                      generateProgress === 'questions' 
                        ? 'bg-indigo-500/20 text-indigo-200 font-bold shadow-lg shadow-indigo-500/20 animate-pulse' 
                        : generateProgress === 'formatting' 
                          ? 'text-indigo-400/60' 
                          : 'text-slate-500'
                    }`}>QST</span>
                    <span className="text-slate-600 text-[8px] sm:text-[9px]">→</span>
                    <span className={`px-1.5 py-0.5 rounded transition-all duration-300 text-[8px] sm:text-[9px] ${
                      generateProgress === 'formatting' 
                        ? 'bg-emerald-500/20 text-emerald-200 font-bold shadow-lg shadow-emerald-500/20 animate-pulse' 
                        : 'text-slate-500'
                    }`}>FMT</span>
                  </span>
                </span>
              ) : 'Generate Practice'}
            </button>
          )}
        </div>
      </div>

      {/* Practice Logs */}
      <div className="flex-1 flex flex-col min-h-[160px]">
        <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase mb-2">Practice Logs</span>
        <div className="flex-1 space-y-2 overflow-y-auto max-h-[220px] pr-1">
          {history.length === 0 ? (
            <div className="text-[10px] text-slate-600 font-mono italic p-2 border border-dashed border-slate-900 rounded-xl text-center">
              No logs recorded.
            </div>
          ) : (
            <>
              {history.map((item) => {
                const meta = item.metadata || {};
                const isAllFormats = meta.isAllFormats === true;
                const sourceCount = [meta.sourceC, meta.sourceD, meta.sourceE].filter(Boolean).length + 2;
                return (
                  <div
                    key={item.id}
                    onClick={() => onLoadHistoricalItem(item)}
                    className="bg-slate-950/30 hover:bg-slate-900/60 border border-slate-900 p-3 rounded-xl cursor-pointer transition text-left space-y-1.5 group"
                  >
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[9px] bg-slate-900 px-2 py-0.5 rounded text-indigo-400 font-bold uppercase">
                        {item.subject === 'Social Studies' ? 'SS' : item.subject === 'Pure History' ? 'PH' : 'HIST'}
                      </span>
                      {isAllFormats && (
                        <span className="text-[8px] bg-amber-900/40 text-amber-400 px-1.5 py-0.5 rounded font-bold">
                          {sourceCount}-SRC
                        </span>
                      )}
                    </div>
                    {/* Topic summary — what the practice is about */}
                    <p className="text-[9px] text-emerald-500/70 font-medium leading-snug line-clamp-1">
                      {getTopicSummary(item)}
                    </p>
                    <p className="text-[11px] text-slate-400 line-clamp-2 font-medium group-hover:text-slate-200 transition">
                      {item.question_prompt}
                    </p>
                  </div>
                );
              })}
              {hasMoreHistory && (
                <button
                  onClick={onLoadMoreHistory}
                  disabled={isLoadingMore}
                  className="w-full text-[9px] font-bold text-slate-500 hover:text-indigo-400 bg-slate-900/50 hover:bg-slate-900 border border-slate-800 py-2 rounded-lg transition disabled:opacity-40"
                >
                  {isLoadingMore ? 'Loading...' : 'Load More'}
                </button>
              )}
              {historyPage > 0 && (
                <button
                  onClick={onJumpToRecent}
                  className="w-full text-[9px] font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-950/30 hover:bg-indigo-950/50 border border-indigo-800/40 py-2 rounded-lg transition flex items-center justify-center gap-1.5"
                >
                  ↑ Most Recent
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
