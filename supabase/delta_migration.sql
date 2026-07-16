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
ALTER TABLE public.practice_history ADD COLUMN IF NOT EXISTS metadata              JSONB DEFAULT '{}'::jsonb;

ALTER TABLE public.practice_history ALTER COLUMN subject         SET NOT NULL;
ALTER TABLE public.practice_history ALTER COLUMN topic           SET NOT NULL;
ALTER TABLE public.practice_history ALTER COLUMN question_type   SET NOT NULL;
ALTER TABLE public.practice_history ALTER COLUMN question_prompt SET NOT NULL;

CREATE INDEX IF NOT EXISTS practice_history_user_idx
    ON public.practice_history (user_id, created_at DESC);

-- ============================================================
-- Additional indexes for query performance
-- ============================================================
CREATE INDEX IF NOT EXISTS essay_evaluations_user_idx
    ON public.essay_evaluations (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS essay_evaluations_subject_idx
    ON public.essay_evaluations (subject) WHERE subject IS NOT NULL;

CREATE INDEX IF NOT EXISTS user_skill_metrics_xp_idx
    ON public.user_skill_metrics (total_xp DESC);

CREATE INDEX IF NOT EXISTS user_skill_metrics_level_idx
    ON public.user_skill_metrics (level_title) WHERE level_title IS NOT NULL;

CREATE INDEX IF NOT EXISTS user_profiles_email_idx
    ON public.user_profiles (email_address) WHERE email_address IS NOT NULL;

CREATE INDEX IF NOT EXISTS user_profiles_referral_code_idx
    ON public.user_profiles (referral_code) WHERE referral_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS study_group_members_group_idx
    ON public.study_group_members (group_id);

CREATE INDEX IF NOT EXISTS study_group_members_user_idx
    ON public.study_group_members (user_id);

CREATE INDEX IF NOT EXISTS generated_questions_user_idx
    ON public.generated_questions (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS user_notifications_unread_idx
    ON public.user_notifications (user_id, is_read) WHERE is_read = false;

CREATE INDEX IF NOT EXISTS waitlist_signups_created_idx
    ON public.waitlist_signups (created_at DESC);

CREATE INDEX IF NOT EXISTS user_feedback_created_idx
    ON public.user_feedback (created_at DESC);

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
ALTER TABLE public.user_skill_metrics ADD COLUMN IF NOT EXISTS achievements          TEXT[] DEFAULT '{}';
ALTER TABLE public.user_skill_metrics ADD COLUMN IF NOT EXISTS total_evaluations     INTEGER DEFAULT 0;
ALTER TABLE public.user_skill_metrics ADD COLUMN IF NOT EXISTS total_xp_decayed      INTEGER DEFAULT 0;
ALTER TABLE public.user_skill_metrics ADD COLUMN IF NOT EXISTS last_decay_check_date  DATE;

-- ════════════════════════════════════════════════════════════
--  Personalized reminder columns
-- ════════════════════════════════════════════════════════════
ALTER TABLE public.user_skill_metrics ADD COLUMN IF NOT EXISTS last_active_at           TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.user_skill_metrics ADD COLUMN IF NOT EXISTS last_reminder_sent_at     DATE;

-- ════════════════════════════════════════════════════════════
--  Notification preference columns
-- ════════════════════════════════════════════════════════════
ALTER TABLE public.user_skill_metrics ADD COLUMN IF NOT EXISTS email_reminders_enabled   BOOLEAN DEFAULT TRUE;
ALTER TABLE public.user_skill_metrics ADD COLUMN IF NOT EXISTS practice_receipt_enabled  BOOLEAN DEFAULT TRUE;

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
-- 9. user_notifications  (in-app notification system)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY
);

ALTER TABLE public.user_notifications ADD COLUMN IF NOT EXISTS created_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
ALTER TABLE public.user_notifications ADD COLUMN IF NOT EXISTS user_id     UUID;
ALTER TABLE public.user_notifications ADD COLUMN IF NOT EXISTS type        TEXT NOT NULL DEFAULT 'info';
ALTER TABLE public.user_notifications ADD COLUMN IF NOT EXISTS title       TEXT NOT NULL DEFAULT '';
ALTER TABLE public.user_notifications ADD COLUMN IF NOT EXISTS message     TEXT NOT NULL DEFAULT '';
ALTER TABLE public.user_notifications ADD COLUMN IF NOT EXISTS is_read     BOOLEAN DEFAULT FALSE;
ALTER TABLE public.user_notifications ADD COLUMN IF NOT EXISTS metadata    JSONB;

ALTER TABLE public.user_notifications ALTER COLUMN title   SET NOT NULL;
ALTER TABLE public.user_notifications ALTER COLUMN message SET NOT NULL;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'user_notifications_user_id_fkey'
    ) THEN
        ALTER TABLE public.user_notifications ADD CONSTRAINT user_notifications_user_id_fkey
            FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow owner read user_notifications" ON public.user_notifications;
