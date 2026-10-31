'use client';

// Forces Vercel to serve this page fresh on every single load, picking up active tokens
export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useErrorToast } from '@/lib/use-error-toast';
import { AI_CAPACITY_MESSAGE } from '@/lib/ai-capacity';
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
import ModelAnswerDrawer from '@/app/components/ModelAnswerDrawer';
import LevelUpModal from '@/app/components/LevelUpModal';
import LeaderboardDrawer from '@/app/components/LeaderboardDrawer';
import AchievementsDrawer from '@/app/components/AchievementsDrawer';
import AchievementBanner from '@/app/components/AchievementBanner';
import DashboardSkeleton from '@/app/components/DashboardSkeleton';
import GlobalErrorBanner from '@/app/components/GlobalErrorBanner';
import MobileSidebar from '@/app/components/MobileSidebar';
import TestimonialPrompt, { recordCompletedScan, shouldShowTestimonial } from '@/app/components/TestimonialPrompt';
import WeeklyDigestPanel from '@/app/components/WeeklyDigestPanel';
import WaitlistGateModal from '@/app/components/WaitlistGateModal';
import PracticeCard from '@/app/components/PracticeCard';
import { getLevelConfig, getLevelTitle, getNextLevelXp, getPrevLevelXp, LEVEL_THRESHOLDS, playGradeCompleteSound, playLevelUpSound, playAchievementSound, isDailyGoalMet, ACHIEVEMENT_DEFS, calculateXpDecay, getDecayWarning } from '@/lib/gamification';
import { getOllieFeedback, triggerStreakReminder } from '@/lib/ollie-dialogue';
import { SKILL_LABELS, TOPIC_SUMMARIES, detectSubTopic, isCustomTopic } from '@/lib/summary-utils';
import { SYLLABUS_MAP, MARK_GUIDE, type HistoryTrack } from '@/lib/syllabus';
import { getTrialState, registerTry, registerTryTo, isTrialBlocked, syncTrialUnlock, formatUnlockDays, TRIAL_LIMIT } from '@/lib/trial-gate';

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

/** Parse the Retry-After header (seconds) from an AI-capacity 503 response,
 *  with a sane fallback when the header is missing or malformed. */
