# Deployment Guide for Supabase Edge Function

This guide will help you deploy the `fetchFeeds` Edge Function to fix the image extraction issue in your Newsleak application.

## Prerequisites

1. **Supabase CLI**: Install if you haven't already
   ```bash
   npm install -g supabase
   ```

2. **Supabase Project**: You should have a Supabase project set up with:
   - `rss_feeds` table
   - `news_articles` table
   - Service role key

## Quick Deployment Steps

### 1. Login to Supabase

```bash
supabase login
```

This will open a browser window for authentication.

### 2. Link to Your Project

```bash
supabase link --project-ref your-project-ref
```

You can find your project ref in your Supabase dashboard URL: `https://app.supabase.com/project/YOUR-PROJECT-REF`

### 3. Deploy the Function

```bash
supabase functions deploy fetchFeeds
```

### 4. Verify Deployment

```bash
supabase functions list
```

You should see `fetchFeeds` in the list of deployed functions.

## Testing the Function

### Option 1: Test from Admin Panel

1. Go to your admin panel at `/admin/analytics`
2. Click the "Refresh Feeds" button
3. Check the browser's Network tab to see the request
4. Verify that articles now have images in the database

### Option 2: Test with cURL

```bash
curl -X POST https://YOUR-PROJECT-REF.supabase.co/functions/v1/fetchFeeds \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

Replace:
- `YOUR-PROJECT-REF` with your actual project reference
- `YOUR_ANON_KEY` with your anon/public key from Supabase dashboard

### Option 3: Test Locally

```bash
# Start Supabase local development
supabase start

# Serve the function locally
supabase functions serve fetchFeeds

# In another terminal, test it
curl -X POST http://localhost:54321/functions/v1/fetchFeeds \
  -H "Authorization: Bearer YOUR_LOCAL_ANON_KEY"
```

## Checking the Results

### 1. Check Database

Run this SQL in your Supabase SQL Editor:

```sql
SELECT id, title, image, source 
FROM news_articles 
ORDER BY published DESC 
LIMIT 10;
```

You should see articles with non-null `image` values.

### 2. Check Function Logs

In Supabase Dashboard:
1. Go to Edge Functions
2. Click on `fetchFeeds`
3. View the logs to see what happened during execution

### 3. Check Your App

1. Open your app at the home page
2. Articles should now display their actual featured images instead of the default fallback
3. Use browser DevTools to inspect the image URLs

## Database Schema Requirements

Make sure your `news_articles` table has these columns:

```sql
-- Check if image column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'news_articles';

-- Add image column if missing
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS image TEXT;

-- Add feed_id column if missing
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS feed_id UUID REFERENCES rss_feeds(id);

-- Ensure link is unique (for upsert to work)
ALTER TABLE news_articles ADD CONSTRAINT news_articles_link_unique UNIQUE (link);
```

## Troubleshooting

### Function Not Found Error

If you get a 404 error:
1. Verify the function is deployed: `supabase functions list`
2. Check the function URL matches your project
3. Ensure you're logged into the correct project

### No Images Being Extracted

If images are still null:
1. Check the function logs for errors
2. Verify the RSS feed URLs are accessible
3. Test with a known good RSS feed (e.g., BBC News)
4. Check if CORS proxy is working

### Permission Errors

If you get permission errors:
1. Verify your service role key is set correctly
2. Check RLS policies on `news_articles` and `rss_feeds` tables
3. Ensure the function has proper environment variables

## Environment Variables

The function needs these environment variables (set automatically by Supabase):
- `SUPABASE_URL`: Your project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your service role key

These are automatically available in deployed functions. For local testing, they're set by `supabase start`.

## Monitoring

### View Real-time Logs

```bash
supabase functions logs fetchFeeds --tail
```

### Check Function Health

```bash
supabase functions inspect fetchFeeds
```

## Updating the Function

After making changes to `supabase/functions/fetchFeeds/index.ts`:

```bash
# Deploy the updated version
supabase functions deploy fetchFeeds

# Verify the update
supabase functions list
```

## Scheduling Automatic Fetches (Optional)

You can set up a cron job to automatically fetch feeds:

### Option 1: Using Supabase Cron (if available)

Check Supabase documentation for pg_cron extension setup.

### Option 2: Using GitHub Actions

Create `.github/workflows/fetch-feeds.yml`:

```yaml
name: Fetch RSS Feeds

on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:  # Manual trigger

jobs:
  fetch:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Supabase Function
        run: |
          curl -X POST ${{ secrets.SUPABASE_URL }}/functions/v1/fetchFeeds \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}"
```

Add secrets in GitHub repo settings:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

## Best Practices

1. **Monitor Usage**: Edge functions have execution limits, monitor your usage
2. **Error Handling**: The function logs errors, check them regularly
3. **Rate Limiting**: Consider adding rate limiting if fetching many feeds
4. **Image Validation**: Consider validating image URLs before storing
5. **Cleanup**: Periodically clean up old articles to save storage

## Support

If you encounter issues:
1. Check Supabase function logs
2. Review the SUPABASE_EDGE_FUNCTION_FIX.md for detailed implementation notes
3. Check Supabase Discord/Support for platform-specific issues
