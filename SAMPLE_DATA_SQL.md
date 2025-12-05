# 📝 Sample Data SQL Scripts

This file contains SQL scripts to populate your Newsleak database with sample data for testing and development.

## ⚠️ Important Notes

- Run these scripts **after** executing `supabase_complete_schema.sql`
- These are for **testing only** - not for production
- Replace placeholder values (email, auth_uid) with your actual values

---

## 🔐 Create Admin User

First, create yourself as an admin user. You'll need your Firebase Auth UID.

### Get Your Firebase Auth UID
1. Log into your app with Firebase Auth
2. In browser console, run: `firebase.auth().currentUser.uid`
3. Copy the UID (looks like: `abc123xyz456...`)

```sql
-- Create admin user
INSERT INTO public.admin_users (email, full_name, role, auth_uid, is_active) VALUES
  ('admin@newsleak.com', 'Admin User', 'super_admin', 'YOUR_FIREBASE_AUTH_UID_HERE', true)
ON CONFLICT (email) DO UPDATE SET
  auth_uid = EXCLUDED.auth_uid,
  is_active = true;
```

---

## 📰 Add RSS Feed Sources

Add popular news sources to start fetching articles:

```sql
-- Popular international news sources
INSERT INTO public.rss_feeds (source, url, category, language, is_active, description, website_url, favicon) VALUES
  -- World News
  ('BBC News', 'http://feeds.bbci.co.uk/news/rss.xml', 'World', 'en', true, 'BBC World News - Latest Headlines', 'https://www.bbc.com/news', 'https://www.bbc.co.uk/favicon.ico'),
  ('CNN', 'http://rss.cnn.com/rss/cnn_topstories.rss', 'World', 'en', true, 'CNN Top Stories', 'https://www.cnn.com', 'https://www.cnn.com/favicon.ico'),
  ('Reuters', 'https://www.reutersagency.com/feed/', 'World', 'en', true, 'Reuters News Feed', 'https://www.reuters.com', 'https://www.reuters.com/favicon.ico'),
  
  -- Technology
  ('TechCrunch', 'https://techcrunch.com/feed/', 'Technology', 'en', true, 'Latest technology and startup news', 'https://techcrunch.com', 'https://techcrunch.com/favicon.ico'),
  ('The Verge', 'https://www.theverge.com/rss/index.xml', 'Technology', 'en', true, 'Technology, science, and culture news', 'https://www.theverge.com', 'https://www.theverge.com/favicon.ico'),
  ('Ars Technica', 'https://feeds.arstechnica.com/arstechnica/index', 'Technology', 'en', true, 'Tech news and analysis', 'https://arstechnica.com', 'https://arstechnica.com/favicon.ico'),
  ('Wired', 'https://www.wired.com/feed/rss', 'Technology', 'en', true, 'Technology, science and culture news', 'https://www.wired.com', 'https://www.wired.com/favicon.ico'),
  
  -- Business
  ('Business Insider', 'https://www.businessinsider.com/rss', 'Business', 'en', true, 'Business news and analysis', 'https://www.businessinsider.com', 'https://www.businessinsider.com/favicon.ico'),
  ('Forbes', 'https://www.forbes.com/real-time/feed2/', 'Business', 'en', true, 'Forbes business news', 'https://www.forbes.com', 'https://www.forbes.com/favicon.ico'),
  
  -- Sports
  ('ESPN', 'https://www.espn.com/espn/rss/news', 'Sports', 'en', true, 'ESPN sports news', 'https://www.espn.com', 'https://www.espn.com/favicon.ico'),
  ('Sky Sports', 'https://www.skysports.com/rss/12040', 'Football', 'en', true, 'Football news from Sky Sports', 'https://www.skysports.com', 'https://www.skysports.com/favicon.ico'),
  
  -- Entertainment
  ('Variety', 'https://variety.com/feed/', 'Entertainment', 'en', true, 'Entertainment industry news', 'https://variety.com', 'https://variety.com/favicon.ico'),
  ('Hollywood Reporter', 'https://www.hollywoodreporter.com/feed/', 'Entertainment', 'en', true, 'Entertainment news', 'https://www.hollywoodreporter.com', 'https://www.hollywoodreporter.com/favicon.ico'),
  
  -- Politics
  ('Politico', 'https://www.politico.com/rss/politics08.xml', 'Politics', 'en', true, 'Political news and analysis', 'https://www.politico.com', 'https://www.politico.com/favicon.ico'),
  
  -- Health & Science
  ('Scientific American', 'http://rss.sciam.com/ScientificAmerican-Global', 'Science', 'en', true, 'Science news and research', 'https://www.scientificamerican.com', 'https://www.scientificamerican.com/favicon.ico')
ON CONFLICT (url) DO UPDATE SET
  is_active = EXCLUDED.is_active,
  category = EXCLUDED.category,
  description = EXCLUDED.description;
```

---

## 📝 Create Test Articles (Manual)

If you want to manually add test articles without waiting for RSS fetch:

