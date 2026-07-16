'use client';

// 🚀 Forces Vercel to serve this page fresh on every single load, picking up active tokens
export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/utils/supabase';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import FeedbackModal from '@/app/components/FeedbackModal';
import NotificationBell from '@/app/components/NotificationBell';
import StudyGroupPanel from '@/app/components/StudyGroupPanel';
import ShareResultCard from '@/app/components/ShareResultCard';
import ConfettiEffect from '@/app/components/ConfettiEffect';
import OnboardingWizard from '@/app/components/OnboardingWizard';
import AnalyticsPanel from '@/app/components/AnalyticsPanel';
import ConfiguratorSidebar from '@/app/components/ConfiguratorSidebar';
import ModelAnswerDrawer from '@/app/components/ModelAnswerDrawer';
import LevelUpModal from '@/app/components/LevelUpModal';
import LeaderboardDrawer from '@/app/components/LeaderboardDrawer';
import AchievementsDrawer from '@/app/components/AchievementsDrawer';
import AchievementBanner from '@/app/components/AchievementBanner';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import DashboardSkeleton from '@/app/components/DashboardSkeleton';
import GlobalErrorBanner from '@/app/components/GlobalErrorBanner';
import MobileSidebar from '@/app/components/MobileSidebar';
import TestimonialPrompt, { recordCompletedScan, shouldShowTestimonial } from '@/app/components/TestimonialPrompt';
import { getLevelConfig, getLevelTitle, getNextLevelXp, getPrevLevelXp, LEVEL_THRESHOLDS, playGradeCompleteSound, playLevelUpSound, playAchievementSound, isDailyGoalMet, ACHIEVEMENT_DEFS, calculateXpDecay, getDecayWarning } from '@/lib/gamification';
import { SKILL_LABELS, TOPIC_SUMMARIES, detectSubTopic, isCustomTopic } from '@/lib/summary-utils';

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
  metadata?: Record<string, any>;
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
  
  const [sourceCount, setSourceCount] = useState(5);
  
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
  const [showGuestBanner, setShowGuestBanner] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [scanProgress, setScanProgress] = useState<string | null>(null);
  const scanProgressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [generateProgress, setGenerateProgress] = useState<string | null>(null);
  const generateProgressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [hasScanned, setHasScanned] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentChallengeId, setCurrentChallengeId] = useState<string | null>(null);
  const [isExemplarOpen, setIsExemplarOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isTestimonialOpen, setIsTestimonialOpen] = useState(false);

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
  const [isAdmin, setIsAdmin] = useState(false);
  const [errorToast, setErrorToast] = useState<{ message: string; type: 'error' | 'warning' } | null>(null);
  const errorToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const errorToastStartRef = useRef(0);
  const errorToastRemainingRef = useRef(12000);
  const dailyGoalToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dailyGoalToastStartRef = useRef(0);
  const dailyGoalToastRemainingRef = useRef(12000);
  // (Timer refs for modals are now managed inside their respective components)
  const [hoveredNotif, setHoveredNotif] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // ── Pause / resume helpers (for toast/daily-goal only) ──
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
    errorToastRemainingRef.current = 12000;
    errorToastStartRef.current = Date.now();
    setErrorToast({ message, type });
    errorToastTimerRef.current = setTimeout(() => setErrorToast(null), 12000);
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
    sourceCProvenance: '' as string | undefined,
    sourceC: '' as string | undefined,
    sourceDProvenance: '' as string | undefined,
    sourceD: '' as string | undefined,
    sourceEProvenance: '' as string | undefined,
    sourceE: '' as string | undefined,
    questionPrompt: 'No question active. Use the configurator panel on the left to start.',
    sbcsPrompt: 'SBCS evaluation task criteria will render here.',
    seqPrompt: 'SEQ structural essay prompt query will render here.',
    srqPrompt: 'SRQ contextual evaluation prompt query will render here.',
    // All Formats fields
    partA_Inference: '' as string | undefined,
    partB_Comparison: '' as string | undefined,
    partC_Purpose: '' as string | undefined,
    partD_Reliability: '' as string | undefined,
    partE_Assertion: '' as string | undefined,
    srqBackgroundContext: '' as string | undefined,
    srqQuestionA: '' as string | undefined,
    srqQuestionB: '' as string | undefined,
    seqQuestion1: '' as string | undefined,
    seqQuestion2: '' as string | undefined,
    seqQuestion3: '' as string | undefined,
    isAllFormats: false as boolean | undefined,
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
      dailyGoalToastRemainingRef.current = 12000;
      dailyGoalToastStartRef.current = Date.now();
      dailyGoalToastTimerRef.current = setTimeout(() => setShowDailyGoalToast(false), 12000);
    }
    return () => {
      if (dailyGoalToastTimerRef.current) clearTimeout(dailyGoalToastTimerRef.current);
    };
  }, [showDailyGoalToast, hoveredNotif]);

  // (Auto-dismiss effects for modals — now managed inside their own components)

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
        .select('id, subject, topic, question_type, question_prompt, background_context, source_a, source_a_provenance, source_b, source_b_provenance, suggested_answer, created_at, metadata')
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
        .select('sbq_inference_score, sbq_comparison_score, sbq_reliability_score, seq_essay_score, seq_conclusion_score, total_xp, level_title, current_streak, longest_streak, achievements, last_practice_date, ss_goal_level, history_goal_level, takes_history')
        .eq('user_id', uid)
        .single();
      if (metricsData) {
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
      // Check if user is admin
      const isUserAdmin = 
        user.app_metadata?.is_admin === true || 
        user.user_metadata?.is_admin === true;
      setIsAdmin(isUserAdmin);

      setIsAuthLoading(false);

      // ── Send heartbeat to track last_active_at for personalized reminders ──
      sendHeartbeat(user.id);
    }

    // ── Initialize sound from localStorage after mount (prevents hydration mismatch) ──
    if (typeof window !== 'undefined') {
      const storedSound = localStorage.getItem('sound_enabled');
      if (storedSound === 'false') {
        setIsSoundEnabled(false);
      } else if (!storedSound) {
        localStorage.setItem('sound_enabled', 'true');
      }
    }

    forceRetrieveSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        handleUserSession(session.user);
      }
    });

    return () => {
      subscription.unsubscribe();
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
    };
  }, []);

  // ── Simulated generate progress steps (Sources → Questions → Formatting) ──
  useEffect(() => {
    if (isGenerating) {
      const STEPS = ['sources', 'questions', 'formatting'];
      let stepIndex = 0;
      setGenerateProgress(STEPS[0]);
      const tick = () => {
        stepIndex++;
        if (stepIndex < STEPS.length) {
          setGenerateProgress(STEPS[stepIndex]);
          generateProgressIntervalRef.current = setTimeout(tick, 1500);
        }
      };
      generateProgressIntervalRef.current = setTimeout(tick, 700);
    } else {
      if (generateProgressIntervalRef.current) {
        clearTimeout(generateProgressIntervalRef.current);
        generateProgressIntervalRef.current = null;
      }
      setGenerateProgress(null);
    }
    return () => {
      if (generateProgressIntervalRef.current) {
        clearTimeout(generateProgressIntervalRef.current);
        generateProgressIntervalRef.current = null;
      }
    };
  }, [isGenerating]);

  // ── Simulated scan progress steps (SBCS → SEQ → SRQ → Feedback) ──
  useEffect(() => {
    if (isGrading) {
      const STEPS = ['sbcs', 'seq', 'srq', 'feedback'];
      let stepIndex = 0;
      setScanProgress(STEPS[0]);
      // Quick first tick to get past SBCS fast, then steady 1.5s per subsequent step
      const tick = () => {
        stepIndex++;
        if (stepIndex < STEPS.length) {
          setScanProgress(STEPS[stepIndex]);
          scanProgressIntervalRef.current = setTimeout(tick, stepIndex === 1 ? 1500 : 1500);
        }
      };
      scanProgressIntervalRef.current = setTimeout(tick, 700);
    } else {
      if (scanProgressIntervalRef.current) {
        clearTimeout(scanProgressIntervalRef.current);
        scanProgressIntervalRef.current = null;
      }
      setScanProgress(null);
    }
    return () => {
      if (scanProgressIntervalRef.current) {
        clearTimeout(scanProgressIntervalRef.current);
        scanProgressIntervalRef.current = null;
      }
    };
  }, [isGrading]);

  // ── Heartbeat: ping every 5 min while dashboard is open ──
  const heartbeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sendHeartbeat = useCallback((uid: string) => {
    // Fire-and-forget — never blocks the dashboard
    fetch('/api/user/heartbeat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: uid }),
    }).catch(() => {});
  }, []);

  // Set up periodic heartbeat once userId is known
  useEffect(() => {
    if (userId) {
      // Ping every 5 minutes
      heartbeatIntervalRef.current = setInterval(() => {
        sendHeartbeat(userId);
      }, 5 * 60 * 1000);
    }
    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
    };
  }, [userId, sendHeartbeat]);

  /** Generate a short summary of what this practice is about — stored in metadata for fast display */
  const generateSummary = (topic: string, qType: string, bgContext: string, customPrompt?: string): string => {
    // For custom / off-syllabus topics, use first portion of bgContext or customPrompt
    if (isCustomTopic(topic)) {
      const source = customPrompt || bgContext || topic;
      return source.replace(/\s+/g, ' ').slice(0, 55).trim() + (source.length > 55 ? '…' : '');
    }

    let base = TOPIC_SUMMARIES[topic] || topic || 'General practice';

    // For 'Any Topic (Random Mix)', append part of background context
    if (topic === 'Any Topic (Random Mix)' && bgContext) {
      base = bgContext.replace(/\s+/g, ' ').slice(0, 60).trim() + (bgContext.length > 60 ? '…' : '');
    }

    // Try to detect a more specific sub-topic from background context
    const subTopic = bgContext ? detectSubTopic(bgContext) : null;
    if (subTopic && !base.includes(subTopic)) {
      base = `${base} > ${subTopic}`;
    }

    // Use clean skill label
    if (qType && !qType.startsWith('All Formats')) {
      const skillLabel = SKILL_LABELS[qType];
      if (skillLabel) {
        base = `${base} · ${skillLabel}`;
      } else {
        // Fall back to raw abbreviation
        const skillBrief = qType
          .replace(/^SBQ: /, '').replace(/^SRQ\/SEQ: /, '').replace(/^SEQ: /, '')
          .replace(/\(AO[123]\/?AO?[12]?\)/g, '').trim();
        if (skillBrief && skillBrief.length < 40) base = `${base} · ${skillBrief}`;
      }
    }

    return base;
  };

  const handleGenerateChallenge = async () => {
    const _startGen = Date.now();
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
          questionType: selectedSkill,
          sourceCount 
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
        sourceCProvenance: data.sourceCProvenance || undefined,
        sourceC: data.sourceC || undefined,
        sourceDProvenance: data.sourceDProvenance || undefined,
        sourceD: data.sourceD || undefined,
        sourceEProvenance: data.sourceEProvenance || undefined,
        sourceE: data.sourceE || undefined,
        questionPrompt: data.questionPrompt || `${activeSubject} Comprehensive Suite`,
        sbcsPrompt: data.sbcsPrompt || 'How far does Source A support the claim? Explain your answer.',
        seqPrompt: data.seqPrompt || 'Explain the impact of the policy decisions on the local population.',
        srqPrompt: data.srqPrompt || 'In your opinion, is institutional intervention or local management more vital?',
        // All Formats fields
        partA_Inference: data.partA_Inference || undefined,
        partB_Comparison: data.partB_Comparison || undefined,
        partC_Purpose: data.partC_Purpose || undefined,
        partD_Reliability: data.partD_Reliability || undefined,
        partE_Assertion: data.partE_Assertion || undefined,
        srqBackgroundContext: data.srqBackgroundContext || undefined,
        srqQuestionA: data.srqQuestionA || undefined,
        srqQuestionB: data.srqQuestionB || undefined,
        seqQuestion1: data.seqQuestion1 || undefined,
        seqQuestion2: data.seqQuestion2 || undefined,
        seqQuestion3: data.seqQuestion3 || undefined,
        isAllFormats: data.isAllFormats || undefined,
        suggestedAnswer: data.suggestedAnswer || ''
      });

      if (userId) {
        // Build metadata for All Formats: store extra sources, parts, and subject-specific content
        const metadata: Record<string, any> = {};
        if (data.isAllFormats) {
          metadata.isAllFormats = true;
          // Store a concise summary for sidebar practice logs
          metadata.summary = generateSummary(selectedTopic, selectedSkill, data.backgroundContext || '', isCustomMode ? customPrompt : undefined);
          metadata.sourceCProvenance = data.sourceCProvenance || '';
          metadata.sourceC = data.sourceC || '';
          metadata.sourceDProvenance = data.sourceDProvenance || '';
          metadata.sourceD = data.sourceD || '';
          metadata.sourceEProvenance = data.sourceEProvenance || '';
          metadata.sourceE = data.sourceE || '';
          metadata.partA_Inference = data.partA_Inference || '';
          metadata.partB_Comparison = data.partB_Comparison || '';
          metadata.partC_Purpose = data.partC_Purpose || '';
          metadata.partD_Reliability = data.partD_Reliability || '';
          metadata.partE_Assertion = data.partE_Assertion || '';
          metadata.srqBackgroundContext = data.srqBackgroundContext || '';
          metadata.srqQuestionA = data.srqQuestionA || '';
          metadata.srqQuestionB = data.srqQuestionB || '';
          metadata.seqQuestion1 = data.seqQuestion1 || '';
          metadata.seqQuestion2 = data.seqQuestion2 || '';
          metadata.seqQuestion3 = data.seqQuestion3 || '';
        } else {
          // Individual skill track — store summary too
          metadata.summary = generateSummary(selectedTopic, selectedSkill, data.backgroundContext || '', isCustomMode ? customPrompt : undefined);
        }

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
            suggested_answer: data.suggestedAnswer,
            metadata: Object.keys(metadata).length > 0 ? metadata : undefined
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
      const _elapsed = Date.now() - _startGen;
      if (_elapsed < 1500) await new Promise(r => setTimeout(r, 1500 - _elapsed));
      setIsGenerating(false);
    }
  };

  const handleScanStructure = async () => {
    if (!sbcsAnswer.trim() && !seqAnswer.trim() && !srqAnswer.trim()) return;
    const _startGrade = Date.now();
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

      setHasScanned(true);
      // Track scan for testimonial prompt
      recordCompletedScan();
      if (shouldShowTestimonial()) {
        setIsTestimonialOpen(true);
      }
      } catch (err) {
        console.error(err);
        showErrorToast(
          err instanceof Error ? err.message : 'Grading failed. Please try again.'
        );
        setHasScanned(false);
      } finally {
        const _elapsed = Date.now() - _startGrade;
        if (_elapsed < 1500) await new Promise(r => setTimeout(r, 1500 - _elapsed));
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

    // Restore All Formats extras from metadata (JSONB column)
    const meta = item.metadata || {};
    const isAllFormats = meta.isAllFormats === true;

    setChallenge({
      backgroundContext: item.background_context || '',
      sourceAProvenance: item.source_a_provenance || 'Source A Context:',
      sourceA: item.source_a || '',
      sourceBProvenance: item.source_b_provenance || 'Source B Context:',
      sourceB: item.source_b,
      // Restore sources C-E from metadata (All Formats only)
      sourceCProvenance: isAllFormats ? (meta.sourceCProvenance || undefined) : undefined,
      sourceC: isAllFormats ? (meta.sourceC || undefined) : undefined,
      sourceDProvenance: isAllFormats ? (meta.sourceDProvenance || undefined) : undefined,
      sourceD: isAllFormats ? (meta.sourceD || undefined) : undefined,
      sourceEProvenance: isAllFormats ? (meta.sourceEProvenance || undefined) : undefined,
      sourceE: isAllFormats ? (meta.sourceE || undefined) : undefined,
      questionPrompt: item.question_prompt,
      sbcsPrompt: 'Historical record segment task.',
      seqPrompt: 'Historical prioritization prompt layer.',
      srqPrompt: 'Contextual recommendations query segment.',
      // Restore All Formats parts from metadata
      partA_Inference: isAllFormats ? (meta.partA_Inference || undefined) : undefined,
      partB_Comparison: isAllFormats ? (meta.partB_Comparison || undefined) : undefined,
      partC_Purpose: isAllFormats ? (meta.partC_Purpose || undefined) : undefined,
      partD_Reliability: isAllFormats ? (meta.partD_Reliability || undefined) : undefined,
      partE_Assertion: isAllFormats ? (meta.partE_Assertion || undefined) : undefined,
      srqBackgroundContext: isAllFormats ? (meta.srqBackgroundContext || undefined) : undefined,
      srqQuestionA: isAllFormats ? (meta.srqQuestionA || undefined) : undefined,
      srqQuestionB: isAllFormats ? (meta.srqQuestionB || undefined) : undefined,
      seqQuestion1: isAllFormats ? (meta.seqQuestion1 || undefined) : undefined,
      seqQuestion2: isAllFormats ? (meta.seqQuestion2 || undefined) : undefined,
      seqQuestion3: isAllFormats ? (meta.seqQuestion3 || undefined) : undefined,
      isAllFormats: isAllFormats || undefined,
      suggestedAnswer: item.suggested_answer || ''
    });
    setEvaluation({ scoreEstimate: '', critique: [], segments: [], confidence: 0, a1Upgrade: '' });
  };

  const handleSetExamGoal = async (subject: 'ss' | 'history', goalLevel: string) => {
    if (!userId) return;
    try {
      const field = subject === 'ss' ? 'ss_goal_level' : 'history_goal_level';
      const res = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, [field]: goalLevel }),
      });
      if (res.ok) {
        if (subject === 'ss') {
          setSsGoalLevel(goalLevel);
        } else {
          setHistoryGoalLevel(goalLevel);
        }
      } else {
        const errData = await res.json().catch(() => ({ error: 'Failed to save exam goal' }));
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
      const res = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, takes_history: takes }),
      });
      if (res.ok) {
        setTakesHistory(takes);
        if (!takes) setHistoryGoalLevel(null);
      } else {
        const errData = await res.json().catch(() => ({ error: 'Failed to update History setting' }));
        showErrorToast(errData.error || 'Failed to update History setting');
      }
    } catch (err) {
      console.warn('Failed to update History setting:', err);
      showErrorToast('Could not update History setting. Check your connection.');
    }
  };

  const emailInitial = userEmail ? userEmail.charAt(0).toUpperCase() : 'G';
  const isGuest = !isAuthLoading && !userId;
  const isQuestionPromptInactive = (challenge.backgroundContext ?? '').includes('Click Generate Practice');

  if (isAuthLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans relative selection:bg-indigo-500/30">
      {/* Global error/offline banner */}
      <GlobalErrorBanner />
      <style>{`
        /* Hover micro-interactions */
        .hover-lift { transition: transform 0.15s ease, box-shadow 0.15s ease; }
        .hover-lift:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(99,102,241,0.1); }
        .hover-glow:hover { filter: brightness(0.9) saturate(0.85); }
        .hover-dim:hover { filter: brightness(0.85); }
        @keyframes pulse-soft { 0%,100% { opacity: 1; } 50% { opacity: 0.7; } }
        .animate-pulse-soft { animation: pulse-soft 2s ease-in-out infinite; }
      `}</style>
      
      {/* Guest Mode Banner */}
      {isGuest && showGuestBanner && (
        <div className="bg-gradient-to-r from-indigo-950/80 via-purple-950/80 to-slate-950/80 border-b border-indigo-500/30 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="text-lg">🔓</span>
            <span><strong className="text-indigo-400">Guest Mode</strong> — generate &amp; grade instantly. Sign up to save your progress.</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/auth"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-1.5 rounded-lg text-[10px] transition whitespace-nowrap"
            >
              Sign Up Free
            </Link>
            <button
              onClick={() => setShowGuestBanner(false)}
              className="text-slate-500 hover:text-slate-300 text-sm transition p-1"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <header className="border-b border-slate-900 px-4 sm:px-6 py-4 flex items-center justify-between bg-slate-950/60 backdrop-blur-md relative z-40">
        <div className="flex items-center gap-4">
            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="sm:hidden w-10 h-10 flex items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
              aria-label="Open menu"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <h1 className="text-xl font-black text-indigo-500 tracking-wider">MARKUP</h1>
            <button
              onClick={() => router.push('/dashboard/settings')}
              className="hidden sm:inline-flex bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[9px] font-bold px-3 py-2 rounded-lg transition text-slate-400 hover:text-slate-200 items-center gap-1.5"
            >
              ⚙️ Settings
            </button>
          </div>
        
        <div className="flex items-center gap-1 sm:gap-3">
          {/* Notification Bell */}
          {userId && <NotificationBell userId={userId} />}

          {/* Study Groups */}
          <button
            onClick={() => setIsStudyGroupOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[9px] font-bold px-2.5 py-2 rounded-lg transition text-slate-400 hover:text-slate-200"
            title="Study Groups"
          >
            👥
          </button>

          {/* Sound toggle */}
          <button
            onClick={() => setIsSoundEnabled(!isSoundEnabled)}
            className="text-sm p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-900 transition"
            title={isSoundEnabled ? 'Mute sounds' : 'Enable sounds'}
          >
            {isSoundEnabled ? '🔊' : '🔇'}
          </button>

          {/* Achievements button */}
          <button
            onClick={() => setIsAchievementsOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[9px] font-bold px-2.5 py-2 rounded-lg transition text-slate-400 hover:text-slate-200"
          >
            🏅 {achievements.length}/{ACHIEVEMENT_DEFS.length}
          </button>
          {/* Admin link - checked via session metadata */}
          {(isAdmin) && (
            <a 
              href="/admin/analytics" 
              className="hidden sm:inline-flex bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 text-[11px] font-bold px-3 py-2 rounded-xl transition items-center gap-1.5"
            >
              📊 Platform Insights
            </a>
          )}
          
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-800 hover:border-indigo-500 focus:outline-none transition relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 shadow-lg"
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
                  <p className="text-xs text-slate-200 font-semibold truncate mt-1 bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-900">{isGuest ? 'Guest Mode' : (userEmail || 'Active Student')}</p>
                </div>
                <div className="pt-2 border-t border-slate-900 flex flex-col space-y-1">
                  <button onClick={() => { router.push('/dashboard/settings'); setIsSettingsOpen(false); }} className="w-full text-left text-slate-400 hover:text-indigo-400 text-xs font-bold py-2 px-1 transition">
                    ⚙️ Settings
                  </button>
                  <button onClick={() => { setIsFeedbackOpen(true); setIsSettingsOpen(false); }} className="w-full text-left text-slate-400 hover:text-indigo-400 text-xs font-bold py-2 px-1 transition">
                    🐛 Submit Bug / Feedback
                  </button>
                  {isGuest ? (
                    <Link href="/auth" className="block w-full text-center bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-xl text-xs transition mt-2">
                      Sign Up Free
                    </Link>
                  ) : (
                    <button onClick={async () => { await supabase.auth.signOut(); router.push('/auth'); }} className="w-full bg-red-950/30 hover:bg-red-900/50 text-red-400 border border-red-900/30 font-bold py-2 rounded-xl text-xs transition mt-2">
                      Sign Out
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Analytics Matrix Panel — hidden on phones (< 768px), visible on tablets+ */}
      <div className="hidden md:block">
        <AnalyticsPanel
          userId={userId}
          levelTitle={levelTitle}
          masteryPoints={masteryPoints}
          xpProgress={xpProgress}
          streakData={streakData}
          streakBonus={streakBonus}
          dailyGoalMet={dailyGoalMet}
          decayWarning={decayWarning}
          skillRatings={skillRatings}
          achievements={achievements}
          ssGoalLevel={ssGoalLevel}
          historyGoalLevel={historyGoalLevel}
          takesHistory={takesHistory}
          onFetchLeaderboard={fetchLeaderboard}
          onSetExamGoal={handleSetExamGoal}
          onSetTakesHistory={handleSetTakesHistory}
        />
      </div>

      {/* Main Grid Framework Layout */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-6 p-4 sm:p-6 gap-4 sm:gap-6 overflow-y-auto max-h-[78vh]">
        
        {/* Configurator Sidebar — extracted component */}
        <ConfiguratorSidebar
          activeSubject={activeSubject}
          selectedTopic={selectedTopic}
          selectedSkill={selectedSkill}
          isCustomMode={isCustomMode}
          isGenerating={isGenerating}
          generateProgress={generateProgress}
          history={history}
          hasMoreHistory={hasMoreHistory}
          isLoadingMore={isLoadingMore}
          historyPage={historyPage}
          syllabusMap={SYLLABUS_MAP}
          onSetActiveSubject={setActiveSubject}
          onSetSelectedTopic={setSelectedTopic}
          onSetSelectedSkill={setSelectedSkill}
          sourceCount={sourceCount}
          onSetCustomMode={setIsCustomMode}
          onSetSourceCount={setSourceCount}
          onSetHasScanned={setHasScanned}
          onGenerate={handleGenerateChallenge}
          onLoadHistoricalItem={loadHistoricalItem}
          onLoadMoreHistory={loadMoreHistory}
          onJumpToRecent={() => {
            setHistoryPage(0);
            setHasMoreHistory(true);
            loadHistoryLogs(userId, 0, false);
            historyScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />

        {/* SCROLLABLE Source Material Columns Display Layout */}
        <div className="xl:col-span-2 space-y-4 max-h-[75vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800 select-text">
          <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 text-xs space-y-1 hover-lift">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Contextual Background</span>
            <p className="text-slate-400 leading-relaxed select-text">{isCustomMode ? 'Analyze school assignment files.' : challenge.backgroundContext}</p>
          </div>
          
          {/* Source A */}
          <div className="space-y-1.5 hover-lift">
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-black bg-indigo-600/20 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/30">Source A</span>
              <span className="text-[11px] font-bold text-slate-200 block select-text">{isCustomMode ? 'Source A Provenance' : challenge.sourceAProvenance}</span>
            </div>
            <div className="bg-transparent border border-slate-800 rounded-xl p-4 text-xs transition hover:border-indigo-900/50 hover:bg-indigo-950/5">
              <p className="text-slate-300 leading-relaxed select-text whitespace-pre-line font-serif">{isCustomMode ? 'Paste school source texts here...' : challenge.sourceA}</p>
            </div>
          </div>

          {/* Source B */}
          <div className="space-y-1.5 hover-lift">
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-black bg-indigo-600/20 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/30">Source B</span>
              <span className="text-[11px] font-bold text-slate-200 block select-text">{isCustomMode ? 'Source B Provenance' : challenge.sourceBProvenance}</span>
            </div>
            <div className="bg-transparent border border-slate-800 rounded-xl p-4 text-xs transition hover:border-indigo-900/50 hover:bg-indigo-950/5">
              <p className="text-slate-300 leading-relaxed select-text whitespace-pre-line font-serif">{isCustomMode ? 'Reference document texts...' : challenge.sourceB}</p>
            </div>
          </div>

          {/* Sources C, D, E — shown only in All Formats mode */}
          {challenge.isAllFormats && challenge.sourceC && (
            <div className="space-y-1.5 pt-2 border-t border-slate-800/50">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Additional Sources</span>
            </div>
          )}
          {challenge.isAllFormats && challenge.sourceC && (
            <div className="space-y-1.5 hover-lift">
              <div className="flex items-center gap-2">
                <span className="text-[8px] font-black bg-amber-600/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">Source C</span>
                <span className="text-[11px] font-bold text-slate-200 block select-text">{challenge.sourceCProvenance || 'Source 3'}</span>
              </div>
              <div className="bg-transparent border border-slate-800 rounded-xl p-4 text-xs transition hover:border-amber-900/50 hover:bg-amber-950/5">
                <p className="text-slate-300 leading-relaxed select-text whitespace-pre-line font-serif">{challenge.sourceC}</p>
              </div>
            </div>
          )}
          {challenge.isAllFormats && challenge.sourceD && (
            <div className="space-y-1.5 hover-lift">
              <div className="flex items-center gap-2">
                <span className="text-[8px] font-black bg-amber-600/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">Source D</span>
                <span className="text-[11px] font-bold text-slate-200 block select-text">{challenge.sourceDProvenance || 'Source 4'}</span>
              </div>
              <div className="bg-transparent border border-slate-800 rounded-xl p-4 text-xs transition hover:border-amber-900/50 hover:bg-amber-950/5">
                <p className="text-slate-300 leading-relaxed select-text whitespace-pre-line font-serif">{challenge.sourceD}</p>
              </div>
            </div>
          )}
          {challenge.isAllFormats && challenge.sourceE && (
            <div className="space-y-1.5 hover-lift">
              <div className="flex items-center gap-2">
                <span className="text-[8px] font-black bg-amber-600/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">Source E</span>
                <span className="text-[11px] font-bold text-slate-200 block select-text">{challenge.sourceEProvenance || 'Source 5'}</span>
              </div>
              <div className="bg-transparent border border-slate-800 rounded-xl p-4 text-xs transition hover:border-amber-900/50 hover:bg-amber-950/5">
                <p className="text-slate-300 leading-relaxed select-text whitespace-pre-line font-serif">{challenge.sourceE}</p>
              </div>
            </div>
          )}
        </div>

        {/* Workspace Textareas & Prompt Column Suite */}
        <div className="xl:col-span-2 flex flex-col space-y-4 max-h-[75vh]">
          
          {/* Scroll anchor for mobile Practice tab */}
          <div className="writing-canvas" />
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
                  className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-3 py-2 rounded-full transition"
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
                  {/* SBCS Segment Block — All Formats: show 5 individual parts */}
                  <div className="bg-slate-950/60 border border-slate-900 p-4 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase font-mono">Section A: Source-Based Case Study (SBCS) — 35 marks</label>
                      <div className="flex gap-2">
                        <button onClick={() => handlePasteFromClipboard('sbcs')} type="button" className="text-[10px] text-indigo-400 hover:underline p-1.5 sm:p-1 rounded-lg">📋 Paste</button>
                        <button onClick={() => handleInjectPeelFrame('sbcs')} type="button" className="text-[10px] text-slate-400 hover:underline p-1.5 sm:p-1 rounded-lg">💡 PEEL</button>
                      </div>
                    </div>

                    {challenge.isAllFormats ? (
                      <>
                        {/* Part (a) - Inference */}
                        <div className="bg-indigo-950/20 border border-indigo-900/30 rounded-lg p-3">
                          <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider">Part (a) — Inference / Message — 2 marks</span>
                          <p className="text-xs font-medium text-slate-300 mt-1">{challenge.partA_Inference}</p>
                        </div>
                        {/* Part (b) - Comparison */}
                        <div className="bg-indigo-950/20 border border-indigo-900/30 rounded-lg p-3">
                          <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider">Part (b) — Comparison — 5 marks</span>
                          <p className="text-xs font-medium text-slate-300 mt-1">{challenge.partB_Comparison}</p>
                        </div>
                        {/* Part (c) - Purpose */}
                        <div className="bg-indigo-950/20 border border-indigo-900/30 rounded-lg p-3">
                          <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider">Part (c) — Purpose — 4 marks</span>
                          <p className="text-xs font-medium text-slate-300 mt-1">{challenge.partC_Purpose}</p>
                        </div>
                        {/* Part (d) - Reliability */}
                        <div className="bg-indigo-950/20 border border-indigo-900/30 rounded-lg p-3">
                          <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider">Part (d) — Reliability — 5 marks</span>
                          <p className="text-xs font-medium text-slate-300 mt-1">{challenge.partD_Reliability}</p>
                        </div>
                        {/* Part (e) - Assertion */}
                        <div className="bg-amber-950/20 border border-amber-900/30 rounded-lg p-3">
                          <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">Part (e) — Assertion / Synthesis — 10 marks</span>
                          <p className="text-xs font-medium text-slate-300 mt-1">{challenge.partE_Assertion}</p>
                        </div>
                      </>
                    ) : (
                      <p className="text-xs font-medium text-slate-300 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800">{challenge.sbcsPrompt}</p>
                    )}
                    <textarea value={sbcsAnswer} onChange={(e) => setSbcsAnswer(e.target.value)} placeholder="Type source inference or comparison analysis here..." className="w-full min-h-[140px] bg-transparent text-slate-300 border border-slate-800 p-2.5 font-mono text-xs focus:outline-none focus:border-indigo-600 bg-slate-950 rounded-xl resize-none" />
                    <div className="flex justify-between text-[8px] text-slate-600 font-mono px-1">
                      <span>{sbcsAnswer.trim() ? `~${sbcsAnswer.trim().split(/\s+/).length} words` : ''}</span>
                      <span>{sbcsAnswer.length} chars</span>
                    </div>
                  </div>

                  {/* All Formats: Subject-specific sections */}
                  {challenge.isAllFormats && (
                    <>
                      {/* SS: SRQ Section */}
                      {challenge.srqBackgroundContext && (
                        <div className="bg-emerald-950/20 border border-emerald-900/30 p-4 rounded-xl space-y-3">
                          <label className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase font-mono">Section B: Structured Response Questions (SRQ) — 15 marks [Social Studies]</label>
                          
                          {/* Background context */}
                          <div className="bg-slate-950/60 border border-slate-900 rounded-lg p-3">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Background Context</span>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{challenge.srqBackgroundContext}</p>
                          </div>

                          {/* SRQ (a) — 7 marks */}
                          {challenge.srqQuestionA && (
                            <div className="bg-slate-950/60 border border-slate-900 rounded-lg p-3">
                              <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">SRQ (a) — Recommendation / Strategy — 7 marks</span>
                              <p className="text-xs font-medium text-slate-300 mt-1">{challenge.srqQuestionA}</p>
                            </div>
                          )}

                          {/* SRQ (b) — 8 marks */}
                          {challenge.srqQuestionB && (
                            <div className="bg-slate-950/60 border border-slate-900 rounded-lg p-3">
                              <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">SRQ (b) — Evaluation / Judgment — 8 marks</span>
                              <p className="text-xs font-medium text-slate-300 mt-1">{challenge.srqQuestionB}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* History: SEQ Section */}
                      {challenge.seqQuestion1 && !challenge.srqBackgroundContext && (
                        <div className="bg-amber-950/20 border border-amber-900/30 p-4 rounded-xl space-y-3">
                          <label className="text-[10px] font-bold tracking-widest text-amber-400 uppercase font-mono">Section B: Structured Essay Questions (SEQ) — 20 marks [Elective History]</label>
                          <p className="text-[9px] text-slate-500 italic">Answer any ONE of the following three questions.</p>
                          
                          <div className="bg-slate-950/60 border border-slate-900 rounded-lg p-3">
                            <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">SEQ Question 1 — Causes / Consequences</span>
                            <p className="text-xs font-medium text-slate-300 mt-1">{challenge.seqQuestion1}</p>
                          </div>

                          <div className="bg-slate-950/60 border border-slate-900 rounded-lg p-3">
                            <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">SEQ Question 2 — Significance / Impact</span>
                            <p className="text-xs font-medium text-slate-300 mt-1">{challenge.seqQuestion2}</p>
                          </div>

                          <div className="bg-slate-950/60 border border-slate-900 rounded-lg p-3">
                            <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">SEQ Question 3 — Comparison / Judgment</span>
                            <p className="text-xs font-medium text-slate-300 mt-1">{challenge.seqQuestion3}</p>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Individual skill tracks: SEQ + SRQ blocks */}
                  {!challenge.isAllFormats && (
                    <>
                      {/* SEQ Segment Block */}
                      <div className="bg-slate-950/60 border border-slate-900 p-4 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase font-mono">Section B: Structured Essay Question (SEQ)</label>
                          <div className="flex gap-2">
                            <button onClick={() => handlePasteFromClipboard('seq')} type="button" className="text-[10px] text-indigo-400 hover:underline p-1.5 sm:p-1 rounded-lg">📋 Paste</button>
                            <button onClick={() => handleInjectPeelFrame('seq')} type="button" className="text-[10px] text-slate-400 hover:underline p-1.5 sm:p-1 rounded-lg">💡 PEEL</button>
                          </div>
                        </div>
                        <p className="text-xs font-medium text-slate-300 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800">{challenge.seqPrompt}</p>
                        <textarea value={seqAnswer} onChange={(e) => setSeqAnswer(e.target.value)} placeholder="Draft factor prioritization essay structure here..." className="w-full min-h-[140px] bg-transparent text-slate-300 border border-slate-800 p-2.5 font-mono text-xs focus:outline-none focus:border-indigo-600 bg-slate-950 rounded-xl resize-none" />
                        <div className="flex justify-between text-[8px] text-slate-600 font-mono px-1">
                          <span>{seqAnswer.trim() ? `~${seqAnswer.trim().split(/\s+/).length} words` : ''}</span>
                          <span>{seqAnswer.length} chars</span>
                        </div>
                      </div>

                      {/* SRQ Segment Block */}
                      <div className="bg-slate-950/60 border border-slate-900 p-4 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase font-mono">Section C: Structured Response Question (SRQ)</label>
                          <div className="flex gap-2">
                            <button onClick={() => handlePasteFromClipboard('srq')} type="button" className="text-[10px] text-indigo-400 hover:underline p-1.5 sm:p-1 rounded-lg">📋 Paste</button>
                            <button onClick={() => handleInjectPeelFrame('srq')} type="button" className="text-[10px] text-slate-400 hover:underline p-1.5 sm:p-1 rounded-lg">💡 PEEL</button>
                          </div>
                        </div>
                        <p className="text-xs font-medium text-slate-300 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800">{challenge.srqPrompt}</p>
                        <textarea value={srqAnswer} onChange={(e) => setSrqAnswer(e.target.value)} placeholder="State your assertions and balanced evaluation judgments here..." className="w-full min-h-[140px] bg-transparent text-slate-300 border border-slate-800 p-2.5 font-mono text-xs focus:outline-none focus:border-indigo-600 bg-slate-950 rounded-xl resize-none" />
                        <div className="flex justify-between text-[8px] text-slate-600 font-mono px-1">
                          <span>{srqAnswer.trim() ? `~${srqAnswer.trim().split(/\s+/).length} words` : ''}</span>
                          <span>{srqAnswer.length} chars</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )
            ) : (
              <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl font-mono text-xs leading-relaxed overflow-y-auto max-h-[450px]">
                {evaluation.segments.map((seg, idx) => (
                  <span key={idx} className={seg.type === 'error' ? 'underline decoration-red-500 bg-red-500/10' : seg.type === 'weak' ? 'bg-yellow-500/20 text-yellow-300' : ''}>{seg.text}</span>
                ))}
                <div className="mt-4 pt-4 border-t border-slate-900">
                  <button onClick={() => setHasScanned(false)} className="text-[10px] bg-slate-900 text-slate-400 font-bold px-3 py-2 rounded-lg border border-slate-800">✏️ Resume Editing</button>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 shrink-0 pt-2 border-t border-slate-900 bg-[#07090e] pb-1">
            {(!isQuestionPromptInactive || isCustomMode) && (
              <button 
                onClick={() => { setIsTimerActive(!isTimerActive); if(timeLeft === 0) setTimeLeft(1200); }}
                className={`px-4 rounded-xl text-xs font-mono font-bold transition whitespace-nowrap border hover-glow ${
                  isTimerActive
                    ? timeLeft <= 60
                      ? 'bg-rose-600 border-rose-500 text-white animate-pulse'
                      : timeLeft <= 300
                        ? 'bg-amber-600 border-amber-500 text-white'
                        : 'bg-emerald-700 border-emerald-500 text-white'
                    : 'bg-slate-950 border-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                ⏱️ {isTimerActive ? formatTime(timeLeft) : 'Start Timer'}
                {isTimerActive && timeLeft <= 300 && (
                  <span className="ml-1 text-[9px]">{timeLeft <= 60 ? 'CRITICAL' : `${Math.ceil(timeLeft/60)}m left`}</span>
                )}
              </button>
            )}
            
            <button 
              onClick={handleScanStructure} 
              disabled={isGrading || (!sbcsAnswer && !seqAnswer && !srqAnswer) || (isCustomMode && !customPrompt.trim())} 
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl text-xs transition uppercase font-mono tracking-wider disabled:opacity-40"
            >
              {isGrading ? (
                <span className="inline-flex flex-col items-center gap-1 w-full">
                  <span className="inline-flex items-center gap-2 text-[10px]">
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin-fast shrink-0" />
                    Grading…
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[9px] opacity-80">
                    <span className={`px-1.5 py-0.5 rounded transition-all duration-300 ${
                      scanProgress === 'sbcs' 
                        ? 'bg-white/20 text-white font-bold shadow-lg shadow-white/10 animate-pulse' 
                        : ['seq', 'srq', 'feedback'].includes(scanProgress || '') 
                          ? 'text-slate-300/60' 
                          : 'text-slate-500'
                    }`}>SBCS</span>
                    <span className="text-slate-600">→</span>
                    <span className={`px-1.5 py-0.5 rounded transition-all duration-300 ${
                      scanProgress === 'seq' 
                        ? 'bg-white/20 text-white font-bold shadow-lg shadow-white/10 animate-pulse' 
                        : scanProgress === 'srq' || scanProgress === 'feedback' 
                          ? 'text-slate-300/60' 
                          : 'text-slate-500'
                    }`}>SEQ</span>
                    <span className="text-slate-600">→</span>
                    <span className={`px-1.5 py-0.5 rounded transition-all duration-300 ${
                      scanProgress === 'srq' 
                        ? 'bg-white/20 text-white font-bold shadow-lg shadow-white/10 animate-pulse' 
                        : scanProgress === 'feedback' 
                          ? 'text-slate-300/60' 
                          : 'text-slate-500'
                    }`}>SRQ</span>
                    <span className="text-slate-600">→</span>
                    <span className={`px-1.5 py-0.5 rounded transition-all duration-300 ${
                      scanProgress === 'feedback' 
                        ? 'bg-emerald-500/20 text-emerald-200 font-bold shadow-lg shadow-emerald-500/20 animate-pulse' 
                        : 'text-slate-500'
                    }`}>Feedback</span>
                  </span>
                </span>
              ) : '⚡ Scan All Answers Simultaneously'}
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

      {/* Model Answer Drawer — extracted component */}
      <ModelAnswerDrawer
        isOpen={isExemplarOpen}
        onClose={() => setIsExemplarOpen(false)}
        confidence={evaluation.confidence}
        a1Upgrade={evaluation.a1Upgrade}
        suggestedAnswer={challenge.suggestedAnswer}
      />

      {/* Confetti Effect */}
      <ConfettiEffect active={showConfetti} />

      {/* Level-Up Celebration Modal — extracted component */}
      <LevelUpModal
        isOpen={showLevelUp}
        onClose={() => setShowLevelUp(false)}
        levelUpInfo={levelUpInfo}
      />

      {/* Leaderboard Drawer — extracted component */}
      <LeaderboardDrawer
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        isLoading={isLeaderboardLoading}
        data={leaderboardData}
      />

      {/* Achievement Unlocked Banner — extracted component */}
      {showAchievementUnlocked && newlyUnlocked.length > 0 && (
        <div
          className="cursor-pointer"
          onMouseEnter={() => setHoveredNotif('achievement')}
          onMouseLeave={() => setHoveredNotif(null)}
        >
          <AchievementBanner
            newlyUnlocked={newlyUnlocked}
            onDismiss={() => setShowAchievementUnlocked(false)}
            isPaused={hoveredNotif === 'achievement'}
          />
        </div>
      )}

      {/* Toast Container — top center, side-by-side */}
      {(showDailyGoalToast || errorToast) && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[70] flex-col md:flex-row gap-4 items-start justify-center flex">
          {showDailyGoalToast && (
            <div
              className="animate-in slide-in-from-top-5 fade-in duration-300 w-full max-w-xs cursor-pointer shrink-0"
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
                <button onClick={(e) => { e.stopPropagation(); dismissDailyGoalToast(); }} className="absolute top-2 right-2.5 w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-slate-900 transition text-sm font-bold z-10">✕</button>
                <div className="p-4 pr-8">
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">✅ Daily Goal Complete!</p>
                  <p className="text-xs text-slate-300 mt-1 font-semibold">+{dailyGoalBonus} XP Bonus Earned</p>
                </div>
                <div className="h-0.5 bg-emerald-900/30">
                  <div className={`h-full bg-gradient-to-r from-emerald-400 to-emerald-600 animate-shrink-width ${hoveredNotif === 'daily' ? 'animate-paused' : ''}`} />
                </div>
              </div>
            </div>
          )}

          {errorToast && (
            <div
              className="animate-in slide-in-from-top-5 fade-in duration-300 w-full max-w-md cursor-pointer shrink-0"
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
                <span className="text-lg mt-0.5 shrink-0">{errorToast.type === 'error' ? '⚠️' : '💡'}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-[11px] font-bold ${errorToast.type === 'error' ? 'text-rose-300' : 'text-amber-300'}`}>
                    {errorToast.type === 'error' ? 'Error' : 'Warning'}
                  </p>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed break-words">{errorToast.message}</p>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={(e) => { e.stopPropagation(); if (errorToast.message) reportError(errorToast.message); }} className="text-[9px] font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 px-3 py-2 rounded-lg transition">📮 Report to Developer</button>
                  <button onClick={(e) => { e.stopPropagation(); dismissErrorToast(); }} className="text-slate-500 hover:text-white transition ml-auto shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-900 text-sm font-bold">✕</button>
                </div>
              </div>
              <div className="h-0.5 bg-slate-800/50 rounded-full mt-1 overflow-hidden">
                <div className={`h-full rounded-full animate-shrink-width ${hoveredNotif === 'error' ? 'animate-paused' : ''} ${errorToast.type === 'error' ? 'bg-rose-500' : 'bg-amber-500'}`} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Achievements Drawer — extracted component */}
      <AchievementsDrawer
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
        achievements={achievements}
      />

      {/* Mobile sidebar navigation */}
      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        userId={userId}
        userEmail={userEmail}
        isAdmin={isAdmin}
        achievementsCount={achievements.length}
        totalAchievements={ACHIEVEMENT_DEFS.length}
        isSoundEnabled={isSoundEnabled}
        onToggleSound={() => setIsSoundEnabled(!isSoundEnabled)}
        onOpenStudyGroups={() => setIsStudyGroupOpen(true)}
        onOpenAchievements={() => setIsAchievementsOpen(true)}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
        onSignOut={async () => { await supabase.auth.signOut(); router.push('/auth'); }}
        // Game stats for mobile view
        levelTitle={levelTitle}
        masteryPoints={masteryPoints}
        xpProgress={xpProgress}
        streakData={streakData}
        skillRatings={skillRatings}
        dailyGoalMet={dailyGoalMet}
        decayWarning={decayWarning}
        onOpenLeaderboard={fetchLeaderboard}
      />

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

      {/* Testimonial Prompt — appears after 2nd+ successful scan */}
      <TestimonialPrompt
        isOpen={isTestimonialOpen}
        isGuest={isGuest}
        userName={userEmail ? userEmail.split('@')[0] : undefined}
        userEmail={userEmail || undefined}
        onClose={() => setIsTestimonialOpen(false)}
      />

      {/* ── Mobile Bottom Tab Bar (app-style navigation) ── */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/98 border-t border-slate-900 backdrop-blur-xl safe-area-bottom flex items-center justify-around px-2 py-1.5">
        <button            onClick={() => {
            const el = document.querySelector('.writing-canvas');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl text-indigo-400 transition min-h-[44px] min-w-[64px]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          <span className="text-[8px] font-bold tracking-wider">PRACTICE</span>
        </button>
        <button
          onClick={() => {
            const el = document.querySelector('[data-section="configurator"]');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            else setIsMobileSidebarOpen(true);
          }}
          className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl text-slate-500 hover:text-slate-300 transition min-h-[44px] min-w-[64px]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span className="text-[8px] font-bold tracking-wider">HISTORY</span>
        </button>
        <button
          onClick={() => setIsAchievementsOpen(true)}
          className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl text-slate-500 hover:text-slate-300 transition min-h-[44px] min-w-[64px]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
          <span className="text-[8px] font-bold tracking-wider">STATS</span>
        </button>
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl text-slate-500 hover:text-slate-300 transition min-h-[44px] min-w-[64px]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          <span className="text-[8px] font-bold tracking-wider">MORE</span>
        </button>
      </nav>

      {/* Spacer for bottom nav on mobile */}
      <div className="sm:hidden h-16" />
    </div>
  );
}
