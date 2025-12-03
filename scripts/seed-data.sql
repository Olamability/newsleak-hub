-- ============================================================================
-- NEWSLEAK DATABASE SEED DATA
-- ============================================================================
-- This script adds sample data for testing your Newsleak installation
-- Run this AFTER setting up the database schema
-- ============================================================================

-- Note: This script is OPTIONAL and only for testing/development
-- You can skip this if you plan to add real data immediately

BEGIN;

-- ============================================================================
-- 1. ADD SAMPLE ADMIN USER
-- ============================================================================
-- IMPORTANT: Replace 'your-firebase-uid' with your actual Firebase Auth UID
-- You can find this in Firebase Console -> Authentication -> Users

-- DELETE this if you've already created your admin user
-- ⚠️ IMPORTANT: Replace 'REPLACE_WITH_YOUR_FIREBASE_UID' with actual Firebase Auth UID
-- Get your UID from: Firebase Console → Authentication → Users → Copy UID
INSERT INTO public.admin_users (email, full_name, role, auth_uid, is_active)
VALUES 
  ('admin@newsleak.local', 'Admin User', 'super_admin', 'REPLACE_WITH_YOUR_FIREBASE_UID', true)
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- 2. ADD POPULAR RSS FEEDS
-- ============================================================================
-- These are real RSS feeds from popular news sources
-- Feel free to add/remove based on your preferences

INSERT INTO public.rss_feeds (source, url, category, description, is_active, language, country)
VALUES 
  -- World News
  ('BBC News', 'http://feeds.bbci.co.uk/news/rss.xml', 'World', 'BBC World News RSS Feed', true, 'en', 'GB'),
  ('CNN Top Stories', 'http://rss.cnn.com/rss/cnn_topstories.rss', 'World', 'CNN breaking news and top stories', true, 'en', 'US'),
  ('Al Jazeera', 'https://www.aljazeera.com/xml/rss/all.xml', 'World', 'Al Jazeera international news', true, 'en', 'QA'),
  
  -- Technology
  ('TechCrunch', 'https://techcrunch.com/feed/', 'Technology', 'Technology news and analysis', true, 'en', 'US'),
  ('The Verge', 'https://www.theverge.com/rss/index.xml', 'Technology', 'Tech news and reviews', true, 'en', 'US'),
  ('Wired', 'https://www.wired.com/feed/rss', 'Technology', 'Technology, science, and culture', true, 'en', 'US'),
  ('Ars Technica', 'https://feeds.arstechnica.com/arstechnica/index', 'Technology', 'Technology news and analysis', true, 'en', 'US'),
  
  -- Business
  ('Reuters Business', 'https://www.reutersagency.com/feed/?taxonomy=best-topics&post_type=best', 'Business', 'Reuters business news', true, 'en', 'US'),
  ('Bloomberg', 'https://feeds.bloomberg.com/markets/news.rss', 'Business', 'Bloomberg markets and business news', true, 'en', 'US'),
  
  -- Sports
  ('ESPN', 'https://www.espn.com/espn/rss/news', 'Sports', 'Sports news and updates', true, 'en', 'US'),
  ('BBC Sport', 'http://feeds.bbci.co.uk/sport/rss.xml', 'Sports', 'BBC Sports news', true, 'en', 'GB'),
  
  -- Entertainment
  ('Variety', 'https://variety.com/feed/', 'Entertainment', 'Entertainment news and analysis', true, 'en', 'US'),
  ('Hollywood Reporter', 'https://www.hollywoodreporter.com/feed/', 'Entertainment', 'Entertainment industry news', true, 'en', 'US'),
  
  -- Science
  ('Science Daily', 'https://www.sciencedaily.com/rss/all.xml', 'Science', 'Science news and research', true, 'en', 'US'),
  ('NASA', 'https://www.nasa.gov/rss/dyn/breaking_news.rss', 'Science', 'NASA space and science news', true, 'en', 'US'),
  
  -- Health
  ('WebMD', 'https://rssfeeds.webmd.com/rss/rss.aspx?RSSSource=RSS_PUBLIC', 'Health', 'Health news and information', true, 'en', 'US'),
  ('Medical News Today', 'https://www.medicalnewstoday.com/rss', 'Health', 'Medical and health news', true, 'en', 'US')
