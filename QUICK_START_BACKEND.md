# 🚀 Quick Start - Database & RSS Feed Setup

This guide provides the **exact steps** to fix database connection issues and enable RSS feed fetching.

---

## ⚡ Quick Fix (5 minutes)

### Step 1: Get Your Correct Supabase Anon Key

**CRITICAL**: Your `.env` currently has a **service_role** key where it should have an **anon** key.

1. Go to: https://app.supabase.com/project/filffznooegjcvykgkbk/settings/api
2. Find the **"anon public"** key (NOT service_role)
3. Copy it

### Step 2: Update Your .env File

Open `.env` and update this line:

```env
VITE_SUPABASE_ANON_KEY=<PASTE_YOUR_ANON_KEY_HERE>
```

**How to tell if you have the right key:**
- Anon key has `"role":"anon"` in the JWT
- Service role key has `"role":"service_role"` in the JWT

### Step 3: Restart Your Dev Server

```bash
npm run dev
```

That's it! Your database connection should now work.

---

## 📦 Complete Setup (30 minutes)

### Prerequisites

✅ Node.js 18+ installed
✅ npm installed
✅ Supabase account created
✅ Firebase account created (for auth)

### 1. Install Dependencies

```bash
npm install --legacy-peer-deps
```

### 2. Configure Environment Variables

Your `.env` file has been updated with the correct structure. You need to:

1. **Get Supabase Anon Key** (see Quick Fix above)
2. **Verify Firebase credentials** are correct

Your `.env` should have:

```env
# Supabase
VITE_SUPABASE_URL=https://filffznooegjcvykgkbk.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# Firebase
VITE_FIREBASE_API_KEY=AIzaSyCTKMG2Jo4C1y_adgAF61GyQ8_ER_8_p9g
VITE_FIREBASE_AUTH_DOMAIN=news-aggregator-bb220.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=news-aggregator-bb220
VITE_FIREBASE_STORAGE_BUCKET=news-aggregator-bb220.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=393859722906
VITE_FIREBASE_APP_ID=1:393859722906:web:2de4c2d2f35aae5b177923

# App
VITE_APP_URL=http://localhost:8080
VITE_APP_NAME=Newsleak
```

### 3. Set Up Database Tables

1. Go to: https://app.supabase.com/project/filffznooegjcvykgkbk/sql
2. Click "New query"
3. Copy contents of `supabase_complete_schema.sql`
4. Paste and click "Run"
5. Verify 15 tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### 4. Add RSS Feeds

In Supabase SQL Editor:

```sql
INSERT INTO public.rss_feeds (source, url, category, description, is_active)
VALUES 
  ('BBC News', 'http://feeds.bbci.co.uk/news/rss.xml', 'World', 'BBC World News', true),
  ('TechCrunch', 'https://techcrunch.com/feed/', 'Technology', 'Tech news', true),
  ('The Verge', 'https://www.theverge.com/rss/index.xml', 'Technology', 'Tech and culture', true),
  ('ESPN', 'https://www.espn.com/espn/rss/news', 'Sports', 'Sports news', true),
  ('CNN', 'http://rss.cnn.com/rss/cnn_topstories.rss', 'World', 'CNN news', true);

-- Verify
SELECT source, url, is_active FROM rss_feeds;
```

### 5. Deploy RSS Fetch Function

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login
supabase login

# Deploy the function
./scripts/deploy-edge-functions.sh
```

Or manually:

```bash
supabase link --project-ref filffznooegjcvykgkbk
supabase functions deploy fetchFeeds --no-verify-jwt
```

### 6. Configure Edge Function Environment Variables

1. Go to: https://app.supabase.com/project/filffznooegjcvykgkbk/functions
2. Click on `fetchFeeds`
3. Go to "Settings" or "Environment Variables"
4. Add these variables:

```
SUPABASE_URL=https://filffznooegjcvykgkbk.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

### 7. Test RSS Fetching

```bash
# Trigger the function manually
curl -X POST https://filffznooegjcvykgkbk.supabase.co/functions/v1/fetchFeeds \
  -H "Authorization: Bearer <your-anon-key>"
```

### 8. Verify Articles Were Fetched

In Supabase SQL Editor:

