# ⚡ Quick Start - Backend Setup

**Get your Newsleak backend running in 15 minutes!**

---

## 📋 What You Need

- [ ] Supabase account ([sign up free](https://supabase.com))
- [ ] Firebase account ([sign up free](https://firebase.google.com))
- [ ] Node.js 18+ installed
- [ ] 15 minutes of time

---

## 🚀 5-Step Setup

### Step 1: Clone & Install (2 minutes)

```bash
git clone https://github.com/Olamability/newsleak-hub.git
cd newsleak-hub
npm install --legacy-peer-deps
```

### Step 2: Create Supabase Database (5 minutes)

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click **"New Project"**
3. Name it `newsleak-hub`, create strong password
4. Wait 2-3 minutes for project creation
5. Go to **SQL Editor** → **New Query**
6. Copy **ALL** of `supabase_complete_schema.sql` (726 lines)
7. Paste and click **"Run"**
8. ✅ You should see "Success. No rows returned"

### Step 3: Add RSS Feeds (2 minutes)

1. Still in **SQL Editor**, create **New Query**
2. Copy this SQL and run it:

```sql
-- Add popular news sources
INSERT INTO public.rss_feeds (source, url, category, is_active, description, website_url) VALUES
  ('BBC News', 'http://feeds.bbci.co.uk/news/rss.xml', 'World', true, 'BBC World News', 'https://www.bbc.com/news'),
  ('TechCrunch', 'https://techcrunch.com/feed/', 'Technology', true, 'Tech news', 'https://techcrunch.com'),
  ('ESPN', 'https://www.espn.com/espn/rss/news', 'Sports', true, 'Sports news', 'https://www.espn.com')
ON CONFLICT (url) DO NOTHING;
```

More feeds available in [SAMPLE_DATA_SQL.md](./SAMPLE_DATA_SQL.md)

### Step 4: Configure Environment (3 minutes)

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Get your **Supabase credentials**:
   - In Supabase → **Settings** → **API**
   - Copy **Project URL** and **anon public** key

3. Get your **Firebase credentials**:
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create new project: `newsleak-hub`
   - Go to **Project Settings** → **Your apps** → Add web app
   - Copy the config values

4. Update `.env` with your values:
   ```env
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGci...
   
   VITE_FIREBASE_API_KEY=AIza...
   VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-app.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123:web:abc
   ```

### Step 5: Start the App (1 minute)

```bash
npm run dev
```

Visit: **http://localhost:8080**

---

## 🎉 Success Checklist

After setup, you should see:

- [ ] Homepage loads without errors
- [ ] No "Missing Supabase configuration" error
- [ ] Database tables visible in Supabase Dashboard
- [ ] RSS feeds listed in `rss_feeds` table
- [ ] Can sign up for new account
- [ ] Can sign in with email/password

---

## 📰 Get Your First Articles

The homepage will be empty initially. To fetch articles:

### Option 1: Deploy Edge Function (Recommended)

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project (get ref from Supabase dashboard)
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the fetch function
supabase functions deploy fetchFeeds

# Trigger it
supabase functions invoke fetchFeeds
```

Wait 30-60 seconds, then refresh your homepage. You should see articles!

### Option 2: Add Test Articles Manually

Run this SQL in Supabase SQL Editor:

```sql
INSERT INTO public.news_articles (
  title, link, description, image, source, category, 
  published, is_published, feed_id
) VALUES
  (
    'Welcome to Newsleak Hub!',
    'https://example.com/welcome',
    'Your personalized news aggregation platform is ready.',
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800',
    'Newsleak',
    'Technology',
    NOW(),
    true,
    (SELECT id FROM public.rss_feeds LIMIT 1)
  );
```

Refresh homepage to see the test article!

---

## 🔧 Optional: Create Admin User

To access `/admin` panel:

1. Sign up in your app
2. In browser console, copy your Firebase UID:
   ```javascript
   firebase.auth().currentUser.uid
   ```
3. Run in Supabase SQL Editor:
   ```sql
   INSERT INTO public.admin_users (email, full_name, role, auth_uid, is_active) VALUES
     ('your-email@example.com', 'Admin Name', 'super_admin', 'YOUR_FIREBASE_UID', true)
   ON CONFLICT (email) DO UPDATE SET auth_uid = EXCLUDED.auth_uid;
   ```
4. Refresh and visit `/admin`

---

## ❓ Troubleshooting

### "Missing Supabase configuration"
- Check `.env` file exists
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
- Restart dev server: `npm run dev`

### "No articles showing"
- Run Edge Function: `supabase functions invoke fetchFeeds`
- Or add test article using SQL above
- Check `news_articles` table has `is_published = true`

### "Can't sign up / sign in"
- Go to Firebase Console → **Authentication**
- Click **Get Started**
- Enable **Email/Password** sign-in method

### "Build fails"
- Delete `node_modules`: `rm -rf node_modules`
- Clear npm cache: `npm cache clean --force`
- Reinstall: `npm install --legacy-peer-deps`

---

## 📚 Next Steps

Now that your backend is running:

1. ✅ **Read the guides**:
   - [COMPLETE_BACKEND_INTEGRATION_GUIDE.md](./COMPLETE_BACKEND_INTEGRATION_GUIDE.md) - Full details
   - [API_FUNCTIONS_REFERENCE.md](./API_FUNCTIONS_REFERENCE.md) - API docs
   - [SAMPLE_DATA_SQL.md](./SAMPLE_DATA_SQL.md) - More SQL scripts

2. ✅ **Add more RSS feeds** from [SAMPLE_DATA_SQL.md](./SAMPLE_DATA_SQL.md)

3. ✅ **Enable Push Notifications**:
   - Firebase Console → Cloud Messaging → Generate VAPID key
   - Add to `.env` as `VITE_FIREBASE_VAPID_KEY`

4. ✅ **Deploy Edge Functions** for automatic RSS fetching

5. ✅ **Deploy to Production**:
   - Vercel: `vercel --prod`
   - Netlify: `netlify deploy --prod`
   - See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

## 🆘 Still Need Help?

- **Full Documentation**: [COMPLETE_BACKEND_INTEGRATION_GUIDE.md](./COMPLETE_BACKEND_INTEGRATION_GUIDE.md)
- **API Reference**: [API_FUNCTIONS_REFERENCE.md](./API_FUNCTIONS_REFERENCE.md)
- **Implementation Status**: [BACKEND_IMPLEMENTATION_STATUS.md](./BACKEND_IMPLEMENTATION_STATUS.md)
- **Troubleshooting**: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **GitHub Issues**: [Create an issue](https://github.com/Olamability/newsleak-hub/issues)

---

## ✨ What You Just Built

Your Newsleak instance now has:

- ✅ **PostgreSQL database** with 15 tables
- ✅ **Row Level Security** for data protection
- ✅ **Firebase authentication** for users
- ✅ **RSS feed aggregation** capability
- ✅ **Real-time updates** via Supabase
- ✅ **Push notifications** ready (FCM)
- ✅ **Admin panel** for management
- ✅ **Analytics tracking** built-in

**All features work with real data from your database!**

---

**Ready to launch your news platform? 🚀**

For production deployment, see [PRODUCTION_SETUP_GUIDE.md](./PRODUCTION_SETUP_GUIDE.md)
