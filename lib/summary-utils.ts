/**
 * Shared summary utilities for generating concise practice log summaries.
 * Used by both the dashboard (primary, stored in metadata) and the
 * ConfiguratorSidebar (fallback for old rows without stored summaries).
 */
 import { SYLLABUS_MAP } from '@/lib/syllabus';

/** ── Clean skill labels (with the marks each question type carries) ── */
export const SKILL_LABELS: Record<string, string> = {
'All Formats (SBCS + SRQ Bundle)': 'Full paper — SBCS + SRQ (50 marks)',
'All Formats (SBCS + SEQ Bundle)': 'Full paper — SBCS + SEQ (50 marks)',
// Legacy label retained so older practice rows still render cleanly.
'All Formats (SBCS + SEQ + SRQ Bundle)': 'Full paper (50 marks)',
'SBQ: Inference / Message (AO1/AO2)': 'Inference / Message (AO1/AO2)',
'SBQ: Comparison & Contrast (AO1/AO2)': 'Comparison & Contrast (AO1/AO2)',
  'SBQ: Purpose / Motive Evolution (AO1/AO2)': 'Purpose / Motive (AO1/AO2)',
  'SBQ: Utility & Reliability Limits (AO1/AO2)': 'Utility & Reliability (AO1/AO2)',
  'SBQ: Synthesis Matrix Assertion (AO1/AO2)': 'Assertion / Different Perspective (10 marks)',
  'SRQ: Structured Response Questions (AO1/AO3)': 'SRQ — Q6 (7 marks) + Q7 (8 marks)',
  'SBQ: Inference / Message (AO1/AO3)': 'Inference / Message (AO1/AO3)',
  'SBQ: Comparison & Contrast (AO1/AO3)': 'Comparison & Contrast (AO1/AO3)',
  'SBQ: Reliability & Cross-Referencing (AO1/AO3)': 'Reliability & Cross-Referencing (AO1/AO3)',
  'SBQ: Evaluation of Utility (AO1/AO3)': 'Utility (AO1/AO3)',
  'SBQ: Target Purpose Analysis (AO1/AO3)': 'Purpose Analysis (AO1/AO3)',
  'SEQ: High-Scoring Essay Factor Prioritization (AO1/AO2)': 'Essay — 2 of 3, 10 marks each',
  // ── Legacy skill keys (retained so older practice rows still render) ──
  'SBQ: Inference / Message (AO2)': 'Inference / Message (AO1/AO2)',
  'SBQ: Comparison & Contrast (AO2)': 'Comparison & Contrast (AO1/AO2)',
  'SBQ: Purpose / Motive Evolution (AO2)': 'Purpose / Motive (AO1/AO2)',
  'SBQ: Utility & Reliability Limits (AO2)': 'Utility & Reliability (AO1/AO2)',
  'SBQ: Synthesis Matrix Assertion (AO2)': 'Assertion / Different Perspective (10 marks)',
  'SRQ: Structured Response Questions (AO1)': 'SRQ — Q6 (7 marks) + Q7 (8 marks)',
  'SBQ: Inference / Message (AO3)': 'Inference / Message (AO1/AO3)',
  'SBQ: Comparison & Contrast (AO3)': 'Comparison & Contrast (AO1/AO3)',
  'SBQ: Reliability & Cross-Referencing (AO3)': 'Reliability & Cross-Referencing (AO1/AO3)',
  'SBQ: Evaluation of Utility (AO3)': 'Utility (AO1/AO3)',
  'SBQ: Target Purpose Analysis (AO3)': 'Purpose Analysis (AO1/AO3)',
  // Legacy Social Studies SEQ label (SS papers have no SEQ section).
  'SEQ: Structured Essay Questions (AO1)': 'Essay (legacy)',
};

/** ── Known syllabus topics — anything outside this list is treated as custom ── */
export const KNOWN_TOPICS: string[] = [
  'Any Topic (Random Mix)',
  ...Object.values(SYLLABUS_MAP).flatMap((s) => s.topics),
];

