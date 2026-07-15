'use client';

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
  history: HistoryItem[];
  hasMoreHistory: boolean;
  isLoadingMore: boolean;
  historyPage: number;
  syllabusMap: Record<string, { topics: string[]; skills: string[] }>;
  onSetActiveSubject: (subject: string) => void;
  onSetSelectedTopic: (topic: string) => void;
  onSetSelectedSkill: (skill: string) => void;
  onSetCustomMode: (mode: boolean) => void;
  onSetHasScanned: (scanned: boolean) => void;
  onGenerate: () => void;
  onLoadHistoricalItem: (item: HistoryItem) => void;
  onLoadMoreHistory: () => void;
  onJumpToRecent: () => void;
}

export default function ConfiguratorSidebar({
  activeSubject,
  selectedTopic,
  selectedSkill,
  isCustomMode,
  isGenerating,
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
}: ConfiguratorSidebarProps) {
  return (
    <div className="xl:col-span-1 flex flex-col space-y-4 overflow-y-auto pr-1">
      {/* Configurator Card */}
      <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4 space-y-4 hover-lift">
        <h2 className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Configurator</h2>

        {/* Subject Toggle */}
        <div className="flex flex-col space-y-1">
          <label className="text-[9px] font-bold uppercase text-slate-500">Syllabus Subject</label>
          <div className="grid grid-cols-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => onSetActiveSubject('Social Studies')}
              className={`text-[10px] font-bold py-1.5 rounded-lg transition ${
                activeSubject === 'Social Studies' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              SS
            </button>
            <button
              onClick={() => onSetActiveSubject('Elective History')}
              className={`text-[10px] font-bold py-1.5 rounded-lg transition ${
                activeSubject === 'Elective History' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              History
            </button>
          </div>
        </div>

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
              {syllabusMap[activeSubject]?.topics.map(topic => (
                <option key={topic} value={topic}>
                  {topic.replace('Issue ', 'Is. ').replace('Case Study: ', '')}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold uppercase text-slate-500">Target Skill Objectives</label>
            <select
              value={selectedSkill}
              onChange={(e) => onSetSelectedSkill(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-xs font-medium text-slate-200 focus:outline-none"
            >
              {syllabusMap[activeSubject]?.skills.map(skill => (
                <option key={skill} value={skill}>{skill}</option>
              ))}
            </select>
          </div>

          {!isCustomMode && (
            <button
              onClick={onGenerate}
              disabled={isGenerating}
              className="w-full bg-indigo-600 text-white text-xs font-bold py-2.5 rounded-xl transition disabled:opacity-50 mt-1"
            >
              {isGenerating ? 'Drafting Sheet...' : '⚡ Generate Practice'}
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
                        {item.subject === 'Social Studies' ? 'SS' : 'HIST'}
                      </span>
                      {isAllFormats && (
                        <span className="text-[8px] bg-amber-900/40 text-amber-400 px-1.5 py-0.5 rounded font-bold">
                          {sourceCount}-SRC
                        </span>
                      )}
                    </div>
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
                  {isLoadingMore ? 'Loading...' : '⬇ Load More'}
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
