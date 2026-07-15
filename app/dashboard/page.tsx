'use client';

// 🚀 Forces Vercel to serve this page fresh on every single load, picking up active tokens
export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/utils/supabase';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import FeedbackModal from '@/app/components/FeedbackModal';
import NotificationBell from '@/app/components/NotificationBell';
import StudyGroupPanel from '@/app/components/StudyGroupPanel';
import ShareResultCard from '@/app/components/ShareResultCard';
import ExamCountdown from '@/app/components/ExamCountdown';
import ConfettiEffect from '@/app/components/ConfettiEffect';
import OnboardingWizard from '@/app/components/OnboardingWizard';
import { getLevelConfig, getLevelTitle, getNextLevelXp, getPrevLevelXp, LEVEL_THRESHOLDS, playGradeCompleteSound, playLevelUpSound, playAchievementSound, isDailyGoalMet, ACHIEVEMENT_DEFS, calculateXpDecay, getDecayWarning } from '@/lib/gamification';

interface Segment {
  text: string;
  type: 'correct' | 'weak' | 'error';
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
}

const SYLLABUS_MAP: Record<string, { topics: string[]; skills: string[] }> = {
  'Social Studies': {
    topics: [
      'Any Topic (Random Mix)',
      'Issue 1: Exploring Citizenship and Governance',
      'Issue 2: Living in a Diverse Society',
      'Issue 3: Responding to a Globalised World'
    ],
    skills: [
      'All Formats (SBCS + SEQ + SRQ Bundle)',
      'SBQ: Inference / Message (AO2)',
      'SBQ: Comparison & Contrast (AO2)',
      'SBQ: Purpose / Motive Evolution (AO2)',
      'SBQ: Utility & Reliability Limits (AO2)',
      'SBQ: Synthesis Matrix Assertion (AO2)',
      'SRQ/SEQ: Structured Essay Explanations (AO1)'
    ]
  },
  'Elective History': {
    topics: [
      'Any Topic (Random Mix)',
      'Case Study: Nazi Germany (*SBCS)',
      'Case Study: Militarist Japan',
      'WWII: Outbreak in Europe (*SBCS)',
      'Cold War: Origins in Europe (*SBCS)'
    ],
    skills: [
      'All Formats (SBCS + SEQ + SRQ Bundle)',
      'SBQ: Inference / Message (AO3)',
      'SBQ: Comparison & Contrast (AO3)',
      'SBQ: Reliability & Cross-Referencing (AO3)',
      'SBQ: Evaluation of Utility (AO3)',
      'SBQ: Target Purpose Analysis (AO3)',
      'SEQ: High-Scoring Essay Factor Prioritization (AO1/AO2)'
    ]
  }
};

