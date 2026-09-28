/**
* Canonical SEAB syllabus data for the GCE O-Level Humanities subjects MARKUP
* supports. Sourced from the official 2026 SEAB syllabuses:
* - 2261 Humanities (Social Studies, History) — Social Studies = Paper 1,
* History elective = Paper 2
* - 2174 History (Pure) — Papers 1 and 2
*
* This file is the single source of truth for topics and question types shown
* in the practice configurator. Update it when SEAB revises a syllabus.
*/

export type SubjectId = 'Social Studies' | 'Elective History' | 'Pure History';

/**
 * The History papers a student can take. Elective History (2261/02) and Pure
 * History (2174) are mutually exclusive — a student takes at most one. The
 * question types and assessment objectives are identical for both; only the
 * content coverage differs (Pure adds the Southeast Asian units).
 */
export type HistoryTrack = Exclude<SubjectId, 'Social Studies'>;

export const HISTORY_TRACKS: HistoryTrack[] = ['Elective History', 'Pure History'];

export interface PaperSpec {
  code: string;
  paper: string;
  duration: string;
  totalMarks: number;
  sections: { name: string; marks: number; detail: string }[];
  /** Per-question mark guidance for generated papers. */
  sbqLayout: string;
  essayLayout?: string;
  srqLayout?: string;
}

/**
 * A selectable paper within a subject. Only subjects that are examined as more
 * than one paper (currently Pure History, 2174) expose these; each carries its
 * own mark guidance and its own list of content units.
 */
export interface SyllabusPaper {
  id: string;
  label: string;
  markGuide: string;
  topics: string[];
}

/* ────────────────────────────────────────────────────────────────
Paper structures (verified against the 2026 syllabuses)
──────────────────────────────────────────────────────────────── */

export const SOCIAL_STUDIES_PAPER: PaperSpec = {
  code: '2261 (Paper 1)',
  paper: 'Social Studies',
  duration: '1 h 45 min',
  totalMarks: 50,
  sections: [
    { name: 'Section A — Source-Based Case Study (SBCS)', marks: 35, detail: 'Max 6 sources. Q1–Q4 = 25 marks; Q5 = 10 marks (multiple sources, must consider the issue from a different perspective)' },
    { name: 'Section B — Structured-Response Questions (SRQ)', marks: 15, detail: 'Q6 = 7 marks; Q7 = 8 marks' },
  ],
  // Q5 is the multi-source question requiring a different perspective (10 marks).
  sbqLayout:
  'Section A = 35 marks. Q1–Q4 together carry 25 marks (whole-number marks between 5 and 7 each). Q5 carries exactly 10 marks and MUST use multiple sources to consider the issue from a different perspective.',
  srqLayout:
  'Q6 = 7 marks (explanation / recommendation using multiple strategies, in the context of Singapore). Q7 = 8 marks (two factors or perspectives with a judgement on relative importance, or a balanced evaluation).',
};

export const ELECTIVE_HISTORY_PAPER: PaperSpec = {
  code: '2261 (Paper 2)',
  paper: 'History (Elective)',
  duration: '1 h 50 min',
  totalMarks: 50,
  sections: [
    { name: 'Section A — Source-Based Case Study (SBCS)', marks: 30, detail: 'Max 6 sources. Q1(a)–(e): five source-based questions' },
    { name: 'Section B — Essay Questions', marks: 20, detail: 'Answer 2 of 3 questions, each worth 10 marks' },
  ],
  sbqLayout:
  'Q1(a)–(e) total 30 marks. Typical allocation: (a) 6, (b) 5, (c) 6, (d) 5, (e) 8 — the five parts must sum to exactly 30. Part (e) uses all sources for an assertion/judgement.',
  essayLayout:
  'Three essay prompts (SEQ), of which the student answers two. Each essay is worth 10 marks and must demand analysis, evaluation and judgement.',
};

export const PURE_HISTORY_PAPERS: PaperSpec[] = [
  {
    code: '2174 (Paper 1)',
    paper: 'History (Pure) — Paper 1',
    duration: '1 h 50 min',
    totalMarks: 50,
    sections: [
      { name: 'Section A — Source-Based Case Study (SBCS)', marks: 30, detail: 'Max 6 sources. Q1(a)–(e)' },
      { name: 'Section B — Essay Questions', marks: 20, detail: 'Answer 2 of 3, each 10 marks' },
    ],
    sbqLayout: 'Q1(a)–(e) total 30 marks — five parts summing to exactly 30.',
    essayLayout: 'Three prompts, answer two, each 10 marks.',
  },
  {
    code: '2174 (Paper 2)',
    paper: 'History (Pure) — Paper 2',
    duration: '1 h 50 min',
    totalMarks: 50,
    sections: [
      { name: 'Section A — Source-Based Case Study (SBCS)', marks: 30, detail: 'Max 6 sources. Q1(a)–(e)' },
      { name: 'Section B — Essay Questions', marks: 20, detail: 'Answer 2 of 3, each 10 marks' },
    ],
    sbqLayout: 'Q1(a)–(e) total 30 marks — five parts summing to exactly 30.',
    essayLayout: 'Three prompts, answer two, each 10 marks.',
  },
];