/** ── Topic-to-summary mapping ── */
export const TOPIC_SUMMARIES: Record<string, string> = {
  // Social Studies — Issues
  'Issue 1: Exploring Citizenship and Governance': 'Citizenship & governance',
  'Issue 2: Living in a Diverse Society': 'Multiculturalism & diversity',
  'Issue 3: Being Part of a Globalised World': 'Globalisation & cross-border issues',
  // Social Studies — guiding questions (sub-topics)
  'Issue 1 · GQ1: What does citizenship mean to me?': 'Citizenship: meaning & attributes',
  'Issue 1 · GQ2: What are the functions and roles of government in working for the good of society?': 'Functions & roles of government',
  'Issue 1 · GQ3: How do we decide what is good for society?': 'Deciding what is good for society',
  'Issue 1 · GQ4: How can we work together for the good of society?': 'Citizens & government working together',
  'Issue 2 · GQ1: What are the factors that shape the identities of people and contribute to a diverse society?': 'Factors shaping identity',
  'Issue 2 · GQ2: What are the experiences and effects of living in a diverse society?': 'Experiences of diversity',
  'Issue 2 · GQ3: How can we respond to diversity in society?': 'Responding to diversity',
  'Issue 3 · GQ1: What are the factors that contribute to globalisation?': 'Driving forces of globalisation',
  'Issue 3 · GQ2: How can we respond to the economic impacts of globalisation?': 'Economic impacts of globalisation',
  'Issue 3 · GQ3: How can we respond to the cultural impacts of globalisation?': 'Cultural impacts of globalisation',
  'Issue 3 · GQ4: How can we respond to the security impacts of globalisation?': 'Security impacts of globalisation',
  // Elective + Pure History — units
  'Paris Peace Conference & its impact on Europe in the 1920s': 'Paris Peace Conference & the 1920s',
  'Case Study: Nazi Germany (*SBCS)': 'Nazi Germany regime analysis',
  'Case Study: Militarist Japan, 1920s–1930s': 'Militarist Japan expansion',
  'Outbreak of WWII in Europe (*SBCS)': 'WWII European theatre origins',
  'Outbreak of WWII in the Asia-Pacific': 'WWII Asia-Pacific origins',
  'Reasons for the end of WWII': 'End of WWII',
  'Cold War: Origins and development in Europe (*SBCS)': 'Cold War ideological divide',
  'Cold War: Korean War, 1950–1953 (*SBCS)': 'Korean War case study',
  'Cold War: Vietnam War, 1954–1975': 'Vietnam War case study',
  'End of the Cold War: Decline of the USSR and the end of the Cold War': 'Decline of the USSR',
  // Pure History — Southeast Asian case studies
  'British Malaya, 1870s–1920s: Extension of European control (Compulsory *SBCS)': 'British Malaya under European control',
  'Dutch Indonesia, 1870s–1920s: Extension of European control': 'Dutch Indonesia under European control',
  'French Vietnam, 1870s–1920s: Extension of European control': 'French Vietnam under European control',
  'Decolonisation: British Malaya, 1945–1957 (Compulsory *SBCS)': 'British Malaya decolonisation',
  'Decolonisation: Dutch Indonesia, 1945–1949': 'Dutch Indonesia decolonisation',
  'Decolonisation: French Vietnam, 1945–1954': 'French Vietnam decolonisation',
  // Pure History — per-paper mixed practice
  'Any Topic — Pure History Paper 1 (1870s–1942)': 'Pure History Paper 1 — mixed practice',
  'Any Topic — Pure History Paper 2 (1945–1991)': 'Pure History Paper 2 — mixed practice',
  // ── Legacy topic keys (retained so older practice rows still render) ──
  'WWI: Impact of the Paris Peace Conference in the 1920s': 'Paris Peace Conference & the 1920s',
  'WWII: Outbreak in Europe (*SBCS)': 'WWII European theatre origins',
  'WWII: Outbreak in the Asia-Pacific': 'WWII Asia-Pacific origins',
  'WWII: Reasons for the end of the war': 'End of WWII',
  'Cold War: Origins in Europe (*SBCS)': 'Cold War ideological divide',
  'SEA: Political systems before the arrival of the Europeans': 'Southeast Asia before 1870',
  'SEA: European interest in Southeast Asia': 'European interest in Southeast Asia',
  'SEA: Extension of European control, 1870s–1942': 'Extension of European control',
  'SEA: How locals responded, challenged and managed European control': 'Responses to European control',
  'Decolonisation: Establishment of newly independent nations in Southeast Asia': 'Decolonisation of Southeast Asia',
  // Legacy Social Studies sub-topics
  'Issue 1: What does citizenship mean to me? (attributes of citizenship)': 'Citizenship: meaning & attributes',
  'Issue 1: Functions and roles of government in working for the good of society': 'Functions & roles of government',
  'Issue 1: How do we decide what is good for society? (trade-offs & principles of governance)': 'Deciding what is good for society',
  'Issue 1: How can we work together for the good of society?': 'Citizens & government working together',
  'Issue 2: Factors that shape identities in a diverse society': 'Factors shaping identity',
  'Issue 2: Experiences and effects of living in a diverse society': 'Experiences of diversity',
  'Issue 2: Responding to socio-cultural diversity': 'Responding to diversity',
  'Issue 2: Responding to socio-economic diversity': 'Responding to diversity',
  'Issue 3: Driving forces of globalisation': 'Driving forces of globalisation',
  'Issue 3: Responding to the economic impacts of globalisation': 'Economic impacts of globalisation',
  'Issue 3: Responding to the cultural impacts of globalisation': 'Cultural impacts of globalisation',
  'Issue 3: Responding to the security impacts of globalisation': 'Security impacts of globalisation',
};

/** ── Sub-topic keyword patterns — for detecting more specific labels from background_context ── */
export interface SubTopicPattern {
  keywords: string[];
  label: string;
}