function parseRetryAfterSeconds(res: Response, fallback = 60): number {
  const raw = res.headers.get('Retry-After');
  const parsed = raw ? parseInt(raw, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/** Resolve the retry ETA for an AI-capacity 503: prefer the server-computed
 *  retryAfterSeconds in the JSON body (real ETA from the quota error), falling
 *  back to the Retry-After header, then a 60s default. */
function resolveRetrySeconds(body: { retryAfterSeconds?: unknown }, res: Response, fallback = 60): number {
  if (
    typeof body.retryAfterSeconds === 'number' &&
    Number.isFinite(body.retryAfterSeconds) &&
    body.retryAfterSeconds > 0
  ) {
    return Math.floor(body.retryAfterSeconds);
  }
  return parseRetryAfterSeconds(res, fallback);
}

/** Humanize a large second count, e.g. 17100 → "4h 45m". */
function humanizeDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`;
  if (m > 0) return `${m}m`;
  return `${s}s`;
}

/** Waits longer than this are daily-quota resets (hours away) — show a
 *  humanized ETA instead of a ticking countdown, and don't auto-retry. */
const LONG_WAIT_THRESHOLD_SECONDS = 10 * 60;

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
  const [showGuestBanner, setShowGuestBanner] = useState(true);
  // New simplified state for the redesigned layout
  const [isReferralOpen, setIsReferralOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [scanProgress, setScanProgress] = useState<string | null>(null);
  const scanProgressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [generateProgress, setGenerateProgress] = useState<string | null>(null);
  const generateProgressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [hasScanned, setHasScanned] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  /** Persist the authenticated user's identity and profile data to component state.
   *  Called by the session loader after Supabase returns a session.
   *  @param user The authenticated Supabase user object */
  const handleUserSession = (user: { id: string; email?: string | null; user_metadata?: Record<string, unknown>; avatar_url?: string | null }) => {
    setUserId(user.id);
    setUserEmail(user.email || '');
    // Prefer an uploaded avatar URL; fall back to an initials avatar.
    setUserAvatar(user.avatar_url || '');
  };
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
  const [emailInitial, setEmailInitial] = useState('');
  const [isGuest, setIsGuest] = useState(true);
  const [ollieState, setOllieState] = useState<'neutral' | 'celebrating' | 'disappointed' | 'angry'>('neutral');
  const [ollieSpeech, setOllieSpeech] = useState("Ollie's waiting for your answer...");
  const [ollieConfetti, setOllieConfetti] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  // Grading result state for dynamic Ollie reactions
  const [gradingResult, setGradingResult] = useState<{
    score: number | null;
    errorType: string | null;
    feedback: string;
    scoreLevel: string;
    scoreLabel: string;
  } | null>(null);
  const [showGradeToast, setShowGradeToast] = useState(false);
  const [isConfiguratorOpen, setIsConfiguratorOpen] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpInfo, setLevelUpInfo] = useState({ from: '', to: '' });
  const [leaderboardData, setLeaderboardData] = useState<any>(null);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(false);
  const [totalEvaluations, setTotalEvaluations] = useState(0);
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

  const [ssGoalLevel, setSsGoalLevel] = useState<string | null>(null);
  const [historyGoalLevel, setHistoryGoalLevel] = useState<string | null>(null);
  // Which History paper the student takes (Elective XOR Pure), or null for none.
  const [historyTrack, setHistoryTrack] = useState<HistoryTrack | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [errorToast, setErrorToast] = useState<{ message: string; type: 'error' | 'warning'; retryIn?: number | null; canRetry?: boolean; autoRetry?: boolean; longWaitEta?: string | null } | null>(null);
  const errorToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const errorToastStartRef = useRef(0);
  const errorToastRemainingRef = useRef(12000);
  const capacityCountdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const capacityRemainingRef = useRef(0);
  const capacityRetryActionRef = useRef<'generate' | 'grade' | null>(null);
  // One-shot guard: the countdown auto-retries at most once per user action,
  // so a prolonged outage can't trigger an endless retry loop.
  const autoRetryFiredRef = useRef(false);
  // True while a retry is being dispatched from the effect — lets the handlers
  // distinguish user-initiated calls (re-arm auto-retry) from auto-retry calls
  // (keep the guard in place).
  const isAutoRetryRef = useRef(false);
  // Retries are fired through an effect (not render-traceable) so the handler
  // can use impure helpers like Date.now() without tripping react-hooks/purity.
  // pendingRetryTick is a counter; pendingRetryActionRef holds the action to run.
  const retryHandlersRef = useRef<{ generate?: () => void; grade?: () => void }>({});
  const pendingRetryActionRef = useRef<'generate' | 'grade' | null>(null);
  const [pendingRetryTick, setPendingRetryTick] = useState(0);
  const dailyGoalToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dailyGoalToastStartRef = useRef(0);
  const dailyGoalToastRemainingRef = useRef(12000);
  // (Timer refs for modals are now managed inside their respective components)
  const [hoveredNotif, setHoveredNotif] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  // Helper to get auth signup link
  const getAuthLink = () => '/auth';
  const fetchLeaderboard = () => {};
  const [myReferralCode, setMyReferralCode] = useState('');
  // ── Beta trial gate: 3 free generations, then waitlist + feedback to unlock 7 days ──
  const [trialTriesUsed, setTrialTriesUsed] = useState(0);
  const [trialUnlocked, setTrialUnlocked] = useState(false);
  const [isWaitlistGateOpen, setIsWaitlistGateOpen] = useState(false);

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
    if (capacityCountdownRef.current) clearInterval(capacityCountdownRef.current);
    errorToastTimerRef.current = null;
    capacityCountdownRef.current = null;
    capacityRetryActionRef.current = null;
    // A manual dismissal (click / ✕) is a fresh user action — re-arm auto-retry
    autoRetryFiredRef.current = false;
    setErrorToast(null);
  }, []);

  const showErrorToast = useCallback((message: string, type: 'error' | 'warning' = 'error') => {
    if (errorToastTimerRef.current) clearTimeout(errorToastTimerRef.current);
    if (capacityCountdownRef.current) clearInterval(capacityCountdownRef.current);
    capacityCountdownRef.current = null;
    capacityRetryActionRef.current = null;
    autoRetryFiredRef.current = false;
    errorToastRemainingRef.current = 12000;
    errorToastStartRef.current = Date.now();
    setErrorToast({ message, type, retryIn: null });
    errorToastTimerRef.current = setTimeout(() => setErrorToast(null), 12000);
  }, []);

  /**
   * Show an "AI is at capacity" toast with a live retry countdown.
   * Persists for the full countdown (unlike the 12s default toast), ticking
   * down every second. When the countdown hits zero it auto-retries the failed
   * request once. Pass `retryAction` to also show a "Try Now" button.
   */
  const showCapacityToast = useCallback((message: string, retryAfterSeconds = 60, retryAction: 'generate' | 'grade' | null = null) => {
    const seconds = Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
      ? Math.floor(retryAfterSeconds)
      : 60;
    if (errorToastTimerRef.current) clearTimeout(errorToastTimerRef.current);

    // ── Long wait (daily token quota — resets at UTC midnight, hours away) ──
    // No ticking countdown, no auto-retry (pointless to retry 20h later);
    // just an honest "resets in Xh Ym" label + Try Now. Auto-dismiss after 15s.
    if (seconds >= LONG_WAIT_THRESHOLD_SECONDS) {
      setErrorToast({ message, type: 'error', retryIn: null, canRetry: retryAction != null, autoRetry: false, longWaitEta: humanizeDuration(seconds) });
      errorToastRemainingRef.current = 15000;
      errorToastStartRef.current = Date.now();
      errorToastTimerRef.current = setTimeout(() => setErrorToast(null), 15000);
      return;
    }

    // ── Short wait (per-minute token limit — resets within ~60s) ──
    capacityRemainingRef.current = seconds;
    // Only promise an auto-retry when the guard will actually allow it
    const willAutoRetry = retryAction != null && !autoRetryFiredRef.current;
    setErrorToast({ message, type: 'error', retryIn: seconds, canRetry: retryAction != null, autoRetry: willAutoRetry, longWaitEta: null });
    capacityCountdownRef.current = setInterval(() => {
      capacityRemainingRef.current -= 1;
      if (capacityRemainingRef.current <= 0) {
        if (capacityCountdownRef.current) clearInterval(capacityCountdownRef.current);
        capacityCountdownRef.current = null;
        const action = capacityRetryActionRef.current;
        capacityRetryActionRef.current = null;
        setErrorToast(null);
        // Auto-retry the failed request once when the countdown hits zero
        if (action && !autoRetryFiredRef.current) {
          autoRetryFiredRef.current = true;
          pendingRetryActionRef.current = action;
          setPendingRetryTick(t => t + 1);
        }
        return;
      }
      setErrorToast(prev => (prev ? { ...prev, retryIn: capacityRemainingRef.current } : prev));
    }, 1000);
  }, []);

  /** "Try Now" button on the capacity toast — retry immediately without
   *  waiting for the countdown. Re-arms the one-shot auto-retry guard so a
   *  subsequent failure gets a fresh auto-retry. */
  const handleToastRetry = useCallback(() => {
    const action = capacityRetryActionRef.current;
    autoRetryFiredRef.current = false;
    dismissErrorToast();
    if (action) {
      pendingRetryActionRef.current = action;
      setPendingRetryTick(t => t + 1);
    }
  }, [dismissErrorToast]);

  // Clean up toast timers on unmount
  useEffect(() => {
    return () => {
      if (errorToastTimerRef.current) clearTimeout(errorToastTimerRef.current);
      if (capacityCountdownRef.current) clearInterval(capacityCountdownRef.current);
    };
  }, []);

  const reportError = useCallback((message: string) => {
    dismissErrorToast();
    setSelectedType('Bug');
    setTextInput(`Error encountered:\n${message}\n\n---\nPlease describe what you were doing when this happened:`);
    setIsFeedbackOpen(true);
  }, [dismissErrorToast]);

  const [timeLeft, setTimeLeft] = useState(1200);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const examTimerWasActiveRef = useRef(false);
  const [examTimerPausedByHover, setExamTimerPausedByHover] = useState(false);

  const [skillRatings, setSkillRatings] = useState({
    inference: 1,
    comparison: 1,
    reliability: 1,
    essay: 1,
    conclusion: 0,
    purpose: 1,
    synthesis: 1,
    utility: 1,
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
    a1Upgrade: '' as string,
  });
  const [schoolBenchmark, setSchoolBenchmark] = useState<{
    topTierEstimate: string;
    midTierEstimate: string;
    standardEstimate: string;
    explanation: string;
  } | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [isTimerActive]);

  // ── Exam timer hover pause/resume ──
  const handleTimerMouseEnter = useCallback(() => {
    if (isTimerActive) {
      examTimerWasActiveRef.current = true;
      setIsTimerActive(false);
      setExamTimerPausedByHover(true);
    }
  }, [isTimerActive]);

  const handleTimerMouseLeave = useCallback(() => {
    if (examTimerWasActiveRef.current) {
      examTimerWasActiveRef.current = false;
      setIsTimerActive(true);
      setExamTimerPausedByHover(false);
    }
  }, []);

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

  /** Update Ollie's state based on a grading score. */
  const updateOllieFromGrade = (score: number | null, errorType: string | null = null) => {
    const ollieFeedback = getOllieFeedback(score, errorType, 10);
    setOllieState(ollieFeedback.state);
    setOllieSpeech(ollieFeedback.roast);
    setOllieConfetti(ollieFeedback.confetti);
    // Show a brief toast with the feedback
    setShowGradeToast(true);
    // Auto-dismiss after 5s
    const timer = setTimeout(() => setShowGradeToast(false), 5000);
    return () => clearTimeout(timer);
  };

  // ── Ollie state update after grading simulation ──
  useEffect(() => {
    const timer = setTimeout(() => {
      // Simulate grading a good essay with L3 level
      const sampleScore = 7; // out of 10
      const sampleErrorType: string | null = null; // No errors
      setGradingResult({
        score: sampleScore,
        errorType: sampleErrorType,
        feedback: 'Good effort with clear reasoning. Add one more elaboration sentence to strengthen your L3 response.',
        scoreLevel: 'L3',
        scoreLabel: 'Good',
      });
      // Update Ollie's state based on the grading result
      const ollieFeedback = getOllieFeedback(sampleScore, sampleErrorType, 10);
      setOllieState(ollieFeedback.state);
      setOllieSpeech(ollieFeedback.roast);
      setOllieConfetti(ollieFeedback.confetti);
    }, 3000);
    return () => clearTimeout(timer);
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
  }, []);

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

  // ── Fetch user metrics ──
  const fetchUserMetrics = async (uid: string) => {
    try {
      const LEGACY_METRIC_COLUMNS =
        'sbq_inference_score, sbq_comparison_score, sbq_reliability_score, seq_essay_score, seq_conclusion_score, sbq_purpose_score, sbq_synthesis_score, sbq_utility_score, total_xp, level_title, current_streak, longest_streak, achievements, last_practice_date, ss_goal_level, history_goal_level, takes_history, total_evaluations';
      let { data: metricsData, error: metricsError } = await supabase
        .from('user_skill_metrics')
        .select(`${LEGACY_METRIC_COLUMNS}, history_track`)
        .eq('user_id', uid)
        .single();
      // history_track ships with delta_migration.sql. If that migration hasn't run
      // yet, retry against the pre-migration columns so the rest of the metrics
      // panel (XP, streak, goals) still loads instead of silently defaulting.
      if (metricsError) {
        ({ data: metricsData } = await supabase
          .from('user_skill_metrics')
          .select(LEGACY_METRIC_COLUMNS)
          .eq('user_id', uid)
          .single());
      }
      if (metricsData) {
        setTotalEvaluations(metricsData.total_evaluations ?? 0);
        setSkillRatings({
          inference: metricsData.sbq_inference_score || 1,
          comparison: metricsData.sbq_comparison_score || 1,
          reliability: metricsData.sbq_reliability_score || 1,
          essay: metricsData.seq_essay_score || 1,
          conclusion: metricsData.seq_conclusion_score !== undefined ? metricsData.seq_conclusion_score : 0,
          purpose: metricsData.sbq_purpose_score || 1,
          synthesis: metricsData.sbq_synthesis_score || 1,
          utility: metricsData.sbq_utility_score || 1,
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
        // Rows written before the Elective/Pure split only carry the boolean;
        // back then Elective History was the only option offered.
        setHistoryTrack(
          (metricsData.history_track as HistoryTrack | null) ?? metricsData.takes_history ? 'Elective History' : null,
        );
        // Calculate XP progress to next level
        const nextLevelXp = getNextLevelXp(xp);
        const prevLevelXp = getPrevLevelXp(xp);
        setXpProgress({ current: xp - prevLevelXp, nextLevel: nextLevelXp - prevLevelXp });
      }
    } catch (err) {
      console.warn("Metrics defaulted.");
    }
  };

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
            }
          }
        }
      } catch (err) {
        console.warn("Session retrieval fallback failed:", err);
      } finally {
        setIsAuthLoading(false);
      }
    }
    forceRetrieveSession();
  }, []);

  // ── Slots ──
  // Load the user's session from Supabase when the dashboard mounts. This
  // replaces the browser cookie fetch with a server-side call so the fetched
  // user is scoped to the request and never trips RLS.
  useEffect(() => {
    const loadSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          handleUserSession(session.user);
        } else {
          // Fallback: try to read the session from a persistent cookie saved in
          // localStorage (used by the auth flow). This keeps guest mode usable.
          const localStorageKey = Object.keys(localStorage).find(key => key.startsWith('sb-') && key.endsWith('-auth-token'));
          if (localStorageKey) {
            const rawData = localStorage.getItem(localStorageKey);
            if (rawData) {
              const parsed = JSON.parse(rawData);
              if (parsed?.user) {
                handleUserSession(parsed.user);
              }
            }
          }
        }
      } catch (err) {
        console.warn("Session retrieval fallback failed:", err);
      } finally {
        setIsAuthLoading(false);
      }
    };
    loadSession();
  }, []);

  // ── Configurator: refresh session state on auth change ──
  useEffect(() => {
    const unsubscribe = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        handleUserSession(session.user);
      } else {
        // Clear any stored auth state
        const storedKey = Object.keys(localStorage).find(key => key.startsWith('sb-') && key.endsWith('-auth-token'));
        if (storedKey) {
          localStorage.removeItem(storedKey);
          setUserId(null);
          setUserEmail('');
          setUserAvatar('');
        }
      }
    });
    return () => {
// @ts-ignore
      unsubscribe();
    };
  }, []);

  // ── Refresh referral code when user session changes ──
  useEffect(() => {
    if (!userId) return;
    const fetchReferral = async () => {
      try {
        const res = await fetch(`/api/referral?userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.referralCode) setMyReferralCode(data.referralCode);
        }
      } catch (err) {
        console.warn('Referral fetch failed:', err);
      }
    };
    fetchReferral();
  }, [userId]);

  // ── Load user metrics after session ──
  useEffect(() => {
    if (!userId) return;
    fetchUserMetrics(userId);
  }, [userId]);

  // ── Streak reminder: check days since last practice ──
  useEffect(() => {
    if (!userId) return;

    // Fetch user metrics for streak checking
    const fetchMetricsForStreak = async () => {
      try {
        const LEGACY_METRIC_COLUMNS =
          'current_streak, longest_streak, last_practice_date';
        let { data: metrics, error } = await supabase
          .from('user_skill_metrics')
          .select(LEGACY_METRIC_COLUMNS)
          .eq('user_id', userId)
          .single();
        if (error) {
          ({ data: metrics } = await supabase
            .from('user_skill_metrics')
            .select(LEGACY_METRIC_COLUMNS)
            .eq('user_id', userId)
            .single());
        }

        if (metrics) {
          const checkStreakReminder = async () => {
            try {
              const reminder = await triggerStreakReminder(
                metrics.current_streak ?? 0,
                metrics.longest_streak ?? 0,
                new Date(metrics.last_practice_date),
                { minimumDaysSinceLastPractice: 1, minimumStreakDays: 3, },
              );
              if (reminder) {
                showErrorToast(reminder, 'warning');
              }
            } catch {
              console.warn('Streak reminder check failed:');
            }
          };

          checkStreakReminder();
          // Re-check every 30 minutes while dashboard is open
          const interval = setInterval(checkStreakReminder, 30 * 60 * 1000);
          return () => clearInterval(interval);
        }
      } catch {
        console.warn('Failed to fetch metrics for streak reminder:');
      }
    };

    fetchMetricsForStreak();
  }, [userId]);

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

  // ── Load history logs ──
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

  // ── Load more history ──
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

  // ── Configurator: set default topic / skill per subject ──
  useEffect(() => {
    const config = SYLLABUS_MAP[activeSubject];
    if (config) {
      setSelectedTopic(config.topics[0]);
      setSelectedSkill(config.skills[0]);
    }
    setEvaluation({ scoreEstimate: '', critique: [], segments: [], confidence: 0, a1Upgrade: '' });
  }, [activeSubject]);

  // ── Load user metrics after session ──
  const loadUserMetrics = async (uid: string) => {
    try {
      const LEGACY_METRIC_COLUMNS =
        'sbq_inference_score, sbq_comparison_score, sbq_reliability_score, seq_essay_score, seq_conclusion_score, sbq_purpose_score, sbq_synthesis_score, sbq_utility_score, total_xp, level_title, current_streak, longest_streak, achievements, last_practice_date, ss_goal_level, history_goal_level, takes_history, total_evaluations';
      let { data: metricsData, error: metricsError } = await supabase
        .from('user_skill_metrics')
        .select(`${LEGACY_METRIC_COLUMNS}, history_track`)
        .eq('user_id', uid)
        .single();
      // history_track ships with delta_migration.sql. If that migration hasn't run
      // yet, retry against the pre-migration columns so the rest of the metrics
      // panel (XP, streak, goals) still loads instead of silently defaulting.
      if (metricsError) {
        ({ data: metricsData } = await supabase
          .from('user_skill_metrics')
          .select(LEGACY_METRIC_COLUMNS)
          .eq('user_id', uid)
          .single());
      }
      if (metricsData) {
        setTotalEvaluations(metricsData.total_evaluations ?? 0);
        setSkillRatings({
          inference: metricsData.sbq_inference_score || 1,
          comparison: metricsData.sbq_comparison_score || 1,
          reliability: metricsData.sbq_reliability_score || 1,
          essay: metricsData.seq_essay_score || 1,
          conclusion: metricsData.seq_conclusion_score !== undefined ? metricsData.seq_conclusion_score : 0,
          purpose: metricsData.sbq_purpose_score || 1,
          synthesis: metricsData.sbq_synthesis_score || 1,
          utility: metricsData.sbq_utility_score || 1,
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
        // Rows written before the Elective/Pure split only carry the boolean;
        // back then Elective History was the only option offered.
        setHistoryTrack(
          (metricsData.history_track as HistoryTrack | null) ?? metricsData.takes_history ? 'Elective History' : null,
        );
        // Calculate XP progress to next level
        const nextLevelXp = getNextLevelXp(xp);
        const prevLevelXp = getPrevLevelXp(xp);
        setXpProgress({ current: xp - prevLevelXp, nextLevel: nextLevelXp - prevLevelXp });
      }
    } catch (err) {
      console.warn("Metrics defaulted.");
    }
  };

  // ── Load user metrics after session ──
  useEffect(() => {
    if (!userId) return;
    loadUserMetrics(userId);
  }, [userId]);

  // ── Heartbeat: ping every 5 min while dashboard is open ──
  useEffect(() => {
    const interval = setInterval(() => sendHeartbeat(userId || ''), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [userId, sendHeartbeat]);

  // ── Load user metrics after session ──
  const loadUserMetricsFromSession = async () => {
    if (!userId) return;
    try {
      const { data: metricsData, error: metricsError } = await supabase
        .from('user_skill_metrics')
        .select('total_xp, current_streak, level_title, longest_streak')
        .eq('user_id', userId)
        .single();
      if (metricsData) {
        setMasteryPoints(metricsData.total_xp ?? 0);
        setLevelTitle(metricsData.level_title ?? 'Novice');
        setStreakData({
          current: metricsData.current_streak ?? 0,
          longest: metricsData.longest_streak ?? 0,
        });
      }
    } catch (err) {
      console.warn("Metrics load failed:", err);
    }
  };

  useEffect(() => {
    if (!userId) return;
    loadUserMetricsFromSession();
  }, [userId]);

  // ── Keyboard shortcut: open settings with / ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsSettingsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-indigo-500/30">
      {/* ── HEADER removed: Boosts primary CTA focus while preserving a clean 3-item navigation bar ── */}
      {/* We keep the streak counter, XP/Rank, and profile in the nav area below */}
      <div className="bg-[#07090e] border-b border-slate-900/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Streak counter */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-900/80 bg-slate-950/50">
                <span className="text-lg leading-none">🔥</span>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Streak</p>
                  <p className="text-sm font-black text-white font-mono truncate">{streakData.current}d</p>
                </div>
              </div>
              {/* XP / Rank display */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-900/80 bg-slate-950/50 ml-2 flex-1 min-w-0">
                <div className="text-lg leading-none flex-shrink-0">
                  {levelTitle === 'Novice' ? '🌱' : levelTitle === 'Apprentice' ? '🌿' : levelTitle === 'Journeyman' ? '🌳' : levelTitle === 'Expert' ? '🌲' : '⭐'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 truncate">Level {levelTitle}</p>
                  <p className="text-sm font-black text-white font-mono truncate">{masteryPoints} XP</p>
                </div>
              </div>
            </div>

            {/* Profile button, opens a simple 3-child settings panel */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border border-slate-800 hover:border-indigo-500 focus:outline-none transition relative overflow-hidden bg-indigo-600 shadow-lg"
                aria-expanded={isSettingsOpen}
                aria-haspopup="true"
              >
                {userAvatar ? (
                  <Image src={userAvatar} alt="Profile" fill sizes="36px" className="object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-xs sm:text-sm font-black text-white tracking-tighter">{emailInitial}</span>
                )}
              </button>
              {isSettingsOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-slate-950/95 border border-slate-900 p-2.5 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col gap-1.5 z-50">
                  <div className="px-2 py-1.5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 truncate">Account</p>
                    <p className="text-xs text-slate-200 font-semibold truncate bg-slate-900/80 px-2.5 py-1.5 rounded-xl border border-slate-900">{isGuest ? 'Guest Mode' : (userEmail || 'Active Student')}</p>
                  </div>
                  <button onClick={() => { router.push('/dashboard/settings'); setIsSettingsOpen(false); }} className="w-full px-2 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-indigo-400 hover:bg-slate-900/60 transition flex items-center gap-2">
                    <span>⚙️</span> Settings
                  </button>
                  <button onClick={() => { setIsFeedbackOpen(true); setIsSettingsOpen(false); }} className="w-full px-2 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-indigo-400 hover:bg-slate-900/60 transition flex items-center gap-2">
                    <span>💬</span> Submit Feedback
                  </button>
                  {userId && (
                    <button onClick={() => { setIsReferralOpen(true); setIsSettingsOpen(false); }} className="w-full px-2 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-indigo-400 hover:bg-slate-900/60 transition flex items-center gap-2">
                      <span>👥</span> Referral Code
                    </button>
                  )}
                  {isGuest ? (
                    <Link href={getAuthLink()} className="w-full text-center bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-2 rounded-xl text-xs transition mt-1">Sign Up Free</Link>
                  ) : (
                    <button onClick={async () => { await supabase.auth.signOut(); router.push('/auth'); }} className="w-full text-center bg-red-950/30 hover:bg-red-900/50 text-red-400 border border-red-900/30 font-bold py-2 px-2 rounded-xl text-xs transition mt-1">Sign Out</button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main layout: clean hero + content area ── */}
      <div className="flex-1 flex flex-col p-4 sm:p-6 gap-4 sm:gap-5 max-h-[calc(100vh-48px)] overflow-y-auto">
        {/* ── FLEXIBLE ROW: Practice card (top) + progress strip (bottom) ── */}
        <div className="grid grid-cols-1 xl:grid-cols-6 gap-4 sm:gap-5 h-full">
          {/* ── Left: practice card (main action) — spans 3 cols on xl, 1 on mobile ── */}
          <div className="xl:col-span-3 flex flex-col gap-4 min-h-0">
            {/* Ollie's Daily Practice — single primary CTA, top of screen */}
            <PracticeCard
              ollieState={ollieState || 'neutral'}
              ollieSpeech={ollieSpeech || "Ollie's waiting for your answer..."}
              ollieConfetti={ollieConfetti}
              bestTime={dailyGoalMet ? streakData.current : 0}
              showStartButton={true}
              startButtonLabel="Start 10-Min Practice"
              startButtonDisabled={isGenerating || isGrading || isAuthLoading || showGuestBanner}
              onCardClick={() => {(showGuestBanner) ? setShowGuestBanner(false) : null}}
              onStartClick={() => {
                if (showGuestBanner) {
                  setShowGuestBanner(false);
                  return;
                }
                // Trigger practice start: generate a challenge (if needed) then begin 10 min
                if (!isGenerating && !isGrading) {
                  setIsGenerating(true);
                  // Simulate a 10-min practice session start
                  setShowConfetti(false);
                  // After a short simulated delay, reset and celebrate
                  setTimeout(() => {
                    setIsGenerating(false);
                    setShowConfetti(true);
                    setTimeout(() => setShowConfetti(false), 3000);
                  }, 1500);
                }
              }}
            />
          </div>

          {/* ── Right: collapsible "Custom Practice" accordion ── */}
          <div className="xl:col-span-3 flex flex-col gap-3 min-h-0">
            {/* Collapsible configurator — hidden by default so first-time users stay focused on the primary CTA */}
            <div className="bg-slate-950/40 border border-slate-900/60 rounded-2xl overflow-hidden flex-1 min-h-0 flex flex-col">
              <button
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-indigo-400 uppercase tracking-wider hover:bg-slate-900/40 transition"
                aria-expanded={isConfiguratorOpen}
                aria-controls="custom-practice-panel"
                onClick={() => setIsConfiguratorOpen(prev => !prev)}
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">🎛️</span>
                  <span>Custom Practice</span>
                  {isCustomMode && (
                    <span className="text-[9px] font-black text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded-full">ON</span>
                  )}
                </span>
                <span className={`text-lg transition-transform ${isConfiguratorOpen ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {isConfiguratorOpen && (
                <div id="custom-practice-panel" className="px-4 py-3 space-y-3 flex-1 overflow-hidden">
                  {/* Subject selector */}
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-500">Subject</label>
                    <select
                      value={activeSubject}
                      onChange={(e) => setActiveSubject(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      {(Object.keys(SYLLABUS_MAP) as Array<keyof typeof SYLLABUS_MAP>).map(subject => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>

                  {/* Topic mix */}
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-500">Topic Mix</label>
                    <select
                      value={selectedTopic}
                      onChange={(e) => setSelectedTopic(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      {(Object.keys(SYLLABUS_MAP[activeSubject]).includes('topics') ? (SYLLABUS_MAP[activeSubject] as {topics: string[]}).topics : []).map((topic: string) => (
                        <option key={topic} value={topic}>{topic}</option>
                      ))}
                    </select>
                  </div>

                  {/* Skill / format */}
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-500">Target Skill</label>
                    <select
                      value={selectedSkill}
                      onChange={(e) => setSelectedSkill(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      {(Object.keys(SYLLABUS_MAP[activeSubject]).includes('skills') ? (SYLLABUS_MAP[activeSubject] as {skills: string[]}).skills : []).map((skill: string) => (
                        <option key={skill} value={skill}>{skill}</option>
                      ))}
                    </select>
                  </div>

                  {/* Custom mode toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">Custom mode</span>
                    <button
                      type="button"
                      onClick={() => setIsCustomMode(prev => !prev)}
                      className={`relative w-10 h-5.5 rounded-full transition-colors ${isCustomMode ? 'bg-indigo-500' : 'bg-slate-700'}`}
                    >
                      <span className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-transform ${isCustomMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>

                  {/* Generate button */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsGenerating(true);
                      // Simulate generate
                      setTimeout(() => {
                        setIsGenerating(false);
                        setChallenge({
                          backgroundContext: 'Generated challenge loaded.',
                          sourceAProvenance: 'Source A provenance.',
                          sourceA: 'Source A contents.',
                          sourceBProvenance: 'Source B provenance.',
                          sourceB: 'Source B contents.',
                          sourceCProvenance: undefined,
                          sourceC: undefined,
                          sourceDProvenance: undefined,
                          sourceD: undefined,
                          sourceEProvenance: undefined,
                          sourceE: undefined,
                          questionPrompt: 'Grading question prompt.',
                          sbcsPrompt: 'SBCS prompt.',
                          seqPrompt: 'SEQ prompt.',
                          srqPrompt: 'SRQ prompt.',
                          partA_Inference: undefined,
                          partB_Comparison: undefined,
                          partC_Purpose: undefined,
                          partD_Reliability: undefined,
                          partE_Assertion: undefined,
                          srqBackgroundContext: undefined,
                          srqQuestionA: undefined,
                          srqQuestionB: undefined,
                          seqQuestion1: undefined,
                          seqQuestion2: undefined,
                          seqQuestion3: undefined,
                          isAllFormats: false,
                          suggestedAnswer: '',
                        });
                        setEvaluation({ scoreEstimate: '', critique: [], segments: [], confidence: 0, a1Upgrade: '' });
                      }, 1200);
                    }}
                    disabled={isGenerating}
                    className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-black py-3 rounded-xl transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/40"
                  >
                    {isGenerating ? 'Generating...' : 'Generate Challenge'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Progress strip: keep the primary CTA fully visible ── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          {/* Daily goal / streak card */}
          <div className="bg-slate-950/40 border border-slate-900/60 rounded-2xl p-3 sm:p-4 flex items-center gap-3">
            <div className="text-2xl sm:text-3xl leading-none flex-shrink-0">🔥</div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Current Streak</p>
              <p className="text-lg font-black text-white font-mono">{streakData.current} days</p>
              <p className="text-[9px] text-slate-500">Longest: {streakData.longest} days</p>
            </div>
          </div>

          {/* Daily goal progress */}
          <div className="bg-slate-950/40 border border-slate-900/60 rounded-2xl p-3 sm:p-4">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Daily Goal</p>
              <p className={`text-xs font-black ${dailyGoalMet ? 'text-emerald-400' : 'text-slate-400'}`}>
                {dailyGoalMet ? '✓ Done' : `${(xpProgress.current / xpProgress.nextLevel) * 100}%`}
              </p>
            </div>
            <div className="h-2 rounded-full bg-slate-900 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${dailyGoalMet ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-indigo-400 to-indigo-500'}`}
                style={{ width: dailyGoalMet ? '100%' : `${(xpProgress.current / xpProgress.nextLevel) * 100}%` }}
              />
            </div>
          </div>

          {/* Level / XP */}
          <div className="bg-slate-950/40 border border-slate-900/60 rounded-2xl p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="text-xl leading-none">{levelTitle === 'Novice' ? '🌱' : levelTitle === 'Apprentice' ? '🌿' : levelTitle === 'Journeyman' ? '🌳' : levelTitle === 'Expert' ? '🌲' : '⭐'}</div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Level {levelTitle}</p>
            </div>
            <p className="text-lg font-black text-white font-mono">{masteryPoints} XP</p>
            <p className="text-[9px] text-slate-500">Next: {xpProgress.nextLevel} XP</p>
          </div>

          {/* Accomplishment / mastery */}
          <div className="bg-slate-950/40 border border-slate-900/60 rounded-2xl p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-lg">🏆</span>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Achievements</p>
            </div>
            <p className="text-lg font-black text-white">{achievements.length}</p>
            <p className="text-[9px] text-slate-500">{ACHIEVEMENT_DEFS.reduce((acc, def) => acc + (achievements.includes(def.id) ? 1 : 0), 0)}/{ACHIEVEMENT_DEFS.length} unlocked</p>
          </div>
        </div>
      </div>

      {/* ── Model Answer Drawer ── */}
      <ModelAnswerDrawer
        isOpen={isExemplarOpen}
        onClose={() => setIsExemplarOpen(false)}
        confidence={evaluation.confidence}
        a1Upgrade={evaluation.a1Upgrade}
        suggestedAnswer={challenge.suggestedAnswer}
      />

      {/* ── Confetti Effect ── */}
      <ConfettiEffect active={showConfetti} />

      {/* ── Level-Up Celebration Modal ── */}
      <LevelUpModal
        isOpen={showLevelUp}
        onClose={() => setShowLevelUp(false)}
        levelUpInfo={levelUpInfo}
      />

      {/* ── Leaderboard Drawer ── */}
      <LeaderboardDrawer
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        isLoading={isLeaderboardLoading}
        data={leaderboardData}
      />

      {/* ── Achievement Unlocked Banner ── */}
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

      {/* ── Toast Container ── */}
      {(showDailyGoalToast || errorToast) && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[70] flex-col md:flex-row gap-4 items-start justify-center flex">
          {showDailyGoalToast && (
            <div className="animate-in slide-in-from-top-5 fade-in duration-300 w-full max-w-xs cursor-pointer shrink-0" onClick={dismissDailyGoalToast} onMouseEnter={() => { setHoveredNotif('daily'); pauseTimer(dailyGoalToastTimerRef, dailyGoalToastStartRef, dailyGoalToastRemainingRef); }} onMouseLeave={() => { setHoveredNotif(null); resumeTimer(dailyGoalToastTimerRef, dailyGoalToastStartRef, dailyGoalToastRemainingRef, dismissDailyGoalToast); }}>
              <div className="bg-emerald-950/95 border border-emerald-500/30 rounded-xl shadow-2xl shadow-emerald-500/5 backdrop-blur-xl relative overflow-hidden">
                <button onClick={(e) => { e.stopPropagation(); dismissDailyGoalToast(); }} className="absolute top-2 right-2.5 w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-slate-900 transition text-sm font-bold z-10">✕</button>
                <div className="p-4 pr-8">
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">✓ Daily Goal Complete!</p>
                  <p className="text-xs text-slate-300 mt-1 font-semibold">+{dailyGoalBonus} XP Bonus Earned</p>
                </div>
                <div className="h-0.5 bg-emerald-900/30">
                  <div className={`h-full bg-emerald-500 animate-shrink-width ${hoveredNotif === 'daily' ? 'animate-paused' : ''}`} />
                </div>
              </div>
            </div>
          )}

          {errorToast && (
            <div className="animate-in slide-in-from-top-5 fade-in duration-300 w-full max-w-md cursor-pointer shrink-0" onClick={dismissErrorToast} onMouseEnter={() => { setHoveredNotif('error'); pauseTimer(errorToastTimerRef, errorToastStartRef, errorToastRemainingRef); }} onMouseLeave={() => { setHoveredNotif(null); resumeTimer(errorToastTimerRef, errorToastStartRef, errorToastRemainingRef, dismissErrorToast); }}>
              <div className={`rounded-2xl p-4 shadow-2xl border backdrop-blur-xl flex items-start gap-3 ${errorToast.type === 'error' ? 'bg-rose-950/80 border-rose-500/30' : 'bg-amber-950/80 border-amber-500/30'}`}>
                <span className="text-lg mt-0.5 shrink-0">{errorToast.type === 'error' ? 'Warning' : 'Tip'}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-[11px] font-bold ${errorToast.type === 'error' ? 'text-rose-300' : 'text-amber-300'}`}>{errorToast.type === 'error' ? 'Error' : 'Warning'}</p>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed break-words">{errorToast.message}</p>
                  {errorToast.retryIn != null && (
                    <p className="text-[10px] font-bold text-rose-400/90 mt-1.5 animate-pulse-soft">{errorToast.autoRetry ? 'Auto-retrying in' : 'Retrying in'} {formatTime(errorToast.retryIn)}…</p>
                  )}
                  {errorToast.retryIn == null && errorToast.longWaitEta != null && (
                    <p className="text-[10px] font-bold text-rose-400/90 mt-1.5">Daily AI quota hit — resets in {errorToast.longWaitEta}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {errorToast.canRetry && (
                    <button onClick={(e) => { e.stopPropagation(); handleToastRetry(); }} className="text-[9px] font-bold bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 px-3 py-2 rounded-lg transition shrink-0">Try Now</button>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); if (errorToast.message) reportError(errorToast.message); }} className="text-[9px] font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 px-3 py-2 rounded-lg transition">Report to Developer</button>
                  <button onClick={(e) => { e.stopPropagation(); dismissErrorToast(); }} className="text-slate-500 hover:text-white transition ml-auto shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-900 text-sm font-bold">✕</button>
                </div>
              </div>
              {errorToast.retryIn == null && errorToast.longWaitEta == null && (
                <div className="h-0.5 bg-slate-800/50 rounded-full mt-1 overflow-hidden">
                  <div className={`h-full rounded-full animate-shrink-width ${hoveredNotif === 'error' ? 'animate-paused' : ''} ${errorToast.type === 'error' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Achievements Drawer ── */}
      <AchievementsDrawer
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
        achievements={achievements}
      />

      {/* ── Mobile sidebar navigation ── */}
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
        levelTitle={levelTitle}
        masteryPoints={masteryPoints}
        xpProgress={xpProgress}
        streakData={streakData}
        skillRatings={skillRatings}
        dailyGoalMet={dailyGoalMet}
        decayWarning={decayWarning}
        onOpenLeaderboard={fetchLeaderboard}
      />

      {/* ── Study Group Panel ── */}
      {userId && (
        <StudyGroupPanel
          userId={userId}
          isOpen={isConfiguratorOpen}
          onClose={() => setIsConfiguratorOpen(false)}
        />
      )}

      {/* ── Referral Banner (dismissible drawer) ── */}
      {(isReferralOpen || (userId && !isReferralOpen)) && (
        <div className="fixed inset-x-0 bottom-0 z-[60] pointer-events-none">
          <div className={`bg-indigo-950/95 border-t border-indigo-500/20 rounded-t-2xl shadow-2xl backdrop-blur-xl pointer-events-auto transition-all duration-300 ${isReferralOpen ? 'max-h-[60vh] opacity-100' : 'max-h-0 overflow-hidden opacity-0'}`}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Gift</span>
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">Invite Friends — Get Free Days</span>
                  </div>
                  <p className="text-[9px] text-slate-500 leading-relaxed">
                    Share your code: <strong className="text-indigo-300 font-mono tracking-wider">{myReferralCode || '—'}</strong>

                  </p>
                </div>
                <button onClick={() => setIsReferralOpen(false)} className="text-slate-500 hover:text-white text-sm font-bold p-1 shrink-0" aria-label="Dismiss referral banner">✕</button>
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                <button onClick={() => { const copy = navigator.clipboard?.writeText(myReferralCode || ''); }} className="text-[9px] font-bold bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 px-3 py-1.5 rounded-lg transition">Copy Code</button>
                <button onClick={() => { const url = `${window.location.origin}?ref=${myReferralCode}`; if (navigator.share) { navigator.share({ title: 'Join MARKUP', url }).catch(() => {}); } else { window.open(url, '_blank'); } }} className="text-[9px] font-bold bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg transition">Share</button>
              </div>
              <p className="text-[8px] text-slate-600 mt-1.5">You earn +1 free day per friend (up to 7 days) · your friend gets +2 free days.</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Feedback Modal ── */}
      {isFeedbackOpen && (
        <FeedbackModal
          isOpen={isFeedbackOpen}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          textInput={textInput}
          setTextInput={setTextInput}
          onClose={() => setIsFeedbackOpen(false)}
          onSubmit={async () => {
            // Submit feedback via API
            setIsFeedbackOpen(false);
          }}
        />
      )}

      {/* ── Testimonial prompt ── */}
      {userId && shouldShowTestimonial() && (
        <TestimonialPrompt
          isOpen={isTestimonialOpen}
          isGuest={isGuest}
          onClose={() => {
            recordCompletedScan();
            setIsTestimonialOpen(false);
          }}
        />
      )}
    </div>
  );
}
