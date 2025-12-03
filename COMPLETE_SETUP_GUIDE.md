# 🚀 Complete Setup Guide for Newsleak Hub
## Production-Ready Database & Backend Setup

This guide will walk you through setting up your Newsleak news aggregation platform from **absolute scratch** to a **production-ready deployment**. Written for beginners!

---

## 📋 What You'll Need

Before we start, make sure you have:

- [ ] A computer with internet connection
- [ ] A web browser (Chrome, Firefox, Safari, or Edge)
- [ ] About 30 minutes of your time

**That's it!** Everything else is free and we'll set up together.

---

## 🎯 Overview - What We're Building

Newsleak is a modern news aggregation platform that:
- Fetches news from multiple RSS feeds automatically
- Lets users read, like, bookmark, and comment on articles
- Has an admin dashboard for managing content
- Sends push notifications for breaking news
- Works on desktop and mobile

---

## Part 1: Create Your Accounts (5 minutes)

### Step 1: Create a Supabase Account

Supabase is your database and backend.

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** (green button)
3. Sign up with GitHub, Google, or email
4. Verify your email if needed
5. You're in! 🎉

### Step 2: Create a Firebase Account

Firebase handles authentication and push notifications.

1. Go to [https://firebase.google.com](https://firebase.google.com)
2. Click **"Get started"** (blue button)
3. Sign in with your Google account
4. Accept terms and conditions
5. You're in! 🎉

---

## Part 2: Set Up Your Database (10 minutes)

### Step 1: Create Your Supabase Project

1. In Supabase Dashboard, click **"New project"**
2. Fill in:
   - **Organization**: Select or create one (e.g., "My Projects")
   - **Name**: `newsleak` (or any name you like)
   - **Database Password**: Create a strong password and **SAVE IT SOMEWHERE SAFE**
   - **Region**: Choose closest to you (e.g., "US East" if you're in America)
   - **Pricing Plan**: Free (perfect for getting started)
3. Click **"Create new project"**
4. Wait 2-3 minutes while your database is set up ☕

### Step 2: Get Your Supabase Credentials

1. Once your project is ready, click **"Settings"** (gear icon in sidebar)
2. Click **"API"**
3. You'll see:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string of characters)
   - **service_role** key (another long string - keep this SECRET!)

**IMPORTANT**: Copy these to a text file. You'll need them later.

```
My Supabase Credentials:
URL: https://xxxxx.supabase.co
Anon Key: eyJhbGc...
Service Role Key: eyJhbGc... (KEEP SECRET!)
```

### Step 3: Set Up Your Database Tables

This is the most important step! We'll create all the tables your app needs.

1. In Supabase Dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. In your downloaded project, open the file: `supabase_complete_schema.sql`
4. Copy **ALL** the content (Ctrl+A, then Ctrl+C)
5. Paste into the Supabase SQL Editor
6. Click **"Run"** (or press Ctrl+Enter)
7. Wait 10-20 seconds...
8. You should see: **"Success. No rows returned"** ✅

### Step 4: Verify Database Setup

Let's make sure everything worked!

1. In the same SQL Editor, clear the previous query
2. Paste this verification query:

```sql
-- Check that all tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

3. Click **"Run"**
4. You should see **15 tables** listed:
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

**If you see all 15 tables** ✅ Perfect! Move to next step.  
**If you see fewer tables** ❌ Go back to Step 3 and run the schema again.

### Step 5: Add Default Data

Let's add some initial categories for news:

1. In SQL Editor, paste this:

```sql
-- Check if categories exist
SELECT * FROM categories ORDER BY display_order;
```

2. Click **"Run"**
3. You should see 8 categories (World, Politics, Business, Technology, Sports, Entertainment, Science, Health)

**If categories are there** ✅ Great!  
**If no categories** ❌ They should have been created. Try running the full schema again.

---

## Part 3: Set Up Firebase (10 minutes)

### Step 1: Create Your Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Add project"**
3. Enter project name: `newsleak` (or any name)
4. Click **"Continue"**
5. Google Analytics: **Disable** it (we don't need it for now)
6. Click **"Create project"**
7. Wait 30 seconds...
8. Click **"Continue"** when ready

### Step 2: Add a Web App to Firebase

1. On Firebase project page, click the **Web icon** `</>`
2. Register app:
   - App nickname: `newsleak-web`
   - **Don't check** "Also set up Firebase Hosting"
3. Click **"Register app"**
4. You'll see Firebase configuration - **COPY THIS!**

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "xxx.firebaseapp.com",
  projectId: "xxx",
  storageBucket: "xxx.appspot.com",
  messagingSenderId: "123...",
  appId: "1:123..."
};
```

Save this to your text file!

5. Click **"Continue to console"**

### Step 3: Enable Authentication

1. In Firebase Console, click **"Authentication"** in left sidebar
2. Click **"Get started"**
3. Click on **"Email/Password"**
4. Toggle **"Enable"** to ON
5. Click **"Save"**

✅ Now users can sign up with email and password!

**Optional**: You can also enable Google sign-in the same way.

### Step 4: Set Up Push Notifications

1. In Firebase Console, click the gear icon ⚙️ (Project settings)
2. Scroll down to **"Your apps"** section
3. Under your web app, scroll to **"Firebase SDK snippet"**
4. Copy the config values to your text file

Now for Push Notifications:

1. Still in **"Project settings"**, click **"Cloud Messaging"** tab
2. Scroll to **"Web Push certificates"**
3. Click **"Generate key pair"**
4. Copy the key (starts with `B...`) - this is your VAPID key
5. Save it to your text file as `VAPID Key: B...`

---

## Part 4: Configure Your Application (5 minutes)

### Step 1: Set Up Environment Variables

1. In your project folder, find the file `.env.example`
2. Copy it and rename to `.env`
3. Open `.env` in a text editor
4. Fill in your credentials:

```env
# Supabase Configuration (from Part 2, Step 2)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-service-key...

# Firebase Configuration (from Part 3)
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_STORAGE_BUCKET=xxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123...
VITE_FIREBASE_APP_ID=1:123...
VITE_FIREBASE_VAPID_KEY=B...

# Application Configuration
VITE_APP_URL=http://localhost:8080
VITE_APP_NAME=Newsleak
```

5. **Save the file** ✅

**IMPORTANT**: Never share your `.env` file or commit it to GitHub!

### Step 2: Install Node.js (If You Haven't)

Check if you have Node.js:

1. Open Terminal (Mac/Linux) or Command Prompt (Windows)
2. Type: `node --version`
3. If you see a version number (like `v18.x.x`) ✅ You're good!
4. If you see an error ❌ Install Node.js:
   - Go to [https://nodejs.org](https://nodejs.org)
   - Download the **LTS** version
   - Install it
   - Restart your terminal
   - Try `node --version` again

### Step 3: Install Project Dependencies

1. Open Terminal/Command Prompt
2. Navigate to your project folder:
   ```bash
   cd path/to/newsleak-hub
   ```
3. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
4. Wait 1-2 minutes... ☕
5. You should see "added XXX packages" ✅

---

## Part 5: Create Your First Admin User

You need an admin account to manage the platform!

### Step 1: Create a User in Firebase

1. Go to Firebase Console → **Authentication**
2. Click **"Users"** tab
3. Click **"Add user"**
4. Enter:
   - Email: `admin@example.com` (or your email)
   - Password: Create a password
5. Click **"Add user"**
6. **IMPORTANT**: Copy the **User UID** (looks like: `xR7gK2mN...`)

### Step 2: Add Admin User to Database

1. Go back to Supabase → **SQL Editor**
2. Paste this query (replace with your email and UID):

```sql
INSERT INTO public.admin_users (email, full_name, role, auth_uid)
VALUES (
  'admin@example.com',        -- Your email
  'Admin User',                -- Your name
  'super_admin',               -- Your role
  'xR7gK2mN...'               -- Your Firebase User UID
);
```

3. Click **"Run"**
4. You should see: **"Success. 1 row inserted"** ✅

---

## Part 6: Add Your First RSS Feeds

Let's add some news sources!

1. In Supabase SQL Editor, paste:

```sql
INSERT INTO public.rss_feeds (source, url, category, description, is_active)
VALUES 
  ('BBC News', 'http://feeds.bbci.co.uk/news/rss.xml', 'World', 'BBC World News', true),
  ('TechCrunch', 'https://techcrunch.com/feed/', 'Technology', 'Tech news and startups', true),
  ('ESPN', 'https://www.espn.com/espn/rss/news', 'Sports', 'Sports news and updates', true),
  ('CNN Top Stories', 'http://rss.cnn.com/rss/cnn_topstories.rss', 'World', 'CNN breaking news', true);
```

2. Click **"Run"**
3. You should see: **"Success. 4 rows inserted"** ✅

---

## Part 7: Start Your Application! 🎉

### Development Mode (Testing)

1. In Terminal/Command Prompt:
   ```bash
   npm run dev
   ```

2. Wait a few seconds...
3. You should see:
   ```
   ➜  Local:   http://localhost:8080/
   ```

4. Open your browser and go to: **http://localhost:8080**
5. You should see your Newsleak app! 🎉

### Test Everything

1. **Homepage**: Should load without errors
2. **Sign In**: Click "Sign In" and use your admin credentials
3. **Articles**: Should see a message (no articles yet - normal!)
4. **Admin Dashboard**: Should be accessible

---

## Part 8: Fetch Your First Articles

Now let's get some news articles!

### Option 1: Manual Trigger (Easiest)

We'll set up an automated Edge Function later. For now, you can manually fetch feeds.

1. We'll create a simple script later, or
2. You can add articles manually through the admin panel

### Option 2: Deploy Edge Function (Recommended)

This automatically fetches news every hour.

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```
   (Find YOUR_PROJECT_REF in your Supabase URL: `https://YOUR_PROJECT_REF.supabase.co`)

4. Deploy the function:
   ```bash
   supabase functions deploy fetchFeeds
   ```

5. Set up environment variables for the function:
   - Go to Supabase Dashboard → **Edge Functions**
   - Click on `fetchFeeds`
   - Add environment variable:
     - Name: `SUPABASE_SERVICE_ROLE_KEY`
     - Value: Your service role key

6. Test the function:
   ```bash
   curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/fetchFeeds \
     -H "Authorization: Bearer YOUR_ANON_KEY"
   ```

7. Wait 30 seconds, then check your database:
   ```sql
   SELECT COUNT(*) FROM news_articles;
   ```

You should see articles! 🎉

---

## Part 9: Production Deployment

### Option 1: Deploy to Vercel (Easiest & Free)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   npm run build
   vercel --prod
   ```

4. Add your environment variables in Vercel dashboard:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add ALL variables from your `.env` file

5. Redeploy to apply env variables:
   ```bash
   vercel --prod
   ```

✅ Your app is now live!

### Option 2: Deploy to Netlify

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Login:
   ```bash
   netlify login
   ```

3. Build and deploy:
   ```bash
   npm run build
   netlify deploy --prod --dir=dist
   ```

4. Add environment variables in Netlify dashboard

### Option 3: Deploy to Firebase Hosting

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login:
   ```bash
   firebase login
   ```

3. Initialize:
   ```bash
   firebase init hosting
   ```
   - Select your Firebase project
   - Public directory: `dist`
   - Single-page app: `Yes`
   - Automatic builds: `No`

4. Deploy:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

---

## 🎯 Production Checklist

Before launching to users:

- [ ] Database is set up and verified (15 tables)
- [ ] Environment variables are configured
- [ ] Admin user is created and can login
- [ ] RSS feeds are added
- [ ] Articles are being fetched (manually or via edge function)
- [ ] Authentication works (sign up, sign in, sign out)
- [ ] Users can like and bookmark articles
- [ ] Comments work
- [ ] Admin dashboard is accessible
- [ ] App is deployed to production
- [ ] SSL/HTTPS is enabled (automatic with Vercel/Netlify/Firebase)
- [ ] Custom domain is configured (optional)
- [ ] Push notifications are tested (optional)

---

## 🆘 Troubleshooting

### "Cannot connect to database"

**Solution**:
1. Check your `.env` file has correct Supabase URL and keys
2. Verify your Supabase project is running (check dashboard)
3. Make sure you ran the database schema (`supabase_complete_schema.sql`)

### "No articles showing"

**Solution**:
1. Check if RSS feeds exist:
   ```sql
   SELECT * FROM rss_feeds;
   ```
2. Manually trigger feed fetch (see Part 8)
3. Check Supabase Edge Function logs for errors

### "Can't login / Authentication error"

**Solution**:
1. Verify Firebase credentials in `.env`
2. Check Firebase Console → Authentication → Users (user should exist)
3. Clear browser cache and cookies
4. Try incognito mode

### "Build fails"

**Solution**:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm run build
```

### "Edge function not working"

**Solution**:
1. Check Supabase Dashboard → Edge Functions → Logs
2. Verify environment variables are set in function settings
3. Test with curl command (see Part 8)
4. Check that function has correct permissions

---

## 📚 Next Steps

Your app is running! Here's what to do next:

1. **Add More RSS Feeds**:
   - Find RSS feeds for your favorite news sites
   - Add them via admin panel or SQL

2. **Customize Your App**:
   - Change colors in `tailwind.config.ts`
   - Update app name in `.env`
   - Add your logo

3. **Set Up Automated Fetching**:
   - Use GitHub Actions (see `PRODUCTION_SETUP_GUIDE.md`)
   - Or use Supabase Cron jobs

4. **Monitor Your App**:
   - Check Supabase Dashboard for database usage
   - Monitor Firebase Console for authentication
   - Set up error tracking (Sentry, LogRocket)

5. **Add Features**:
   - Email newsletters
   - Social media sharing
   - Advanced search
   - User profiles

---

## 📞 Getting Help

If you're stuck:

1. **Check the documentation**:
   - `README.md` - Overview
   - `DATABASE_SCHEMA.md` - Database reference
   - `API_DOCUMENTATION.md` - API guide
   - `PRODUCTION_SETUP_GUIDE.md` - Advanced setup

2. **Common Issues**:
   - See troubleshooting section above
   - Check GitHub Issues for similar problems

3. **Ask for Help**:
   - Create a GitHub Issue
   - Include error messages and screenshots
   - Describe what you were trying to do

---

## 🎉 Congratulations!

You've successfully set up a production-ready news aggregation platform!

**What you've achieved**:
✅ Set up a PostgreSQL database with 15 tables  
✅ Configured authentication with Firebase  
✅ Connected frontend to backend  
✅ Added RSS feeds  
✅ Deployed to production  

**You're now running a modern, scalable news platform!** 🚀

---

**Last Updated**: December 2024  
**Version**: 2.0  
**Author**: Newsleak Team

For questions, issues, or contributions, visit: [GitHub Repository](https://github.com/Olamability/newsleak-hub)