export const SUBTOPIC_PATTERNS: SubTopicPattern[] = [
  { keywords: ['citizen', 'rights', 'responsibilities', 'participation', 'democracy', 'vote', 'election'], label: 'Citizen participation' },
  { keywords: ['government', 'governance', 'state', 'institution', 'policy', 'parliament', 'constitution'], label: 'Government institutions' },
  { keywords: ['diversity', 'multicultural', 'racial', 'ethnic', 'harmony', 'integration', 'cohesion'], label: 'Racial & ethnic harmony' },
  { keywords: ['immigration', 'migrant', 'foreign', 'new citizen', 'naturalisation'], label: 'Immigration & integration' },
  { keywords: ['religion', 'religious', 'belief', 'faith', 'multi-religious'], label: 'Religious diversity' },
  { keywords: ['globalisation', 'globalization', 'global', 'international', 'trade', 'interdependence'], label: 'Global interdependence' },
  { keywords: ['environment', 'climate', 'sustainable', 'pollution', 'conservation', 'green'], label: 'Environmental challenges' },
  { keywords: ['technology', 'digital', 'innovation', 'internet', 'social media'], label: 'Technology & digital age' },
  { keywords: ['hitler', 'nazi rise', 'mein kampf', 'reichstag', 'nazi party', 'national socialist'], label: 'Rise of Nazism' },
  { keywords: ['nazi control', 'propaganda', 'gestapo', 'opposition', 'conformity', 'indoctrination'], label: 'Control & opposition' },
  { keywords: ['nazi policy', 'economic', 'recovery', 'unemployment', 'autobahn', 'rearmament'], label: 'Nazi economic policies' },
  { keywords: ['nazi social', 'women', 'youth', 'hitler youth', 'education', 'family'], label: 'Nazi social policies' },
  { keywords: ['holocaust', 'jewish', 'persecution', 'genocide', 'final solution', 'concentration camp', 'auschwitz'], label: 'The Holocaust' },
  { keywords: ['wwii', 'world war two', 'blitzkrieg', 'invasion', 'soviet', 'allied', 'axis'], label: 'WWII & Nazi expansion' },
  { keywords: ['meiji', 'militarism', 'imperial', 'expansion', 'modernisation', 'industrialisation'], label: 'Rise of Japanese militarism' },
  { keywords: ['china', 'manchuria', 'nanking', 'pacific war', 'southeast asia', 'co-prosperity'], label: 'Japanese expansion in Asia' },
  { keywords: ['cold war', 'nuclear', 'arms race', 'containment', 'deterrence', 'mutual destruction'], label: 'Nuclear tensions & arms race' },
  { keywords: ['berlin', 'berlin wall', 'berlin blockade', 'cuban missile', 'korean war', 'vietnam war'], label: 'Key Cold War conflicts' },
  { keywords: ['appeasement', 'league of nations', 'treaty of versailles', 'munich', 'causes of wwii'], label: 'Causes of WWII' },
  { keywords: ['d-day', 'stalingrad', 'battle of britain', 'midway', 'el alamein', 'turning point'], label: 'Key turning points' },
  { keywords: ['identity', 'national identity', 'singapore', 'nation building', 'loyalty', 'belonging'], label: 'National identity & nation building' },
  { keywords: ['socio-economic', 'inequality', 'poverty', 'class', 'social mobility', 'income gap'], label: 'Socio-economic inequality' },
  { keywords: ['healthcare', 'housing', 'education policy', 'public service', 'welfare'], label: 'Public policy & welfare' },
  { keywords: ['malaya', 'british malaya', 'federation', 'malayan union', 'merdeka', 'umno'], label: 'British Malaya' },
  { keywords: ['indonesia', 'dutch indonesia', 'sukarno', 'pki', 'java'], label: 'Dutch Indonesia' },
  { keywords: ['vietnam', 'french indochina', 'viet minh', 'dien bien phu', 'ho chi minh'], label: 'French Vietnam' },
];

/**
 * Detect a specific sub-topic from background_context by keyword scoring.
 * Returns the best-matched label, or null if no pattern matched.
 */
export function detectSubTopic(ctx: string): string | null {
  const lower = ctx.toLowerCase();
  const matched: { label: string; score: number }[] = [];
  for (const pattern of SUBTOPIC_PATTERNS) {
    let score = 0;
    for (const kw of pattern.keywords) {
      if (lower.includes(kw.toLowerCase())) score++;
    }
    if (score > 0) matched.push({ label: pattern.label, score });
  }
  if (matched.length === 0) return null;
  // Best match: highest score, then shortest label
  matched.sort((a, b) => b.score - a.score || a.label.length - b.label.length);
  return matched[0].label;
}

/**
 * If the topic isn't a known syllabus topic, generate a summary from context.
 */
export function isCustomTopic(topic: string): boolean {
  return !KNOWN_TOPICS.includes(topic);
}
