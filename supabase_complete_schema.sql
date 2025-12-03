-- ============================================================================
-- NEWSLEAK COMPLETE DATABASE SCHEMA FOR SUPABASE
-- ============================================================================
-- This SQL file creates the complete database schema for the Newsleak news
-- aggregation platform. It includes all tables, indexes, triggers, functions,
-- views, and Row Level Security (RLS) policies.
--
-- USAGE:
-- 1. Open your Supabase project dashboard
-- 2. Navigate to SQL Editor
-- 3. Copy and paste this entire file
-- 4. Click "Run" to execute
--
-- This script is idempotent - it can be run multiple times safely.
-- Existing data will not be lost.
-- ============================================================================

-- ============================================================================
-- SECTION 1: CREATE TABLES
-- ============================================================================

-- 1.1 Admin Users Table
-- Must be created first as it's referenced by other tables
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'admin', -- 'super_admin', 'admin', 'editor'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  auth_uid TEXT UNIQUE
);

COMMENT ON TABLE public.admin_users IS 'Admin user accounts with role-based access';
COMMENT ON COLUMN public.admin_users.role IS 'User role: super_admin, admin, or editor';
COMMENT ON COLUMN public.admin_users.auth_uid IS 'Firebase/Supabase authentication UID';

-- 1.2 Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  auth_provider TEXT DEFAULT 'email', -- 'email', 'google', 'apple', 'phone'
  auth_uid TEXT UNIQUE, -- Firebase/Supabase auth UID
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false
);

COMMENT ON TABLE public.users IS 'User accounts and profile information';
COMMENT ON COLUMN public.users.auth_provider IS 'Authentication provider: email, google, apple, or phone';
COMMENT ON COLUMN public.users.auth_uid IS 'Unique authentication identifier from Firebase/Supabase';

-- 1.3 RSS Feeds Table
CREATE TABLE IF NOT EXISTS public.rss_feeds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  category TEXT,
  language TEXT DEFAULT 'en',
  country TEXT,
  is_active BOOLEAN DEFAULT true,
  fetch_interval INTEGER DEFAULT 60, -- Minutes
  last_fetched TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.admin_users(id) ON DELETE SET NULL,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  fetch_errors INTEGER DEFAULT 0,
  last_error TEXT
);

COMMENT ON TABLE public.rss_feeds IS 'RSS feed sources for news aggregation';
COMMENT ON COLUMN public.rss_feeds.fetch_interval IS 'How often to fetch this feed in minutes';
COMMENT ON COLUMN public.rss_feeds.fetch_errors IS 'Number of consecutive fetch errors';

-- 1.4 News Articles Table
CREATE TABLE IF NOT EXISTS public.news_articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  feed_id UUID REFERENCES public.rss_feeds(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  link TEXT UNIQUE NOT NULL,
  description TEXT,
  content TEXT,
  image TEXT,
  source TEXT,
  author TEXT,
  published TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_published BOOLEAN DEFAULT true,
  is_breaking BOOLEAN DEFAULT false,
  is_trending BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 0, -- Higher priority shown first
  language TEXT DEFAULT 'en',
  country TEXT,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  engagement_score DECIMAL DEFAULT 0 -- Calculated: views + likes*2 + comments*3 + shares*5
);

COMMENT ON TABLE public.news_articles IS 'News articles aggregated from RSS feeds';
COMMENT ON COLUMN public.news_articles.engagement_score IS 'Calculated engagement metric: views + likes*2 + comments*3 + shares*5';
COMMENT ON COLUMN public.news_articles.priority IS 'Editorial priority - higher numbers shown first';

-- 1.5 Article Likes Table
CREATE TABLE IF NOT EXISTS public.article_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES public.news_articles(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- Can be auth UID or anon_{uuid}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(article_id, user_id)
);

COMMENT ON TABLE public.article_likes IS 'Article likes from both authenticated and anonymous users';
COMMENT ON COLUMN public.article_likes.user_id IS 'User identifier - can be auth user ID or anon_{uuid} for anonymous users';

