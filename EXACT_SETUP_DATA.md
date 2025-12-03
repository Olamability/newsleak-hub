# 📋 Exact Backend Setup Data - Copy & Paste Ready

This document provides **exact values** you need to complete your backend setup.

---

## 🔑 Your Supabase Project Information

**Project URL**: `https://filffznooegjcvykgkbk.supabase.co`  
**Project Reference ID**: `filffznooegjcvykgkbk`

---

## ⚠️ CRITICAL ACTION REQUIRED

Your `.env` file currently has a **SERVICE_ROLE** key in `VITE_SUPABASE_ANON_KEY`.

**This is a SECURITY RISK!** Service role keys bypass all security and should NEVER be in client code.

### Get Your Correct Anon Key

1. Go to: https://app.supabase.com/project/filffznooegjcvykgkbk/settings/api
2. Find the section labeled **"Project API keys"**
3. Copy the **"anon public"** key (NOT the service_role key)
4. Replace this line in `.env`:

```env
VITE_SUPABASE_ANON_KEY=<PASTE_YOUR_ANON_KEY_HERE>
```

**How to verify you have the right key:**
```bash
# Decode your key to check the role
echo "YOUR_KEY" | cut -d. -f2 | base64 -d | grep role

# Should show: "role":"anon"  (NOT "service_role")
```

---

## 📝 Complete .env File Template

Copy this and fill in the values:

```env
# ============================================================================
# SUPABASE CONFIGURATION
# ============================================================================
VITE_SUPABASE_URL=https://filffznooegjcvykgkbk.supabase.co
VITE_SUPABASE_ANON_KEY=<GET_FROM_SUPABASE_DASHBOARD>
SUPABASE_SERVICE_ROLE_KEY=<GET_FROM_SUPABASE_DASHBOARD>

# ============================================================================
# FIREBASE CONFIGURATION
# ============================================================================
VITE_FIREBASE_API_KEY=AIzaSyCTKMG2Jo4C1y_adgAF61GyQ8_ER_8_p9g
VITE_FIREBASE_AUTH_DOMAIN=news-aggregator-bb220.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=news-aggregator-bb220
VITE_FIREBASE_STORAGE_BUCKET=news-aggregator-bb220.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=393859722906
VITE_FIREBASE_APP_ID=1:393859722906:web:2de4c2d2f35aae5b177923
VITE_FIREBASE_VAPID_KEY=<OPTIONAL_FOR_PUSH_NOTIFICATIONS>

# ============================================================================
# APPLICATION
# ============================================================================
VITE_APP_URL=http://localhost:8080
VITE_APP_NAME=Newsleak
```

---

## 🗄️ Database Setup SQL

### Step 1: Create Tables

