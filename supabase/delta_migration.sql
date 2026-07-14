-- ============================================================
-- MARKUP – Delta migration (bulletproof)
-- Every CREATE TABLE IF NOT EXISTS is followed by
-- ALTER TABLE ... ADD COLUMN IF NOT EXISTS for every column.
-- This ensures columns exist even if a previous partial run
-- created the table without them.
-- ============================================================

-- ============================================================
-- 1. user_profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY
);

ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS updated_at          TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS full_name           TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS email_address       TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS avatar_url          TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS stripe_customer_id  TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS subscription_tier   TEXT DEFAULT 'free';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS selected_plan       TEXT DEFAULT 'Free';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS billing_rate        NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS account_status      TEXT DEFAULT 'Active';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS is_admin            BOOLEAN DEFAULT FALSE;

-- Don't re-add FK if table already had it
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'user_profiles_id_fkey'
    ) THEN
        ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_id_fkey
            FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow users to read their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow admins to read all profiles" ON public.user_profiles;

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
-- 2. generated_questions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.generated_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY
);

ALTER TABLE public.generated_questions ADD COLUMN IF NOT EXISTS created_at         TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
ALTER TABLE public.generated_questions ADD COLUMN IF NOT EXISTS user_id            UUID;
ALTER TABLE public.generated_questions ADD COLUMN IF NOT EXISTS subject            TEXT NOT NULL DEFAULT '';
ALTER TABLE public.generated_questions ADD COLUMN IF NOT EXISTS topic              TEXT NOT NULL DEFAULT '';
ALTER TABLE public.generated_questions ADD COLUMN IF NOT EXISTS question_type      TEXT NOT NULL DEFAULT '';
ALTER TABLE public.generated_questions ADD COLUMN IF NOT EXISTS background_context TEXT NOT NULL DEFAULT '';
ALTER TABLE public.generated_questions ADD COLUMN IF NOT EXISTS source_a           TEXT NOT NULL DEFAULT '';
ALTER TABLE public.generated_questions ADD COLUMN IF NOT EXISTS source_b           TEXT NOT NULL DEFAULT '';
ALTER TABLE public.generated_questions ADD COLUMN IF NOT EXISTS question_prompt    TEXT NOT NULL DEFAULT '';
ALTER TABLE public.generated_questions ADD COLUMN IF NOT EXISTS suggested_answer   TEXT;

-- Fix NOT NULL on existing columns (if table had them, they can't be NULL anyway)
ALTER TABLE public.generated_questions ALTER COLUMN subject            SET NOT NULL;
ALTER TABLE public.generated_questions ALTER COLUMN topic              SET NOT NULL;
ALTER TABLE public.generated_questions ALTER COLUMN question_type      SET NOT NULL;
ALTER TABLE public.generated_questions ALTER COLUMN background_context SET NOT NULL;
ALTER TABLE public.generated_questions ALTER COLUMN source_a           SET NOT NULL;
ALTER TABLE public.generated_questions ALTER COLUMN source_b           SET NOT NULL;
ALTER TABLE public.generated_questions ALTER COLUMN question_prompt    SET NOT NULL;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'generated_questions_user_id_fkey'
    ) THEN
        ALTER TABLE public.generated_questions ADD CONSTRAINT generated_questions_user_id_fkey
            FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
END $$;

ALTER TABLE public.generated_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated insert generated_questions" ON public.generated_questions;
DROP POLICY IF EXISTS "Allow owner read generated_questions" ON public.generated_questions;
CREATE POLICY "Allow authenticated insert generated_questions"
    ON public.generated_questions FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Allow owner read generated_questions"
    ON public.generated_questions FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

-- ============================================================
-- 3. essay_evaluations
-- ============================================================
CREATE TABLE IF NOT EXISTS public.essay_evaluations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY
);