/* ────────────────────────────────────────────────────────────────
Content topics (topics marked * are prescribed SBCS topics)
──────────────────────────────────────────────────────────────── */

/**
 * Social Studies — 3 Issues. Each Issue's guiding questions are individual
 * selectable sub-topics; every Issue therefore exposes its full set of
 * official guiding questions (Issue 2 has three, Issues 1 and 3 have four).
 */
export const SOCIAL_STUDIES_TOPICS: { issue: string; inquiry: string; subTopics: string[] }[] = [
  {
    issue: 'Issue 1: Exploring Citizenship and Governance',
    inquiry: 'Working for the good of society: Whose responsibility is it?',
    subTopics: [
      'Issue 1 · GQ1: What does citizenship mean to me?',
      'Issue 1 · GQ2: What are the functions and roles of government in working for the good of society?',
      'Issue 1 · GQ3: How do we decide what is good for society?',
      'Issue 1 · GQ4: How can we work together for the good of society?',
    ],
  },
  {
    issue: 'Issue 2: Living in a Diverse Society',
    inquiry: 'Living in a diverse society: Is harmony achievable?',
    subTopics: [
      'Issue 2 · GQ1: What are the factors that shape the identities of people and contribute to a diverse society?',
      'Issue 2 · GQ2: What are the experiences and effects of living in a diverse society?',
      'Issue 2 · GQ3: How can we respond to diversity in society?',
    ],
  },
  {
    issue: 'Issue 3: Being Part of a Globalised World',
    inquiry: 'Being part of a globalised world: How can we respond to globalisation?',
    subTopics: [
      'Issue 3 · GQ1: What are the factors that contribute to globalisation?',
      'Issue 3 · GQ2: How can we respond to the economic impacts of globalisation?',
      'Issue 3 · GQ3: How can we respond to the cultural impacts of globalisation?',
      'Issue 3 · GQ4: How can we respond to the security impacts of globalisation?',
    ],
  },
];

/**
 * History elective (2261 Paper 2) — "The Making of the 20th Century Modern
 * World, 1910s–1991". `*SBCS` marks the prescribed source-based case-study
 * topics; the overview units (WWI, rise of authoritarian regimes, the
 * 1960s–70s Cold War) are not directly examined.
 */
export const ELECTIVE_HISTORY_TOPICS: string[] = [
  'Paris Peace Conference & its impact on Europe in the 1920s',
  'Case Study: Nazi Germany (*SBCS)',
  'Case Study: Militarist Japan, 1920s–1930s',
  'Outbreak of WWII in Europe (*SBCS)',
  'Outbreak of WWII in the Asia-Pacific',
  'Reasons for the end of WWII',
  'Cold War: Origins and development in Europe (*SBCS)',
  'Cold War: Korean War, 1950–1953 (*SBCS)',
  'Cold War: Vietnam War, 1954–1975',
  'End of the Cold War: Decline of the USSR and the end of the Cold War',
];

/**
 * Pure History (2174) — two papers with different content.
 * `*SBCS` marks prescribed source-based case-study topics; "Compulsory" marks
 * the Southeast Asian country that must be studied (the other is taught as an
 * either/or option).
 */
export const PURE_HISTORY_TOPICS: Record<string, string[]> = {
  'Paper 1': [
    'British Malaya, 1870s–1920s: Extension of European control (Compulsory *SBCS)',
    'Dutch Indonesia, 1870s–1920s: Extension of European control',
    'French Vietnam, 1870s–1920s: Extension of European control',
    'Paris Peace Conference & its impact on Europe in the 1920s',
    'Case Study: Nazi Germany (*SBCS)',
    'Case Study: Militarist Japan, 1920s–1930s',
    'Outbreak of WWII in Europe (*SBCS)',
    'Outbreak of WWII in the Asia-Pacific',
  ],
  'Paper 2': [
    'Reasons for the end of WWII',
    'Cold War: Origins and development in Europe (*SBCS)',
    'Cold War: Korean War, 1950–1953 (*SBCS)',
    'Cold War: Vietnam War, 1954–1975',
    'Decolonisation: British Malaya, 1945–1957 (Compulsory *SBCS)',
    'Decolonisation: Dutch Indonesia, 1945–1949',
    'Decolonisation: French Vietnam, 1945–1954',
    'End of the Cold War: Decline of the USSR and the end of the Cold War',
  ],
};

/**
 * The two Pure History papers as the configurator presents them. Each paper
 * leads with its own paper-scoped "any topic" option so a mixed practice still
 * tells the generator which paper's content it may draw on.
 */