```sql
-- Sample articles (use real data in production)
INSERT INTO public.news_articles (
  title, 
  link, 
  description, 
  content, 
  image, 
  source, 
  category, 
  published, 
  is_published,
  feed_id
) VALUES
  (
    'Breaking: Major Tech Company Announces AI Breakthrough',
    'https://example.com/article-1',
    'A major technology company has announced a significant breakthrough in artificial intelligence...',
    'Full article content here...',
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
    'TechCrunch',
    'Technology',
    NOW() - INTERVAL '2 hours',
    true,
    (SELECT id FROM public.rss_feeds WHERE source = 'TechCrunch' LIMIT 1)
  ),
  (
    'Sports: Championship Finals Set Record Viewership',
    'https://example.com/article-2',
    'The championship finals broke all previous viewership records...',
    'Full article content here...',
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800',
    'ESPN',
    'Sports',
    NOW() - INTERVAL '4 hours',
    true,
    (SELECT id FROM public.rss_feeds WHERE source = 'ESPN' LIMIT 1)
  ),
  (
    'Business: Stock Market Hits New All-Time High',
    'https://example.com/article-3',
    'The stock market reached a new all-time high today...',
    'Full article content here...',
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    'Business Insider',
    'Business',
    NOW() - INTERVAL '6 hours',
    true,
    (SELECT id FROM public.rss_feeds WHERE source = 'Business Insider' LIMIT 1)
  )
ON CONFLICT (link) DO NOTHING;
```

---

## 🏷️ Verify Categories

Check that default categories were created:

```sql
-- View all categories
SELECT * FROM public.categories ORDER BY display_order;
```

Expected output:
- Politics
- Sports
- Entertainment
- Technology
- Business
- Health
- Science
- World

---

## 📊 Check Your Data

After inserting sample data, verify everything:

```sql
-- Count RSS feeds
SELECT COUNT(*) as feed_count FROM public.rss_feeds WHERE is_active = true;

-- Count articles
SELECT COUNT(*) as article_count FROM public.news_articles WHERE is_published = true;

-- Count categories
SELECT COUNT(*) as category_count FROM public.categories WHERE is_active = true;

-- Count admin users
SELECT COUNT(*) as admin_count FROM public.admin_users WHERE is_active = true;

-- View recent articles
SELECT 
  title,
  source,
  category,
  published,
  like_count,
  comment_count,
  view_count
FROM public.news_articles
WHERE is_published = true
ORDER BY published DESC
LIMIT 10;
```

---

## 🚀 Trigger RSS Feed Fetch

After adding RSS feeds, trigger the Edge Function to fetch articles:

### Method 1: Using Supabase CLI
```bash
supabase functions invoke fetchFeeds
```

### Method 2: Using curl
```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/fetchFeeds \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

### Method 3: From Your App
```typescript
const { data, error } = await supabase.functions.invoke('fetchFeeds');
```

---

## 🧹 Clean Up Test Data

If you want to remove all test data and start fresh:

```sql
-- ⚠️ WARNING: This will delete ALL data!
-- Only run this if you want to completely reset

-- Delete all articles
DELETE FROM public.news_articles;

-- Delete all RSS feeds
DELETE FROM public.rss_feeds;

-- Delete all users (except admins)
DELETE FROM public.users;

-- Delete all likes, bookmarks, comments
DELETE FROM public.article_likes;
DELETE FROM public.article_bookmarks;
DELETE FROM public.comments;
DELETE FROM public.article_views;

-- Reset auto-increment sequences (if needed)
ALTER SEQUENCE IF EXISTS news_articles_id_seq RESTART WITH 1;
```

---

## 🔄 Refresh Materialized Views

After adding data, refresh the analytics views:

```sql
-- Refresh article stats
REFRESH MATERIALIZED VIEW CONCURRENTLY article_stats;

-- Verify the refresh worked
SELECT * FROM article_stats LIMIT 10;
```

---

## 📈 Sample User Preferences

Create default preferences for a test user:

```sql
-- Create user preferences (replace USER_ID with actual Firebase user ID)
INSERT INTO public.user_preferences (
  user_id,
  theme,
  language,
  favorite_categories,
  notification_enabled,
  breaking_news_alerts,
  text_size
) VALUES
  (
    'YOUR_USER_ID_HERE',
    'dark',
    'en',
    ARRAY['Technology', 'Sports', 'Business'],
    true,
    true,
    'medium'
  )
ON CONFLICT (user_id) DO UPDATE SET
  favorite_categories = EXCLUDED.favorite_categories,
  updated_at = NOW();
```

---

## 🎯 Next Steps

After running these scripts:

1. ✅ Verify data in Supabase Dashboard → Table Editor
2. ✅ Run Edge Function to fetch real RSS articles
3. ✅ Test the app at http://localhost:8080
4. ✅ Check that articles display on homepage
5. ✅ Test user interactions (like, bookmark, comment)

---

## 🆘 Troubleshooting

### No articles showing?
```sql
-- Check if articles exist and are published
SELECT COUNT(*), is_published 
FROM public.news_articles 
GROUP BY is_published;

-- Make sure articles are published
UPDATE public.news_articles SET is_published = true WHERE is_published = false;
```

### RSS feeds not fetching?
```sql
-- Check feed status
SELECT source, url, is_active, last_fetched, fetch_errors, last_error
FROM public.rss_feeds
ORDER BY last_fetched DESC NULLS LAST;

-- Reset error count
UPDATE public.rss_feeds SET fetch_errors = 0, last_error = NULL WHERE fetch_errors > 0;
```

### Need to add your admin user?
```sql
-- Check existing admins
SELECT email, full_name, role, auth_uid, is_active FROM public.admin_users;

-- Update admin auth_uid
UPDATE public.admin_users 
SET auth_uid = 'YOUR_FIREBASE_AUTH_UID'
WHERE email = 'admin@newsleak.com';
```

---

**Remember**: This is sample data for development. In production, articles will be automatically fetched from RSS feeds via the Edge Function.