DROP POLICY IF EXISTS "Allow owner insert user_notifications" ON public.user_notifications;
DROP POLICY IF EXISTS "Allow owner update user_notifications" ON public.user_notifications;
CREATE POLICY "Allow owner read user_notifications"
    ON public.user_notifications FOR SELECT
    USING (auth.uid() = user_id);
CREATE POLICY "Allow owner insert user_notifications"
    ON public.user_notifications FOR INSERT
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow owner update user_notifications"
    ON public.user_notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================================
-- 10. study_groups
-- ============================================================
CREATE TABLE IF NOT EXISTS public.study_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY
);

ALTER TABLE public.study_groups ADD COLUMN IF NOT EXISTS created_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
ALTER TABLE public.study_groups ADD COLUMN IF NOT EXISTS name        TEXT NOT NULL DEFAULT '';
ALTER TABLE public.study_groups ADD COLUMN IF NOT EXISTS join_code   TEXT NOT NULL DEFAULT '';
ALTER TABLE public.study_groups ADD COLUMN IF NOT EXISTS owner_id    UUID;

ALTER TABLE public.study_groups ALTER COLUMN name      SET NOT NULL;
ALTER TABLE public.study_groups ALTER COLUMN join_code SET NOT NULL;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class WHERE relname = 'study_groups_join_code_key' AND relkind = 'i'
    ) THEN
        ALTER TABLE public.study_groups ADD CONSTRAINT study_groups_join_code_key UNIQUE (join_code);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'study_groups_owner_id_fkey'
    ) THEN
        ALTER TABLE public.study_groups ADD CONSTRAINT study_groups_owner_id_fkey
            FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
END $$;

ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow owner select study_groups" ON public.study_groups;
DROP POLICY IF EXISTS "Allow owner insert study_groups" ON public.study_groups;
DROP POLICY IF EXISTS "Allow member select study_groups" ON public.study_groups;
DROP POLICY IF EXISTS "Allow group_select" ON public.study_groups;
CREATE POLICY "Allow group_select"
    ON public.study_groups FOR SELECT
    USING (true);  -- Anyone can look up a group by join code
CREATE POLICY "Allow owner insert study_groups"
    ON public.study_groups FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

-- ============================================================
-- 11. study_group_members
-- ============================================================
CREATE TABLE IF NOT EXISTS public.study_group_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY
);

ALTER TABLE public.study_group_members ADD COLUMN IF NOT EXISTS created_at   TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
ALTER TABLE public.study_group_members ADD COLUMN IF NOT EXISTS group_id     UUID;
ALTER TABLE public.study_group_members ADD COLUMN IF NOT EXISTS user_id      UUID;
ALTER TABLE public.study_group_members ADD COLUMN IF NOT EXISTS is_owner     BOOLEAN DEFAULT FALSE;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class WHERE relname = 'study_group_members_group_user_key' AND relkind = 'i'
    ) THEN
        ALTER TABLE public.study_group_members ADD CONSTRAINT study_group_members_group_user_key UNIQUE (group_id, user_id);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'study_group_members_group_id_fkey'
    ) THEN
        ALTER TABLE public.study_group_members ADD CONSTRAINT study_group_members_group_id_fkey
            FOREIGN KEY (group_id) REFERENCES public.study_groups(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'study_group_members_user_id_fkey'
    ) THEN
        ALTER TABLE public.study_group_members ADD CONSTRAINT study_group_members_user_id_fkey
            FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

ALTER TABLE public.study_group_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow member select study_group_members" ON public.study_group_members;
DROP POLICY IF EXISTS "Allow member insert study_group_members" ON public.study_group_members;
CREATE POLICY "Allow member select study_group_members"
    ON public.study_group_members FOR SELECT
    USING (auth.uid() = user_id OR auth.uid() IN (
        SELECT gm2.user_id FROM public.study_group_members gm2 WHERE gm2.group_id = group_id
    ));
CREATE POLICY "Allow member insert study_group_members"
    ON public.study_group_members FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- Add referral columns to user_profiles
-- ============================================================
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS referral_code  TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS referred_by    TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class WHERE relname = 'user_profiles_referral_code_key' AND relkind = 'i'
    ) THEN
        ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_referral_code_key UNIQUE (referral_code);
    END IF;
END $$;

