# Newsleak Production Setup Guide

This guide will walk you through setting up the Newsleak news aggregation platform from scratch to production deployment.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Firebase Setup](#firebase-setup)
5. [Push Notifications Setup](#push-notifications-setup)
6. [Application Configuration](#application-configuration)
7. [Deployment](#deployment)
8. [Post-Deployment](#post-deployment)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts

- [Supabase Account](https://supabase.com) - Database and backend services
- [Firebase Account](https://firebase.google.com) - Authentication and push notifications
- [Node.js](https://nodejs.org/) - v18 or higher
- [Git](https://git-scm.com/) - Version control

### Development Tools

```bash
# Install Node.js (using nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Install Supabase CLI
npm install -g supabase

# Verify installations
node --version
npm --version
supabase --version
```

---

## Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Olamability/newsleak-hub.git
cd newsleak-hub
```

### 2. Install Dependencies

```bash
npm install --legacy-peer-deps
```

### 3. Create Environment File

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Firebase Configuration
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-app.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_VAPID_KEY=your-vapid-key

# App Configuration
VITE_APP_URL=http://localhost:8080
VITE_APP_NAME=Newsleak
```

---

## Database Setup

### Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Enter project details:
   - Name: `newsleak`
   - Database Password: (save this securely)
   - Region: Choose closest to your users
4. Wait for project to be created (~2 minutes)

### Step 2: Get Supabase Credentials

From your Supabase project dashboard:

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** → Use for `VITE_SUPABASE_URL`
   - **anon public** key → Use for `VITE_SUPABASE_ANON_KEY`
   - **service_role** key → Use for `SUPABASE_SERVICE_ROLE_KEY`
3. Update your `.env` file

### Step 3: Run Database Migrations

#### Option A: Using Supabase Dashboard (Recommended)

1. Go to **SQL Editor** in Supabase Dashboard
2. Click **New Query**
3. Copy the contents of `supabase/migrations/002_complete_schema_setup.sql`
4. Paste into the SQL Editor
5. Click **Run** to execute the migration
6. Verify success (should show "Success. No rows returned")

#### Option B: Using Supabase CLI

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### Step 4: Verify Database Setup

Run this query in SQL Editor to verify tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see all tables listed in `DATABASE_SCHEMA.md`.

### Step 5: Create Admin Account

Run this in SQL Editor to create your first admin:

```sql
INSERT INTO public.admin_users (email, full_name, role, auth_uid) 
VALUES (
  'your-email@example.com',
  'Your Name',
  'super_admin',
  'your-firebase-uid'  -- You'll get this after Firebase setup
);
```

---

## Firebase Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **Add Project**
3. Enter project name: `newsleak`
4. Enable/disable Google Analytics (optional)
5. Click **Create Project**

### Step 2: Add Web App

1. In Firebase Console, click the Web icon `</>`
2. Register app with nickname: `newsleak-web`
3. Don't check "Firebase Hosting" for now
4. Click **Register App**
5. Copy the Firebase configuration object
6. Update `.env` file with these values

### Step 3: Enable Authentication

1. Go to **Authentication** → **Sign-in method**
2. Enable the following providers:
   - **Email/Password** - Enable
   - **Google** - Enable (optional)
   - **Phone** - Enable (optional, requires Blaze plan)
3. Click **Save**

### Step 4: Set Up Firebase Cloud Messaging (FCM)

1. Go to **Project Settings** → **Cloud Messaging**
2. Under **Web Push certificates**, click **Generate key pair**
3. Copy the **Key pair** value
4. Add to `.env` as `VITE_FIREBASE_VAPID_KEY`
5. Copy **Server key** for backend notifications

### Step 5: Update Firebase Config in Code

Update `src/lib/firebase.ts` with your Firebase config:

```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
```

---

## Push Notifications Setup

### Step 1: Create Service Worker

Create `public/firebase-messaging-sw.js`:

```javascript
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || '/icon-192.png',
    badge: '/badge-72.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        for (let client of windowClients) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
```

### Step 2: Deploy Supabase Edge Function for Notifications

Create `supabase/functions/sendNotification/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const FIREBASE_SERVER_KEY = Deno.env.get('FIREBASE_SERVER_KEY')!;

interface NotificationRequest {
  title: string;
  body: string;
  imageUrl?: string;
  articleId?: string;
  tokens?: string[];
}

serve(async (req) => {
  try {
    const { title, body, imageUrl, articleId, tokens } = await req.json() as NotificationRequest;

    if (!tokens || tokens.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No FCM tokens provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const message = {
      notification: {
        title,
        body,
        image: imageUrl,
      },
      data: {
        articleId: articleId || '',
        url: articleId ? `/article/${articleId}` : '/',
      },
      tokens,
    };

    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Authorization': `key=${FIREBASE_SERVER_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();

    return new Response(
      JSON.stringify({ success: true, result }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
```

Deploy the function:

```bash
supabase functions deploy sendNotification --no-verify-jwt
```

---

## Application Configuration

### Step 1: Build the Application

```bash
npm run build
```

Verify build is successful and check `dist/` folder.

### Step 2: Test Locally

```bash
npm run dev
```

Visit `http://localhost:8080` and verify:
- [ ] Homepage loads
- [ ] Can view articles
- [ ] Can sign in/sign up
- [ ] Admin dashboard accessible
- [ ] RSS feeds can be added

---

## Deployment

### Option 1: Deploy to Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel --prod
```

4. Set environment variables in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env`

### Option 2: Deploy to Netlify

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Login:
```bash
netlify login
```

3. Deploy:
```bash
netlify deploy --prod
```

4. Set environment variables in Netlify dashboard

### Option 3: Deploy to Firebase Hosting

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login:
```bash
firebase login
```

3. Initialize Firebase Hosting:
```bash
firebase init hosting
```

4. Deploy:
```bash
npm run build
firebase deploy --only hosting
```

---

## Post-Deployment

### 1. Set Up Automated RSS Fetching

#### Option A: Using GitHub Actions

Create `.github/workflows/fetch-feeds.yml`:

```yaml
name: Fetch RSS Feeds

on:
  schedule:
    - cron: '0 */3 * * *'  # Every 3 hours
  workflow_dispatch:

jobs:
  fetch:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Supabase Function
        run: |
          curl -X POST ${{ secrets.SUPABASE_URL }}/functions/v1/fetchFeeds \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}"
```

Add secrets in GitHub repo settings.

#### Option B: Using Supabase Cron (if available)

Check Supabase documentation for pg_cron setup.

### 2. Add RSS Feeds

1. Login to admin dashboard: `https://your-app.com/admin/login`
2. Go to **Add Feed**
3. Add your RSS feed sources:
   - BBC News: `http://feeds.bbci.co.uk/news/rss.xml`
   - CNN: `http://rss.cnn.com/rss/cnn_topstories.rss`
   - TechCrunch: `https://techcrunch.com/feed/`
   - etc.

### 3. Test Push Notifications

1. Enable notifications in browser when prompted
2. Go to admin dashboard
3. Create a test notification
4. Verify notification appears

### 4. Monitor Performance

- Check Supabase dashboard for database metrics
- Monitor Firebase console for auth and FCM usage
- Set up error tracking (Sentry recommended)

---

## Troubleshooting

### Database Connection Issues

```sql
-- Test database connection
SELECT NOW();

-- Check RLS policies
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

### Authentication Not Working

1. Verify Firebase config in `.env`
2. Check Firebase Console → Authentication for errors
3. Ensure auth providers are enabled

### RSS Feeds Not Fetching

1. Check Supabase Edge Function logs
2. Verify RSS feed URLs are accessible
3. Check CORS proxy settings

### Push Notifications Not Working

1. Verify VAPID key is correct
2. Check service worker registration
3. Ensure Firebase Cloud Messaging is enabled
4. Check browser console for errors

### Build Errors

```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json dist
npm install --legacy-peer-deps
npm run build
```

---

## Performance Optimization

### 1. Enable Caching

Add to `vite.config.ts`:

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        }
      }
    }
  }
});
```

### 2. Add Service Worker for PWA

Install Workbox:

```bash
npm install workbox-cli -g
```

Generate service worker:

```bash
workbox generateSW workbox-config.js
```

### 3. Enable CDN

Configure CDN for static assets in your hosting platform.

---

## Security Checklist

- [ ] Environment variables secured
- [ ] Firebase security rules configured
- [ ] Supabase RLS policies enabled
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Input validation on all forms
- [ ] SQL injection prevention (using Supabase client)
- [ ] XSS protection enabled

---

## Support

For issues or questions:

1. Check existing documentation
2. Review GitHub Issues
3. Contact: support@newsleak.com
4. Join Discord community

---

## Next Steps

1. Set up analytics (Google Analytics, Mixpanel)
2. Implement SEO optimization
3. Add mobile app (React Native)
4. Set up error monitoring (Sentry)
5. Configure CDN for images
6. Implement advanced caching
7. Add A/B testing
8. Set up CI/CD pipeline

---

**Last Updated:** December 2024
**Version:** 1.0.0