export default function DashboardPage() {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const historyScrollRef = useRef<HTMLDivElement>(null);
  
  const [activeSubject, setActiveSubject] = useState('Social Studies');
  const [selectedTopic, setSelectedTopic] = useState('Any Topic (Random Mix)');
  const [selectedSkill, setSelectedSkill] = useState('All Formats (SBCS + SEQ + SRQ Bundle)');
  
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  
  // O-Level canvas states
  const [sbcsAnswer, setSbcsAnswer] = useState('');
  const [seqAnswer, setSeqAnswer] = useState('');
  const [srqAnswer, setSrqAnswer] = useState('');

  const [userAvatar, setUserAvatar] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentChallengeId, setCurrentChallengeId] = useState<string | null>(null);
  const [isExemplarOpen, setIsExemplarOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const [selectedType, setSelectedType] = useState('General');
  const [textInput, setTextInput] = useState('');
  const [historyPage, setHistoryPage] = useState(0);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const isLoadingMoreRef = useRef(false);
  const HISTORY_PAGE_SIZE = 50;
  const [masteryPoints, setMasteryPoints] = useState(0);
  const [levelTitle, setLevelTitle] = useState('Novice');
  const [xpProgress, setXpProgress] = useState({ current: 0, nextLevel: 500 });
  const [streakData, setStreakData] = useState({ current: 0, longest: 0 });
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpInfo, setLevelUpInfo] = useState({ from: '', to: '' });
  const [leaderboardData, setLeaderboardData] = useState<any>(null);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(false);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [newlyUnlocked, setNewlyUnlocked] = useState<any[]>([]);
  const [showAchievementUnlocked, setShowAchievementUnlocked] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [dailyGoalMet, setDailyGoalMet] = useState(false);
  const [dailyGoalBonus, setDailyGoalBonus] = useState(0);
  const [showDailyGoalToast, setShowDailyGoalToast] = useState(false);
  const [streakBonus, setStreakBonus] = useState(0);
  const [xpDecayed, setXpDecayed] = useState(0);
  const [decayWarning, setDecayWarning] = useState({ show: false, message: '', severity: 'warning' as 'warning' | 'danger' });
  const [isStudyGroupOpen, setIsStudyGroupOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [ssGoalLevel, setSsGoalLevel] = useState<string | null>(null);
  const [historyGoalLevel, setHistoryGoalLevel] = useState<string | null>(null);
  const [takesHistory, setTakesHistory] = useState(false);
  const [errorToast, setErrorToast] = useState<{ message: string; type: 'error' | 'warning' } | null>(null);
  const errorToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const errorToastStartRef = useRef(0);
  const errorToastRemainingRef = useRef(5000);
  const dailyGoalToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dailyGoalToastStartRef = useRef(0);
  const dailyGoalToastRemainingRef = useRef(5000);
  const levelUpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const levelUpStartRef = useRef(0);
  const levelUpRemainingRef = useRef(8000);
  const exemplarTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exemplarStartRef = useRef(0);
  const exemplarRemainingRef = useRef(8000);
  const achievementsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const achievementsStartRef = useRef(0);
  const achievementsRemainingRef = useRef(8000);
  const leaderboardTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaderboardStartRef = useRef(0);
  const leaderboardRemainingRef = useRef(8000);
  const [hoveredNotif, setHoveredNotif] = useState<string | null>(null);

  // ── Pause / resume helpers ──
  const pauseTimer = useCallback((timerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>, startRef: React.MutableRefObject<number>, remainingRef: React.MutableRefObject<number>) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      const elapsed = Date.now() - startRef.current;
      remainingRef.current = Math.max(0, remainingRef.current - elapsed);
    }
  }, []);

  const resumeTimer = useCallback((timerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>, startRef: React.MutableRefObject<number>, remainingRef: React.MutableRefObject<number>, cb: () => void) => {
    if (!timerRef.current && remainingRef.current > 0) {
      startRef.current = Date.now();
      timerRef.current = setTimeout(cb, remainingRef.current);
    }
  }, []);

  const dismissErrorToast = useCallback(() => {
    if (errorToastTimerRef.current) clearTimeout(errorToastTimerRef.current);
    setErrorToast(null);
  }, []);

  const showErrorToast = useCallback((message: string, type: 'error' | 'warning' = 'error') => {
    if (errorToastTimerRef.current) clearTimeout(errorToastTimerRef.current);
    errorToastRemainingRef.current = 5000;
    errorToastStartRef.current = Date.now();
    setErrorToast({ message, type });
    errorToastTimerRef.current = setTimeout(() => setErrorToast(null), 5000);
  }, []);

  const reportError = useCallback((message: string) => {
    dismissErrorToast();
    setSelectedType('Bug');
    setTextInput(`Error encountered:\n${message}\n\n---\nPlease describe what you were doing when this happened:`);
    setIsFeedbackOpen(true);
  }, [dismissErrorToast]);

  const [timeLeft, setTimeLeft] = useState(1200); 
  const [isTimerActive, setIsTimerActive] = useState(false);
  
  const [skillRatings, setSkillRatings] = useState({
    inference: 1,
    comparison: 1,
    reliability: 1,
    essay: 1,
    conclusion: 0
  });

  const [challenge, setChallenge] = useState({
    backgroundContext: 'Click Generate Practice to load Singapore standard materials.',
    sourceAProvenance: 'Source A sample provenance information context.',
    sourceA: 'Source A contents appear here once generated.',
    sourceBProvenance: 'Source B sample provenance information context.',
    sourceB: 'Source B contents appear here once generated.',
    questionPrompt: 'No question active. Use the configurator panel on the left to start.',
    sbcsPrompt: 'SBCS evaluation task criteria will render here.',
    seqPrompt: 'SEQ structural essay prompt query will render here.',
    srqPrompt: 'SRQ contextual evaluation prompt query will render here.',
    suggestedAnswer: ''
  });

  const [evaluation, setEvaluation] = useState({
    scoreEstimate: '',
    critique: [] as string[],
    segments: [] as Segment[],
    confidence: 0 as number,
    a1Upgrade: '' as string
  });

  useEffect(() => {
    let interval: any = null;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getSkillColorClass = (val: number) => {
    return val >= 3 ? 'text-emerald-400' : 'text-rose-500';
  };

  const dismissDailyGoalToast = useCallback(() => {
    if (dailyGoalToastTimerRef.current) clearTimeout(dailyGoalToastTimerRef.current);
    setShowDailyGoalToast(false);
  }, []);

  const dismissBanner = useCallback(() => setShowAchievementUnlocked(false), []);

  // ── Close settings dropdown on outside click ──
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsSettingsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  });

  // ── Auto-dismiss daily goal toast after 5s (with pause/resume) ──
  useEffect(() => {
    if (showDailyGoalToast && hoveredNotif !== 'daily') {
      if (dailyGoalToastTimerRef.current) clearTimeout(dailyGoalToastTimerRef.current);
      dailyGoalToastRemainingRef.current = 5000;
      dailyGoalToastStartRef.current = Date.now();
      dailyGoalToastTimerRef.current = setTimeout(() => setShowDailyGoalToast(false), 5000);
    }
    return () => {
      if (dailyGoalToastTimerRef.current) clearTimeout(dailyGoalToastTimerRef.current);
    };
  }, [showDailyGoalToast, hoveredNotif]);

  // ── Auto-dismiss level-up modal after 8s (with pause/resume) ──
  useEffect(() => {
    if (showLevelUp && hoveredNotif !== 'levelup') {
      if (levelUpTimerRef.current) clearTimeout(levelUpTimerRef.current);
      levelUpRemainingRef.current = 8000;
      levelUpStartRef.current = Date.now();
      levelUpTimerRef.current = setTimeout(() => setShowLevelUp(false), 8000);
    }
    return () => {
      if (levelUpTimerRef.current) clearTimeout(levelUpTimerRef.current);
    };
  }, [showLevelUp, hoveredNotif]);

  // ── Auto-dismiss model answer drawer after 8s (with pause/resume) ──
  useEffect(() => {
    if (isExemplarOpen && hoveredNotif !== 'exemplar') {
      if (exemplarTimerRef.current) clearTimeout(exemplarTimerRef.current);
      exemplarRemainingRef.current = 8000;
      exemplarStartRef.current = Date.now();
      exemplarTimerRef.current = setTimeout(() => setIsExemplarOpen(false), 8000);
    }
    return () => {
      if (exemplarTimerRef.current) clearTimeout(exemplarTimerRef.current);
    };
  }, [isExemplarOpen, hoveredNotif]);

  // ── Auto-dismiss achievements drawer after 8s (with pause/resume) ──
  useEffect(() => {
    if (isAchievementsOpen && hoveredNotif !== 'achievements') {
      if (achievementsTimerRef.current) clearTimeout(achievementsTimerRef.current);
      achievementsRemainingRef.current = 8000;
      achievementsStartRef.current = Date.now();
      achievementsTimerRef.current = setTimeout(() => setIsAchievementsOpen(false), 8000);
    }
    return () => {
      if (achievementsTimerRef.current) clearTimeout(achievementsTimerRef.current);
    };
  }, [isAchievementsOpen, hoveredNotif]);

  // ── Auto-dismiss leaderboard drawer after 8s (with pause/resume) ──
  useEffect(() => {
    if (isLeaderboardOpen && hoveredNotif !== 'leaderboard') {
      if (leaderboardTimerRef.current) clearTimeout(leaderboardTimerRef.current);
      leaderboardRemainingRef.current = 8000;
      leaderboardStartRef.current = Date.now();
      leaderboardTimerRef.current = setTimeout(() => setIsLeaderboardOpen(false), 8000);
    }
    return () => {
      if (leaderboardTimerRef.current) clearTimeout(leaderboardTimerRef.current);
    };
  }, [isLeaderboardOpen, hoveredNotif]);

  const fetchLeaderboard = async () => {
    if (!userId) return;
    setIsLeaderboardLoading(true);
    setIsLeaderboardOpen(true);
    try {
      const res = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        const data = await res.json();
        setLeaderboardData(data);
      } else {
        const errData = await res.json().catch(() => ({ error: 'Leaderboard API returned ' + res.status }));
        showErrorToast(errData.error || 'Failed to load leaderboard');
      }
    } catch (err) {
      console.warn('Leaderboard fetch failed:', err);
      showErrorToast('Could not connect to leaderboard. Check your connection.');
    } finally {
      setIsLeaderboardLoading(false);
    }
  };

  useEffect(() => {
    const config = SYLLABUS_MAP[activeSubject];
    if (config) {
      setSelectedTopic(config.topics[0]);
      setSelectedSkill(config.skills[0]);
    }
    setEvaluation({ scoreEstimate: '', critique: [], segments: [], confidence: 0, a1Upgrade: '' });
  }, [activeSubject]);

  const loadHistoryLogs = async (uid?: string | null, page = 0, append = false) => {
    try {
      const targetUid = uid || userId;
      if (!targetUid) return;
      const from = page * HISTORY_PAGE_SIZE;
      const to = from + HISTORY_PAGE_SIZE - 1;
      const { data: historyData, error } = await supabase
        .from('practice_history')
        .select('*')
        .eq('user_id', targetUid)
        .order('created_at', { ascending: false })
        .range(from, to);
      if (historyData && !error) {
        if (append) {
          setHistory(prev => [...prev, ...historyData]);
        } else {
          setHistory(historyData);
        }
        setHasMoreHistory(historyData.length >= HISTORY_PAGE_SIZE);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const loadMoreHistory = async () => {
    if (isLoadingMoreRef.current || !hasMoreHistory || !userId) return;
    isLoadingMoreRef.current = true;
    setIsLoadingMore(true);
    const nextPage = historyPage + 1;
    setHistoryPage(nextPage);
    await loadHistoryLogs(userId, nextPage, true);
    isLoadingMoreRef.current = false;
    setIsLoadingMore(false);
  };

  const loadUserMetrics = async (uid: string) => {
    try {
      const { data: metricsData } = await supabase
        .from('user_skill_metrics')
        .select('*')
        .eq('user_id', uid)
        .single();        if (metricsData) {
        setSkillRatings({
          inference: metricsData.sbq_inference_score || 1,
          comparison: metricsData.sbq_comparison_score || 1,
          reliability: metricsData.sbq_reliability_score || 1,
          essay: metricsData.seq_essay_score || 1,
          conclusion: metricsData.seq_conclusion_score !== undefined ? metricsData.seq_conclusion_score : 0
        });
        // Gamification state
        const xp = metricsData.total_xp ?? 0;
        setMasteryPoints(xp);
        setLevelTitle(metricsData.level_title ?? 'Novice');
        setStreakData({
          current: metricsData.current_streak ?? 0,
          longest: metricsData.longest_streak ?? 0,
        });
        setAchievements(metricsData.achievements ?? []);
        setDailyGoalMet(isDailyGoalMet(metricsData.last_practice_date));
        setDecayWarning(getDecayWarning(metricsData.last_practice_date, xp));
        setSsGoalLevel(metricsData.ss_goal_level ?? null);
        setHistoryGoalLevel(metricsData.history_goal_level ?? null);
        setTakesHistory(metricsData.takes_history ?? false);
        // Calculate XP progress to next level
        const nextLevelXp = getNextLevelXp(xp);
        const prevLevelXp = getPrevLevelXp(xp);
        setXpProgress({ current: xp - prevLevelXp, nextLevel: nextLevelXp - prevLevelXp });
      }
    } catch (err) {
      console.warn("Metrics defaulted.");
    }
  };

  useEffect(() => {
    async function forceRetrieveSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          handleUserSession(session.user);
          return;
        }

        const localStorageKey = Object.keys(localStorage).find(key => key.startsWith('sb-') && key.endsWith('-auth-token'));
        if (localStorageKey) {
          const rawData = localStorage.getItem(localStorageKey);
          if (rawData) {
            const parsed = JSON.parse(rawData);
            if (parsed?.user) {
              handleUserSession(parsed.user);
              return;
            }
          }
        }
      } catch (err) {
        console.warn("Session retrieval fallback failed:", err);
      } finally {
        setIsAuthLoading(false);
      }
    }

    function handleUserSession(user: any) {
      setUserId(user.id);
      const rawEmail = user.email || user.user_metadata?.email || '';
      setUserEmail(rawEmail.toLowerCase().trim());
      setUserAvatar(user.user_metadata?.avatar_url || '');
      loadUserMetrics(user.id);
      loadHistoryLogs(user.id, 0, false);
      setIsAuthLoading(false);
    }

    forceRetrieveSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        handleUserSession(session.user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleGenerateChallenge = async () => {
    setIsGenerating(true);
    setHasScanned(false);
    setIsExemplarOpen(false);
    setEvaluation({ scoreEstimate: '', critique: [], segments: [], confidence: 0, a1Upgrade: '' });
    
    try {
      const res = await fetch('/api/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          subject: activeSubject, 
          topic: selectedTopic, 
          questionType: selectedSkill 
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'API returned ' + res.status }));
        throw new Error(errData.error || 'Generation failed (API ' + res.status + ')');
      }
      const data = await res.json();
      
      setChallenge({
        backgroundContext: data.backgroundContext || '',
        sourceAProvenance: data.sourceAProvenance || '',
        sourceA: data.sourceA || '',
        sourceBProvenance: data.sourceBProvenance || '',
        sourceB: data.sourceB || '',
        questionPrompt: data.questionPrompt || `${activeSubject} Comprehensive Suite`,
        sbcsPrompt: data.sbcsPrompt || 'How far does Source A support the claim? Explain your answer.',
        seqPrompt: data.seqPrompt || 'Explain the impact of the policy decisions on the local population.',
        srqPrompt: data.srqPrompt || 'In your opinion, is institutional intervention or local management more vital?',
        suggestedAnswer: data.suggestedAnswer || ''
      });

      if (userId) {
        const { data: savedRecord } = await supabase
          .from('practice_history')
          .insert([{
            user_id: userId,
            subject: activeSubject,
            topic: selectedTopic,
            question_type: selectedSkill,
            question_prompt: data.questionPrompt || 'Comprehensive Sheet Bundle',
            background_context: data.backgroundContext,
            source_a: data.sourceA,
            source_a_provenance: data.sourceAProvenance,
            source_b: data.sourceB,
            source_b_provenance: data.sourceBProvenance,
            suggested_answer: data.suggestedAnswer
          }])
          .select()
          .single();

        if (savedRecord) setCurrentChallengeId(savedRecord.id);
        // Reset history pagination and reload from start
        setHistoryPage(0);
        setHasMoreHistory(true);
        loadHistoryLogs(userId, 0, false);
      }
    } catch (err) {
      console.error(err);
      showErrorToast(
        err instanceof Error ? err.message : 'Generation failed. Check your API key and try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleScanStructure = async () => {
    if (!sbcsAnswer.trim() && !seqAnswer.trim() && !srqAnswer.trim()) return;
    setIsGrading(true);
    // Reset ephemeral gamification states
    setStreakBonus(0);
    try {
      const activePrompt = isCustomMode ? customPrompt : challenge.questionPrompt;
      const res = await fetch('/api/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sbcsAnswer,
          seqAnswer,
          srqAnswer,
          questionPrompt: activePrompt,
          questionType: selectedSkill,
          subject: activeSubject,
          topic: selectedTopic,
          userId,
          questionId: currentChallengeId,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Grading API returned ' + res.status }));
        throw new Error(errData.error || 'Grading failed (API ' + res.status + ')');
      }
      const data = await res.json();
      
      setEvaluation({
        scoreEstimate: data.scoreEstimate || 'L3/6 Bundle Matrix',
        critique: data.critique || [],
        segments: data.highlightedSegments || [{ text: [sbcsAnswer, seqAnswer, srqAnswer].filter(Boolean).join('\n'), type: 'correct' }],
        confidence: data.confidence ?? 0,
        a1Upgrade: data.a1Upgrade || ''
      });

      if (userId) {
        // Gamification: apply XP earned from the grade response
        // Note: essay_evaluations insert is handled server-side in /api/grade
        const xpEarned = data.gamification?.xpEarned ?? 0;
        let totalXpGained = xpEarned;

        // Daily goal bonus
        const bonus = data._dailyGoalBonus ?? 0;
        if (bonus > 0) {
          totalXpGained += bonus;
          setDailyGoalBonus(bonus);
          setDailyGoalMet(true);
          if (!showDailyGoalToast) setShowDailyGoalToast(true);
        }

        // Streak bonus
        const streakBonusVal = data._streakBonus?.bonus ?? 0;
        if (streakBonusVal > 0) {
          totalXpGained += streakBonusVal;
          setStreakBonus(streakBonusVal);
        }

        // XP decay — server already deducted this from total XP
        // We just display it and adjust totalXpGained to match server calculation
        const decayed = data._xpDecayed ?? 0;
        if (decayed > 0) {
          setXpDecayed(decayed);
          totalXpGained -= decayed;
        }

        // Always update XP (even when decay makes it negative — server already calculated the correct value)
        const prevXp = masteryPoints;
        const newXp = Math.max(0, prevXp + totalXpGained);
        const prevTitle = levelTitle;
        const newTitle = getLevelTitle(newXp);

        setMasteryPoints(newXp);
        setLevelTitle(newTitle);

        // XP progress to next level
        const nextLevelXp = getNextLevelXp(newXp);
        const prevLevelXp = getPrevLevelXp(newXp);
        setXpProgress({ current: newXp - prevLevelXp, nextLevel: nextLevelXp - prevLevelXp });

        // Level-up detection (only when XP actually increased)
        if (totalXpGained > 0 && prevTitle !== newTitle) {
          setLevelUpInfo({ from: prevTitle, to: newTitle });
          setShowLevelUp(true);
          setShowConfetti(true);
          if (isSoundEnabled) playLevelUpSound();
          setTimeout(() => setShowConfetti(false), 4000);
        }

        // Achievement unlocks
        const newAchs = data._newAchievements;
        if (newAchs && newAchs.length > 0) {
          setNewlyUnlocked(newAchs);
          setShowAchievementUnlocked(true);
          setAchievements(prev => [...prev, ...newAchs.map((a: any) => a.id)]);
          if (isSoundEnabled) playAchievementSound();
        }

        // Play grade complete sound
        if (isSoundEnabled) playGradeCompleteSound();

        // Update streak
        setStreakData(prev => ({ ...prev, current: prev.current + 1 }));
      }

      setHasScanned(true);      } catch (err) {
        console.error(err);
        showErrorToast(
          err instanceof Error ? err.message : 'Grading failed. Please try again.'
        );
        setHasScanned(false);
      } finally {
        setIsGrading(false);
      }
  };

  const handlePasteFromClipboard = async (target: 'sbcs' | 'seq' | 'srq') => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        if (target === 'sbcs') setSbcsAnswer(text);
        if (target === 'seq') setSeqAnswer(text);
        if (target === 'srq') setSrqAnswer(text);
      }
    } catch (err) {
      console.warn("Clipboard access denied.");
    }
  };

  const handleInjectPeelFrame = (target: 'sbcs' | 'seq' | 'srq') => {
    const frame = `Point: [State your direct claim matching prompt criteria here]\nEvidence: [Quote historical data or cross-reference records here]\nExplanation: [Analyze why this validation satisfies LORMS matrices]\nLink: [Therefore, wrap cleanly back to the question statement...]`;
    if (target === 'sbcs') setSbcsAnswer(frame);
    if (target === 'seq') setSeqAnswer(frame);
    if (target === 'srq') setSrqAnswer(frame);
  };

  const handleSubmitFeedback = async () => {
    if (!textInput.trim()) return;
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          userEmail,
          feedbackType: selectedType,
          description: textInput,
        }),
      });
      
      if (res.ok) {
        setTextInput('');
        setIsFeedbackOpen(false);
        showErrorToast('Feedback submitted successfully!', 'warning');
      } else {
        const errData = await res.json().catch(() => ({ error: 'Feedback API returned ' + res.status }));
        showErrorToast(errData.error || 'Failed to submit feedback');
      }
    } catch (err) {
      console.error(err);
      showErrorToast('Could not send feedback. Check your connection.');
    }
  };

  const loadHistoricalItem = (item: HistoryItem) => {
    setCurrentChallengeId(item.id);
    setHasScanned(false);
    setIsExemplarOpen(false);
    setChallenge({
      backgroundContext: item.background_context || '',
      sourceAProvenance: item.source_a_provenance || 'Source A Context:',
      sourceA: item.source_a || '',
      sourceBProvenance: item.source_b_provenance || 'Source B Context:',
      sourceB: item.source_b,
      questionPrompt: item.question_prompt,
      sbcsPrompt: 'Historical record segment task.',
      seqPrompt: 'Historical prioritization prompt layer.',
      srqPrompt: 'Contextual recommendations query segment.',
      suggestedAnswer: item.suggested_answer || ''
    });
    setEvaluation({ scoreEstimate: '', critique: [], segments: [], confidence: 0, a1Upgrade: '' });
  };

  const handleSetExamGoal = async (subject: 'ss' | 'history', goalLevel: string) => {
    if (!userId) return;
    try {
      const res = await fetch('/api/exam-goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, subject, goalLevel }),
      });
      if (res.ok) {
        if (subject === 'ss') {
          setSsGoalLevel(goalLevel);
        } else {
          setHistoryGoalLevel(goalLevel);
        }
      } else {
        const errData = await res.json().catch(() => ({ error: 'Goal API returned ' + res.status }));
        showErrorToast(errData.error || 'Failed to save exam goal');
      }
    } catch (err) {
      console.warn('Failed to save exam goal:', err);
      showErrorToast('Could not save exam goal. Check your connection.');
    }
  };

  const handleSetTakesHistory = async (takes: boolean) => {
    if (!userId) return;
    try {
      const res = await fetch('/api/exam-goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, subject: 'history', goalLevel: takes ? 'Novice' : null }),
      });
      if (res.ok) {
        setTakesHistory(takes);
        if (!takes) setHistoryGoalLevel(null);
      } else {
        const errData = await res.json().catch(() => ({ error: 'History API returned ' + res.status }));
        showErrorToast(errData.error || 'Failed to update History setting');
      }
    } catch (err) {
      console.warn('Failed to update History setting:', err);
      showErrorToast('Could not update History setting. Check your connection.');
    }
  };

  const emailInitial = userEmail ? userEmail.charAt(0).toUpperCase() : 'S';
  const isQuestionPromptInactive = (challenge.backgroundContext ?? '').includes('Click Generate Practice');

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#07090e] text-slate-400 font-mono flex items-center justify-center text-xs">
        Verifying Security Shell Handshake...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans relative selection:bg-indigo-500/30">
      
      {/* Navigation Header */}
      <header className="border-b border-slate-900 px-6 py-4 flex items-center justify-between bg-slate-950/60 backdrop-blur-md relative z-40">          <div className="flex items-center gap-4">
            <h1 className="text-xl font-black text-indigo-500 tracking-wider">MARKUP</h1>
            <button
              onClick={() => router.push('/dashboard/profile')}
              className="hidden sm:inline-flex bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[9px] font-bold px-2.5 py-1 rounded-lg transition text-slate-400 hover:text-slate-200 items-center gap-1.5"
            >
              📊 Stats
            </button>
          </div>
        
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          {userId && <NotificationBell userId={userId} />}

          {/* Study Groups */}
          <button
            onClick={() => setIsStudyGroupOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[9px] font-bold px-2 py-1.5 rounded-lg transition text-slate-400 hover:text-slate-200"
            title="Study Groups"
          >
            👥
          </button>

          {/* Sound toggle */}
          <button
            onClick={() => setIsSoundEnabled(!isSoundEnabled)}
            className="text-[11px] text-slate-500 hover:text-slate-300 transition"
            title={isSoundEnabled ? 'Mute sounds' : 'Enable sounds'}
          >
            {isSoundEnabled ? '🔊' : '🔇'}
          </button>

          {/* Achievements button */}
          <button
            onClick={() => setIsAchievementsOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[9px] font-bold px-2 py-1.5 rounded-lg transition text-slate-400 hover:text-slate-200"
          >
            🏅 {achievements.length}/{ACHIEVEMENT_DEFS.length}
          </button>
          {(typeof window !== 'undefined' && localStorage.getItem('admin_override') === 'true') && (
            <a 
              href="/admin/analytics" 
              className="hidden sm:inline-flex bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 text-[11px] font-bold px-3 py-1.5 rounded-xl transition items-center gap-1.5"
            >
              📊 Platform Insights
            </a>
          )}
          
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="w-9 h-9 rounded-full flex items-center justify-center border border-slate-800 hover:border-indigo-500 focus:outline-none transition relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 shadow-lg"
            >
              {userAvatar ? (
                <Image src={userAvatar} alt="Profile" fill sizes="36px" className="object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-sm font-black text-white tracking-tighter">{emailInitial}</span>
              )}
            </button>

            {isSettingsOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-slate-950/95 border border-slate-900 p-4 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col space-y-3">
                <div>
                  <h3 className="text-[10px] font-black tracking-widest text-slate-500 uppercase">Account Profile</h3>
                  <p className="text-xs text-slate-200 font-semibold truncate mt-1 bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-900">{userEmail || 'Active Student'}</p>
                </div>
                <div className="pt-2 border-t border-slate-900 flex flex-col space-y-1">
                  <button onClick={() => { router.push('/dashboard/profile'); setIsSettingsOpen(false); }} className="w-full text-left text-slate-400 hover:text-indigo-400 text-xs font-bold py-2 px-1 transition">
                    📊 My Stats & Profile
                  </button>
                  <button onClick={() => { setIsFeedbackOpen(true); setIsSettingsOpen(false); }} className="w-full text-left text-slate-400 hover:text-indigo-400 text-xs font-bold py-2 px-1 transition">
                    🐛 Submit Bug / Feedback
                  </button>
                  <button onClick={async () => { await supabase.auth.signOut(); router.push('/auth'); }} className="w-full bg-red-950/30 hover:bg-red-900/50 text-red-400 border border-red-900/30 font-bold py-2 rounded-xl text-xs transition mt-2">Sign Out</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Analytics Matrix Panel */}
      <div className="px-6 pt-4 grid grid-cols-1 md:grid-cols-8 gap-4">
        <div className="md:col-span-1 bg-indigo-600/10 border border-indigo-500/20 p-4 rounded-2xl flex items-center gap-4 relative overflow-hidden group">
          <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center text-xl">🎯</div>
          <div>
            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Focus Target</h4>
            <p className="text-[11px] font-bold text-slate-300 leading-tight">Cross-reference carefully to build band ranks.</p>
          </div>
        </div>

        {/* Level Title + XP Progress */}
        <div className="md:col-span-2 bg-slate-950/80 border border-slate-900 p-4 rounded-2xl flex flex-col justify-center relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{getLevelConfig(levelTitle).icon}</span>
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{levelTitle}</span>
                <span className="text-lg font-black text-indigo-400 font-mono block">{masteryPoints} <span className="text-[10px] text-slate-600 font-normal">pts</span></span>
              </div>
            </div>
            <button
              onClick={fetchLeaderboard}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[9px] font-bold px-2 py-1.5 rounded-lg transition text-slate-400 hover:text-slate-200"
            >
              🏆 Rank
            </button>
          </div>
          {/* XP progress bar to next level */}
          {levelTitle !== 'Master' && (
            <div className="mt-2">
              <div className="flex justify-between text-[8px] text-slate-600 font-mono mb-0.5">
                <span>{getPrevLevelXp(masteryPoints)}pts</span>
                <span>{getNextLevelXp(masteryPoints)}pts</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700 ease-out"
                  style={{ width: `${Math.min((xpProgress.current / Math.max(xpProgress.nextLevel, 1)) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Daily Goal */}
        <div className={`md:col-span-1 bg-slate-950/80 border p-4 rounded-2xl flex flex-col justify-center items-center text-center transition ${
          dailyGoalMet ? 'border-emerald-500/30' : 'border-slate-900'
        }`}>
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
            {dailyGoalMet ? '✅ Done' : '📋 Goal'}
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-lg font-black font-mono ${dailyGoalMet ? 'text-emerald-400' : 'text-slate-500'}`}>
              {dailyGoalMet ? 'Complete!' : '1 paper'}
            </span>
          </div>
          <span className="text-[8px] text-slate-600 font-mono">
            {dailyGoalMet ? `+25 pts earned` : 'Scan 1 paper today'}
          </span>
        </div>

        {/* Streak Counter with bonus indicator */}
        <div className="md:col-span-1 bg-slate-950/80 border border-slate-900 p-4 rounded-2xl flex flex-col justify-center items-center text-center relative">
          {streakBonus > 0 && (
            <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full animate-in zoom-in-95">
              +{streakBonus}
            </div>
          )}
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
            {streakData.current > 0 ? '🔥 Streak' : 'Streak'}
          </span>
          <div className="flex items-baseline gap-1">
            <span className={`text-lg font-black font-mono ${streakData.current >= 3 ? 'text-amber-400' : 'text-slate-400'}`}>
              {streakData.current}
            </span>
            <span className="text-[9px] text-slate-600 font-normal">days</span>
          </div>
          {streakData.longest > 1 && (
            <span className="text-[8px] text-slate-600 font-mono">Best: {streakData.longest}</span>
          )}
        </div>

        {/* XP Decay Warning */}
        {decayWarning.show && (
          <div className={`md:col-span-2 flex items-center gap-3 p-3 rounded-2xl border ${
            decayWarning.severity === 'danger' ? 'bg-rose-500/10 border-rose-500/20' : 'bg-amber-500/10 border-amber-500/20'
          }`}>
            <span className={`text-lg ${decayWarning.severity === 'danger' ? 'animate-pulse' : ''}`}>⚠️</span>
            <p className={`text-[10px] font-medium ${decayWarning.severity === 'danger' ? 'text-rose-300' : 'text-amber-300'}`}>
              {decayWarning.message}
            </p>
          </div>
        )}

        {/* Exam Countdowns — SS (mandatory) + History (optional) */}
        {userId && (
          <ExamCountdown
            userId={userId}
            ssGoalLevel={ssGoalLevel}
            historyGoalLevel={historyGoalLevel}
            takesHistory={takesHistory}
            currentLevel={levelTitle}
            onSetGoal={handleSetExamGoal}
            onSetTakesHistory={handleSetTakesHistory}
          />
        )}

        <div className="md:col-span-4 bg-slate-950/80 border border-slate-900 p-4 rounded-2xl grid grid-cols-5 gap-2">
          <div className="text-center">
            <p className="text-[8px] font-bold text-slate-500 uppercase">Inference</p>
            <p className={`text-xs font-black font-mono ${getSkillColorClass(skillRatings.inference)}`}>L{skillRatings.inference}/5</p>
          </div>
          <div className="text-center">
            <p className="text-[8px] font-bold text-slate-500 uppercase">Compare</p>
            <p className={`text-xs font-black font-mono ${getSkillColorClass(skillRatings.comparison)}`}>L{skillRatings.comparison}/6</p>
          </div>
          <div className="text-center">
            <p className="text-[8px] font-bold text-slate-500 uppercase">Reliability</p>
            <p className={`text-xs font-black font-mono ${getSkillColorClass(skillRatings.reliability)}`}>L{skillRatings.reliability}/6</p>
          </div>
          <div className="text-center">
            <p className="text-[8px] font-bold text-slate-500 uppercase">SEQ Essay</p>
            <p className={`text-xs font-black font-mono ${getSkillColorClass(skillRatings.essay)}`}>L{skillRatings.essay}/8</p>
          </div>
          <div className="text-center border-l border-slate-900 pl-1">
            <p className="text-[8px] font-bold text-slate-400 uppercase">SEQ Conclusion</p>
            <p className={`text-xs font-black font-mono ${getSkillColorClass(skillRatings.conclusion)}`}>L{skillRatings.conclusion}/2</p>
          </div>
        </div>
      </div>

      {/* Main Grid Framework Layout */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-6 p-6 gap-6 overflow-hidden max-h-[78vh]">
        
        {/* Configurator Sidebar */}
        <div className="xl:col-span-1 flex flex-col space-y-4 overflow-y-auto pr-1">
          <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4 space-y-4">
            <h2 className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Configurator</h2>
            
            {/* Subject Toggle Container */}
            <div className="flex flex-col space-y-1">
              <label className="text-[9px] font-bold uppercase text-slate-500">Syllabus Subject</label>
              <div className="grid grid-cols-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button onClick={() => setActiveSubject('Social Studies')} className={`text-[10px] font-bold py-1.5 rounded-lg transition ${activeSubject === 'Social Studies' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>SS</button>
                <button onClick={() => setActiveSubject('Elective History')} className={`text-[10px] font-bold py-1.5 rounded-lg transition ${activeSubject === 'Elective History' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>History</button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button onClick={() => { setIsCustomMode(false); setHasScanned(false); }} className={`text-[10px] font-bold py-2 rounded-lg transition ${!isCustomMode ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>AI Paper</button>
              <button onClick={() => { setIsCustomMode(true); setHasScanned(false); }} className={`text-[10px] font-bold py-2 rounded-lg transition ${isCustomMode ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>Vet Homework</button>
            </div>

            <div className="space-y-3 pt-1">
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-slate-500">Syllabus Topic Focus</label>
                <select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)} className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-xs font-medium text-slate-200 focus:outline-none">
                  {SYLLABUS_MAP[activeSubject]?.topics.map(topic => (
                    <option key={topic} value={topic}>{topic.replace('Issue ', 'Is. ').replace('Case Study: ', '')}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-slate-500">Target Skill Objectives</label>
                <select value={selectedSkill} onChange={(e) => setSelectedSkill(e.target.value)} className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-xs font-medium text-slate-200 focus:outline-none">
                  {SYLLABUS_MAP[activeSubject]?.skills.map(skill => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </select>
              </div>

              {!isCustomMode && (
                <button onClick={handleGenerateChallenge} disabled={isGenerating} className="w-full bg-indigo-600 text-white text-xs font-bold py-2.5 rounded-xl transition disabled:opacity-50 mt-1">
                  {isGenerating ? 'Drafting Sheet...' : '⚡ Generate Practice'}
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-[160px]">
            <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase mb-2">Practice Logs</span>
            <div className="flex-1 space-y-2 overflow-y-auto max-h-[220px] pr-1" ref={historyScrollRef}>
              {history.length === 0 ? (
                <div className="text-[10px] text-slate-600 font-mono italic p-2 border border-dashed border-slate-900 rounded-xl text-center">No logs recorded.</div>
              ) : (
                <>
                  {history.map((item) => (
                    <div key={item.id} onClick={() => loadHistoricalItem(item)} className="bg-slate-950/30 hover:bg-slate-900/60 border border-slate-900 p-3 rounded-xl cursor-pointer transition text-left space-y-1.5 group">
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-[9px] bg-slate-900 px-2 py-0.5 rounded text-indigo-400 font-bold uppercase">{item.subject === 'Social Studies' ? 'SS' : 'HIST'}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 font-medium group-hover:text-slate-200 transition">{item.question_prompt}</p>
                    </div>
                  ))}
                  {/* Load More button */}
                  {hasMoreHistory && (
                    <button
                      onClick={loadMoreHistory}
                      disabled={isLoadingMore}
                      className="w-full text-[9px] font-bold text-slate-500 hover:text-indigo-400 bg-slate-900/50 hover:bg-slate-900 border border-slate-800 py-2 rounded-lg transition disabled:opacity-40"
                    >
                      {isLoadingMore ? 'Loading...' : '⬇ Load More'}
                    </button>
                  )}
                  {/* Jump to Most Recent — appears once user has loaded beyond the first page */}
                  {historyPage > 0 && (
                    <button
                      onClick={() => {
                        setHistoryPage(0);
                        setHasMoreHistory(true);
                        loadHistoryLogs(userId, 0, false);
                        historyScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
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

        {/* SCROLLABLE Source Material Columns Display Layout */}
        <div className="xl:col-span-2 space-y-4 max-h-[75vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800 select-text">
          <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 text-xs space-y-1">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Contextual Background</span>
            <p className="text-slate-400 leading-relaxed select-text">{isCustomMode ? 'Analyze school assignment files.' : challenge.backgroundContext}</p>
          </div>
          
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-200 block select-text">{isCustomMode ? 'Source A Provenance' : challenge.sourceAProvenance}</span>
            <div className="bg-transparent border border-slate-800 rounded-xl p-4 text-xs">
              <p className="text-slate-300 leading-relaxed select-text whitespace-pre-line font-serif">{isCustomMode ? 'Paste school source texts here...' : challenge.sourceA}</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-200 block select-text">{isCustomMode ? 'Source B Provenance' : challenge.sourceBProvenance}</span>
            <div className="bg-transparent border border-slate-800 rounded-xl p-4 text-xs">
              <p className="text-slate-300 leading-relaxed select-text whitespace-pre-line font-serif">{isCustomMode ? 'Reference document texts...' : challenge.sourceB}</p>
            </div>
          </div>
        </div>

        {/* Workspace Textareas & Prompt Column Suite */}
        <div className="xl:col-span-2 flex flex-col space-y-4 max-h-[75vh]">
          
          <div className="bg-indigo-950/20 border border-indigo-900/30 rounded-2xl p-4 shrink-0">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Question Assignment Prompt</span>
            {isCustomMode ? (
              <input type="text" value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} placeholder="Type or paste your school assignment question prompt here..." className="w-full bg-slate-900 border border-slate-800 p-2.5 mt-2 rounded-xl text-xs text-slate-200 focus:outline-none" />
            ) : (
              <p className="text-xs font-bold text-slate-200 mt-1 select-text">{challenge.questionPrompt}</p>
            )}
          </div>

          {/* Canvas Scroll Wrapper Container */}
          <div className="flex-1 space-y-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800">
            <div className="flex justify-between items-center px-1 sticky top-0 bg-[#07090e] z-10 py-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Writing Canvas</span>
              {challenge.suggestedAnswer && !isCustomMode && (
                <button 
                  onClick={() => setIsExemplarOpen(true)}
                  className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-3 py-1 rounded-full transition"
          >
            💡 View Model Essay {evaluation.confidence > 0 ? `(${(evaluation.confidence * 100).toFixed(0)}% confident)` : ''}
          </button>
              )}
            </div>

            {!hasScanned ? (
              (!isCustomMode && isQuestionPromptInactive) ? (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-900 rounded-2xl bg-slate-950/20">
                  <p className="text-sm font-bold text-indigo-400">Ready to initiate O-Level practice simulation?</p>
                  <p className="text-[11px] text-slate-500 mt-1">Configure parameters and tap "Generate" to retrieve your full source package.</p>
                </div>
              ) : (
                <div className="space-y-4 pb-4">
                  {/* SBCS Segment Block */}
                  <div className="bg-slate-950/60 border border-slate-900 p-4 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase font-mono">Section A: Source-Based Question (SBCS)</label>
                      <div className="flex gap-2">
                        <button onClick={() => handlePasteFromClipboard('sbcs')} type="button" className="text-[10px] text-indigo-400 hover:underline">📋 Paste</button>
                        <button onClick={() => handleInjectPeelFrame('sbcs')} type="button" className="text-[10px] text-slate-400 hover:underline">💡 PEEL</button>
                      </div>
                    </div>
                    <p className="text-xs font-medium text-slate-300 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800">{challenge.sbcsPrompt}</p>
                    <textarea value={sbcsAnswer} onChange={(e) => setSbcsAnswer(e.target.value)} placeholder="Type source inference or comparison analysis here..." className="w-full min-h-[140px] bg-transparent text-slate-300 border border-slate-800 p-2.5 font-mono text-xs focus:outline-none focus:border-indigo-600 bg-slate-950 rounded-xl resize-none" />
                  </div>

                  {/* SEQ Segment Block */}
                  <div className="bg-slate-950/60 border border-slate-900 p-4 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase font-mono">Section B: Structured Essay Question (SEQ)</label>
                      <div className="flex gap-2">
                        <button onClick={() => handlePasteFromClipboard('seq')} type="button" className="text-[10px] text-indigo-400 hover:underline">📋 Paste</button>
                        <button onClick={() => handleInjectPeelFrame('seq')} type="button" className="text-[10px] text-slate-400 hover:underline">💡 PEEL</button>
                      </div>
                    </div>
                    <p className="text-xs font-medium text-slate-300 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800">{challenge.seqPrompt}</p>
                    <textarea value={seqAnswer} onChange={(e) => setSeqAnswer(e.target.value)} placeholder="Draft factor prioritization essay structure here..." className="w-full min-h-[140px] bg-transparent text-slate-300 border border-slate-800 p-2.5 font-mono text-xs focus:outline-none focus:border-indigo-600 bg-slate-950 rounded-xl resize-none" />
                  </div>

                  {/* SRQ Segment Block */}
                  <div className="bg-slate-950/60 border border-slate-900 p-4 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase font-mono">Section C: Structured Response Question (SRQ)</label>
                      <div className="flex gap-2">
                        <button onClick={() => handlePasteFromClipboard('srq')} type="button" className="text-[10px] text-indigo-400 hover:underline">📋 Paste</button>
                        <button onClick={() => handleInjectPeelFrame('srq')} type="button" className="text-[10px] text-slate-400 hover:underline">💡 PEEL</button>
                      </div>
                    </div>
                    <p className="text-xs font-medium text-slate-300 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800">{challenge.srqPrompt}</p>
                    <textarea value={srqAnswer} onChange={(e) => setSrqAnswer(e.target.value)} placeholder="State your assertions and balanced evaluation judgments here..." className="w-full min-h-[140px] bg-transparent text-slate-300 border border-slate-800 p-2.5 font-mono text-xs focus:outline-none focus:border-indigo-600 bg-slate-950 rounded-xl resize-none" />
                  </div>
                </div>
              )
            ) : (
              <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl font-mono text-xs leading-relaxed overflow-y-auto max-h-[450px]">
                {evaluation.segments.map((seg, idx) => (
                  <span key={idx} className={seg.type === 'error' ? 'underline decoration-red-500 bg-red-500/10' : seg.type === 'weak' ? 'bg-yellow-500/20 text-yellow-300' : ''}>{seg.text}</span>
                ))}
                <div className="mt-4 pt-4 border-t border-slate-900">
                  <button onClick={() => setHasScanned(false)} className="text-[10px] bg-slate-900 text-slate-400 font-bold px-3 py-1.5 rounded-lg border border-slate-800">✏️ Resume Editing</button>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 shrink-0 pt-2 border-t border-slate-900 bg-[#07090e] pb-1">
            {(!isQuestionPromptInactive || isCustomMode) && (
              <button 
                onClick={() => { setIsTimerActive(!isTimerActive); if(timeLeft === 0) setTimeLeft(1200); }}
                className={`px-4 rounded-xl text-xs font-mono font-bold transition whitespace-nowrap border ${isTimerActive ? 'bg-amber-600 border-amber-500 text-white' : 'bg-slate-950 border-slate-900 text-slate-400 hover:text-slate-200'}`}
              >
                ⏱️ {isTimerActive ? formatTime(timeLeft) : 'Start Timer'}
              </button>
            )}
            
            <button 
              onClick={handleScanStructure} 
              disabled={isGrading || (!sbcsAnswer && !seqAnswer && !srqAnswer) || (isCustomMode && !customPrompt.trim())} 
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl text-xs transition uppercase font-mono tracking-wider disabled:opacity-40"
            >
              {isGrading ? 'Processing All Content Streams...' : '⚡ Scan All Answers Simultaneously'}
            </button>
          </div>
        </div>

        {/* Diagnostic Grading Interface Column */}
        <div className="xl:col-span-1 space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-5 space-y-4 flex flex-col h-full min-h-[220px]">
            {!evaluation.scoreEstimate ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-2 text-slate-600 font-mono text-[10px] italic">
                Banding parameters will show up here after running an structural engine scan.
              </div>
            ) : (
              <>
                <div>
                  <div className="group relative flex items-center gap-1.5 cursor-help">
                    <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Estimated Banding</span>
                    <span className="text-[9px] text-indigo-400 font-bold bg-indigo-950/50 px-1.5 py-0.5 rounded border border-indigo-900/40" title="L1: Surface Details Only • L2: Source Content Used • L3: LORMS Target Objective Met">LORMS Criteria ⓘ</span>
                  </div>
                  <div className="text-xl font-black text-indigo-400 tracking-tight mt-1.5 font-mono select-text">{evaluation.scoreEstimate}</div>
                  
                  {/* Confidence indicator */}
                  {evaluation.confidence > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            evaluation.confidence >= 0.8 ? 'bg-emerald-500' :
                            evaluation.confidence >= 0.6 ? 'bg-amber-500' :
                            evaluation.confidence >= 0.4 ? 'bg-orange-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${evaluation.confidence * 100}%` }}
                        />
                      </div>
                      <span className={`text-[10px] font-bold font-mono ${
                        evaluation.confidence >= 0.8 ? 'text-emerald-400' :
                        evaluation.confidence >= 0.6 ? 'text-amber-400' :
                        'text-red-400'
                      }`}>
                        {(evaluation.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  )}
                  {evaluation.confidence > 0 && evaluation.confidence < 0.5 && (
                    <p className="text-[10px] text-red-400 font-bold mt-1">⚠ Low confidence — consider manual review</p>
                  )}
                </div>
                {evaluation.critique.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-900">
                    <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase block">Diagnostics Checklist</span>
                    <ul className="space-y-2 select-text">
                      {evaluation.critique.map((bullet, idx) => (
                        <li key={idx} className="text-[11px] text-slate-400 flex items-start gap-2"><span className="text-indigo-500">•</span><span>{bullet}</span></li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* Share Result Card */}
                {userId && (
                  <div className="pt-2 border-t border-slate-900 flex justify-end">
                    <ShareResultCard
                      scoreEstimate={evaluation.scoreEstimate}
                      confidence={evaluation.confidence}
                      subject={activeSubject}
                      topic={selectedTopic}
                      skill={selectedSkill}
                      xpEarned={masteryPoints > 0 ? Math.min(masteryPoints, 200) : 0}
                      levelTitle={levelTitle}
                      masteryPoints={masteryPoints}
                      streakDays={streakData.current}
                      critiqueCount={evaluation.critique.length}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

      </div>

      {/* Model Answer Drawer */}
      {isExemplarOpen && (
        <div
          className="fixed inset-y-0 right-0 w-full md:w-1/2 lg:w-1/3 bg-slate-950 border-l border-slate-900 z-50 shadow-2xl flex flex-col relative overflow-hidden"
          onMouseEnter={() => {
            setHoveredNotif('exemplar');
            pauseTimer(exemplarTimerRef, exemplarStartRef, exemplarRemainingRef);
          }}
          onMouseLeave={() => {
            setHoveredNotif(null);
            resumeTimer(exemplarTimerRef, exemplarStartRef, exemplarRemainingRef, () => setIsExemplarOpen(false));
          }}
        >
          {/* Progress bar at top */}
          <div className="h-0.5 bg-emerald-900/30 shrink-0">
            <div className={`h-full bg-gradient-to-r from-emerald-400 to-emerald-600 animate-shrink-width-8s ${hoveredNotif === 'exemplar' ? 'animate-paused' : ''}`} />
          </div>
          {/* Close button top-right */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (exemplarTimerRef.current) clearTimeout(exemplarTimerRef.current);
              setIsExemplarOpen(false);
            }}
            className="absolute top-4 right-4 text-slate-500 hover:text-white transition text-sm font-bold z-10"
          >
            ✕
          </button>
          <div className="p-6 pt-4 flex-1 flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-900 pb-4 mb-4">
              <h3 className="text-sm font-black tracking-wider text-emerald-400 uppercase">Syllabus Model Answer</h3>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto">
              {evaluation.confidence > 0 && (
                <div className="flex items-center gap-2 px-1">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Model Confidence</span>
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden max-w-[120px]">
                    <div
                      className={`h-full rounded-full ${
                        evaluation.confidence >= 0.8 ? 'bg-emerald-500' :
                        evaluation.confidence >= 0.6 ? 'bg-amber-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${Math.min(evaluation.confidence * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    {(evaluation.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              )}
              <div className="bg-slate-900/50 rounded-xl p-4 overflow-y-auto border border-slate-900 max-h-[55vh]">
                <p className="text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-wrap select-text">
                  {evaluation.a1Upgrade || challenge.suggestedAnswer}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confetti Effect */}
      <ConfettiEffect active={showConfetti} />

      {/* Level-Up Celebration Modal */}
      {showLevelUp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => {
            if (levelUpTimerRef.current) clearTimeout(levelUpTimerRef.current);
            setShowLevelUp(false);
          }}
          onMouseEnter={() => {
            setHoveredNotif('levelup');
            pauseTimer(levelUpTimerRef, levelUpStartRef, levelUpRemainingRef);
          }}
          onMouseLeave={() => {
            setHoveredNotif(null);
            resumeTimer(levelUpTimerRef, levelUpStartRef, levelUpRemainingRef, () => setShowLevelUp(false));
          }}
        >
          <div 
            className="bg-slate-950 border border-indigo-500/40 rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl shadow-indigo-500/20 animate-in zoom-in-95 duration-300 text-center relative overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Background glow */}
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />

            {/* Close button top-right */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (levelUpTimerRef.current) clearTimeout(levelUpTimerRef.current);
                setShowLevelUp(false);
              }}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition text-sm font-bold z-20"
            >
              ✕
            </button>

            {/* Progress bar at top */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-indigo-950/50">
              <div className={`h-full bg-gradient-to-r from-indigo-400 to-purple-500 animate-shrink-width ${hoveredNotif === 'levelup' ? 'animate-paused' : ''}`} />
            </div>
            
            <div className="relative z-10">
              <div className="text-5xl mb-3 animate-bounce">
                {getLevelConfig(levelUpInfo.to).icon}
              </div>
              <h2 className="text-lg font-black text-white mb-1">🎉 Level Up!</h2>
              <p className="text-sm text-slate-400 mb-4">
                You advanced from{' '}
                <span className="font-bold text-slate-300">{levelUpInfo.from}</span>
                {' '}to{' '}
                <span className={`font-bold ${getLevelConfig(levelUpInfo.to).color}`}>
                  {levelUpInfo.to}
                </span>
                !
              </p>
              
              {/* Achievement card */}
              <div className="bg-slate-900/70 rounded-2xl p-4 border border-slate-800 mb-5">
                <p className="text-xs text-slate-400 leading-relaxed">
                  {levelUpInfo.to === 'Apprentice' && 'You\'ve proven you can grade well. Keep the momentum going — Scholar awaits!'}
                  {levelUpInfo.to === 'Scholar' && 'You\'re mastering the material. Your skill radar will thank you for the practice!'}
                  {levelUpInfo.to === 'Expert' && 'Exceptional consistency. You\'re among the top-tier students now.'}
                  {levelUpInfo.to === 'Master' && 'The highest rank! You\'ve shown elite-level skill across every format.'}
                  {levelUpInfo.to === 'Novice' && 'Every expert starts somewhere. Keep scanning!'}
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (levelUpTimerRef.current) clearTimeout(levelUpTimerRef.current);
                  setShowLevelUp(false);
                }}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition shadow-lg"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Drawer */}
      {isLeaderboardOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => {
            if (leaderboardTimerRef.current) clearTimeout(leaderboardTimerRef.current);
            setIsLeaderboardOpen(false);
          }}
          onMouseEnter={() => {
            setHoveredNotif('leaderboard');
            pauseTimer(leaderboardTimerRef, leaderboardStartRef, leaderboardRemainingRef);
          }}
          onMouseLeave={() => {
            setHoveredNotif(null);
            resumeTimer(leaderboardTimerRef, leaderboardStartRef, leaderboardRemainingRef, () => setIsLeaderboardOpen(false));
          }}
        >
          <div 
            className="bg-slate-950 border border-slate-800 rounded-3xl max-w-lg w-full mx-4 shadow-2xl relative overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Progress bar at top */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-indigo-950/50">
              <div className={`h-full bg-gradient-to-r from-indigo-400 to-purple-500 animate-shrink-width-8s ${hoveredNotif === 'leaderboard' ? 'animate-paused' : ''}`} />
            </div>
            {/* Scrollable content */}
            <div className="overflow-y-auto max-h-[85vh] p-6">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-sm font-black tracking-widest text-slate-300 uppercase">🏆 Community</h2>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (leaderboardTimerRef.current) clearTimeout(leaderboardTimerRef.current);
                    setIsLeaderboardOpen(false);
                  }}
                  className="text-slate-500 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

            {isLeaderboardLoading ? (
              <div className="text-center py-12">
                <p className="text-xs text-slate-500 font-mono animate-pulse">Loading community data...</p>
              </div>
            ) : leaderboardData ? (
              <div className="space-y-5">
                {/* ── Your Personal Stats Card ── */}
                <div className="bg-gradient-to-br from-indigo-600/10 to-purple-600/10 border border-indigo-500/20 rounded-2xl p-5">
                  <h3 className="text-[10px] font-black tracking-widest text-indigo-400 uppercase mb-3">Your Profile</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-900/60 rounded-xl p-3 text-center">
                      <p className="text-[9px] font-bold text-slate-500 uppercase">Rank</p>
                      <p className="text-lg font-black font-mono text-indigo-400">#{leaderboardData.myRank}</p>
                      <p className="text-[8px] text-slate-600">of {leaderboardData.totalUsers}</p>
                    </div>
                    <div className="bg-slate-900/60 rounded-xl p-3 text-center">
                      <p className="text-[9px] font-bold text-slate-500 uppercase">Percentile</p>
                      <p className="text-lg font-black font-mono text-emerald-400">{leaderboardData.percentile}%</p>
                      <p className="text-[8px] text-emerald-500/60">{leaderboardData.decileLabel}</p>
                    </div>
                    <div className="bg-slate-900/60 rounded-xl p-3 text-center">
                      <p className="text-[9px] font-bold text-slate-500 uppercase">Level</p>
                      <p className="text-lg font-black font-mono text-amber-400">{leaderboardData.myLevel}</p>
                      <p className="text-[8px] text-slate-600">{leaderboardData.myXp} pts</p>
                    </div>
                  </div>

                  {/* Streak + trend */}
                  <div className="flex gap-3 mt-3">
                    <div className="flex-1 bg-slate-900/60 rounded-xl p-3 flex items-center gap-3">
                      <span className="text-lg">🔥</span>
                      <div>
                        <p className="text-[9px] font-bold text-slate-500">Streak</p>
                        <p className="text-sm font-black font-mono text-amber-400">{leaderboardData.myStreak}d <span className="text-[9px] text-slate-600 font-normal">(best {leaderboardData.myLongestStreak})</span></p>
                      </div>
                    </div>
                    <div className="flex-1 bg-slate-900/60 rounded-xl p-3 flex items-center gap-3">
                      <span className="text-lg">{leaderboardData.trendDirection === 'up' ? '📈' : leaderboardData.trendDirection === 'steady' ? '➡️' : '💤'}</span>
                      <div>
                        <p className="text-[9px] font-bold text-slate-500">This Week</p>
                        <p className="text-sm font-black font-mono text-slate-300">
                          {leaderboardData.recentEvalCount >= 5 ? 'On Fire!' :
                           leaderboardData.recentEvalCount >= 3 ? 'Consistent' :
                           leaderboardData.recentEvalCount >= 1 ? 'Getting Started' : 'Inactive'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Context for weaker students ── */}
                {leaderboardData.percentile < 40 && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
                    <p className="text-xs text-amber-300 font-bold mb-1">💪 You\'re building momentum!</p>
                    <p className="text-[11px] text-amber-400/70 leading-relaxed">
                      Every paper you submit moves you up. Most high-rankers started where you are now.
                      Your next goal: practice 3 times this week to break into the top half.
                    </p>
                  </div>
                )}

                {/* ── Peers at Your Level ── */}
                {leaderboardData.sameLevelPeers && leaderboardData.sameLevelPeers.length > 0 && (
                  <div>
                    <h3 className="text-[10px] font-black tracking-widest text-slate-500 uppercase mb-2">Peers at Your Level</h3>
                    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-3">
                      <p className="text-[11px] text-slate-400">
                        {leaderboardData.sameLevelPeersCount} other {leaderboardData.myLevel}(s) at similar XP — you\'re not alone!
                      </p>
                      <div className="flex gap-2 mt-2">
                        {leaderboardData.sameLevelPeers.map((peer: any, i: number) => (
                          <div key={i} className="flex-1 bg-slate-800/50 rounded-lg p-2 text-center">
                            <p className="text-[10px] font-mono text-slate-400">{peer.xp}pts</p>
                            <p className="text-[8px] text-slate-600">🔥{peer.streak}d</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Most Improved ── */}
                {leaderboardData.mostImproved && leaderboardData.mostImproved.length > 0 && (
                  <div>
                    <h3 className="text-[10px] font-black tracking-widest text-emerald-500 uppercase mb-2">📈 Most Improved This Week</h3>
                    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-3">
                      {leaderboardData.mostImproved.map((improver: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 py-1.5 border-b border-slate-800/50 last:border-0">
                          <span className="text-[10px] font-mono text-emerald-400 font-bold w-8">+{improver.xpGained}</span>
                          <span className="text-[10px] text-slate-500">pts this week</span>
                        </div>
                      ))}
                      <p className="text-[9px] text-slate-600 mt-2">Others are climbing — so can you! Every submission counts.</p>
                    </div>
                  </div>
                )}

                {/* ── Leaderboard Top 10 ── */}
                {leaderboardData.leaderboard && leaderboardData.leaderboard.length > 0 && (
                  <div>
                    <h3 className="text-[10px] font-black tracking-widest text-amber-500 uppercase mb-2">🏅 Top Students</h3>
                    <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden">
                      {leaderboardData.leaderboard.slice(0, 10).map((entry: any) => (
                        <div
                          key={entry.rank}
                          className={`flex items-center justify-between px-4 py-2.5 border-b border-slate-800/50 last:border-0 ${
                            entry.isMe ? 'bg-indigo-500/10 border-indigo-500/30' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-6 text-center text-xs font-mono font-bold ${
                              entry.rank === 1 ? 'text-amber-400' :
                              entry.rank === 2 ? 'text-slate-300' :
                              entry.rank === 3 ? 'text-amber-700' : 'text-slate-600'
                            }`}>
                              {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                            </span>
                            <span className={`text-xs font-medium ${entry.isMe ? 'text-indigo-300 font-bold' : 'text-slate-400'}`}>
                              {entry.isMe ? 'You' : `${entry.level}`}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500">{entry.xp} pts</span>
                        </div>
                      ))}
                    </div>
                    {!leaderboardData.isInTopTwenty && (
                      <p className="text-[9px] text-slate-600 text-center mt-2">You\'re climbing — keep submitting to reach the board!</p>
                    )}
                  </div>
                )}

                {/* ── Motivational Footer ── */}
                <div className="text-center pt-2">
                  <p className="text-[10px] text-slate-600 italic">
                    "The only person you should try to be better than is the person you were yesterday."
                  </p>
                </div>
              </div>              ) : (
              <div className="text-center py-12">
                <p className="text-xs text-slate-500">Could not load community data.</p>
              </div>
            )}
            </div>
          </div>
        </div>
      )}

      {/* Achievement Unlocked Banner — top of screen with countdown bar & close button */}
      {showAchievementUnlocked && newlyUnlocked.length > 0 && (
        <div
          className="cursor-pointer"
          onMouseEnter={() => {
            setHoveredNotif('achievement');
          }}
          onMouseLeave={() => {
            setHoveredNotif(null);
          }}
        >
          <AchievementBanner
            newlyUnlocked={newlyUnlocked}
            onDismiss={dismissBanner}
            isPaused={hoveredNotif === 'achievement'}
          />
        </div>
      )}

      {/* Daily Goal Bonus Toast — auto-dismisses after 5s */}
      {showDailyGoalToast && (
        <div
          className="fixed top-24 right-6 z-50 animate-in slide-in-from-right-5 fade-in duration-300 max-w-xs cursor-pointer"
          onClick={dismissDailyGoalToast}
          onMouseEnter={() => {
            setHoveredNotif('daily');
            pauseTimer(dailyGoalToastTimerRef, dailyGoalToastStartRef, dailyGoalToastRemainingRef);
          }}
          onMouseLeave={() => {
            setHoveredNotif(null);
            resumeTimer(dailyGoalToastTimerRef, dailyGoalToastStartRef, dailyGoalToastRemainingRef, dismissDailyGoalToast);
          }}
        >
          <div className="bg-gradient-to-r from-emerald-950/95 to-slate-950/95 border border-emerald-500/30 rounded-xl shadow-2xl shadow-emerald-500/5 backdrop-blur-xl relative overflow-hidden">
            {/* Close button top-right */}
            <button
              onClick={(e) => { e.stopPropagation(); dismissDailyGoalToast(); }}
              className="absolute top-2 right-2.5 text-slate-500 hover:text-white transition text-sm font-bold z-10"
            >
              ✕
            </button>
            {/* Content */}
            <div className="p-4 pr-8">
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">✅ Daily Goal Complete!</p>
              <p className="text-xs text-slate-300 mt-1 font-semibold">+{dailyGoalBonus} XP Bonus Earned</p>
            </div>
            {/* Progress bar at bottom */}
            <div className="h-0.5 bg-emerald-900/30">
              <div className={`h-full bg-gradient-to-r from-emerald-400 to-emerald-600 animate-shrink-width ${hoveredNotif === 'daily' ? 'animate-paused' : ''}`} />
            </div>
          </div>
        </div>
      )}

      {/* Error Toast — shows on generation or grading failure */}
      {errorToast && (
        <div
          className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-right-5 fade-in duration-300 cursor-pointer max-w-sm"
          onClick={dismissErrorToast}
          onMouseEnter={() => {
            setHoveredNotif('error');
            pauseTimer(errorToastTimerRef, errorToastStartRef, errorToastRemainingRef);
          }}
          onMouseLeave={() => {
            setHoveredNotif(null);
            resumeTimer(errorToastTimerRef, errorToastStartRef, errorToastRemainingRef, dismissErrorToast);
          }}
        >
          <div className={`rounded-2xl p-4 shadow-2xl border backdrop-blur-xl flex items-start gap-3 ${
            errorToast.type === 'error'
              ? 'bg-rose-950/80 border-rose-500/30'
              : 'bg-amber-950/80 border-amber-500/30'
          }`}>
            <span className="text-lg mt-0.5 shrink-0">
              {errorToast.type === 'error' ? '⚠️' : '💡'}
            </span>
            <div className="flex-1 min-w-0">
              <p className={`text-[11px] font-bold ${
                errorToast.type === 'error' ? 'text-rose-300' : 'text-amber-300'
              }`}>
                {errorToast.type === 'error' ? 'Error' : 'Warning'}
              </p>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed break-words">
                {errorToast.message}
              </p>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (errorToast.message) reportError(errorToast.message);
                }}
                className="text-[9px] font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 px-2.5 py-1 rounded-lg transition"
              >
                📮 Report to Developer
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  dismissErrorToast();
                }}
                className="text-slate-500 hover:text-white transition ml-auto shrink-0 text-sm font-bold"
              >
                ✕
              </button>
            </div>
          </div>
          {/* Progress bar countdown */}
          <div className="h-0.5 bg-slate-800/50 rounded-full mt-1 overflow-hidden">
            <div
              className={`h-full rounded-full animate-shrink-width ${
                hoveredNotif === 'error' ? 'animate-paused' : ''
              } ${errorToast.type === 'error' ? 'bg-rose-500' : 'bg-amber-500'}`}
            />
          </div>
        </div>
      )}

      {/* Achievements Drawer */}
      {isAchievementsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => {
            if (achievementsTimerRef.current) clearTimeout(achievementsTimerRef.current);
            setIsAchievementsOpen(false);
          }}
          onMouseEnter={() => {
            setHoveredNotif('achievements');
            pauseTimer(achievementsTimerRef, achievementsStartRef, achievementsRemainingRef);
          }}
          onMouseLeave={() => {
            setHoveredNotif(null);
            resumeTimer(achievementsTimerRef, achievementsStartRef, achievementsRemainingRef, () => setIsAchievementsOpen(false));
          }}
        >
          <div
            className="bg-slate-950 border border-slate-800 rounded-3xl max-w-sm w-full mx-4 shadow-2xl relative overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Progress bar at top (clipped by parent overflow-hidden) */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-slate-800/30">
              <div className={`h-full bg-gradient-to-r from-amber-400 to-orange-500 animate-shrink-width-8s ${hoveredNotif === 'achievements' ? 'animate-paused' : ''}`} />
            </div>
            {/* Scrollable content wrapper */}
            <div className="overflow-y-auto max-h-[80vh] p-6">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-sm font-black tracking-widest text-slate-300 uppercase">🏅 Achievements</h2>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (achievementsTimerRef.current) clearTimeout(achievementsTimerRef.current);
                    setIsAchievementsOpen(false);
                  }}
                  className="text-slate-500 hover:text-white transition text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="text-[10px] text-slate-500 font-mono mb-4 text-center">
                {achievements.length} / {ACHIEVEMENT_DEFS.length} unlocked
              </div>

              <div className="space-y-2">
                {ACHIEVEMENT_DEFS.map((ach) => {
                  const unlocked = achievements.includes(ach.id);
                  return (
                    <div
                      key={ach.id}
                      className={`rounded-xl p-3 border flex items-center gap-3 transition ${
                        unlocked
                          ? 'bg-emerald-500/5 border-emerald-500/20'
                          : 'bg-slate-900/30 border-slate-800/50 opacity-50'
                      }`}
                    >
                      <span className={`text-xl ${unlocked ? '' : 'grayscale'}`}>{ach.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold ${unlocked ? 'text-white' : 'text-slate-500'}`}>
                          {ach.title}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">{ach.description}</p>
                      </div>
                      {unlocked && <span className="text-[9px] text-emerald-400">✅</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Study Group Panel */}
      {userId && (
        <StudyGroupPanel
          userId={userId}
          isOpen={isStudyGroupOpen}
          onClose={() => setIsStudyGroupOpen(false)}
        />
      )}

      {/* Onboarding Wizard — manages own visibility via localStorage */}
      <OnboardingWizard
        userId={userId}
        onComplete={() => {}}
      />

      <FeedbackModal 
        isOpen={isFeedbackOpen} 
        onClose={() => setIsFeedbackOpen(false)} 
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        textInput={textInput}
        setTextInput={setTextInput}
        onSubmit={handleSubmitFeedback}
      />

    </div>
  );
}

/** Achievement banner component with countdown bar and close button */
function AchievementBanner({ newlyUnlocked, onDismiss, isPaused }: { newlyUnlocked: any[]; onDismiss: () => void; isPaused?: boolean }) {
  useEffect(() => {
    if (isPaused) return;
    const timer = setTimeout(onDismiss, 8000);
    return () => clearTimeout(timer);
  }, [onDismiss, isPaused]);

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] animate-in slide-in-from-top-3 fade-in duration-300">
      <div className="bg-gradient-to-r from-emerald-950/95 via-slate-950/95 to-indigo-950/95 border-b border-emerald-500/30 backdrop-blur-xl shadow-2xl shadow-emerald-500/10 relative overflow-hidden">
        {/* Countdown bar at bottom */}
        <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-emerald-400 to-emerald-600 animate-shrink-width-8s ${isPaused ? 'animate-paused' : ''}`} />

        {/* Close button top right */}
        <button
          onClick={onDismiss}
          className="absolute top-3 right-4 text-slate-400 hover:text-white transition text-sm font-bold z-10"
        >
          ✕
        </button>

        <div className="max-w-3xl mx-auto px-6 py-4 pr-12">
          <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-2">🎉 Achievement Unlocked!</p>
          <div className="flex items-center gap-4">
            {newlyUnlocked.map((ach: any, i: number) => (
              <div key={ach.id || i} className="flex items-center gap-3 py-1">
                <span className="text-3xl">{ach.icon}</span>
                <div>
                  <p className="text-sm font-bold text-white">{ach.title}</p>
                  <p className="text-[11px] text-slate-400">{ach.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}