-- ============================================================
-- Add per-subject exam goal columns to user_skill_metrics
-- ============================================================
ALTER TABLE public.user_skill_metrics ADD COLUMN IF NOT EXISTS exam_goal_level TEXT;
ALTER TABLE public.user_skill_metrics ADD COLUMN IF NOT EXISTS exam_date DATE;
ALTER TABLE public.user_skill_metrics ADD COLUMN IF NOT EXISTS ss_goal_level TEXT;
ALTER TABLE public.user_skill_metrics ADD COLUMN IF NOT EXISTS history_goal_level TEXT;
ALTER TABLE public.user_skill_metrics ADD COLUMN IF NOT EXISTS takes_history BOOLEAN DEFAULT FALSE;

-- ============================================================
-- Update handle_new_user to generate referral code
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  ref_code TEXT;
BEGIN
  -- Generate a unique referral code
  ref_code := upper(substr(md5(NEW.id::text || random()::text), 1, 8));

  INSERT INTO public.user_profiles (
      id,
      full_name,
      email_address,
      avatar_url,
      selected_plan,
      subscription_tier,
      account_status,
      referral_code
  )
  VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'full_name',
      NEW.email,
      NEW.raw_user_meta_data->>'avatar_url',
      'Free',
      'free',
      'Active',
      ref_code
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_skill_metrics (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 13. user_feedback admin_view RLS (admin can read all feedback)
--     Already handled by RLS policy above (Allow admin read user_feedback)
--     No schema changes needed for admin feedback viewer feature.
-- ============================================================

-- ============================================================
-- 14. Testimonial columns on user_feedback
-- ============================================================
ALTER TABLE public.user_feedback ADD COLUMN IF NOT EXISTS testimonial_rating   INTEGER;
ALTER TABLE public.user_feedback ADD COLUMN IF NOT EXISTS testimonial_approved BOOLEAN DEFAULT FALSE;

-- ============================================================
-- 15. rate_limits  (Supabase PostgreSQL-based rate limiter)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.rate_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY
);

ALTER TABLE public.rate_limits ADD COLUMN IF NOT EXISTS ip_address       TEXT NOT NULL DEFAULT '';
ALTER TABLE public.rate_limits ADD COLUMN IF NOT EXISTS endpoint         TEXT NOT NULL DEFAULT '';
ALTER TABLE public.rate_limits ADD COLUMN IF NOT EXISTS request_count    INTEGER NOT NULL DEFAULT 1;
ALTER TABLE public.rate_limits ADD COLUMN IF NOT EXISTS window_expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now());
ALTER TABLE public.rate_limits ADD COLUMN IF NOT EXISTS created_at       TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

ALTER TABLE public.rate_limits ALTER COLUMN ip_address SET NOT NULL;
ALTER TABLE public.rate_limits ALTER COLUMN endpoint SET NOT NULL;
ALTER TABLE public.rate_limits ALTER COLUMN request_count SET NOT NULL;
ALTER TABLE public.rate_limits ALTER COLUMN window_expires_at SET NOT NULL;

-- Composite index for fast lookups: find rate limit by (ip, endpoint, active window)
CREATE INDEX IF NOT EXISTS rate_limits_lookup_idx
    ON public.rate_limits (ip_address, endpoint, window_expires_at DESC);

-- Index for cleanup queries (expired windows)
CREATE INDEX IF NOT EXISTS rate_limits_expiry_idx
    ON public.rate_limits (window_expires_at);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow anyone (even anon) to insert rate limit records — needed for pre-auth rate limiting
DROP POLICY IF EXISTS "Allow all insert rate_limits" ON public.rate_limits;
CREATE POLICY "Allow all insert rate_limits"
    ON public.rate_limits FOR INSERT
    WITH CHECK (true);

-- Allow anyone (even anon) to select rate limit records
DROP POLICY IF EXISTS "Allow all select rate_limits" ON public.rate_limits;
CREATE POLICY "Allow all select rate_limits"
    ON public.rate_limits FOR SELECT
    USING (true);

-- Allow anyone to delete expired records
DROP POLICY IF EXISTS "Allow all delete rate_limits" ON public.rate_limits;
CREATE POLICY "Allow all delete rate_limits"
    ON public.rate_limits FOR DELETE
    USING (true);

-- Periodically clean up stale entries (via pg_cron or manual)
-- A cron job can run: DELETE FROM public.rate_limits WHERE window_expires_at < now() - interval '1 hour'

-- ============================================================
-- Done.
-- ════════════════════════════════════════════════════════════
-- 
--  New additions in this session (no SQL changes needed):
--  
--  Dashboard → extracted AnalyticsPanel, ConfiguratorSidebar components
--  Admin     → added refresh button, feedback viewer tab, evaluations CSV export
--  Email     → SEND_FROM_EMAIL env var, configurable SITE_URL in all HTML templates
--
--  All columns already exist in the schema. No migration needed.
-- ════════════════════════════════════════════════════════════
-- ============================================================
