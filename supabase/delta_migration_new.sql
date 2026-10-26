-- ============================================================
-- MARKUP – Delta migration (bulletproof)
-- Every CREATE TABLE IF NOT EXISTS is followed by
-- ALTER TABLE ... ADD COLUMN IF NOT EXISTS for every column.
-- This ensures columns exist even if a previous partial run
-- created the table without them.
-- ============================================================

-- ============================================================
-- 1. weekly_digest_logs  (weekly practice summary logs)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.weekly_digest_logs (
    id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id             UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    week_starting       TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    skills_practiced    JSONB DEFAULT '[]'::jsonb NOT NULL,
    total_sources       INTEGER DEFAULT 0 NOT NULL,
    total_questions     INTEGER DEFAULT 0 NOT NULL,
    total_formatting    INTEGER DEFAULT 0 NOT NULL,
    total_time_minutes  INTEGER DEFAULT 0,
    completed_at        TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.weekly_digest_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD their own digest logs" ON public.weekly_digest_logs;

CREATE POLICY "Users can CRUD their own digest logs"
    ON public.weekly_digest_logs FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 2. Add index on weekly_digestLogs user_id for performance
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE indexname = 'idx_weekly_digest_logs_user_id'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_weekly_digest_logs_user_id
        ON public.weekly_digest_logs (user_id);
    END IF;
END $$;

-- ============================================================
-- Done.
-- ============================================================