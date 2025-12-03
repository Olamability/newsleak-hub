# Newsleak Database Schema Documentation

This document provides the complete database schema for the Newsleak news aggregation platform, including all tables, relationships, indexes, and Row Level Security (RLS) policies.

## Database: PostgreSQL (Supabase)

## Tables Overview

1. **users** - User accounts and profiles
2. **rss_feeds** - News source RSS feeds
3. **news_articles** - Aggregated news articles
4. **article_likes** - User likes on articles
5. **article_bookmarks** - User bookmarks
6. **article_views** - Article view tracking
7. **comments** - User comments on articles
8. **notifications** - Push notifications sent to users
9. **user_preferences** - User settings and preferences
10. **categories** - News categories
11. **article_categories** - Many-to-many relationship
12. **tags** - Article tags
13. **article_tags** - Many-to-many relationship
14. **admin_users** - Admin accounts
15. **user_activity** - User engagement tracking

---

## Table Schemas

### 1. users

Stores user account information.

```sql
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

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_auth_uid ON public.users(auth_uid);
CREATE INDEX idx_users_created_at ON public.users(created_at);

COMMENT ON TABLE public.users IS 'User accounts and profile information';
```

### 2. rss_feeds

News sources and RSS feed URLs.

```sql
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
  created_by UUID REFERENCES public.admin_users(id),
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  fetch_errors INTEGER DEFAULT 0,
  last_error TEXT
);

CREATE INDEX idx_rss_feeds_category ON public.rss_feeds(category);
CREATE INDEX idx_rss_feeds_is_active ON public.rss_feeds(is_active);
CREATE INDEX idx_rss_feeds_last_fetched ON public.rss_feeds(last_fetched);

COMMENT ON TABLE public.rss_feeds IS 'RSS feed sources for news aggregation';
```

### 3. news_articles

Aggregated news articles from RSS feeds.

```sql
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

CREATE INDEX idx_news_articles_feed_id ON public.news_articles(feed_id);
CREATE INDEX idx_news_articles_published ON public.news_articles(published DESC);
CREATE INDEX idx_news_articles_created_at ON public.news_articles(created_at DESC);
CREATE INDEX idx_news_articles_is_published ON public.news_articles(is_published);
CREATE INDEX idx_news_articles_is_breaking ON public.news_articles(is_breaking);
CREATE INDEX idx_news_articles_is_trending ON public.news_articles(is_trending);
CREATE INDEX idx_news_articles_engagement_score ON public.news_articles(engagement_score DESC);
CREATE INDEX idx_news_articles_link ON public.news_articles(link);
CREATE INDEX idx_news_articles_source ON public.news_articles(source);

COMMENT ON TABLE public.news_articles IS 'News articles aggregated from RSS feeds';
```

### 4. article_likes

User likes on articles.

```sql
CREATE TABLE IF NOT EXISTS public.article_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES public.news_articles(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- Can be auth UID or anon_{uuid}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(article_id, user_id)
);

CREATE INDEX idx_article_likes_article_id ON public.article_likes(article_id);
CREATE INDEX idx_article_likes_user_id ON public.article_likes(user_id);
CREATE INDEX idx_article_likes_created_at ON public.article_likes(created_at);

COMMENT ON TABLE public.article_likes IS 'Article likes from authenticated and anonymous users';
```

### 5. article_bookmarks

User bookmarks.

```sql
CREATE TABLE IF NOT EXISTS public.article_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES public.news_articles(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(article_id, user_id)
);

CREATE INDEX idx_article_bookmarks_article_id ON public.article_bookmarks(article_id);
CREATE INDEX idx_article_bookmarks_user_id ON public.article_bookmarks(user_id);
CREATE INDEX idx_article_bookmarks_created_at ON public.article_bookmarks(created_at DESC);

COMMENT ON TABLE public.article_bookmarks IS 'User saved/bookmarked articles';
```

### 6. article_views

Track article views for analytics.

```sql
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

CREATE INDEX idx_article_views_article_id ON public.article_views(article_id);
CREATE INDEX idx_article_views_viewed_at ON public.article_views(viewed_at DESC);
CREATE INDEX idx_article_views_session_id ON public.article_views(session_id);

COMMENT ON TABLE public.article_views IS 'Article view tracking for analytics';
```

### 7. comments

User comments on articles.

```sql
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

CREATE INDEX idx_comments_article_id ON public.comments(article_id);
CREATE INDEX idx_comments_user_id ON public.comments(user_id);
CREATE INDEX idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX idx_comments_created_at ON public.comments(created_at DESC);

COMMENT ON TABLE public.comments IS 'User comments on articles with nested replies support';
```

### 8. notifications

Push notifications sent to users.

```sql
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
  created_by UUID REFERENCES public.admin_users(id),
  is_sent BOOLEAN DEFAULT false,
  sent_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  notification_type TEXT DEFAULT 'breaking_news', -- 'breaking_news', 'personalized', 'reminder'
  image_url TEXT,
  deep_link TEXT
);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_sent_at ON public.notifications(sent_at DESC);
CREATE INDEX idx_notifications_is_sent ON public.notifications(is_sent);
CREATE INDEX idx_notifications_article_id ON public.notifications(article_id);

COMMENT ON TABLE public.notifications IS 'Push notifications for users';
```

