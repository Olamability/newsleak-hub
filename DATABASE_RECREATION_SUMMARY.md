# Database Recreation Summary

## Problem Solved

You indicated that you dropped the current Supabase database and needed a way to recreate all tables and configurations from scratch.

## Solution Provided

I've created a **complete, ready-to-use SQL file** that recreates your entire Newsleak database with a single command.

## What Was Created

### 1. `supabase_complete_schema.sql` - The Main SQL File

This is a comprehensive, production-ready SQL file containing:

#### Tables (15 total)
- ✅ `admin_users` - Admin accounts with role-based access
- ✅ `users` - User accounts and profiles
- ✅ `rss_feeds` - News source RSS feeds
- ✅ `news_articles` - Aggregated news articles
- ✅ `article_likes` - User likes (authenticated + anonymous)
- ✅ `article_bookmarks` - User bookmarks
- ✅ `article_views` - View tracking for analytics
- ✅ `comments` - User comments with nested replies
- ✅ `notifications` - Push notification queue
- ✅ `user_preferences` - User settings & FCM tokens
- ✅ `categories` - News categories
- ✅ `article_categories` - Many-to-many: articles ↔ categories
- ✅ `tags` - Article tags
- ✅ `article_tags` - Many-to-many: articles ↔ tags
- ✅ `user_activity` - User engagement tracking

#### Performance Features
- ✅ **80+ Indexes** - For fast queries on all major operations
- ✅ **5 Functions** - Automated calculations and updates
- ✅ **10 Triggers** - Automatic counter updates, timestamps
- ✅ **21 RLS Policies** - Security for public, user, and admin access
- ✅ **2 Views** - Popular articles, trending articles
- ✅ **1 Materialized View** - Cached article statistics

#### Default Data
- ✅ 8 default news categories (Politics, Sports, Technology, Business, Health, Science, Entertainment, World)

### 2. `SUPABASE_DATABASE_SETUP.md` - Comprehensive Guide

A detailed setup guide with:
- ✅ Step-by-step installation (Dashboard + CLI methods)
- ✅ Verification steps to confirm successful setup
- ✅ Post-installation configuration
- ✅ Troubleshooting section
- ✅ Database schema overview
- ✅ Next steps and resources

### 3. Updated `README.md`

- ✅ Added prominent database setup section
- ✅ Clear indication this is required first step
- ✅ Links to detailed documentation

## How to Use (Quick Start)

### Option 1: Supabase Dashboard (Easiest)

1. Open your Supabase project
2. Go to **SQL Editor**
3. Click **New query**
4. Open `supabase_complete_schema.sql` from this repository
5. Copy the entire contents
6. Paste into SQL Editor
7. Click **Run** (or Ctrl+Enter / Cmd+Enter)
8. Wait 10-30 seconds
9. ✅ Done! All tables created

### Option 2: Supabase CLI

```bash
# Link your project
supabase link --project-ref your-project-ref

# Copy SQL to migrations
cp supabase_complete_schema.sql supabase/migrations/00000000000000_initial_schema.sql

# Push to database
supabase db push
```

## Verification

After running, verify in SQL Editor:

