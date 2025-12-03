# 🔧 Backend Setup Guide - Exact Configuration Steps

This guide provides the **exact steps and data** needed to set up the Newsleak backend, fix database connection issues, and enable RSS feed fetching.

---

## 🚨 Critical Issues Found and Fixed

### Issue 1: Wrong Supabase Key Type (SECURITY ISSUE)
**Problem**: The `.env` file was using a `service_role` key as the `VITE_SUPABASE_ANON_KEY`.

**Why This is Dangerous**:
- Service role keys bypass Row Level Security (RLS)
- They give full database access to anyone who views your client-side code
- They should NEVER be used in client-side code (anything with `VITE_` prefix)

**Fix Required**:
1. Go to [Supabase Dashboard](https://app.supabase.com/project/filffznooegjcvykgkbk/settings/api)
2. Find the **"anon public"** key (NOT the service_role key)
3. Replace `VITE_SUPABASE_ANON_KEY` in `.env` with the anon key

### Issue 2: Inconsistent Environment Variable Names
**Problem**: Code used `VITE_Supabase_URL` and `VITE_ANON_KEY`, but documentation used different names.

**Fix**: ✅ Updated code to use standardized names:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Issue 3: Hardcoded Firebase Credentials
**Problem**: Firebase credentials were hardcoded in `src/lib/firebase.ts`.

**Fix**: ✅ Updated to use environment variables from `.env`

---

## 📋 Exact Environment Variables Needed

Copy this template and fill in your actual values:

```env
# ============================================================================
# SUPABASE CONFIGURATION
# ============================================================================
VITE_SUPABASE_URL=https://filffznooegjcvykgkbk.supabase.co
VITE_SUPABASE_ANON_KEY=<YOUR_ANON_PUBLIC_KEY_HERE>
SUPABASE_SERVICE_ROLE_KEY=<YOUR_SERVICE_ROLE_KEY_HERE>

# ============================================================================
# FIREBASE CONFIGURATION
# ============================================================================
VITE_FIREBASE_API_KEY=AIzaSyCTKMG2Jo4C1y_adgAF61GyQ8_ER_8_p9g
VITE_FIREBASE_AUTH_DOMAIN=news-aggregator-bb220.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=news-aggregator-bb220
VITE_FIREBASE_STORAGE_BUCKET=news-aggregator-bb220.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=393859722906
VITE_FIREBASE_APP_ID=1:393859722906:web:2de4c2d2f35aae5b177923
VITE_FIREBASE_VAPID_KEY=<optional-for-push-notifications>

# ============================================================================
# APPLICATION CONFIGURATION
# ============================================================================
VITE_APP_URL=http://localhost:8080
VITE_APP_NAME=Newsleak
```

---

## 🔑 How to Get Your Supabase Keys

### Step 1: Access Your Supabase Project
1. Go to: https://app.supabase.com
2. Sign in with your account
3. Select project: `filffznooegjcvykgkbk` (or your project)

### Step 2: Get Your Keys
1. Click **Settings** (gear icon in the sidebar)
2. Click **API** in the settings menu
3. You'll see two sections:

#### Project URL
```
https://filffznooegjcvykgkbk.supabase.co
```
Copy this to: `VITE_SUPABASE_URL`

#### Project API Keys

**anon public key** (starts with `eyJ...`):
- This is SAFE to use in client-side code
- Copy to: `VITE_SUPABASE_ANON_KEY`
- ✅ Use this one for the app

**service_role secret key** (also starts with `eyJ...`):
- This is DANGEROUS in client code
- Copy to: `SUPABASE_SERVICE_ROLE_KEY` (no VITE_ prefix)
- ⚠️ Only use in Edge Functions (server-side)
- Never expose in client-side code

### Step 3: How to Tell Them Apart
Decode the JWT token to check which is which:

```bash
# Copy your key and check the "role" field:
echo "YOUR_KEY_HERE" | cut -d. -f2 | base64 -d | python3 -m json.tool
```

Look for:
- `"role": "anon"` → This is the anon key ✅
- `"role": "service_role"` → This is the service key ⚠️

---

## 🗄️ Database Setup

### Verify Database Tables Exist

1. Go to: https://app.supabase.com/project/filffznooegjcvykgkbk/editor
2. Run this SQL query:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see 15 tables:
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

### If Tables Are Missing

Run the complete schema:
1. Go to: SQL Editor in Supabase Dashboard
2. Open file: `supabase_complete_schema.sql` from this repo
3. Copy entire contents
4. Paste into SQL Editor
5. Click **Run** (or Ctrl+Enter)
6. Wait for "Success. No rows returned"

---

## 📰 RSS Feed Setup

### Add RSS Feeds to Database

Go to Supabase SQL Editor and run:

```sql
-- Add popular news feeds
INSERT INTO public.rss_feeds (source, url, category, description, is_active)
VALUES 
  ('BBC News', 'http://feeds.bbci.co.uk/news/rss.xml', 'World', 'BBC World News', true),
  ('TechCrunch', 'https://techcrunch.com/feed/', 'Technology', 'Tech news and startups', true),
  ('The Verge', 'https://www.theverge.com/rss/index.xml', 'Technology', 'Tech, science, and culture', true),
  ('ESPN', 'https://www.espn.com/espn/rss/news', 'Sports', 'Sports news', true),
  ('CNN', 'http://rss.cnn.com/rss/cnn_topstories.rss', 'World', 'CNN breaking news', true),
  ('Reuters World', 'https://www.reutersagency.com/feed/?taxonomy=best-topics&post_type=best', 'World', 'Reuters world news', true),
  ('Hacker News', 'https://news.ycombinator.com/rss', 'Technology', 'Tech community news', true),
  ('Ars Technica', 'https://feeds.arstechnica.com/arstechnica/index', 'Technology', 'Technology news and analysis', true);

-- Verify feeds were added
SELECT id, source, url, category, is_active FROM rss_feeds;
```

### Enable RSS Feed Fetching

#### Option 1: Deploy Supabase Edge Function

1. **Install Supabase CLI**:
```bash
npm install -g supabase
```

2. **Login**:
```bash
supabase login
```

3. **Link Your Project**:
```bash
cd /home/runner/work/newsleak-hub/newsleak-hub
supabase link --project-ref filffznooegjcvykgkbk
```

4. **Deploy the Function**:
```bash
supabase functions deploy fetchFeeds
```

5. **Set Environment Variables for the Function**:
   - Go to: https://app.supabase.com/project/filffznooegjcvykgkbk/functions
   - Click on `fetchFeeds`
   - Go to "Settings" or "Environment Variables"
   - Add:
     - Name: `SUPABASE_URL`
     - Value: `https://filffznooegjcvykgkbk.supabase.co`
   - Add:
     - Name: `SUPABASE_SERVICE_ROLE_KEY`
     - Value: Your service_role key (from Supabase Settings → API)

6. **Test the Function**:
```bash
curl -X POST https://filffznooegjcvykgkbk.supabase.co/functions/v1/fetchFeeds \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

7. **Verify Articles Were Fetched**:
```sql
SELECT COUNT(*) FROM news_articles;
SELECT title, source, published FROM news_articles ORDER BY published DESC LIMIT 10;
```

#### Option 2: Manual Fetch (Testing Only)

For quick testing, you can manually fetch and insert a few articles:

```sql
-- Example manual insert (replace with real data)
INSERT INTO news_articles (title, link, source, category, published, description)
VALUES (
  'Sample News Article',
  'https://example.com/article',
  'BBC News',
  'World',
  NOW(),
  'This is a sample article description'
);
```

---

## 👤 Create Admin User

### Step 1: Create User in Firebase

1. Go to: https://console.firebase.google.com
2. Select project: `news-aggregator-bb220`
3. Click **Authentication** → **Users**
4. Click **Add user**
5. Enter:
   - Email: `admin@example.com` (or your email)
   - Password: (create a strong password)
6. Click **Add user**
7. **IMPORTANT**: Copy the **User UID** (looks like: `abc123xyz...`)

### Step 2: Add to Database as Admin

Go to Supabase SQL Editor and run:

```sql
INSERT INTO public.admin_users (email, full_name, role, auth_uid)
VALUES (
  'admin@example.com',     -- Your email from Firebase
  'Admin User',            -- Your name
  'super_admin',           -- Role (super_admin, admin, or editor)
  'PASTE_FIREBASE_UID_HERE'  -- UID from Firebase user
);

-- Verify admin was created
SELECT * FROM admin_users;
```

---

## 🚀 Running the Application

### Development Mode

```bash
# 1. Ensure dependencies are installed
npm install --legacy-peer-deps

# 2. Verify .env file is configured
cat .env | grep VITE_SUPABASE_URL
cat .env | grep VITE_SUPABASE_ANON_KEY
cat .env | grep VITE_FIREBASE_API_KEY

# 3. Start development server
npm run dev

# 4. Open browser
# Go to: http://localhost:8080
```

### Production Build

```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

---

## 🧪 Testing the Setup

### Test 1: Database Connection
```javascript
// Open browser console on http://localhost:8080
// Paste this code:
import { supabase } from './src/lib/supabaseClient.ts';
const { data, error } = await supabase.from('rss_feeds').select('*');
console.log('Feeds:', data);
console.log('Error:', error);
```

### Test 2: Firebase Authentication
1. Go to: http://localhost:8080
2. Click **Sign Up**
3. Create a test account
4. Verify you can sign in

### Test 3: RSS Feed Fetching
```sql
-- In Supabase SQL Editor
SELECT COUNT(*) FROM news_articles;
SELECT source, COUNT(*) as article_count 
FROM news_articles 
GROUP BY source;
```

### Test 4: Admin Access
1. Sign in with your admin account
2. Go to: http://localhost:8080/admin
3. Verify you can access the admin dashboard

---

## 🔍 Troubleshooting

### Issue: "Cannot connect to database"

**Check**:
```bash
# Verify .env has correct values
cat .env | grep SUPABASE

# Test connection
curl https://filffznooegjcvykgkbk.supabase.co/rest/v1/rss_feeds \
  -H "apikey: YOUR_ANON_KEY"
```

**Solution**:
1. Make sure `VITE_SUPABASE_ANON_KEY` is the **anon** key, not service_role
2. Check Supabase project is active (not paused)
3. Restart dev server: `npm run dev`

### Issue: "No articles showing"

**Check**:
```sql
SELECT COUNT(*) FROM rss_feeds WHERE is_active = true;
SELECT COUNT(*) FROM news_articles;
```

**Solution**:
1. Ensure RSS feeds are added to database (see RSS Feed Setup)
2. Deploy and run the fetchFeeds Edge Function
3. Check Edge Function logs in Supabase Dashboard

### Issue: "Firebase authentication not working"

**Check**:
```bash
cat .env | grep FIREBASE
```

**Solution**:
1. Verify all Firebase env variables are set
2. Go to Firebase Console → Authentication → Sign-in method
3. Enable Email/Password authentication
4. Restart dev server

### Issue: "Admin dashboard shows 401/403 error"

**Check**:
```sql
SELECT * FROM admin_users WHERE email = 'your-email@example.com';
```

**Solution**:
1. Make sure you created an admin user (see Create Admin User)
2. Verify the `auth_uid` matches your Firebase User UID
3. Sign out and sign in again

---

## 📊 Database Schema Reference

### Key Tables

**rss_feeds**: RSS feed sources
```sql
-- View all feeds
SELECT id, source, url, category, is_active, last_fetched FROM rss_feeds;

-- Add a new feed
INSERT INTO rss_feeds (source, url, category, is_active)
VALUES ('Source Name', 'https://example.com/feed.xml', 'Category', true);
```

**news_articles**: Fetched news articles
```sql
-- View recent articles
SELECT title, source, published, category 
FROM news_articles 
ORDER BY published DESC 
LIMIT 20;

-- Count articles by source
SELECT source, COUNT(*) 
FROM news_articles 
GROUP BY source;
```

**users**: Application users
```sql
-- View all users
SELECT id, email, username, created_at FROM users;
```

**admin_users**: Admin accounts
```sql
-- View all admins
SELECT email, full_name, role FROM admin_users;
```

---

## 🔐 Security Best Practices

1. **Never commit `.env` to Git**
   - Already in `.gitignore`
   - Double-check: `git status` should NOT show `.env`

2. **Use Anon Key in Client Code**
   - `VITE_SUPABASE_ANON_KEY` = anon key ✅
   - Never use service_role key with `VITE_` prefix ❌

3. **Use Service Role Key in Edge Functions Only**
   - `SUPABASE_SERVICE_ROLE_KEY` = service_role key
   - Only in server-side Edge Functions
   - Set in Supabase Dashboard → Edge Functions → Settings

4. **Enable Row Level Security (RLS)**
   - Already enabled in schema
   - Test with anon key to ensure RLS works

5. **Rotate Keys if Exposed**
   - If service_role key was exposed, rotate it immediately
   - Go to: Supabase Settings → API → Reset service_role key

---

## 📞 Getting Help

If you're still having issues:

1. **Check the logs**:
   - Browser Console (F12)
   - Supabase Logs: Dashboard → Logs
   - Edge Function Logs: Dashboard → Edge Functions → fetchFeeds → Logs

2. **Verify configuration**:
   ```bash
   # Run this script to check setup
   npm run dev
   # Then check browser console for any errors
   ```

3. **Common error messages**:
   - `"Invalid API key"` → Check VITE_SUPABASE_ANON_KEY
   - `"relation does not exist"` → Run database schema
   - `"Invalid JWT"` → Wrong key type (using service_role as anon)
   - `"Firebase: Error (auth/invalid-api-key)"` → Check Firebase config

---

## ✅ Setup Checklist

- [ ] Updated `.env` with correct Supabase anon key
- [ ] Added all Firebase environment variables
- [ ] Ran database schema (`supabase_complete_schema.sql`)
- [ ] Verified 15 tables exist in database
- [ ] Added RSS feeds to `rss_feeds` table
- [ ] Deployed `fetchFeeds` Edge Function
- [ ] Created admin user in Firebase
- [ ] Added admin user to `admin_users` table
- [ ] Tested database connection
- [ ] Tested authentication (sign up/sign in)
- [ ] Verified articles are being fetched
- [ ] Tested admin dashboard access

---

**Last Updated**: December 2024
**Version**: 1.0
**Status**: Ready for Production

For additional help, see:
- [COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md)
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