```sql
-- Check article count
SELECT COUNT(*) FROM news_articles;

-- View recent articles
SELECT title, source, published 
FROM news_articles 
ORDER BY published DESC 
LIMIT 10;

-- Articles by source
SELECT source, COUNT(*) as count 
FROM news_articles 
GROUP BY source;
```

### 9. Create Admin User

**In Firebase:**
1. Go to: https://console.firebase.google.com
2. Select project: `news-aggregator-bb220`
3. Authentication → Users → Add user
4. Email: your-email@example.com
5. Password: (create password)
6. Copy the User UID

**In Supabase:**

```sql
INSERT INTO public.admin_users (email, full_name, role, auth_uid)
VALUES (
  'your-email@example.com',
  'Your Name',
  'super_admin',
  'PASTE_FIREBASE_UID_HERE'
);

-- Verify
SELECT * FROM admin_users;
```

### 10. Run the Application

```bash
# Development
npm run dev

# Production build
npm run build
npm run preview
```

Open: http://localhost:8080

---

## ✅ Verification Checklist

- [ ] `.env` has correct anon key (not service_role)
- [ ] All Firebase env vars are set
- [ ] Database has 15 tables
- [ ] RSS feeds added to database
- [ ] Edge function deployed
- [ ] Edge function env vars configured
- [ ] Articles fetched successfully
- [ ] Admin user created
- [ ] Can login to app
- [ ] Can access admin dashboard

---

## 🔧 Troubleshooting

### "Cannot connect to database"

**Check:**
```bash
# View current env vars
cat .env | grep SUPABASE

# Test connection
curl https://filffznooegjcvykgkbk.supabase.co/rest/v1/rss_feeds \
  -H "apikey: $(grep VITE_SUPABASE_ANON_KEY .env | cut -d= -f2)"
```

**Fix:**
1. Verify `VITE_SUPABASE_ANON_KEY` is the **anon** key, not service_role
2. Restart dev server: `npm run dev`

### "No articles showing"

**Check:**
```sql
SELECT COUNT(*) FROM rss_feeds WHERE is_active = true;
SELECT COUNT(*) FROM news_articles;
```

**Fix:**
1. Add RSS feeds (see step 4)
2. Deploy edge function (see step 5)
3. Trigger fetch manually (see step 7)

### "Edge function error"

**Check logs:**
```bash
supabase functions logs fetchFeeds
```

Or in dashboard:
https://app.supabase.com/project/filffznooegjcvykgkbk/functions/fetchFeeds/logs

**Common issues:**
- Missing env vars (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
- Invalid RSS feed URLs
- Network/CORS issues

### "Authentication not working"

**Check:**
```bash
cat .env | grep FIREBASE
```

**Fix:**
1. Verify all Firebase env vars are set
2. Enable Email/Password auth in Firebase Console
3. Restart dev server

---

## 📚 Documentation

For more details, see:
- [BACKEND_SETUP_GUIDE.md](./BACKEND_SETUP_GUIDE.md) - Comprehensive backend setup
- [COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md) - Full platform setup
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues and solutions
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Database structure reference

---

## 🆘 Need Help?

1. Check browser console (F12) for errors
2. Check Supabase logs
3. Check Edge Function logs
4. See TROUBLESHOOTING.md
5. Create a GitHub issue with error details

---

## 🎯 What Changed

### Fixed Issues:

1. ✅ **Security Fix**: Changed `.env` to use correct anon key instead of service_role
2. ✅ **Variable Naming**: Standardized to `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. ✅ **Firebase Config**: Moved hardcoded Firebase credentials to environment variables
4. ✅ **Edge Function**: Improved RSS parsing with proper XML parsing (not regex)
5. ✅ **Error Handling**: Added validation and helpful error messages

### Files Changed:

- `.env` - Updated with correct variable names and structure
- `src/lib/supabaseClient.ts` - Fixed env var names and added validation
- `src/lib/firebase.ts` - Changed to use environment variables
- `supabase/functions/fetchFeeds/index.ts` - Improved RSS parsing
- New: `BACKEND_SETUP_GUIDE.md` - Comprehensive setup guide
- New: `scripts/deploy-edge-functions.sh` - Deployment helper script

---

**Last Updated**: December 2024
**Version**: 1.0

Ready to go! 🚀
