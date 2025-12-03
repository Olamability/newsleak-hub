# Supabase Database Setup Guide

## Overview

This guide will help you recreate the complete Newsleak database schema in Supabase. The `supabase_complete_schema.sql` file contains everything needed to set up your database from scratch.

## What's Included

The SQL file includes:

✅ **15 Database Tables**
- Users and admin management
- RSS feeds and news articles
- User interactions (likes, bookmarks, views, comments)
- Notifications and preferences
- Categories and tags with relationships

✅ **Performance Indexes**
- Optimized queries for all major operations
- Composite indexes for complex queries

✅ **Database Functions**
- Auto-update timestamps
- Automatic article statistics (likes, comments, views)
- Engagement score calculation

✅ **Triggers**
- Automatic counter updates
- Timestamp management

✅ **Row Level Security (RLS)**
- Public access for reading articles
- User-specific policies for likes, bookmarks, comments
- Admin-only policies for content management

✅ **Views & Analytics**
- Popular articles view
- Trending articles view (last 24 hours)
- Materialized view for article statistics

✅ **Default Data**
- 8 default news categories (Politics, Sports, Technology, etc.)

## Prerequisites

- A Supabase account ([sign up free](https://supabase.com))
- A Supabase project created

## Installation Steps

### Option 1: Using Supabase Dashboard (Recommended)

1. **Login to Supabase**
   - Go to [https://app.supabase.com](https://app.supabase.com)
   - Login to your account
   - Select your project (or create a new one)

2. **Open SQL Editor**
   - In your project dashboard, click on **"SQL Editor"** in the left sidebar
   - Click **"New query"**

3. **Run the Schema**
   - Open `supabase_complete_schema.sql` from this repository
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click **"Run"** or press `Ctrl+Enter` (Windows/Linux) or `Cmd+Enter` (Mac)

4. **Wait for Completion**
   - The script will take 10-30 seconds to complete
   - You should see "Success. No rows returned" when done

5. **Verify Installation**
   - Go to **"Table Editor"** in the sidebar
   - You should see 15 tables:
     - admin_users
     - article_bookmarks
     - article_categories
     - article_likes
     - article_tags
     - article_views
     - categories
     - comments
     - news_articles
     - notifications
     - rss_feeds
     - tags
     - user_activity
     - user_preferences
     - users

### Option 2: Using Supabase CLI

1. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**
   ```bash
   supabase login
   ```

3. **Link Your Project**
   ```bash
   supabase link --project-ref your-project-ref
   ```
   
   Find your project ref in your Supabase dashboard URL:
   `https://app.supabase.com/project/[your-project-ref]`

4. **Run the Migration**
   ```bash
   supabase db push --db-url "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
   ```

   Or copy the SQL file to migrations and push:
   ```bash
   cp supabase_complete_schema.sql supabase/migrations/00000000000000_initial_schema.sql
   supabase db push
   ```

## Verification

After running the schema, verify your setup:

### 1. Check Tables

Run this query in SQL Editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see all 15 tables listed.

### 2. Check Default Categories

```sql
SELECT * FROM categories ORDER BY display_order;
```

You should see 8 default categories.

### 3. Check RLS Policies

```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
```

You should see multiple policies per table.

### 4. Check Triggers

```sql
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
ORDER BY event_object_table;
```

You should see triggers for automatic updates.

## Post-Installation Steps

### 1. Configure Your Application

Update your `.env` file with Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

Find these in your Supabase Dashboard:
- Go to **Settings** → **API**
- Copy the **Project URL** and **anon/public key**
- Copy the **service_role key** (keep this secret!)

### 2. Create Your First Admin User

After setting up authentication, add an admin user:

```sql
INSERT INTO public.admin_users (email, full_name, role, auth_uid)
VALUES (
  'admin@example.com',
  'Admin User',
  'super_admin',
  'your-auth-uid-from-firebase-or-supabase'
);
```

### 3. Add RSS Feeds

Add your first news sources:

```sql
INSERT INTO public.rss_feeds (source, url, category, description)
VALUES 
  ('BBC News', 'http://feeds.bbci.co.uk/news/rss.xml', 'World', 'BBC World News RSS Feed'),
  ('TechCrunch', 'https://techcrunch.com/feed/', 'Technology', 'Tech news and analysis'),
  ('ESPN', 'https://www.espn.com/espn/rss/news', 'Sports', 'Sports news and updates');
```

### 4. Set Up Edge Functions (Optional but Recommended)

Deploy the Supabase Edge Functions for automated RSS fetching:

```bash
cd supabase/functions
supabase functions deploy fetchFeeds
supabase functions deploy sendNotification
```

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed edge function setup.

### 5. Schedule Regular Refresh (Optional)

For the materialized view, set up a PostgreSQL cron job:

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule refresh every hour
SELECT cron.schedule(
  'refresh-article-stats',
  '0 * * * *', -- Every hour at minute 0
  'REFRESH MATERIALIZED VIEW CONCURRENTLY article_stats;'
);
```

## Database Schema Overview

### Core Tables

| Table | Description | Key Features |
|-------|-------------|--------------|
| `news_articles` | Main articles storage | Auto-calculated engagement scores |
| `rss_feeds` | News sources | Fetch interval, error tracking |
| `users` | User accounts | Multi-provider auth support |
| `admin_users` | Admin accounts | Role-based access control |

### Interaction Tables

| Table | Description |
|-------|-------------|
| `article_likes` | User likes (auth + anonymous) |
| `article_bookmarks` | Saved articles |
| `article_views` | View tracking with analytics |
| `comments` | Nested comment support |

### Configuration Tables

| Table | Description |
|-------|-------------|
| `categories` | News categories |
| `tags` | Article tags |
| `user_preferences` | User settings & FCM tokens |
| `notifications` | Push notification queue |

### Junction Tables

| Table | Description |
|-------|-------------|
| `article_categories` | Articles ↔ Categories |
| `article_tags` | Articles ↔ Tags |

### Analytics

| Table | Description |
|-------|-------------|
| `user_activity` | Engagement tracking |
| `article_stats` | Materialized view for performance |

## Troubleshooting

### Error: "relation already exists"

This is normal if you're re-running the script. The script uses `CREATE TABLE IF NOT EXISTS` so it's safe to run multiple times.

### Error: "permission denied"

Make sure you're using the SQL Editor as the project owner, or that your database user has sufficient privileges.

### No Tables Visible

1. Make sure you ran the complete script
2. Check for errors in the SQL Editor output
3. Verify you're looking at the `public` schema

### RLS Blocking Queries

If you can't read data after setup:

1. Check that RLS policies are created (see verification step above)
2. Temporarily disable RLS for testing:
   ```sql
   ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
   ```
3. For production, ensure your application passes the correct JWT claims

### Performance Issues

1. Make sure all indexes were created (check verification step)
2. Run `ANALYZE` to update statistics:
   ```sql
   ANALYZE;
   ```
3. For large datasets, consider refreshing the materialized view:
   ```sql
   REFRESH MATERIALIZED VIEW CONCURRENTLY article_stats;
   ```

## Updating the Schema

If you need to modify the schema later:

1. Create a new migration file in `supabase/migrations/`
2. Never drop tables with existing data
3. Use `ALTER TABLE` for schema changes
4. Test migrations in a development project first

## Additional Resources

- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Detailed schema documentation
- [PRODUCTION_SETUP_GUIDE.md](./PRODUCTION_SETUP_GUIDE.md) - Full production setup
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API usage guide
- [Supabase Documentation](https://supabase.com/docs) - Official Supabase docs

## Support

If you encounter issues:

1. Check the Supabase logs: Dashboard → Logs → API
2. Review the error messages carefully
3. Ensure your Supabase project is active
4. Check that you have the latest version of this SQL file

## Next Steps

After setting up your database:

1. ✅ Configure your environment variables
2. ✅ Create your first admin user
3. ✅ Add RSS feeds
4. ✅ Deploy edge functions
5. ✅ Start the application: `npm run dev`
6. ✅ Test the functionality
7. ✅ Add more RSS feeds and categories as needed

Congratulations! Your Newsleak database is ready to use! 🎉
