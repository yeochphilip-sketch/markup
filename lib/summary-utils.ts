/**
 * Shared summary utilities for generating concise practice log summaries.
 * Used by both the dashboard (primary, stored in metadata) and the
 * ConfiguratorSidebar (fallback for old rows without stored summaries).
 */

/** ── Clean skill labels ── */
export const SKILL_LABELS: Record<string, string> = {
  'SBQ: Inference / Message (AO2)': 'Inference (AO2)',
  'SBQ: Comparison & Contrast (AO2)': 'Comparison (AO2)',
  'SBQ: Purpose / Motive Evolution (AO2)': 'Purpose / Motive (AO2)',
  'SBQ: Utility & Reliability Limits (AO2)': 'Utility & Reliability (AO2)',
  'SBQ: Synthesis Matrix Assertion (AO2)': 'Assertion (AO2)',
  'SRQ: Structured Response Questions (AO1)': 'SRQ Response (AO1)',
  'SBQ: Inference / Message (AO3)': 'Inference (AO3)',
  'SBQ: Comparison & Contrast (AO3)': 'Comparison (AO3)',
  'SBQ: Reliability & Cross-Referencing (AO3)': 'Cross-Referencing (AO3)',
  'SBQ: Evaluation of Utility (AO3)': 'Eval. Utility (AO3)',
  'SBQ: Target Purpose Analysis (AO3)': 'Purpose Analysis (AO3)',
  'SEQ: Structured Essay Questions (AO1)': 'SEQ Essay (AO1)',
  'SEQ: High-Scoring Essay Factor Prioritization (AO1/AO2)': 'Essay Factors (AO1/AO2)',
};

/** ── Known syllabus topics — anything outside this list is treated as custom ── */
export const KNOWN_TOPICS: string[] = [
  'Issue 1: Exploring Citizenship and Governance',
  'Issue 2: Living in a Diverse Society',
  'Issue 3: Responding to a Globalised World',
  'Case Study: Nazi Germany (*SBCS)',
  'Case Study: Militarist Japan',
  'WWII: Outbreak in Europe (*SBCS)',
  'Cold War: Origins in Europe (*SBCS)',
  'Any Topic (Random Mix)',
];

/** ── Topic-to-summary mapping ── */
export const TOPIC_SUMMARIES: Record<string, string> = {
  'Issue 1: Exploring Citizenship and Governance': 'Citizenship & governance',
  'Issue 2: Living in a Diverse Society': 'Multiculturalism & diversity',
  'Issue 3: Responding to a Globalised World': 'Globalisation & cross-border issues',
  'Case Study: Nazi Germany (*SBCS)': 'Nazi Germany regime analysis',
  'Case Study: Militarist Japan': 'Militarist Japan expansion',
  'WWII: Outbreak in Europe (*SBCS)': 'WWII European theatre origins',
  'Cold War: Origins in Europe (*SBCS)': 'Cold War ideological divide',
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