ALTER TABLE public.essay_evaluations ADD COLUMN IF NOT EXISTS created_at            TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
ALTER TABLE public.essay_evaluations ADD COLUMN IF NOT EXISTS user_id               UUID;
ALTER TABLE public.essay_evaluations ADD COLUMN IF NOT EXISTS question_id           UUID;
ALTER TABLE public.essay_evaluations ADD COLUMN IF NOT EXISTS subject               TEXT;
ALTER TABLE public.essay_evaluations ADD COLUMN IF NOT EXISTS topic                 TEXT;
ALTER TABLE public.essay_evaluations ADD COLUMN IF NOT EXISTS question_type         TEXT;
ALTER TABLE public.essay_evaluations ADD COLUMN IF NOT EXISTS student_essay         TEXT NOT NULL DEFAULT '';
ALTER TABLE public.essay_evaluations ADD COLUMN IF NOT EXISTS score_estimate        TEXT NOT NULL DEFAULT '';
ALTER TABLE public.essay_evaluations ADD COLUMN IF NOT EXISTS point_status          TEXT;
ALTER TABLE public.essay_evaluations ADD COLUMN IF NOT EXISTS evidence_status       TEXT;
ALTER TABLE public.essay_evaluations ADD COLUMN IF NOT EXISTS critique              JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.essay_evaluations ADD COLUMN IF NOT EXISTS critique_bullets      JSONB;
ALTER TABLE public.essay_evaluations ADD COLUMN IF NOT EXISTS highlighted_segments  JSONB;
ALTER TABLE public.essay_evaluations ADD COLUMN IF NOT EXISTS a1_upgrade            TEXT;
ALTER TABLE public.essay_evaluations ADD COLUMN IF NOT EXISTS sbcs_answer           TEXT;
ALTER TABLE public.essay_evaluations ADD COLUMN IF NOT EXISTS seq_answer            TEXT;
ALTER TABLE public.essay_evaluations ADD COLUMN IF NOT EXISTS srq_answer            TEXT;
ALTER TABLE public.essay_evaluations ADD COLUMN IF NOT EXISTS confidence_score      DOUBLE PRECISION;

ALTER TABLE public.essay_evaluations ALTER COLUMN student_essay  SET NOT NULL;
ALTER TABLE public.essay_evaluations ALTER COLUMN score_estimate SET NOT NULL;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'essay_evaluations_user_id_fkey'
    ) THEN
        ALTER TABLE public.essay_evaluations ADD CONSTRAINT essay_evaluations_user_id_fkey
            FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'essay_evaluations_question_id_fkey'
    ) THEN
        ALTER TABLE public.essay_evaluations ADD CONSTRAINT essay_evaluations_question_id_fkey
            FOREIGN KEY (question_id) REFERENCES public.generated_questions(id) ON DELETE SET NULL;
    END IF;
END $$;

ALTER TABLE public.essay_evaluations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow owner insert essay_evaluations" ON public.essay_evaluations;
DROP POLICY IF EXISTS "Allow owner read essay_evaluations" ON public.essay_evaluations;
CREATE POLICY "Allow owner insert essay_evaluations"
    ON public.essay_evaluations FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Allow owner read essay_evaluations"
    ON public.essay_evaluations FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

-- ============================================================
-- 4. practice_history
-- ============================================================
CREATE TABLE IF NOT EXISTS public.practice_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY
);

ALTER TABLE public.practice_history ADD COLUMN IF NOT EXISTS created_at            TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
ALTER TABLE public.practice_history ADD COLUMN IF NOT EXISTS user_id               UUID;
ALTER TABLE public.practice_history ADD COLUMN IF NOT EXISTS subject               TEXT NOT NULL DEFAULT '';
ALTER TABLE public.practice_history ADD COLUMN IF NOT EXISTS topic                 TEXT NOT NULL DEFAULT '';
ALTER TABLE public.practice_history ADD COLUMN IF NOT EXISTS question_type         TEXT NOT NULL DEFAULT '';
ALTER TABLE public.practice_history ADD COLUMN IF NOT EXISTS question_prompt       TEXT NOT NULL DEFAULT '';
ALTER TABLE public.practice_history ADD COLUMN IF NOT EXISTS background_context    TEXT;
ALTER TABLE public.practice_history ADD COLUMN IF NOT EXISTS source_a              TEXT;
ALTER TABLE public.practice_history ADD COLUMN IF NOT EXISTS source_a_provenance   TEXT;
ALTER TABLE public.practice_history ADD COLUMN IF NOT EXISTS source_b              TEXT;
ALTER TABLE public.practice_history ADD COLUMN IF NOT EXISTS source_b_provenance   TEXT;
ALTER TABLE public.practice_history ADD COLUMN IF NOT EXISTS suggested_answer      TEXT;

