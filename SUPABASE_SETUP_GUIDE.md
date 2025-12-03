# Supabase Setup Guide for Article Likes

## Problem Summary

The article like functionality was experiencing issues where:
1. Clicking the like icon would show an optimistic update (like count increases)
2. Immediately after, it would revert to zero
3. Console errors showed 406 (Not Acceptable) HTTP errors from Supabase

### Root Cause

There was a schema mismatch between the application code and the Supabase database:
- The code was using `user_identifier` as the column name
- The database table likely had `user_id` as the column name (or the column didn't exist)
- This caused all queries to fail with 406 errors

## Solution Implemented

### 1. Code Changes

Updated `/src/lib/articleAnalytics.ts` to:
- Use `user_id` instead of `user_identifier` consistently
- Add proper error handling and logging
- Use `.maybeSingle()` instead of `.single()` to avoid errors when no data exists
- Properly check for existing data before deciding to insert or delete

### 2. Database Setup

Created a migration file at `/supabase/migrations/001_article_likes_setup.sql` that:
- Creates the `article_likes` table with proper schema
- Adds appropriate indexes for performance
- Sets up Row Level Security (RLS) policies
- Includes optional migration from `user_identifier` to `user_id`

## How to Apply the Fix

### Step 1: Run the Database Migration

#### Option A: Using Supabase Dashboard (Recommended for Quick Fix)

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `/supabase/migrations/001_article_likes_setup.sql`
4. Paste it into the SQL Editor
5. Click "Run" to execute the migration

#### Option B: Using Supabase CLI

```bash
# Make sure you're logged in to Supabase CLI
supabase login

# Link your project (if not already linked)
supabase link --project-ref your-project-ref

# Run the migration
supabase db push
```

### Step 2: Verify the Table Schema

After running the migration, verify the table exists with the correct schema:

```sql
-- Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'article_likes'
ORDER BY ordinal_position;

-- Should show:
-- id          | uuid                     | NO
-- article_id  | text                     | NO
-- user_id     | text                     | NO
-- created_at  | timestamp with time zone | YES
```

### Step 3: Test the Application

1. Clear your browser's local storage (or open in incognito mode)
2. Navigate to the application
3. Try clicking the like button on an article
4. Verify that:
   - The like count increases
   - The like button changes state (filled/unfilled)
   - Refreshing the page maintains the like state
   - No 406 errors appear in the browser console

## Database Schema Details

### Table: `article_likes`

| Column     | Type                     | Constraints                    | Description                                    |
|------------|--------------------------|--------------------------------|------------------------------------------------|
| id         | UUID                     | PRIMARY KEY, auto-generated    | Unique identifier for each like                |
| article_id | TEXT                     | NOT NULL                       | ID of the liked article                        |
| user_id    | TEXT                     | NOT NULL                       | User identifier (auth ID or anon_{uuid})       |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW()                  | When the like was created                      |

**Unique Constraint**: `(article_id, user_id)` - Prevents duplicate likes

### Indexes

- `idx_article_likes_article_id`: Fast lookup by article
- `idx_article_likes_user_id`: Fast lookup by user
- `idx_article_likes_created_at`: Useful for trending/recent likes

### Row Level Security Policies

1. **Public Read Access**: Anyone can read article likes (needed for displaying like counts)
2. **Public Insert Access**: Anyone can create likes (including anonymous users)
3. **Public Delete Access**: Anyone can remove likes (the application logic ensures users only delete their own)

> **Note**: For production, you may want to add stricter RLS policies that check the user_id matches the authenticated user or anonymous session.

## Additional Recommendations

### 1. Enable Supabase Realtime (Optional)

If you want real-time like updates across multiple users:

```sql
-- Enable realtime for the article_likes table
ALTER PUBLICATION supabase_realtime ADD TABLE article_likes;
```

Then update your application to subscribe to changes:

```typescript
// In your component or hook
useEffect(() => {
  const channel = supabase
    .channel('article_likes_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'article_likes'
      },
      (payload) => {
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['article-like-status'] });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

### 2. Add API Key Security (If Needed)

If you want to prevent abuse of the like functionality:

1. Set up rate limiting in Supabase Edge Functions
2. Add CAPTCHA verification for high-frequency actions
3. Implement stricter RLS policies

### 3. Analytics and Monitoring

Consider adding:
- Aggregated like counts in a separate table for performance
- Monitoring for unusual like patterns
- Analytics tracking for engagement metrics

### 4. Foreign Key Constraints (Optional)

If you have a `news_articles` table, add a foreign key:

```sql
-- Add foreign key to articles table (if it exists)
ALTER TABLE article_likes 
ADD CONSTRAINT fk_article_likes_article 
FOREIGN KEY (article_id) 
REFERENCES news_articles(id) 
ON DELETE CASCADE;
```

## Troubleshooting

### Still Getting 406 Errors?

1. **Check the table exists**:
   ```sql
   SELECT * FROM information_schema.tables 
   WHERE table_name = 'article_likes';
   ```

2. **Verify RLS is not blocking queries**:
   - Temporarily disable RLS to test: `ALTER TABLE article_likes DISABLE ROW LEVEL SECURITY;`
   - If this fixes it, your RLS policies are too restrictive

3. **Check your Supabase API key**:
   - Ensure `VITE_ANON_KEY` in `.env` matches your Supabase project's anon key
   - Verify `VITE_Supabase_URL` is correct

4. **Clear browser cache and local storage**:
   ```javascript
   localStorage.clear();
   location.reload();
   ```

### Likes Not Persisting?

1. Check browser console for errors
2. Verify network requests in browser DevTools
3. Check Supabase logs in the dashboard under "Logs" → "API"

### Migration from `user_identifier` to `user_id`

If you have existing data with `user_identifier`:

1. Uncomment the migration section in the SQL file
2. Run the migration
3. This will copy data from `user_identifier` to `user_id` and drop the old column

## Testing Checklist

- [ ] Article likes table exists in Supabase
- [ ] Table has correct schema (id, article_id, user_id, created_at)
- [ ] RLS policies are enabled and configured
- [ ] Indexes are created
- [ ] Like button works for authenticated users
- [ ] Like button works for anonymous users
- [ ] Like count persists after page refresh
- [ ] No 406 errors in console
- [ ] Unlike functionality works
- [ ] Multiple likes on different articles work
- [ ] Cannot like the same article twice

## Summary

The fix involves:
1. ✅ Updated code to use `user_id` consistently
2. ✅ Added proper error handling
3. ✅ Created database migration for proper schema
4. ✅ Configured RLS policies for security
5. ✅ Added indexes for performance

After applying these changes, the article like functionality should work correctly with proper persistence and no errors.