-- 1.6 Article Bookmarks Table
CREATE TABLE IF NOT EXISTS public.article_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES public.news_articles(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(article_id, user_id)
);

COMMENT ON TABLE public.article_bookmarks IS 'User saved/bookmarked articles';

-- 1.7 Article Views Table
CREATE TABLE IF NOT EXISTS public.article_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES public.news_articles(id) ON DELETE CASCADE,
  user_id TEXT, -- Optional, can be null for anonymous
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT
);

COMMENT ON TABLE public.article_views IS 'Article view tracking for analytics';

-- 1.8 Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES public.news_articles(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE, -- For nested comments
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT false,
  is_flagged BOOLEAN DEFAULT false,
  like_count INTEGER DEFAULT 0
);

COMMENT ON TABLE public.comments IS 'User comments on articles with nested replies support';
COMMENT ON COLUMN public.comments.parent_id IS 'References parent comment for nested/threaded replies';

-- 1.9 Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  article_id UUID REFERENCES public.news_articles(id) ON DELETE CASCADE,
  user_id TEXT, -- Null means broadcast to all users
  category_filter TEXT, -- Filter by user's preferred categories
  sent_at TIMESTAMP WITH TIME ZONE,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.admin_users(id) ON DELETE SET NULL,
  is_sent BOOLEAN DEFAULT false,
  sent_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  notification_type TEXT DEFAULT 'breaking_news', -- 'breaking_news', 'personalized', 'reminder'
  image_url TEXT,
  deep_link TEXT
);

COMMENT ON TABLE public.notifications IS 'Push notifications for users';
COMMENT ON COLUMN public.notifications.user_id IS 'NULL means broadcast to all users';
COMMENT ON COLUMN public.notifications.notification_type IS 'Type: breaking_news, personalized, or reminder';

-- 1.10 User Preferences Table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  theme TEXT DEFAULT 'light', -- 'light', 'dark', 'system'
  language TEXT DEFAULT 'en',
  favorite_categories TEXT[], -- Array of category names
  followed_sources TEXT[], -- Array of source names
  notification_enabled BOOLEAN DEFAULT true,
  breaking_news_alerts BOOLEAN DEFAULT true,
  personalized_alerts BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT false,
  text_size TEXT DEFAULT 'medium', -- 'small', 'medium', 'large'
  auto_play_videos BOOLEAN DEFAULT false,
  show_images BOOLEAN DEFAULT true,
  fcm_token TEXT, -- Firebase Cloud Messaging token for push notifications
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.user_preferences IS 'User settings and preferences';
COMMENT ON COLUMN public.user_preferences.fcm_token IS 'Firebase Cloud Messaging token for push notifications';

-- 1.11 Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.categories IS 'News categories';
COMMENT ON COLUMN public.categories.display_order IS 'Order in which categories are displayed (lower numbers first)';

-- 1.12 Article Categories Junction Table
CREATE TABLE IF NOT EXISTS public.article_categories (
  article_id UUID REFERENCES public.news_articles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (article_id, category_id)
);

COMMENT ON TABLE public.article_categories IS 'Many-to-many relationship between articles and categories';

-- 1.13 Tags Table
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.tags IS 'Tags for articles';
COMMENT ON COLUMN public.tags.usage_count IS 'Number of articles using this tag';

-- 1.14 Article Tags Junction Table
CREATE TABLE IF NOT EXISTS public.article_tags (
  article_id UUID REFERENCES public.news_articles(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (article_id, tag_id)
);

COMMENT ON TABLE public.article_tags IS 'Many-to-many relationship between articles and tags';

-- 1.15 User Activity Table
CREATE TABLE IF NOT EXISTS public.user_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  activity_type TEXT NOT NULL, -- 'view', 'like', 'bookmark', 'share', 'comment'
  article_id UUID REFERENCES public.news_articles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB -- Additional data like share platform, etc.
);