Run this in Supabase SQL Editor (https://app.supabase.com/project/filffznooegjcvykgkbk/sql):

```sql
-- Run the complete schema
-- Copy entire contents of: supabase_complete_schema.sql
-- Paste in SQL Editor and click Run

-- Verify tables were created:
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Should show 15 tables
```

### Step 2: Add RSS Feeds

```sql
INSERT INTO public.rss_feeds (source, url, category, description, is_active)
VALUES 
  ('BBC News', 'http://feeds.bbci.co.uk/news/rss.xml', 'World', 'BBC World News', true),
  ('TechCrunch', 'https://techcrunch.com/feed/', 'Technology', 'Tech news and startups', true),
  ('The Verge', 'https://www.theverge.com/rss/index.xml', 'Technology', 'Tech, science, and culture', true),
  ('ESPN', 'https://www.espn.com/espn/rss/news', 'Sports', 'Sports news and updates', true),
  ('CNN', 'http://rss.cnn.com/rss/cnn_topstories.rss', 'World', 'CNN breaking news', true),
  ('Reuters', 'https://www.reutersagency.com/feed/?taxonomy=best-topics&post_type=best', 'World', 'Reuters news', true),
  ('Hacker News', 'https://news.ycombinator.com/rss', 'Technology', 'Tech community news', true),
  ('Ars Technica', 'https://feeds.arstechnica.com/arstechnica/index', 'Technology', 'Tech analysis', true),
  ('Wired', 'https://www.wired.com/feed/rss', 'Technology', 'Technology and culture', true),
  ('The Guardian', 'https://www.theguardian.com/world/rss', 'World', 'World news', true);

-- Verify feeds
SELECT id, source, url, category, is_active FROM rss_feeds;
```

### Step 3: Create Admin User

**First, create user in Firebase:**
1. Go to: https://console.firebase.google.com
2. Select project: `news-aggregator-bb220`
3. Authentication → Users → Add user
4. Email: `your-email@example.com`
5. Password: (create a password)
6. **Copy the User UID** (important!)

**Then, add to database:**

```sql
INSERT INTO public.admin_users (email, full_name, role, auth_uid)
VALUES (
  'your-email@example.com',        -- Your email from Firebase
  'Your Full Name',                -- Your name
  'super_admin',                   -- Role: super_admin, admin, or editor
  'PASTE_FIREBASE_USER_UID_HERE'   -- UID from Firebase Authentication
);

-- Verify
SELECT email, full_name, role, created_at FROM admin_users;
```

---

## 🚀 Deploy Edge Function

### Option 1: Using Helper Script

```bash
# Make script executable (first time only)
chmod +x scripts/deploy-edge-functions.sh

# Run deployment script
./scripts/deploy-edge-functions.sh
```

### Option 2: Manual Deployment

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref filffznooegjcvykgkbk

# Deploy the function
supabase functions deploy fetchFeeds --no-verify-jwt
```

### Configure Edge Function Environment Variables

After deployment, set these environment variables in the function:

1. Go to: https://app.supabase.com/project/filffznooegjcvykgkbk/functions
2. Click on `fetchFeeds`
3. Go to "Settings" or "Environment Variables"
4. Add these two variables:

```
Name: SUPABASE_URL
Value: https://filffznooegjcvykgkbk.supabase.co

Name: SUPABASE_SERVICE_ROLE_KEY
Value: <YOUR_SERVICE_ROLE_KEY_FROM_DASHBOARD>
```

---

## 🧪 Test Your Setup

### Test 1: Database Connection

```bash
# Test connection
curl https://filffznooegjcvykgkbk.supabase.co/rest/v1/rss_feeds \
  -H "apikey: YOUR_ANON_KEY_HERE"

# Should return list of feeds
```

### Test 2: Fetch RSS Articles

```bash
# Trigger the edge function
curl -X POST https://filffznooegjcvykgkbk.supabase.co/functions/v1/fetchFeeds \
  -H "Authorization: Bearer YOUR_ANON_KEY_HERE"

# Should return: {"status":"ok","logs":[...],"articles_added":X}
```

### Test 3: Verify Articles in Database

In Supabase SQL Editor:

```sql
-- Count articles
SELECT COUNT(*) FROM news_articles;

-- View recent articles
SELECT title, source, published 
FROM news_articles 
ORDER BY published DESC 
LIMIT 10;

-- Articles per source
SELECT source, COUNT(*) as article_count
FROM news_articles
GROUP BY source
ORDER BY article_count DESC;
```

### Test 4: Run the Application

```bash
# Install dependencies (if not done)
npm install --legacy-peer-deps

# Start dev server
npm run dev

# Open browser: http://localhost:8080
```

### Test 5: Admin Login

1. Go to: http://localhost:8080
2. Click "Sign In"
3. Use your admin email and password (created in Firebase)
4. Should see the homepage
5. Go to: http://localhost:8080/admin
6. Should see the admin dashboard

---

## 📍 Quick Links

### Supabase Dashboard
- **Main Dashboard**: https://app.supabase.com/project/filffznooegjcvykgkbk
- **API Settings**: https://app.supabase.com/project/filffznooegjcvykgkbk/settings/api
- **SQL Editor**: https://app.supabase.com/project/filffznooegjcvykgkbk/sql
- **Database Tables**: https://app.supabase.com/project/filffznooegjcvykgkbk/editor
- **Edge Functions**: https://app.supabase.com/project/filffznooegjcvykgkbk/functions
- **Logs**: https://app.supabase.com/project/filffznooegjcvykgkbk/logs

### Firebase Console
- **Main Console**: https://console.firebase.google.com
- **Project**: https://console.firebase.google.com/project/news-aggregator-bb220
- **Authentication**: https://console.firebase.google.com/project/news-aggregator-bb220/authentication/users
- **Project Settings**: https://console.firebase.google.com/project/news-aggregator-bb220/settings/general

---

## ✅ Setup Verification Checklist

Run through this checklist to verify everything is working:

### Database
- [ ] 15 tables created in Supabase
- [ ] RSS feeds added (at least 5-10 feeds)
- [ ] Admin user created in both Firebase and Supabase
- [ ] Can query tables without errors

### Configuration
- [ ] `.env` file has all required variables
- [ ] `VITE_SUPABASE_ANON_KEY` is the **anon** key (NOT service_role)
- [ ] All Firebase variables are set
- [ ] Variables use correct naming (VITE_SUPABASE_URL, not VITE_Supabase_URL)

### Edge Function
- [ ] Supabase CLI installed (`supabase --version`)
- [ ] Edge function deployed successfully
- [ ] Environment variables set in function (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
- [ ] Function test returns success
- [ ] Articles appear in database after running function

### Application
- [ ] Dependencies installed (`npm install --legacy-peer-deps`)
- [ ] Build succeeds (`npm run build`)
- [ ] Dev server starts (`npm run dev`)
- [ ] No errors in browser console
- [ ] Can sign up and login
- [ ] Articles display on homepage
- [ ] Admin dashboard accessible

---

## 🔧 Troubleshooting Commands

```bash
# Check environment variables
cat .env | grep SUPABASE
cat .env | grep FIREBASE

# Test Supabase connection
curl https://filffznooegjcvykgkbk.supabase.co/rest/v1/ \
  -H "apikey: $(grep VITE_SUPABASE_ANON_KEY .env | cut -d= -f2)"

# View edge function logs
supabase functions logs fetchFeeds --project-ref filffznooegjcvykgkbk

# Rebuild and restart
rm -rf node_modules dist
npm install --legacy-peer-deps
npm run dev
```

---

## 📞 Getting Help

If something doesn't work:

1. **Check the detailed guides**:
   - [BACKEND_SETUP_GUIDE.md](./BACKEND_SETUP_GUIDE.md) - Comprehensive guide
   - [QUICK_START_BACKEND.md](./QUICK_START_BACKEND.md) - Quick reference
   - [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues

2. **Check browser console** (F12):
   - Look for red errors
   - Check Network tab for failed requests

3. **Check Supabase logs**:
   - Dashboard → Logs
   - Edge Functions → fetchFeeds → Logs

4. **Common issues**:
   - "Cannot connect" → Wrong anon key (using service_role)
   - "No articles" → Edge function not deployed or feeds not added
   - "Auth error" → Firebase config wrong or missing
   - "Admin denied" → User not in admin_users table

---

## 🎯 What Was Fixed

### Issues Resolved
1. ✅ **Security**: Fixed service_role key being used as anon key
2. ✅ **Config**: Standardized environment variable names
3. ✅ **Firebase**: Moved hardcoded config to .env
4. ✅ **RSS Parsing**: Improved edge function with proper XML parsing
5. ✅ **Error Handling**: Added validation and fail-fast errors

### Files Modified
- `.env` - Updated with correct structure and warnings
- `src/lib/supabaseClient.ts` - Fixed env var names
- `src/lib/firebase.ts` - Use environment variables
- `supabase/functions/fetchFeeds/index.ts` - Better RSS parsing

### New Documentation
- `BACKEND_SETUP_GUIDE.md` - Comprehensive backend guide
- `QUICK_START_BACKEND.md` - Quick reference
- `EXACT_SETUP_DATA.md` - This file with exact values
- `scripts/deploy-edge-functions.sh` - Deployment helper

---

**Last Updated**: December 2024  
**Your Project**: filffznooegjcvykgkbk  
**Status**: Ready to Configure ✅

**Next Step**: Get your correct Supabase anon key from the dashboard and update `.env`!