ALTER TABLE public.practice_history ALTER COLUMN subject         SET NOT NULL;
ALTER TABLE public.practice_history ALTER COLUMN topic           SET NOT NULL;
ALTER TABLE public.practice_history ALTER COLUMN question_type   SET NOT NULL;
ALTER TABLE public.practice_history ALTER COLUMN question_prompt SET NOT NULL;

CREATE INDEX IF NOT EXISTS practice_history_user_idx
    ON public.practice_history (user_id, created_at DESC);

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'practice_history_user_id_fkey'
    ) THEN
        ALTER TABLE public.practice_history ADD CONSTRAINT practice_history_user_id_fkey
            FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

ALTER TABLE public.practice_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow owner CRUD practice_history" ON public.practice_history;
CREATE POLICY "Allow owner CRUD practice_history"
    ON public.practice_history FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 5. user_skill_metrics
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_skill_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY
);

ALTER TABLE public.user_skill_metrics ADD COLUMN IF NOT EXISTS updated_at            TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
ALTER TABLE public.user_skill_metrics ADD COLUMN IF NOT EXISTS user_id               UUID;
ALTER TABLE public.user_skill_metrics ADD COLUMN IF NOT EXISTS sbq_inference_score   INTEGER DEFAULT 1;
ALTER TABLE public.user_skill_metrics ADD COLUMN IF NOT EXISTS sbq_comparison_score  INTEGER DEFAULT 1;
ALTER TABLE public.user_skill_metrics ADD COLUMN IF NOT EXISTS sbq_reliability_score INTEGER DEFAULT 1;
ALTER TABLE public.user_skill_metrics ADD COLUMN IF NOT EXISTS seq_essay_score       INTEGER DEFAULT 1;
ALTER TABLE public.user_skill_metrics ADD COLUMN IF NOT EXISTS seq_conclusion_score  INTEGER DEFAULT 0;

-- ════════════════════════════════════════════════════════════
--  Gamification columns
-- ════════════════════════════════════════════════════════════
ALTER TABLE public.user_skill_metrics ADD COLUMN IF NOT EXISTS total_xp          INTEGER DEFAULT 0;
ALTER TABLE public.user_skill_metrics ADD COLUMN IF NOT EXISTS level_title       TEXT DEFAULT 'Novice';
ALTER TABLE public.user_skill_metrics ADD COLUMN IF NOT EXISTS last_practice_date DATE;
ALTER TABLE public.user_skill_metrics ADD COLUMN IF NOT EXISTS current_streak    INTEGER DEFAULT 0;
ALTER TABLE public.user_skill_metrics ADD COLUMN IF NOT EXISTS longest_streak    INTEGER DEFAULT 0;

-- Ensure UNIQUE on user_id (for ON CONFLICT in seed query)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class WHERE relname = 'user_skill_metrics_user_id_key' AND relkind = 'i'
    ) THEN
        ALTER TABLE public.user_skill_metrics ADD CONSTRAINT user_skill_metrics_user_id_key UNIQUE (user_id);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'user_skill_metrics_user_id_fkey'
    ) THEN
        ALTER TABLE public.user_skill_metrics ADD CONSTRAINT user_skill_metrics_user_id_fkey
            FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

ALTER TABLE public.user_skill_metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow owner read user_skill_metrics" ON public.user_skill_metrics;
DROP POLICY IF EXISTS "Allow owner upsert user_skill_metrics" ON public.user_skill_metrics;
DROP POLICY IF EXISTS "Allow owner update user_skill_metrics" ON public.user_skill_metrics;
CREATE POLICY "Allow owner read user_skill_metrics"
    ON public.user_skill_metrics FOR SELECT
    USING (auth.uid() = user_id);