### 9. user_preferences

User settings and preferences.

```sql
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);

COMMENT ON TABLE public.user_preferences IS 'User settings and preferences';
```

### 10. categories

News categories.

```sql
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

CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_categories_is_active ON public.categories(is_active);
CREATE INDEX idx_categories_display_order ON public.categories(display_order);

COMMENT ON TABLE public.categories IS 'News categories';

-- Insert default categories
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
```

### 11. article_categories

Many-to-many relationship between articles and categories.

```sql
CREATE TABLE IF NOT EXISTS public.article_categories (
  article_id UUID REFERENCES public.news_articles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (article_id, category_id)
);

CREATE INDEX idx_article_categories_article_id ON public.article_categories(article_id);
CREATE INDEX idx_article_categories_category_id ON public.article_categories(category_id);

COMMENT ON TABLE public.article_categories IS 'Many-to-many relationship between articles and categories';
```

### 12. tags

Article tags.

```sql
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tags_slug ON public.tags(slug);
CREATE INDEX idx_tags_usage_count ON public.tags(usage_count DESC);

COMMENT ON TABLE public.tags IS 'Tags for articles';
```

### 13. article_tags

Many-to-many relationship between articles and tags.

```sql
CREATE TABLE IF NOT EXISTS public.article_tags (
  article_id UUID REFERENCES public.news_articles(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (article_id, tag_id)
);

CREATE INDEX idx_article_tags_article_id ON public.article_tags(article_id);
CREATE INDEX idx_article_tags_tag_id ON public.article_tags(tag_id);

COMMENT ON TABLE public.article_tags IS 'Many-to-many relationship between articles and tags';
```

### 14. admin_users

Admin user accounts.

```sql
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

CREATE INDEX idx_admin_users_email ON public.admin_users(email);
CREATE INDEX idx_admin_users_role ON public.admin_users(role);

COMMENT ON TABLE public.admin_users IS 'Admin user accounts';
```

### 15. user_activity

Track user engagement for analytics.

```sql
CREATE TABLE IF NOT EXISTS public.user_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  activity_type TEXT NOT NULL, -- 'view', 'like', 'bookmark', 'share', 'comment'
  article_id UUID REFERENCES public.news_articles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB -- Additional data like share platform, etc.
);

CREATE INDEX idx_user_activity_user_id ON public.user_activity(user_id);
CREATE INDEX idx_user_activity_article_id ON public.user_activity(article_id);
CREATE INDEX idx_user_activity_type ON public.user_activity(activity_type);
CREATE INDEX idx_user_activity_created_at ON public.user_activity(created_at DESC);

COMMENT ON TABLE public.user_activity IS 'User engagement tracking';
```

---

## Row Level Security (RLS) Policies

### Enable RLS on all tables

```sql
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
```

### Public Read Access (for anonymous users)

```sql
-- News articles - public read
CREATE POLICY "Public read access to published articles"
  ON public.news_articles FOR SELECT
  USING (is_published = true);

-- Categories - public read
CREATE POLICY "Public read access to categories"
  ON public.categories FOR SELECT
  USING (is_active = true);

-- Tags - public read
CREATE POLICY "Public read access to tags"
  ON public.tags FOR SELECT
  USING (true);

-- RSS Feeds - public read for active feeds
CREATE POLICY "Public read access to active feeds"
  ON public.rss_feeds FOR SELECT
  USING (is_active = true);

-- Article likes - public read
CREATE POLICY "Public read access to article_likes"
  ON public.article_likes FOR SELECT
  USING (true);

-- Comments - public read
CREATE POLICY "Public read access to comments"
  ON public.comments FOR SELECT
  USING (is_deleted = false);

-- Article categories - public read
CREATE POLICY "Public read access to article_categories"
  ON public.article_categories FOR SELECT
  USING (true);

-- Article tags - public read
CREATE POLICY "Public read access to article_tags"
  ON public.article_tags FOR SELECT
  USING (true);
```

### User-Specific Policies

```sql
-- Article likes - insert/delete
CREATE POLICY "Users can manage their likes"
  ON public.article_likes FOR ALL
  USING (true)
  WITH CHECK (true);

-- Article bookmarks - full access for own bookmarks
CREATE POLICY "Users can manage their bookmarks"
  ON public.article_bookmarks FOR ALL
  USING (true)
  WITH CHECK (true);

-- Comments - users can CRUD their own comments
CREATE POLICY "Users can create comments"
  ON public.comments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own comments"
  ON public.comments FOR UPDATE
  USING (user_id = current_setting('request.jwt.claim.sub', true));

CREATE POLICY "Users can delete their own comments"
  ON public.comments FOR DELETE
  USING (user_id = current_setting('request.jwt.claim.sub', true));

-- User preferences - users can manage their own
CREATE POLICY "Users can manage their preferences"
  ON public.user_preferences FOR ALL
  USING (user_id = current_setting('request.jwt.claim.sub', true))
  WITH CHECK (user_id = current_setting('request.jwt.claim.sub', true));

-- Article views - anyone can insert
CREATE POLICY "Anyone can record article views"
  ON public.article_views FOR INSERT
  WITH CHECK (true);

-- User activity - users can insert their own
CREATE POLICY "Users can record their activity"
  ON public.user_activity FOR INSERT
  WITH CHECK (true);
```

