-- ============================================================
-- MARKUP – Final schema (Beta build)
-- Run on a fresh DB or migrate manually (DROP existing public tables first).
-- ============================================================

-- Drop old objects in dependency-safe order, so this file is idempotent
-- on a beta instance where the prior schema may exist.
DROP TABLE IF EXISTS public.essay_evaluations CASCADE;
DROP TABLE IF EXISTS public.student_submissions   CASCADE;
DROP TABLE IF EXISTS public.practice_history      CASCADE;
DROP TABLE IF EXISTS public.user_skill_metrics    CASCADE;
DROP TABLE IF EXISTS public.user_feedback         CASCADE;
DROP TABLE IF EXISTS public.user_profiles         CASCADE;
DROP TABLE IF EXISTS public.profiles              CASCADE;
DROP TABLE IF EXISTS public.generated_questions   CASCADE;

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP TRIGGER  IF EXISTS on_auth_user_created     ON auth.users;

-- ============================================================
-- 1. user_profiles  (replaces the legacy `profiles` table)
-- ============================================================
CREATE TABLE public.user_profiles (
    id                  UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    full_name           TEXT,
    email_address       TEXT,
    avatar_url          TEXT,
    stripe_customer_id  TEXT,
    subscription_tier   TEXT DEFAULT 'free'
        CHECK (subscription_tier IN (
            'free',
            'student_monthly',
            'student_academic',
            'tuition_cohort'
        )),
    selected_plan       TEXT DEFAULT 'Free'
        CHECK (selected_plan IN (
            'Free',
            'Student Monthly',
            'Student Academic Pass',
            'Tuition Cohort Pass'
        )),
    billing_rate        NUMERIC(10, 2) DEFAULT 0,
    account_status      TEXT DEFAULT 'Active',
    is_admin            BOOLEAN DEFAULT FALSE
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to read their own profile"
    ON public.user_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Allow users to update their own profile"
    ON public.user_profiles FOR UPDATE
    USING (auth.uid() = id);

-- Reads admin flag from the JWT directly to avoid RLS recursion.
-- Mirrors the same check in middleware.ts and app/admin/analytics/page.tsx.
CREATE POLICY "Allow admins to read all profiles"
    ON public.user_profiles FOR SELECT
    USING (
        auth.jwt() -> 'app_metadata' ->> 'is_admin' = 'true'
        OR auth.jwt() -> 'user_metadata' ->> 'is_admin' = 'true'
    );

-- ============================================================
-- 2. generated_questions  (AI question packets)
-- ============================================================
CREATE TABLE public.generated_questions (
    id                 UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at         TIMESTAMP WITH TIME ZONE
        DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id            UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    subject            TEXT NOT NULL,
    topic              TEXT NOT NULL,
    question_type      TEXT NOT NULL,
    background_context TEXT NOT NULL,
    source_a           TEXT NOT NULL,
    source_b           TEXT NOT NULL,
    question_prompt    TEXT NOT NULL,
    suggested_answer   TEXT
);

ALTER TABLE public.generated_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated insert generated_questions"
    ON public.generated_questions FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Allow owner read generated_questions"
    ON public.generated_questions FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

-- ============================================================
-- 3. essay_evaluations  (replaces `student_submissions`)
-- ============================================================
CREATE TABLE public.essay_evaluations (
    id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at        TIMESTAMP WITH TIME ZONE
        DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id           UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    question_id       UUID REFERENCES public.generated_questions(id) ON DELETE SET NULL,
    subject           TEXT,
    topic             TEXT,
    question_type     TEXT,
    student_essay     TEXT NOT NULL,
    score_estimate    TEXT NOT NULL,
    point_status      TEXT,
    evidence_status   TEXT,
    critique          JSONB NOT NULL,
    critique_bullets  JSONB,
    highlighted_segments JSONB,
    a1_upgrade        TEXT,
    sbcs_answer       TEXT,
    seq_answer        TEXT,
    srq_answer        TEXT,
    confidence_score   DOUBLE PRECISION
);

ALTER TABLE public.essay_evaluations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow owner insert essay_evaluations"
    ON public.essay_evaluations FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Allow owner read essay_evaluations"
    ON public.essay_evaluations FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

-- ============================================================
-- 4. practice_history  (sidebar list of past papers)
-- ============================================================
CREATE TABLE public.practice_history (
    id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at        TIMESTAMP WITH TIME ZONE
        DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id           UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subject           TEXT NOT NULL,
    topic             TEXT NOT NULL,
    question_type     TEXT NOT NULL,
    question_prompt   TEXT NOT NULL,
    background_context TEXT,
    source_a          TEXT,
    source_a_provenance TEXT,
    source_b          TEXT,
    source_b_provenance TEXT,
    suggested_answer  TEXT
);

CREATE INDEX practice_history_user_idx
    ON public.practice_history (user_id, created_at DESC);

ALTER TABLE public.practice_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow owner CRUD practice_history"
    ON public.practice_history FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 5. user_skill_metrics  (5-band mastery radar)
-- ============================================================
CREATE TABLE public.user_skill_metrics (
    id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    updated_at          TIMESTAMP WITH TIME ZONE
        DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id             UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    sbq_inference_score INTEGER DEFAULT 1,
    sbq_comparison_score INTEGER DEFAULT 1,
    sbq_reliability_score INTEGER DEFAULT 1,
    seq_essay_score     INTEGER DEFAULT 1,
    seq_conclusion_score INTEGER DEFAULT 0,
    -- Gamification
    total_xp            INTEGER DEFAULT 0,
    level_title         TEXT DEFAULT 'Novice',
    last_practice_date  DATE,
    current_streak      INTEGER DEFAULT 0,
    longest_streak      INTEGER DEFAULT 0,
    achievements        TEXT[] DEFAULT '{}',
    total_evaluations   INTEGER DEFAULT 0,
    total_xp_decayed    INTEGER DEFAULT 0,
    last_decay_check_date DATE,
    -- Exam goals (per-subject)
    exam_goal_level     TEXT,
    exam_date           DATE,
    ss_goal_level       TEXT,
    history_goal_level  TEXT,
    takes_history       BOOLEAN DEFAULT FALSE
);

ALTER TABLE public.user_skill_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow owner read user_skill_metrics"
    ON public.user_skill_metrics FOR SELECT
    USING (auth.uid() = user_id);
CREATE POLICY "Allow owner upsert user_skill_metrics"
    ON public.user_skill_metrics FOR INSERT
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow owner update user_skill_metrics"
    ON public.user_skill_metrics FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================================
-- 6. user_feedback  (feedback modal submissions)
-- ============================================================
CREATE TABLE public.user_feedback (
    id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at    TIMESTAMP WITH TIME ZONE
        DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email    TEXT,
    feedback_type TEXT DEFAULT 'General',
    description   TEXT NOT NULL
);

ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;
-- Anyone can submit feedback (anonymous-friendly beta behaviour).
CREATE POLICY "Allow public insert user_feedback"
    ON public.user_feedback FOR INSERT
    WITH CHECK (true);
-- Only admins can read feedback for triage.
CREATE POLICY "Allow admin read user_feedback"
    ON public.user_feedback FOR SELECT
    USING (
        auth.jwt() -> 'app_metadata' ->> 'is_admin' = 'true'
        OR auth.jwt() -> 'user_metadata' ->> 'is_admin' = 'true'
    );

-- ============================================================
-- 7. handle_new_user trigger – seeds a profile row on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (
      id,
      full_name,
      email_address,
      avatar_url,
      selected_plan,
      subscription_tier,
      account_status
  )
  VALUES (
      new.id,
      new.raw_user_meta_data->>'full_name',
      new.email,
      new.raw_user_meta_data->>'avatar_url',
      'Free',
      'free',
      'Active'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_skill_metrics (user_id)
  VALUES (new.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