ON CONFLICT (url) DO NOTHING;

-- ============================================================================
-- 3. ADD SAMPLE TAGS
-- ============================================================================
-- Common tags for categorizing articles

INSERT INTO public.tags (name, slug, description)
VALUES 
  ('Breaking News', 'breaking-news', 'Latest breaking news stories'),
  ('Featured', 'featured', 'Featured articles'),
  ('Trending', 'trending', 'Currently trending topics'),
  ('Analysis', 'analysis', 'In-depth analysis and opinion'),
  ('Interview', 'interview', 'Interviews and Q&A'),
  ('Video', 'video', 'Articles with video content'),
  ('Photo Gallery', 'photo-gallery', 'Photo galleries and visual stories'),
  ('Opinion', 'opinion', 'Opinion pieces and editorials'),
  ('Investigation', 'investigation', 'Investigative journalism'),
  ('Local', 'local', 'Local news coverage')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 4. SAMPLE USER (for testing - optional)
-- ============================================================================
-- This creates a test user for development
-- DELETE this in production!

INSERT INTO public.users (email, username, full_name, auth_provider, is_active, email_verified)
VALUES 
  ('testuser@newsleak.local', 'testuser', 'Test User', 'email', true, true)
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- 5. SAMPLE USER PREFERENCES
-- ============================================================================
-- Set up preferences for the test user

INSERT INTO public.user_preferences (user_id, theme, text_size, notifications_enabled, favorite_categories)
SELECT 
  u.id,
  'auto' as theme,
  'medium' as text_size,
  true as notifications_enabled,
  ARRAY['Technology', 'Science', 'World']::text[] as favorite_categories
FROM public.users u
WHERE u.email = 'testuser@newsleak.local'
ON CONFLICT (user_id) DO NOTHING;

COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify the seed data was added

-- Check RSS Feeds
SELECT 
  'RSS Feeds Added' as info,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 17 THEN '✓ All feeds added'
    ELSE '⚠ Expected 17+ feeds, found ' || COUNT(*)::text
  END as status
FROM public.rss_feeds;

-- List feeds by category
SELECT 
  category,
  COUNT(*) as feed_count,
  STRING_AGG(source, ', ') as sources
FROM public.rss_feeds
WHERE is_active = true
GROUP BY category
ORDER BY category;

-- Check Tags
SELECT 
  'Tags Added' as info,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 10 THEN '✓ All tags added'
    ELSE '⚠ Expected 10+ tags, found ' || COUNT(*)::text
  END as status
FROM public.tags;

-- Check Admin Users
SELECT 
  'Admin Users' as info,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✓ Admin user exists'
    ELSE '✗ No admin users!'
  END as status
FROM public.admin_users;

-- Overall Summary
SELECT 
  '========================================' as divider,
  'SEED DATA SUMMARY' as title,
  '========================================' as divider2;

SELECT 
  (SELECT COUNT(*) FROM rss_feeds) as rss_feeds,
  (SELECT COUNT(*) FROM tags) as tags,
  (SELECT COUNT(*) FROM admin_users) as admin_users,
  (SELECT COUNT(*) FROM users) as test_users,
  (SELECT COUNT(*) FROM categories) as categories,
  '✓ Ready to fetch articles!' as next_step;

-- ============================================================================
-- NEXT STEPS
-- ============================================================================

SELECT 
  '========================================' as divider,
  'NEXT STEPS' as title,
  '========================================' as divider2;

SELECT 
  1 as step,
  'Update admin user auth_uid' as action,
  'Replace sample-admin-uid with your Firebase Auth UID' as details
UNION ALL
SELECT 
  2,
  'Configure .env file',
  'Add Supabase and Firebase credentials'
UNION ALL
SELECT 
  3,
  'Deploy fetchFeeds edge function',
  'supabase functions deploy fetchFeeds'
UNION ALL
SELECT 
  4,
  'Trigger first feed fetch',
  'Call the fetchFeeds function to populate articles'
UNION ALL
SELECT 
  5,
  'Start the application',
  'npm run dev'
ORDER BY step;
