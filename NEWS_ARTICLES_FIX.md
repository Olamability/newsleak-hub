# News Articles Not Displaying - Fix Summary

## Issue
News articles were being successfully fetched and processed by the `fetchFeeds` edge function but were not appearing on the homepage.

## Root Cause
The `news_articles` table schema was missing the `category` column that the edge function was trying to populate during article upsert operations. This caused a schema mismatch.

## Solution
Added the `category` TEXT column to the `news_articles` table schema.

### Files Modified
1. `supabase_complete_schema.sql` - Added category column to the CREATE TABLE statement
2. `supabase/migrations/003_add_category_to_news_articles.sql` - Created migration to add the column

## How to Apply the Fix

### Option 1: Run the Migration (Recommended)
Execute the migration file in Supabase SQL Editor:
```bash
# Navigate to Supabase Dashboard > SQL Editor
# Copy and run: supabase/migrations/003_add_category_to_news_articles.sql
```

### Option 2: Manual SQL Command
Run this SQL directly in Supabase SQL Editor:
```sql
ALTER TABLE public.news_articles ADD COLUMN IF NOT EXISTS category TEXT;
CREATE INDEX IF NOT EXISTS idx_news_articles_category ON public.news_articles(category);
```

## Verification
After applying the fix:
1. Trigger the fetchFeeds edge function (manually or wait for scheduled run)
2. Check the homepage - articles should now appear
3. Verify in Supabase Dashboard > Table Editor > news_articles that new articles are being inserted

## Technical Details
- The edge function `fetchFeeds/index.ts` (line 199) inserts `category: feed.category` 
- The frontend expects this field for category filtering (see `src/pages/Index.tsx`)
- Without this column, the upsert operation may have been failing silently or skipping the category field
