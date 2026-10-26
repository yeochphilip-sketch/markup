# Supabase Migration Summary

## New Migration File: `supabase/delta_migration_new.sql`

Created a new delta migration for weekly digest tracking functionality:

### Changes Made:

1. **Created `weekly_digest_logs` table**:
   - `id` - UUID primary key with automatic generation
   - `user_id` - UUID foreign key referencing auth.users, ON DELETE CASCADE
   - `week_starting` - Timestamp for when the week starts
   - `skills_practiced` - JSONB array of skills practiced
   - `total_sources`, `total_questions`, `total_formatting` - Integer counters
   - `total_time_minutes` - Total practice time in minutes
   - `completed_at` - When the weekly session was completed
   - `created_at` - Creation timestamp

2. **Row Level Security**:
   - Enabled RLS on the new table
   - Created policy: "Users can CRUD their own digest logs"
   - Policy uses `auth.uid() = user_id` for both SELECT and INSERT/UPDATE

3. **Index for performance**:
   - Created index `idx_weekly_digest_logs_user_id` on `user_id` column

### Migration Pattern:
Following the existing bulletproof delta migration pattern from `delta_migration.sql`:
- `CREATE TABLE IF NOT EXISTS` for idempotency
- `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` pattern for adding columns
- Safe RLS policy drops and recreations
- Index creation with `IF NOT EXISTS`

### To Apply:
Run this migration against your Supabase database using the Supabase CLI or SQL editor:
```bash
supabase db push
# or
psql "connection_string" -f supabase/delta_migration_new.sql
```