COMMENT ON TABLE public.user_activity IS 'User engagement tracking';
COMMENT ON COLUMN public.user_activity.activity_type IS 'Type of activity: view, like, bookmark, share, or comment';
COMMENT ON COLUMN public.user_activity.metadata IS 'Additional data in JSON format (e.g., share platform)';

-- ============================================================================
-- SECTION 2: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- 2.1 Admin Users Indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON public.admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_auth_uid ON public.admin_users(auth_uid);

-- 2.2 Users Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_auth_uid ON public.users(auth_uid);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);

-- 2.3 RSS Feeds Indexes
CREATE INDEX IF NOT EXISTS idx_rss_feeds_category ON public.rss_feeds(category);
CREATE INDEX IF NOT EXISTS idx_rss_feeds_is_active ON public.rss_feeds(is_active);
CREATE INDEX IF NOT EXISTS idx_rss_feeds_last_fetched ON public.rss_feeds(last_fetched);
CREATE INDEX IF NOT EXISTS idx_rss_feeds_url ON public.rss_feeds(url);

-- 2.4 News Articles Indexes
CREATE INDEX IF NOT EXISTS idx_news_articles_feed_id ON public.news_articles(feed_id);
CREATE INDEX IF NOT EXISTS idx_news_articles_published ON public.news_articles(published DESC);
CREATE INDEX IF NOT EXISTS idx_news_articles_created_at ON public.news_articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_articles_is_published ON public.news_articles(is_published);
CREATE INDEX IF NOT EXISTS idx_news_articles_is_breaking ON public.news_articles(is_breaking);
CREATE INDEX IF NOT EXISTS idx_news_articles_is_trending ON public.news_articles(is_trending);
CREATE INDEX IF NOT EXISTS idx_news_articles_engagement_score ON public.news_articles(engagement_score DESC);
CREATE INDEX IF NOT EXISTS idx_news_articles_link ON public.news_articles(link);
CREATE INDEX IF NOT EXISTS idx_news_articles_source ON public.news_articles(source);

-- 2.5 Article Likes Indexes
CREATE INDEX IF NOT EXISTS idx_article_likes_article_id ON public.article_likes(article_id);
CREATE INDEX IF NOT EXISTS idx_article_likes_user_id ON public.article_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_article_likes_created_at ON public.article_likes(created_at);

-- 2.6 Article Bookmarks Indexes
CREATE INDEX IF NOT EXISTS idx_article_bookmarks_article_id ON public.article_bookmarks(article_id);
CREATE INDEX IF NOT EXISTS idx_article_bookmarks_user_id ON public.article_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_article_bookmarks_created_at ON public.article_bookmarks(created_at DESC);