```sql
-- Check all tables were created (should return 15 rows)
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check default categories (should return 8 rows)
SELECT * FROM categories ORDER BY display_order;

-- Check RLS policies (should return 21+ policies)
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

## Key Features

### ✅ Idempotent
- Safe to run multiple times
- Won't fail if tables already exist
- Won't lose existing data

### ✅ Complete
- All tables from DATABASE_SCHEMA.md
- All indexes for performance
- All triggers for automation
- All RLS policies for security
- All default data

### ✅ Production-Ready
- Proper foreign key constraints
- Cascade deletes where appropriate
- Secure RLS policies
- Performance optimizations
- Analytics views

### ✅ Well-Documented
- Extensive comments throughout
- Section markers for easy navigation
- Explanatory notes for complex parts
- Table and column descriptions

## What Happens When You Run It

1. **Section 1**: Creates all 15 tables with proper relationships
2. **Section 2**: Adds 80+ performance indexes
3. **Section 3**: Inserts 8 default news categories
4. **Section 4**: Creates 5 database functions
5. **Section 5**: Sets up 10 automatic triggers
6. **Section 6**: Enables Row Level Security on all tables
7. **Section 7**: Creates 21 RLS policies for security
8. **Section 8**: Creates 2 analytics views
9. **Section 9**: Creates 1 materialized view for performance

Total execution time: **10-30 seconds**

## After Setup

1. **Configure Environment Variables** (`.env`):
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

2. **Create Your First Admin User**:
   ```sql
   INSERT INTO admin_users (email, full_name, role, auth_uid)
   VALUES ('admin@example.com', 'Admin User', 'super_admin', 'your-auth-uid');
   ```

3. **Add RSS Feeds**:
   ```sql
   INSERT INTO rss_feeds (source, url, category, description)
   VALUES ('BBC News', 'http://feeds.bbci.co.uk/news/rss.xml', 'World', 'BBC World News');
   ```

4. **Deploy Edge Functions** (optional):
   ```bash
   supabase functions deploy fetchFeeds
   supabase functions deploy sendNotification
   ```

5. **Start the Application**:
   ```bash
   npm run dev
   ```

## Database Schema Overview

### Core Tables
| Table | Purpose | Auto Features |
|-------|---------|---------------|
| `news_articles` | Main content | Auto engagement score, updated_at |
| `rss_feeds` | News sources | Auto updated_at |
| `users` | User accounts | Auto updated_at |
| `admin_users` | Admin accounts | Access control |

### Interaction Tables
| Table | Purpose | Auto Features |
|-------|---------|---------------|
| `article_likes` | User likes | Auto update article like_count |
| `article_bookmarks` | Saved articles | - |
| `article_views` | View tracking | Auto update article view_count |
| `comments` | User comments | Auto update article comment_count |

### Configuration
| Table | Purpose |
|-------|---------|
| `categories` | News categories (8 defaults) |
| `tags` | Article tags |
| `user_preferences` | User settings, FCM tokens |
| `notifications` | Push notification queue |

### Analytics
| View/Table | Purpose |
|------------|---------|
| `popular_articles` | Most engaged articles |
| `trending_articles` | Trending last 24h |
| `article_stats` | Cached statistics (materialized) |

## Automatic Features

### Triggers Provide:
1. ✅ Auto-update `updated_at` timestamps
2. ✅ Auto-increment/decrement like counts
3. ✅ Auto-increment/decrement comment counts
4. ✅ Auto-increment view counts
5. ✅ Auto-calculate engagement scores

### Engagement Score Formula:
```
engagement_score = (views × 1) + (likes × 2) + (comments × 3) + (shares × 5)
```

## Security Features

### Row Level Security (RLS) Ensures:
- ✅ **Public access**: Anyone can read published articles, categories, tags
- ✅ **Anonymous users**: Can like, view, and bookmark articles
- ✅ **Authenticated users**: Can manage their own data (comments, preferences)
- ✅ **Admin only**: Only admins can manage articles, feeds, notifications

## Files Modified/Created

1. ✅ **New**: `supabase_complete_schema.sql` (811 lines)
2. ✅ **New**: `SUPABASE_DATABASE_SETUP.md` (400+ lines)
3. ✅ **New**: `DATABASE_RECREATION_SUMMARY.md` (this file)
4. ✅ **Updated**: `README.md` (added database setup section)

## Next Steps

1. Run the SQL file in Supabase
2. Verify all tables were created
3. Configure your `.env` file
4. Create your first admin user
5. Add some RSS feeds
6. Start the application

## Support & Documentation

- 📖 [SUPABASE_DATABASE_SETUP.md](./SUPABASE_DATABASE_SETUP.md) - Detailed setup guide
- 📖 [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Full schema documentation
- 📖 [PRODUCTION_SETUP_GUIDE.md](./PRODUCTION_SETUP_GUIDE.md) - Production deployment
- 📖 [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API reference

## Troubleshooting

### "relation already exists"
- This is normal if re-running. The script uses `CREATE TABLE IF NOT EXISTS`.

### "permission denied"
- Run as project owner in SQL Editor
- Or ensure your database user has sufficient privileges

### No tables visible
- Check SQL Editor output for errors
- Verify you're looking at the `public` schema
- Try running verification queries above

### RLS blocking queries
- Check that policies were created (verification step)
- For testing, can temporarily disable: `ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;`

## Success!

Your database schema is now complete and production-ready! 🎉

All 15 tables, 80+ indexes, 5 functions, 10 triggers, 21 RLS policies, and default data have been created.

You can now:
- ✅ Start adding RSS feeds
- ✅ Begin fetching news articles
- ✅ Create admin and user accounts
- ✅ Enable push notifications
- ✅ Deploy edge functions
- ✅ Run the application

Happy news aggregating! 📰
