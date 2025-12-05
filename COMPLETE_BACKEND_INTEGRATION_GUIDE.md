# 🚀 Complete Backend Integration Guide - Newsleak Hub

## 📋 Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Database Setup](#database-setup)
4. [Environment Configuration](#environment-configuration)
5. [Supabase Edge Functions](#supabase-edge-functions)
6. [Firebase Setup](#firebase-setup)
7. [Testing the Integration](#testing-the-integration)
8. [Troubleshooting](#troubleshooting)
9. [API Reference](#api-reference)

---

## 🎯 Overview

This guide provides complete step-by-step instructions for setting up the Newsleak backend from scratch. The backend uses:

- **Database**: PostgreSQL via Supabase
- **Authentication**: Firebase Auth (with Supabase Auth support)
- **Real-time Updates**: Supabase Realtime
- **RSS Feed Processing**: Supabase Edge Functions
- **Push Notifications**: Firebase Cloud Messaging (FCM)
- **File Storage**: Supabase Storage (for images)

### What This Guide Covers

✅ Complete database schema creation  
✅ Row Level Security (RLS) policies  
✅ Environment variables setup  
✅ Edge functions deployment  
✅ Authentication configuration  
✅ Sample data insertion  
✅ API endpoint documentation  

---

## 📦 Prerequisites

Before starting, ensure you have:

1. **Node.js 18+** installed - [Download](https://nodejs.org/)
2. **Supabase Account** - [Sign up free](https://supabase.com)
3. **Firebase Account** - [Sign up free](https://firebase.google.com)
4. **Git** installed
5. **Code editor** (VS Code recommended)

---

## 🗄️ Database Setup

### Step 1: Create a Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click **"New Project"**
3. Fill in:
   - **Name**: `newsleak-hub`
   - **Database Password**: (generate a strong password and save it)
   - **Region**: Choose closest to your users
4. Click **"Create new project"** (takes 2-3 minutes)

### Step 2: Run the Complete Database Schema

1. In your Supabase project, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Open the file `supabase_complete_schema.sql` from this repository
4. Copy **ALL** content (726 lines) and paste into the SQL Editor
5. Click **"Run"** or press `Ctrl+Enter`

**What This Creates:**

```
📊 Tables Created (15 tables):
├── admin_users          - Admin user accounts
├── users                - Regular user accounts
├── rss_feeds            - RSS feed sources
├── news_articles        - News articles from feeds
├── article_likes        - User likes on articles
├── article_bookmarks    - User saved articles
├── article_views        - Article view analytics
├── comments             - User comments on articles
├── notifications        - Push notifications
├── user_preferences     - User settings
├── categories           - News categories
├── article_categories   - Article-category mapping
├── tags                 - Article tags
├── article_tags         - Article-tag mapping
└── user_activity        - User engagement tracking

🔒 Security:
├── Row Level Security (RLS) enabled on all tables
├── Public read access for published content
├── User-specific access for personal data
└── Admin-only access for management

⚡ Performance:
├── 40+ indexes for fast queries
├── Automatic timestamp updates
├── Engagement score calculation
└── View/like/comment count updates

🎨 Features:
├── Nested comments support
├── Trending algorithm
├── Personalization system
└── Analytics tracking
```

### Step 3: Verify Database Setup

Run this verification query in SQL Editor:

```sql
-- Check that all tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see 15 tables listed.

### Step 4: Insert Sample Data (Optional)

To test with sample articles, run:

```sql
-- Insert sample RSS feeds
INSERT INTO public.rss_feeds (source, url, category, is_active, description, website_url) VALUES
  ('BBC News', 'https://feeds.bbci.co.uk/news/rss.xml', 'World', true, 'BBC World News', 'https://www.bbc.com/news'),
  ('TechCrunch', 'https://techcrunch.com/feed/', 'Technology', true, 'Latest technology news', 'https://techcrunch.com'),
  ('ESPN', 'https://www.espn.com/espn/rss/news', 'Sports', true, 'Sports news and updates', 'https://www.espn.com')
ON CONFLICT (url) DO NOTHING;

-- Insert sample categories (already done in schema, but verify)
SELECT * FROM public.categories;

-- Create a test admin user (use your Firebase auth UID)
INSERT INTO public.admin_users (email, full_name, role, auth_uid) VALUES
  ('admin@newsleak.com', 'Admin User', 'super_admin', 'YOUR_FIREBASE_AUTH_UID_HERE')
ON CONFLICT (email) DO NOTHING;
```

**Important**: Replace `YOUR_FIREBASE_AUTH_UID_HERE` with your actual Firebase user ID after setting up authentication.

---

## ⚙️ Environment Configuration

### Step 1: Get Your Supabase Credentials

1. In Supabase Dashboard, go to **Settings** → **API**
2. Find these values:

```
Project URL: https://xxxxx.supabase.co
anon public: eyJhbGci... (starts with eyJ)
service_role: eyJhbGci... (starts with eyJ - KEEP SECRET!)
```

### Step 2: Create Your .env File

1. In your project root, copy the example:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your actual values:

```env
# ============================================================================
# SUPABASE CONFIGURATION (Required)
# ============================================================================
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ⚠️ NEVER expose this in client code! Only for Edge Functions
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ============================================================================
# FIREBASE CONFIGURATION (Required for Authentication)
# ============================================================================
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-app.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc

# ============================================================================
# FIREBASE CLOUD MESSAGING (Optional - for Push Notifications)
# ============================================================================
VITE_FIREBASE_VAPID_KEY=BNKd...
FIREBASE_SERVER_KEY=AAAAxxxx (for Edge Functions only)

# ============================================================================
# APPLICATION CONFIGURATION
# ============================================================================
VITE_APP_URL=http://localhost:8080
VITE_APP_NAME=Newsleak
```

### Step 3: Verify Environment Variables

Create a script to verify:

```bash
npm run build
```

If it builds successfully, your environment is configured correctly!

---

## 🔥 Firebase Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Add project"**
3. Enter project name: `newsleak-hub`
4. Follow the wizard (disable Google Analytics if not needed)
5. Click **"Create project"**

### Step 2: Enable Authentication

1. In Firebase Console, click **Authentication** → **Get started**
2. Click **Sign-in method** tab
3. Enable these providers:
   - ✅ **Email/Password** - Click to enable
   - ✅ **Google** (optional)
   - ✅ **Apple** (optional for iOS)
4. Click **Save**

### Step 3: Register Web App

1. In Firebase Project Overview, click **Web icon** (</>) 
2. Register app:
   - **App nickname**: `Newsleak Web`
   - ✅ Check "Also set up Firebase Hosting"
3. Copy the Firebase config object
4. Paste values into your `.env` file (see Environment Configuration above)

### Step 4: Enable Cloud Messaging (for Push Notifications)

1. In Firebase Console, go to **Project Settings** → **Cloud Messaging**
2. Under **Web Push certificates**, click **"Generate key pair"**
3. Copy the **VAPID key** to `.env` as `VITE_FIREBASE_VAPID_KEY`
4. Copy the **Server key** to `.env` as `FIREBASE_SERVER_KEY`

---

## 🌐 Supabase Edge Functions

Edge Functions handle RSS feed fetching and push notifications.

### Step 1: Install Supabase CLI

```bash
npm install -g supabase
```

### Step 2: Login to Supabase

```bash
supabase login
```

Follow the browser prompt to authenticate.

### Step 3: Link Your Project

```bash
cd /path/to/newsleak-hub
supabase link --project-ref YOUR_PROJECT_REF
```

Find `YOUR_PROJECT_REF` in Supabase Dashboard → Settings → General → Reference ID

### Step 4: Deploy Edge Functions

Deploy the RSS feed fetcher:

```bash
supabase functions deploy fetchFeeds
```

Deploy the notification sender:

```bash
supabase functions deploy sendNotification
```

### Step 5: Set Edge Function Secrets

```bash
# Set Supabase service role key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Set Firebase server key (for notifications)
supabase secrets set FIREBASE_SERVER_KEY="your-firebase-server-key"
```

### Step 6: Test Edge Functions

Test RSS feed fetching:

```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/fetchFeeds \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

If successful, you'll see RSS articles added to your database!

---

## 🧪 Testing the Integration

### Step 1: Install Dependencies

```bash
npm install --legacy-peer-deps
```

### Step 2: Start Development Server

```bash
npm run dev
```

Visit: http://localhost:8080

### Step 3: Verify Homepage Display

The homepage should display:

✅ **Real articles** from your database  
✅ **Source names** (e.g., "BBC News", "TechCrunch")  
✅ **Timestamps** (e.g., "2h", "1d")  
✅ **Article titles**  
✅ **Featured images** from RSS feeds  
✅ **Like and comment counts**  
✅ **No placeholder or mock data**  

### Step 4: Test User Features

1. **Sign Up**: Create a new account
2. **Like Article**: Click heart icon on an article
3. **Bookmark**: Click bookmark icon
4. **Comment**: Open an article and add a comment
5. **Search**: Try searching for articles
6. **Categories**: Filter by category

### Step 5: Test Admin Features

1. Login as admin (you need to add your Firebase UID to `admin_users` table)
2. Go to `/admin`
3. Test:
   - Add RSS feed
   - View analytics
   - Send push notification
   - Manage articles

---

## 🔍 Troubleshooting

### Issue: "Missing Supabase configuration"

**Solution**: Check that your `.env` file has correct values for:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Issue: "No articles showing on homepage"

**Causes & Solutions**:

1. **No articles in database yet**
   - Run Edge Function to fetch RSS feeds
   - Or insert sample data manually

2. **RLS policies blocking access**
   - Verify articles have `is_published = true`
   - Check RLS policies in Supabase Dashboard

3. **Query error**
   - Open browser DevTools → Console
   - Look for error messages
   - Check Network tab for failed requests

### Issue: "Authentication not working"

**Solution**:
1. Verify Firebase configuration in `.env`
2. Check Firebase Authentication is enabled
3. Check browser console for errors
4. Clear browser cache and cookies

### Issue: "Edge Functions failing"

**Solution**:
1. Check function logs:
   ```bash
   supabase functions logs fetchFeeds
   ```
2. Verify secrets are set:
   ```bash
   supabase secrets list
   ```
3. Redeploy function:
   ```bash
   supabase functions deploy fetchFeeds
   ```

### Issue: "Images not displaying"

**Causes**:
1. RSS feed doesn't have images
2. Image URLs are broken
3. CORS issues

**Solution**: The schema includes automatic image extraction from RSS feeds using multiple strategies. If images still don't show, check the `image` field in `news_articles` table.

---

## 📚 API Reference

### News Articles API

#### Get All Articles
```typescript
const { data, error } = await supabase
  .from('news_articles')
  .select('*')
  .eq('is_published', true)
  .order('published', { ascending: false });
```

#### Get Article by ID
```typescript
const { data, error } = await supabase
  .from('news_articles')
  .select('*')
  .eq('id', articleId)
  .single();
```

#### Get Articles by Category
```typescript
const { data, error } = await supabase
  .from('news_articles')
  .select('*')
  .eq('category', 'Technology')
  .eq('is_published', true)
  .order('published', { ascending: false });
```

### Likes API

#### Add Like
```typescript
const { error } = await supabase
  .from('article_likes')
  .insert({
    article_id: articleId,
    user_id: userId
  });
```

#### Remove Like
```typescript
const { error } = await supabase
  .from('article_likes')
  .delete()
  .eq('article_id', articleId)
  .eq('user_id', userId);
```

#### Check if Liked
```typescript
const { data } = await supabase
  .from('article_likes')
  .select('id')
  .eq('article_id', articleId)
  .eq('user_id', userId)
  .single();

const isLiked = !!data;
```

### Bookmarks API

#### Add Bookmark
```typescript
const { error } = await supabase
  .from('article_bookmarks')
  .insert({
    article_id: articleId,
    user_id: userId,
    article: articleData
  });
```

#### Get User Bookmarks
```typescript
const { data, error } = await supabase
  .from('article_bookmarks')
  .select('article')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });
```

### Comments API

#### Add Comment
```typescript
const { error } = await supabase
  .from('comments')
  .insert({
    article_id: articleId,
    user_id: userId,
    content: commentText
  });
```

#### Get Article Comments
```typescript
const { data, error } = await supabase
  .from('comments')
  .select('*')
  .eq('article_id', articleId)
  .eq('is_deleted', false)
  .order('created_at', { ascending: false });
```

### RSS Feeds API (Admin Only)

#### Add RSS Feed
```typescript
const { error } = await supabase
  .from('rss_feeds')
  .insert({
    source: 'Feed Name',
    url: 'https://example.com/rss',
    category: 'Technology',
    is_active: true
  });
```

#### Trigger Feed Fetch (Edge Function)
```typescript
const { data, error } = await supabase.functions.invoke('fetchFeeds');
```

---

## 🎓 Next Steps

After completing this guide, you should have:

✅ A fully functional PostgreSQL database on Supabase  
✅ All tables, indexes, and RLS policies configured  
✅ Firebase authentication working  
✅ Edge functions deployed for RSS fetching  
✅ Real news articles displaying on the homepage  
✅ All user features (likes, bookmarks, comments) working  

### Production Deployment

When ready for production:

1. **Update Environment Variables** for production
2. **Deploy to Vercel/Netlify** - See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
3. **Set up custom domain**
4. **Configure CORS** in Supabase
5. **Enable rate limiting** on Edge Functions
6. **Set up monitoring** (Sentry, LogRocket)

### Maintenance

**Daily**:
- Monitor error logs
- Check Edge Function execution

**Weekly**:
- Review database performance
- Clean up old article views
- Refresh materialized views:
  ```sql
  REFRESH MATERIALIZED VIEW CONCURRENTLY article_stats;
  ```

**Monthly**:
- Analyze user growth
- Optimize slow queries
- Update RSS feed sources

---

## 🤝 Support

- **Documentation**: Check other `.md` files in this repository
- **Issues**: [GitHub Issues](https://github.com/Olamability/newsleak-hub/issues)
- **Supabase Docs**: https://supabase.com/docs
- **Firebase Docs**: https://firebase.google.com/docs

---

## 📄 License

This project is open source and available under the MIT License.

---

**Last Updated**: December 2024  
**Version**: 2.0.0  
**Maintained by**: Newsleak Team