CREATE POLICY "Allow owner upsert user_skill_metrics"
    ON public.user_skill_metrics FOR INSERT
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow owner update user_skill_metrics"
    ON public.user_skill_metrics FOR UPDATE
    USING (auth.uid() = user_id);

-- Seed one row per existing user (so queries don't 406)
INSERT INTO public.user_skill_metrics (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================
-- 6. user_feedback
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY
);

ALTER TABLE public.user_feedback ADD COLUMN IF NOT EXISTS created_at    TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
ALTER TABLE public.user_feedback ADD COLUMN IF NOT EXISTS user_id       UUID;
ALTER TABLE public.user_feedback ADD COLUMN IF NOT EXISTS user_email    TEXT;
ALTER TABLE public.user_feedback ADD COLUMN IF NOT EXISTS feedback_type TEXT DEFAULT 'General';
ALTER TABLE public.user_feedback ADD COLUMN IF NOT EXISTS description   TEXT NOT NULL DEFAULT '';

ALTER TABLE public.user_feedback ALTER COLUMN description SET NOT NULL;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'user_feedback_user_id_fkey'
    ) THEN
        ALTER TABLE public.user_feedback ADD CONSTRAINT user_feedback_user_id_fkey
            FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
END $$;

ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public insert user_feedback" ON public.user_feedback;
DROP POLICY IF EXISTS "Allow admin read user_feedback" ON public.user_feedback;
CREATE POLICY "Allow public insert user_feedback"
    ON public.user_feedback FOR INSERT
    WITH CHECK (true);
CREATE POLICY "Allow admin read user_feedback"
    ON public.user_feedback FOR SELECT
    USING (
        auth.jwt() -> 'app_metadata' ->> 'is_admin' = 'true'
        OR auth.jwt() -> 'user_metadata' ->> 'is_admin' = 'true'
    );

-- ============================================================
-- 7. handle_new_user trigger (for new signups going forward)
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
      NEW.id,
      NEW.raw_user_meta_data->>'full_name',
      NEW.email,
      NEW.raw_user_meta_data->>'avatar_url',
      'Free',
      'free',
      'Active'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_skill_metrics (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 8. waitlist_signups  (beta waitlist for demand validation)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.waitlist_signups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY
);

ALTER TABLE public.waitlist_signups ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
ALTER TABLE public.waitlist_signups ADD COLUMN IF NOT EXISTS email      TEXT NOT NULL DEFAULT '';
ALTER TABLE public.waitlist_signups ADD COLUMN IF NOT EXISTS name       TEXT;
ALTER TABLE public.waitlist_signups ADD COLUMN IF NOT EXISTS subject    TEXT DEFAULT 'Both';

ALTER TABLE public.waitlist_signups ALTER COLUMN email SET NOT NULL;

-- Unique on email (one signup per person)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class WHERE relname = 'waitlist_signups_email_key' AND relkind = 'i'
    ) THEN
        ALTER TABLE public.waitlist_signups ADD CONSTRAINT waitlist_signups_email_key UNIQUE (email);
    END IF;
END $$;

ALTER TABLE public.waitlist_signups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public signup" ON public.waitlist_signups;
DROP POLICY IF EXISTS "Allow admin read waitlist" ON public.waitlist_signups;

-- Anyone can join the waitlist (anonymous-friendly)
CREATE POLICY "Allow public signup"
    ON public.waitlist_signups FOR INSERT
    WITH CHECK (true);

-- Only admins can view the waitlist
CREATE POLICY "Allow admin read waitlist"
    ON public.waitlist_signups FOR SELECT
    USING (
        auth.jwt() -> 'app_metadata' ->> 'is_admin' = 'true'
        OR auth.jwt() -> 'user_metadata' ->> 'is_admin' = 'true'
    );

-- ============================================================
-- Done. All 7 tables exist with all columns.
-- Run SELECT table_name FROM information_schema.tables
-- WHERE table_schema='public' AND table_type='BASE TABLE'
-- ORDER BY table_name;
-- to verify.
-- ============================================================