export const PURE_HISTORY_PAPER_OPTIONS: SyllabusPaper[] = [
  {
    id: 'Paper 1',
    label: 'Paper 1',
    markGuide:
      '2174 Paper 1 · 50 marks · 1 h 50 min — Section A SBCS 30 (Q1(a)–(e)) · Section B Essay 20 (answer 2 of 3, 10 marks each) · Extension of European control in Southeast Asia, 1870s–1942',
    topics: [
      'Any Topic — Pure History Paper 1 (1870s–1942)',
      ...PURE_HISTORY_TOPICS['Paper 1'],
    ],
  },
  {
    id: 'Paper 2',
    label: 'Paper 2',
    markGuide:
      '2174 Paper 2 · 50 marks · 1 h 50 min — Section A SBCS 30 (Q1(a)–(e)) · Section B Essay 20 (answer 2 of 3, 10 marks each) · The Cold War and decolonisation in Southeast Asia, 1940s–1991',
    topics: [
      'Any Topic — Pure History Paper 2 (1945–1991)',
      ...PURE_HISTORY_TOPICS['Paper 2'],
    ],
  },
];

/* ────────────────────────────────────────────────────────────────
Configurator map — question types per subject
Note: skill IDs are stable keys (also used in SKILL_LABELS and stored
  on practice rows), so they must not be renamed casually. Older rows
  are mapped through the legacy keys in lib/summary-utils.ts.
──────────────────────────────────────────────────────────────── */

export const SS_SKILLS = [
  'All Formats (SBCS + SRQ Bundle)',
  'SBQ: Inference / Message (AO1/AO2)',
  'SBQ: Comparison & Contrast (AO1/AO2)',
  'SBQ: Purpose / Motive Evolution (AO1/AO2)',
  'SBQ: Utility & Reliability Limits (AO1/AO2)',
  'SBQ: Synthesis Matrix Assertion (AO1/AO2)',
  'SRQ: Structured Response Questions (AO1/AO3)',
] as const;

export const HISTORY_SKILLS = [
  'All Formats (SBCS + SEQ Bundle)',
  'SBQ: Inference / Message (AO1/AO3)',
  'SBQ: Comparison & Contrast (AO1/AO3)',
  'SBQ: Reliability & Cross-Referencing (AO1/AO3)',
  'SBQ: Evaluation of Utility (AO1/AO3)',
  'SBQ: Target Purpose Analysis (AO1/AO3)',
  'SEQ: High-Scoring Essay Factor Prioritization (AO1/AO2)',
] as const;

/**
 * A subject as offered in the practice configurator.
 * `topics` is the flat canonical list (used for "known topic" detection and to
 * seed the default selection); `groups` is an optional set of display headings
 * so the topic picker can show Issues / exam papers instead of one long list.
 */
export interface SyllabusSubject {
  topics: string[];
  skills: string[];
  groups?: { label: string; topics: string[] }[];
  papers?: SyllabusPaper[];
}

const ANY_TOPIC = 'Any Topic (Random Mix)';

/** Topics/skills offered in the practice configurator. */
export const SYLLABUS_MAP: Record<string, SyllabusSubject> = {
  'Social Studies': {
    topics: [
      ANY_TOPIC,
      ...SOCIAL_STUDIES_TOPICS.map((i) => i.issue),
      ...SOCIAL_STUDIES_TOPICS.flatMap((i) => i.subTopics),
    ],
    skills: [...SS_SKILLS],
    // One group per Issue; the Issue title itself is the "whole issue" option.
    groups: SOCIAL_STUDIES_TOPICS.map((i) => ({
      label: i.issue,
      topics: [i.issue, ...i.subTopics],
    })),
  },
  'Elective History': {
    topics: [ANY_TOPIC, ...ELECTIVE_HISTORY_TOPICS],
    skills: [...HISTORY_SKILLS],
    groups: [
      {
        label: '2261 Paper 2 · The Making of the 20th Century Modern World, 1910s–1991',
        topics: [...ELECTIVE_HISTORY_TOPICS],
      },
    ],
  },
  'Pure History': {
    // Flat list, for "known topic" detection and the default selection.
    topics: PURE_HISTORY_PAPER_OPTIONS.flatMap((paper) => paper.topics),
    skills: [...HISTORY_SKILLS],
    // Examined as two separate papers — the configurator shows a paper selector.
    papers: PURE_HISTORY_PAPER_OPTIONS,
  },
};

/** Quick lookup for mark guidance shown to students. */
export const MARK_GUIDE: Record<string, string> = {
  'Social Studies': 'Paper 1 · 50 marks · 1 h 45 min — Section A SBCS 35 (Q1–Q4 = 25, Q5 = 10) · Section B SRQ 15 (Q6 = 7, Q7 = 8)',
  'Elective History': 'Paper 2 · 50 marks · 1 h 50 min — Section A SBCS 30 (Q1(a)–(e)) · Section B Essay 20 (answer 2 of 3, 10 marks each)',
  'Pure History': '2174 · Two papers × 50 marks · 1 h 50 min each — each paper: SBCS 30 (Q1(a)–(e)) + Essay 20 (answer 2 of 3, 10 marks each)',
};