-- 2.7 Article Views Indexes
CREATE INDEX IF NOT EXISTS idx_article_views_article_id ON public.article_views(article_id);
CREATE INDEX IF NOT EXISTS idx_article_views_viewed_at ON public.article_views(viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_article_views_session_id ON public.article_views(session_id);
CREATE INDEX IF NOT EXISTS idx_article_views_user_id ON public.article_views(user_id);

-- 2.8 Comments Indexes
CREATE INDEX IF NOT EXISTS idx_comments_article_id ON public.comments(article_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at DESC);

-- 2.9 Notifications Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_sent_at ON public.notifications(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_sent ON public.notifications(is_sent);
CREATE INDEX IF NOT EXISTS idx_notifications_article_id ON public.notifications(article_id);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled_at ON public.notifications(scheduled_at);

-- 2.10 User Preferences Indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);

-- 2.11 Categories Indexes
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON public.categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON public.categories(display_order);

-- 2.12 Article Categories Indexes
CREATE INDEX IF NOT EXISTS idx_article_categories_article_id ON public.article_categories(article_id);
CREATE INDEX IF NOT EXISTS idx_article_categories_category_id ON public.article_categories(category_id);

-- 2.13 Tags Indexes
CREATE INDEX IF NOT EXISTS idx_tags_slug ON public.tags(slug);
CREATE INDEX IF NOT EXISTS idx_tags_usage_count ON public.tags(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_tags_name ON public.tags(name);

-- 2.14 Article Tags Indexes
CREATE INDEX IF NOT EXISTS idx_article_tags_article_id ON public.article_tags(article_id);
CREATE INDEX IF NOT EXISTS idx_article_tags_tag_id ON public.article_tags(tag_id);

-- 2.15 User Activity Indexes
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON public.user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_article_id ON public.user_activity(article_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_type ON public.user_activity(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON public.user_activity(created_at DESC);

-- ============================================================================
-- SECTION 3: INSERT DEFAULT DATA
-- ============================================================================

-- 3.1 Default Categories
INSERT INTO public.categories (name, slug, icon, display_order) VALUES
  ('Politics', 'politics', 'landmark', 1),
  ('Sports', 'sports', 'trophy', 2),
  ('Entertainment', 'entertainment', 'film', 3),
  ('Technology', 'technology', 'cpu', 4),
  ('Business', 'business', 'briefcase', 5),
  ('Health', 'health', 'heart-pulse', 6),
  ('Science', 'science', 'atom', 7),
  ('World', 'world', 'globe', 8)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- SECTION 4: CREATE FUNCTIONS
-- ============================================================================

-- 4.1 Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4.2 Function to update article like count
CREATE OR REPLACE FUNCTION update_article_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.news_articles 
    SET like_count = like_count + 1 
    WHERE id = NEW.article_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.news_articles 
    SET like_count = GREATEST(0, like_count - 1) 
    WHERE id = OLD.article_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 4.3 Function to update article comment count
CREATE OR REPLACE FUNCTION update_article_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.news_articles 
    SET comment_count = comment_count + 1 
    WHERE id = NEW.article_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.news_articles 
    SET comment_count = GREATEST(0, comment_count - 1) 
    WHERE id = OLD.article_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 4.4 Function to update article view count
CREATE OR REPLACE FUNCTION update_article_view_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.news_articles 
  SET view_count = view_count + 1 
  WHERE id = NEW.article_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4.5 Function to calculate engagement score
CREATE OR REPLACE FUNCTION calculate_engagement_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.engagement_score := 
    (NEW.view_count * 1) + 
    (NEW.like_count * 2) + 
    (NEW.comment_count * 3) + 
    (NEW.share_count * 5);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SECTION 5: CREATE TRIGGERS
-- ============================================================================

-- 5.1 Triggers for updated_at columns
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rss_feeds_updated_at ON public.rss_feeds;
CREATE TRIGGER update_rss_feeds_updated_at BEFORE UPDATE ON public.rss_feeds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_news_articles_updated_at ON public.news_articles;
CREATE TRIGGER update_news_articles_updated_at BEFORE UPDATE ON public.news_articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_comments_updated_at ON public.comments;
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5.2 Triggers for article statistics
DROP TRIGGER IF EXISTS trigger_update_like_count ON public.article_likes;
CREATE TRIGGER trigger_update_like_count
AFTER INSERT OR DELETE ON public.article_likes
FOR EACH ROW EXECUTE FUNCTION update_article_like_count();

DROP TRIGGER IF EXISTS trigger_update_comment_count ON public.comments;
CREATE TRIGGER trigger_update_comment_count
AFTER INSERT OR DELETE ON public.comments
FOR EACH ROW EXECUTE FUNCTION update_article_comment_count();

DROP TRIGGER IF EXISTS trigger_update_view_count ON public.article_views;
CREATE TRIGGER trigger_update_view_count
AFTER INSERT ON public.article_views
FOR EACH ROW EXECUTE FUNCTION update_article_view_count();

-- 5.3 Trigger for engagement score calculation
DROP TRIGGER IF EXISTS trigger_calculate_engagement ON public.news_articles;
CREATE TRIGGER trigger_calculate_engagement
BEFORE INSERT OR UPDATE ON public.news_articles
FOR EACH ROW EXECUTE FUNCTION calculate_engagement_score();

-- ============================================================================
-- SECTION 6: ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rss_feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SECTION 7: CREATE RLS POLICIES
-- ============================================================================

-- Drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public read access to published articles" ON public.news_articles;
DROP POLICY IF EXISTS "Public read access to categories" ON public.categories;
DROP POLICY IF EXISTS "Public read access to tags" ON public.tags;
DROP POLICY IF EXISTS "Public read access to active feeds" ON public.rss_feeds;
DROP POLICY IF EXISTS "Public read access to comments" ON public.comments;
DROP POLICY IF EXISTS "Public read access to article_categories" ON public.article_categories;
DROP POLICY IF EXISTS "Public read access to article_tags" ON public.article_tags;
DROP POLICY IF EXISTS "Public read access to article_likes" ON public.article_likes;
DROP POLICY IF EXISTS "Allow public read access to article_likes" ON public.article_likes;
DROP POLICY IF EXISTS "Users can insert their own likes" ON public.article_likes;
DROP POLICY IF EXISTS "Allow users to insert their own likes" ON public.article_likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON public.article_likes;
DROP POLICY IF EXISTS "Allow users to delete their own likes" ON public.article_likes;
DROP POLICY IF EXISTS "Users can manage their bookmarks" ON public.article_bookmarks;
DROP POLICY IF EXISTS "Anyone can record article views" ON public.article_views;
DROP POLICY IF EXISTS "Users can create comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can manage their preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can record their activity" ON public.user_activity;
DROP POLICY IF EXISTS "Admins can read admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can manage RSS feeds" ON public.rss_feeds;
DROP POLICY IF EXISTS "Admins can manage articles" ON public.news_articles;
DROP POLICY IF EXISTS "Admins can manage notifications" ON public.notifications;

-- 7.1 Public Read Policies (for anonymous users)
CREATE POLICY "Public read access to published articles"
  ON public.news_articles FOR SELECT
  USING (is_published = true);

CREATE POLICY "Public read access to categories"
  ON public.categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public read access to tags"
  ON public.tags FOR SELECT
  USING (true);

CREATE POLICY "Public read access to active feeds"
  ON public.rss_feeds FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public read access to comments"
  ON public.comments FOR SELECT
  USING (is_deleted = false);

CREATE POLICY "Public read access to article_categories"
  ON public.article_categories FOR SELECT
  USING (true);

CREATE POLICY "Public read access to article_tags"
  ON public.article_tags FOR SELECT
  USING (true);

-- 7.2 Article Likes Policies (support for anonymous users)
CREATE POLICY "Public read access to article_likes"
  ON public.article_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own likes"
  ON public.article_likes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can delete their own likes"
  ON public.article_likes FOR DELETE
  USING (true);

-- 7.3 User-Specific Policies
CREATE POLICY "Users can manage their bookmarks"
  ON public.article_bookmarks FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can record article views"
  ON public.article_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can create comments"
  ON public.comments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own comments"
  ON public.comments FOR UPDATE
  USING (user_id = current_setting('request.jwt.claim.sub', true));

CREATE POLICY "Users can delete their own comments"
  ON public.comments FOR DELETE
  USING (user_id = current_setting('request.jwt.claim.sub', true));

CREATE POLICY "Users can manage their preferences"
  ON public.user_preferences FOR ALL
  USING (user_id = current_setting('request.jwt.claim.sub', true))
  WITH CHECK (user_id = current_setting('request.jwt.claim.sub', true));

CREATE POLICY "Users can record their activity"
  ON public.user_activity FOR INSERT
  WITH CHECK (true);

-- 7.4 Admin-Only Policies
CREATE POLICY "Admins can read admin_users"
  ON public.admin_users FOR SELECT
  USING (
    auth.uid()::text IN (SELECT auth_uid FROM public.admin_users WHERE is_active = true)
  );

CREATE POLICY "Admins can manage RSS feeds"
  ON public.rss_feeds FOR ALL
  USING (
    auth.uid()::text IN (SELECT auth_uid FROM public.admin_users WHERE is_active = true)
  );

CREATE POLICY "Admins can manage articles"
  ON public.news_articles FOR ALL
  USING (
    auth.uid()::text IN (SELECT auth_uid FROM public.admin_users WHERE is_active = true)
  );

CREATE POLICY "Admins can manage notifications"
  ON public.notifications FOR ALL
  USING (
    auth.uid()::text IN (SELECT auth_uid FROM public.admin_users WHERE is_active = true)
  );

-- ============================================================================
-- SECTION 8: CREATE VIEWS FOR ANALYTICS
-- ============================================================================

-- 8.1 Popular Articles View
CREATE OR REPLACE VIEW popular_articles AS
SELECT 
  na.*,
  COUNT(DISTINCT av.id) as total_views,
  COUNT(DISTINCT al.id) as total_likes,
  COUNT(DISTINCT c.id) as total_comments
FROM news_articles na
LEFT JOIN article_views av ON na.id = av.article_id
LEFT JOIN article_likes al ON na.id = al.article_id
LEFT JOIN comments c ON na.id = c.article_id
WHERE na.is_published = true
GROUP BY na.id
ORDER BY na.engagement_score DESC;

-- 8.2 Trending Articles View (last 24 hours)
CREATE OR REPLACE VIEW trending_articles AS
SELECT 
  na.*,
  COUNT(DISTINCT av.id) as recent_views,
  COUNT(DISTINCT al.id) as recent_likes
FROM news_articles na
LEFT JOIN article_views av ON na.id = av.article_id AND av.viewed_at > NOW() - INTERVAL '24 hours'
LEFT JOIN article_likes al ON na.id = al.article_id AND al.created_at > NOW() - INTERVAL '24 hours'
WHERE na.is_published = true AND na.published > NOW() - INTERVAL '7 days'
GROUP BY na.id
ORDER BY (COUNT(DISTINCT av.id) + COUNT(DISTINCT al.id) * 2) DESC
LIMIT 50;

-- ============================================================================
-- SECTION 9: CREATE MATERIALIZED VIEWS (OPTIONAL)
-- ============================================================================

-- 9.1 Article Stats Materialized View
-- This can be refreshed periodically for better performance
CREATE MATERIALIZED VIEW IF NOT EXISTS article_stats AS
SELECT 
  article_id,
  COUNT(DISTINCT CASE WHEN activity_type = 'view' THEN user_id END) as unique_viewers,
  COUNT(DISTINCT CASE WHEN activity_type = 'like' THEN user_id END) as unique_likers,
  COUNT(DISTINCT CASE WHEN activity_type = 'share' THEN user_id END) as unique_sharers,
  COUNT(DISTINCT CASE WHEN activity_type = 'comment' THEN user_id END) as unique_commenters
FROM user_activity
GROUP BY article_id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_article_stats_article_id ON article_stats(article_id);

-- To refresh the materialized view, run:
-- REFRESH MATERIALIZED VIEW CONCURRENTLY article_stats;

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================

-- Your Newsleak database schema is now ready!
-- 
-- Next steps:
-- 1. Set up Supabase Edge Functions:
--    - fetchFeeds (for RSS feed aggregation)
--    - sendNotification (for push notifications)
-- 
-- 2. Configure your .env file with Supabase credentials:
--    - VITE_SUPABASE_URL
--    - VITE_SUPABASE_ANON_KEY
--    - SUPABASE_SERVICE_ROLE_KEY (for Edge Functions)
--
-- 3. (Optional) Refresh the materialized view periodically:
--    REFRESH MATERIALIZED VIEW CONCURRENTLY article_stats;
--
-- 4. Start building amazing news experiences!
-- ============================================================================
