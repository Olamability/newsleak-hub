# 🔧 Troubleshooting Guide

This guide helps you solve common issues when setting up and running Newsleak.

---

## 📑 Table of Contents

1. [Installation Issues](#installation-issues)
2. [Database Issues](#database-issues)
3. [Authentication Issues](#authentication-issues)
4. [Build & Runtime Issues](#build--runtime-issues)
5. [Deployment Issues](#deployment-issues)
6. [Edge Function Issues](#edge-function-issues)
7. [Performance Issues](#performance-issues)

---

## Installation Issues

### "Node.js is not installed"

**Problem**: Running `node --version` shows "command not found"

**Solution**:
1. Install Node.js from [nodejs.org](https://nodejs.org)
2. Download the **LTS version** (v18 or higher)
3. After installation, restart your terminal
4. Verify: `node --version`

### "npm install fails with errors"

**Problem**: Errors during `npm install`

**Why `--legacy-peer-deps` is needed**:
This project uses React 19 and some UI libraries haven't yet updated their peer dependencies to support it. The `--legacy-peer-deps` flag tells npm to ignore peer dependency conflicts and install packages using older resolution logic. This is a temporary workaround until all dependencies officially support React 19.

**Solutions**:

**Try 1 - Use legacy peer deps flag** (Recommended):
```bash
npm install --legacy-peer-deps
```

**Try 2 - Clear cache**:
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

**Try 3 - Update npm**:
```bash
npm install -g npm@latest
npm install --legacy-peer-deps
```

### "Module not found" errors

**Problem**: Import errors after installation

**Solution**:
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# If still failing, check Node.js version
node --version  # Should be v18+
```

---

## Database Issues

### "Cannot connect to database"

**Problem**: Application can't connect to Supabase

**Checklist**:
- [ ] Check `.env` has `VITE_SUPABASE_URL`
- [ ] Check `.env` has `VITE_SUPABASE_ANON_KEY`
- [ ] Verify URL format: `https://xxxxx.supabase.co`
- [ ] Verify key starts with `eyJ...`
- [ ] Check Supabase project is active (not paused)

**How to verify**:
```bash
# Check .env file
cat .env | grep SUPABASE

# Should show:
# VITE_SUPABASE_URL=https://xxxxx.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJ...
```

**Fix**:
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click Settings → API
3. Copy correct URL and keys
4. Update `.env`
5. Restart dev server

### "No tables found" or "relation does not exist"

**Problem**: Database tables not created

**Solution**:
1. Go to Supabase Dashboard → SQL Editor
2. Run `supabase_complete_schema.sql`
3. Verify with:
```sql
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public';
-- Should return 15
```

### "Permission denied" errors in database queries

**Problem**: RLS (Row Level Security) blocking queries

**Temporary fix for development**:
```sql
-- WARNING: Only for testing, not production!
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
```

**Proper fix**:
1. Ensure user is authenticated
2. Check RLS policies are correct
3. Verify JWT token is being sent

### "No articles showing up"

**Problem**: Articles table is empty

**Solutions**:

**Option 1 - Add RSS feeds manually**:
```sql
INSERT INTO rss_feeds (source, url, category, is_active)
VALUES ('BBC News', 'http://feeds.bbci.co.uk/news/rss.xml', 'World', true);
```

**Option 2 - Use seed data**:
1. Run `scripts/seed-data.sql` in Supabase SQL Editor
2. Then fetch feeds (see Edge Function section)

**Option 3 - Trigger fetch manually**:
```bash
# Deploy edge function first
supabase functions deploy fetchFeeds

# Then trigger it
curl -X POST YOUR_SUPABASE_URL/functions/v1/fetchFeeds \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

---

## Authentication Issues

### "Firebase not configured" or authentication fails

**Problem**: Firebase setup incomplete

**Checklist**:
- [ ] Firebase project created
- [ ] Web app added to Firebase project
- [ ] Email/Password auth enabled in Firebase Console
- [ ] All Firebase env vars in `.env`
- [ ] `.env` values are correct (no trailing spaces)

**Verify .env**:
```bash
cat .env | grep FIREBASE
```

Should show all these:
```
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_STORAGE_BUCKET=xxx
VITE_FIREBASE_MESSAGING_SENDER_ID=123...
VITE_FIREBASE_APP_ID=1:123...
```

**Fix**:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Project Settings → Your apps → Web app
3. Copy all config values
4. Update `.env`
5. Restart dev server

### "User cannot sign in" after signup

**Problem**: Email verification required but not sent

**Solutions**:

**Option 1 - Disable email verification** (dev only):
1. Firebase Console → Authentication → Settings
2. Disable "Email enumeration protection"

**Option 2 - Manually verify user**:
1. Firebase Console → Authentication → Users
2. Find user
3. Click ... → Verify email

### "Admin dashboard not accessible"

**Problem**: User not in admin_users table

**Solution**:
1. Get user's Firebase UID:
   - Firebase Console → Authentication → Users
   - Copy UID

2. Add to database:
```sql
INSERT INTO admin_users (email, full_name, role, auth_uid)
VALUES (
  'your-email@example.com',
  'Your Name',
  'super_admin',
  'paste-firebase-uid-here'
);
```

---

## Build & Runtime Issues

### "Build fails with TypeScript errors"

**Problem**: Type errors during build

**Quick fix** (not recommended for production):
```bash
# Skip type checking (emergency only)
npm run build -- --mode development
```

**Proper fix**:
1. Check error messages
2. Fix type issues in code
3. Run: `npm run build`

### "Vite not found" or build tool errors

**Problem**: Dependencies not installed correctly

**Solution**:
```bash
rm -rf node_modules package-lock.json dist
npm install --legacy-peer-deps
npm run build
```

### "Port 8080 already in use"

**Problem**: Dev server can't start

**Solutions**:

**Option 1 - Kill existing process**:
```bash
# Find process on port 8080
lsof -ti:8080

# Kill it
kill -9 $(lsof -ti:8080)

# Start dev server
npm run dev
```

**Option 2 - Use different port**:
```bash
# Edit vite.config.ts, change port to 3000
npm run dev
```

### "Module not found: @/" imports

**Problem**: Path alias not working

**Fix**: Check `tsconfig.json` has:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### "CORS errors" in browser console

**Problem**: Cross-origin request blocked

**Solutions**:
1. For Supabase: Check project URL is correct
2. For Firebase: Check auth domain is correct
3. In production: Configure CORS in hosting provider

---

## Deployment Issues

### "Environment variables not working in production"

**Problem**: App works locally but not in production

**Solutions**:

**Vercel**:
1. Dashboard → Project → Settings → Environment Variables
2. Add all vars from `.env`
3. Redeploy

**Netlify**:
1. Site settings → Build & deploy → Environment variables
2. Add all vars from `.env`
3. Trigger new deploy

**Firebase Hosting**:
- Environment variables must be configured differently
- Use `.env.production` or build-time injection

### "Build succeeds but site shows blank page"

**Problem**: Runtime errors in production

**Debug**:
1. Open browser console (F12)
2. Check for errors
3. Common issues:
   - Missing env variables
   - Wrong API URLs
   - CORS issues

**Fix**:
1. Verify all env variables set
2. Check they start with `VITE_` prefix
3. Rebuild and redeploy

### "Database connection fails in production"

**Problem**: Can connect locally but not in deployed app

**Checklist**:
- [ ] Env variables set in hosting platform
- [ ] Variables are production values (not localhost)
- [ ] Supabase project is not paused
- [ ] RLS policies allow access

---

## Edge Function Issues

### "supabase command not found"

**Problem**: Supabase CLI not installed

**Solution**:
```bash
npm install -g supabase
supabase --version
```

### "Cannot deploy edge function"

**Problem**: Deployment fails

**Steps**:
1. Login:
```bash
supabase login
```

2. Link project:
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

3. Deploy:
```bash
supabase functions deploy fetchFeeds
```

### "Edge function times out"

**Problem**: Function runs too long

**Solutions**:
1. Check function logs in Supabase Dashboard
2. Reduce number of feeds fetched at once
3. Optimize function code
4. Increase timeout (if possible)

### "Feed fetching not working"

**Problem**: Edge function deployed but not fetching articles

**Debug**:
1. Check function logs:
   - Supabase Dashboard → Edge Functions → fetchFeeds → Logs

2. Test function manually:
```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/fetchFeeds \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

3. Common issues:
   - RSS feed URLs are invalid
   - Feed URLs are blocked by CORS
   - Function environment variables not set

---

## Performance Issues

### "App is slow to load"

**Solutions**:

1. **Check bundle size**:
```bash
npm run build
# Check dist/assets/*.js sizes
```

2. **Optimize images**:
   - Compress images
   - Use appropriate formats (WebP)
   - Lazy load images

3. **Enable React Query caching** (already enabled):
   - Check network tab in browser
   - Should see cached responses

### "Too many database queries"

**Problem**: Slow performance due to excessive queries

**Solutions**:
1. React Query caching (already implemented)
2. Use materialized views for analytics
3. Add database indexes (already in schema)

### "Images not loading or slow"

**Solutions**:
1. Check if images exist in RSS feeds
2. Verify edge function is deployed
3. Use CDN for images (optional)
4. Add image optimization

---

## General Debugging Tips

### Check Application Logs

**Browser Console**:
1. Open DevTools (F12)
2. Go to Console tab
3. Look for errors (red text)

**Network Tab**:
1. Open DevTools → Network
2. Check failed requests (red)
3. Examine request/response details

### Verify Setup

Run verification scripts:
```bash
# Check local setup
bash scripts/verify-setup.sh

# Check database (in Supabase SQL Editor)
# Run scripts/verify-database.sql
```

### Start Fresh

If all else fails:
```bash
# 1. Clean everything
rm -rf node_modules package-lock.json dist .env

# 2. Start over
cp .env.example .env
# Edit .env with correct values

# 3. Reinstall
npm install --legacy-peer-deps

# 4. Build
npm run build

# 5. Test
npm run dev
```

---

## Getting More Help

If you're still stuck:

1. **Check existing documentation**:
   - [COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md)
   - [README.md](./README.md)
   - [PRODUCTION_SETUP_GUIDE.md](./PRODUCTION_SETUP_GUIDE.md)

2. **Search GitHub Issues**:
   - Someone may have had the same problem

3. **Create a new issue**:
   - Include error messages
   - Include steps to reproduce
   - Include your environment (OS, Node version, etc.)

4. **Provide details**:
   - What you were trying to do
   - What actually happened
   - Error messages (full text)
   - Screenshots if relevant

---

## Common Error Messages & Solutions

| Error | Solution |
|-------|----------|
| `ENOENT: no such file or directory` | File/folder missing. Check path. |
| `Module not found` | Run `npm install --legacy-peer-deps` |
| `Permission denied` | Run with `sudo` or fix file permissions |
| `Port already in use` | Kill process or use different port |
| `fetch failed` | Check network connection and URL |
| `401 Unauthorized` | Check API keys in `.env` |
| `403 Forbidden` | Check RLS policies or permissions |
| `404 Not Found` | Check URL is correct |
| `500 Internal Server Error` | Check server logs for details |
| `CORS error` | Check CORS configuration |

---

**Last Updated**: December 2024  
**Maintained by**: Newsleak Team

For additional help, see [COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md)