### Admin-Only Policies

```sql
-- Admin users table - only readable by admins
CREATE POLICY "Admins can read admin_users"
  ON public.admin_users FOR SELECT
  USING (
    auth.uid()::text IN (SELECT auth_uid FROM public.admin_users WHERE is_active = true)
  );

-- RSS feeds - admins can manage
CREATE POLICY "Admins can manage RSS feeds"
  ON public.rss_feeds FOR ALL
  USING (
    auth.uid()::text IN (SELECT auth_uid FROM public.admin_users WHERE is_active = true)
  );

-- News articles - admins can manage all
CREATE POLICY "Admins can manage articles"
  ON public.news_articles FOR ALL
  USING (
    auth.uid()::text IN (SELECT auth_uid FROM public.admin_users WHERE is_active = true)
  );

-- Notifications - admins can manage
CREATE POLICY "Admins can manage notifications"
  ON public.notifications FOR ALL
  USING (
    auth.uid()::text IN (SELECT auth_uid FROM public.admin_users WHERE is_active = true)
  );
```

---

## Database Functions & Triggers

### Auto-update timestamps

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rss_feeds_updated_at BEFORE UPDATE ON public.rss_feeds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_articles_updated_at BEFORE UPDATE ON public.news_articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Auto-update article counts

```sql
-- Update like count when likes change
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

CREATE TRIGGER trigger_update_like_count
AFTER INSERT OR DELETE ON public.article_likes
FOR EACH ROW EXECUTE FUNCTION update_article_like_count();

-- Update comment count
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

CREATE TRIGGER trigger_update_comment_count
AFTER INSERT OR DELETE ON public.comments
FOR EACH ROW EXECUTE FUNCTION update_article_comment_count();

-- Update view count
CREATE OR REPLACE FUNCTION update_article_view_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.news_articles 
  SET view_count = view_count + 1 
  WHERE id = NEW.article_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_view_count
AFTER INSERT ON public.article_views
FOR EACH ROW EXECUTE FUNCTION update_article_view_count();
```

### Calculate engagement score

```sql
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

CREATE TRIGGER trigger_calculate_engagement
BEFORE INSERT OR UPDATE ON public.news_articles
FOR EACH ROW EXECUTE FUNCTION calculate_engagement_score();
```

---

## Views for Analytics

### Popular articles view

```sql
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
```

### Trending articles (last 24 hours)

```sql
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
```

---

## Performance Optimization

### Materialized views for expensive queries

```sql
CREATE MATERIALIZED VIEW IF NOT EXISTS article_stats AS
SELECT 
  article_id,
  COUNT(DISTINCT CASE WHEN activity_type = 'view' THEN user_id END) as unique_viewers,
  COUNT(DISTINCT CASE WHEN activity_type = 'like' THEN user_id END) as unique_likers,
  COUNT(DISTINCT CASE WHEN activity_type = 'share' THEN user_id END) as unique_sharers
FROM user_activity
GROUP BY article_id;

CREATE UNIQUE INDEX ON article_stats(article_id);

-- Refresh periodically (via cron or manually)
-- REFRESH MATERIALIZED VIEW CONCURRENTLY article_stats;
```

---

## Entity Relationship Diagram

```
users
  └─── user_preferences (1:1)
  └─── article_likes (1:many)
  └─── article_bookmarks (1:many)
  └─── comments (1:many)
  └─── user_activity (1:many)

rss_feeds
  └─── news_articles (1:many)
  └─── created_by → admin_users

news_articles
  ├─── article_likes (1:many)
  ├─── article_bookmarks (1:many)
  ├─── article_views (1:many)
  ├─── comments (1:many)
  ├─── notifications (1:many)
  ├─── article_categories (many:many) ← categories
  └─── article_tags (many:many) ← tags

admin_users
  ├─── rss_feeds (1:many)
  └─── notifications (1:many)

comments
  └─── parent_id → comments (self-reference)
```

---

## Migration Notes

1. Run migrations in order
2. For existing data, use upserts to avoid conflicts
3. Back up database before running migrations
4. Test in development environment first
5. Monitor performance after adding indexes
6. Use `CONCURRENTLY` for index creation in production to avoid locking

---

## Next Steps

1. Apply schema using migration files
2. Set up Supabase Edge Functions for:
   - RSS feed fetching
   - Push notification sending
   - Engagement score calculation
3. Configure real-time subscriptions for:
   - New articles
   - New comments
   - Notifications
4. Set up monitoring and analytics
