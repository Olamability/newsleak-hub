# 🚀 Production Deployment Checklist

Use this checklist to ensure your Newsleak app is production-ready before launching to users.

---

## 📋 Pre-Deployment Checklist

### 1. Database Setup
- [ ] Supabase project created and active
- [ ] Database schema deployed (`supabase_complete_schema.sql`)
- [ ] All 15 tables verified
- [ ] Default categories loaded (8 categories)
- [ ] RLS policies active (21+ policies)
- [ ] Indexes created (80+ indexes)
- [ ] Database password saved securely
- [ ] Connection string saved securely

### 2. Environment Configuration
- [ ] `.env` file created from `.env.example`
- [ ] `VITE_SUPABASE_URL` configured
- [ ] `VITE_SUPABASE_ANON_KEY` configured
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configured (keep secret!)
- [ ] `VITE_FIREBASE_API_KEY` configured
- [ ] `VITE_FIREBASE_AUTH_DOMAIN` configured
- [ ] `VITE_FIREBASE_PROJECT_ID` configured
- [ ] `VITE_FIREBASE_STORAGE_BUCKET` configured
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID` configured
- [ ] `VITE_FIREBASE_APP_ID` configured
- [ ] `VITE_FIREBASE_VAPID_KEY` configured
- [ ] `.env` file added to `.gitignore`
- [ ] No secrets committed to Git

### 3. Firebase Setup
- [ ] Firebase project created
- [ ] Web app registered in Firebase
- [ ] Email/Password authentication enabled
- [ ] Google sign-in enabled (optional)
- [ ] Phone authentication enabled (optional)
- [ ] Cloud Messaging enabled
- [ ] VAPID key generated for web push
- [ ] Service worker configured (`public/firebase-messaging-sw.js`)

### 4. Admin & Content Setup
- [ ] At least one admin user created
- [ ] Admin user can login successfully
- [ ] Admin dashboard accessible
- [ ] RSS feeds added (minimum 3-5 feeds)
- [ ] Feeds are active and valid URLs
- [ ] Feed categories match database categories

### 5. Edge Functions
- [ ] Supabase CLI installed
- [ ] Linked to correct Supabase project
- [ ] `fetchFeeds` function deployed
- [ ] `sendNotification` function deployed (if using push notifications)
- [ ] Function environment variables set
- [ ] Functions tested and working
- [ ] Scheduled fetching configured (cron or GitHub Actions)

### 6. Application Testing
- [ ] Dependencies installed (`npm install --legacy-peer-deps`)
- [ ] Build completes without errors (`npm run build`)
- [ ] No TypeScript errors
- [ ] No linting errors (`npm run lint`)
- [ ] Local dev server runs (`npm run dev`)
- [ ] Homepage loads correctly
- [ ] Navigation works
- [ ] Authentication flow works (sign up, sign in, sign out)
- [ ] Password reset works
- [ ] Articles display correctly
- [ ] Article detail pages work
- [ ] Search functionality works
- [ ] Category filtering works
- [ ] Like/bookmark features work
- [ ] Comments work
- [ ] Admin dashboard loads
- [ ] Admin can add/edit RSS feeds
- [ ] Push notifications work (if enabled)

### 7. Performance & Optimization
- [ ] Images are optimized
- [ ] Code is minified (production build)
- [ ] Lazy loading implemented
- [ ] React Query caching configured
- [ ] Bundle size is acceptable (<1MB)
- [ ] Lighthouse score checked (aim for 90+)
- [ ] Page load time < 3 seconds
- [ ] Time to interactive < 5 seconds

### 8. Security
- [ ] No API keys in client-side code
- [ ] Service role key never exposed to client
- [ ] RLS policies tested and working
- [ ] CORS properly configured
- [ ] Rate limiting considered (Supabase auto-handles basic limits)
- [ ] Input validation on all forms
- [ ] XSS protection enabled
- [ ] SQL injection protection (using Supabase client)
- [ ] Password requirements enforced
- [ ] HTTPS will be enabled (automatic with most hosting)

### 9. SEO & Meta
- [ ] Meta tags configured
- [ ] Open Graph tags added
- [ ] Twitter Card tags added
- [ ] Sitemap generated (optional)
- [ ] Robots.txt configured (optional)
- [ ] Favicons added
- [ ] App manifest configured (PWA)

### 10. Error Handling
- [ ] 404 page exists
- [ ] Error boundaries implemented
- [ ] Network error handling
- [ ] Graceful degradation for offline mode
- [ ] User-friendly error messages
- [ ] Console errors fixed

---

## 🌐 Deployment Steps

### Choose Your Platform

#### Option A: Vercel (Recommended)
- [ ] Vercel account created
- [ ] Project connected to Git repository
- [ ] Environment variables added in Vercel dashboard
- [ ] Build settings configured
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Install Command: `npm install --legacy-peer-deps`
- [ ] Deploy triggered
- [ ] Deployment successful
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active

#### Option B: Netlify
- [ ] Netlify account created
- [ ] Site created and linked to repository
- [ ] Build settings configured
  - Build command: `npm run build`
  - Publish directory: `dist`
- [ ] Environment variables added
- [ ] Deploy triggered
- [ ] Deployment successful
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active

#### Option C: Firebase Hosting
- [ ] Firebase CLI installed
- [ ] Firebase initialized for hosting
- [ ] Build created (`npm run build`)
- [ ] Deployed to Firebase Hosting
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active

---

## 🔄 Post-Deployment

### 1. Verify Production
- [ ] Production URL accessible
- [ ] HTTPS working (lock icon in browser)
- [ ] Homepage loads without errors
- [ ] All pages accessible
- [ ] Authentication works
- [ ] Articles are loading
- [ ] Admin dashboard accessible
- [ ] No console errors
- [ ] Mobile responsive (test on phone)

### 2. Configure Automated Feed Fetching

#### Option A: GitHub Actions
- [ ] Create `.github/workflows/fetch-feeds.yml`
- [ ] Configure cron schedule (e.g., every 3 hours)
- [ ] Add repository secrets:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Test workflow runs successfully

#### Option B: External Cron Service
- [ ] Sign up for cron service (e.g., cron-job.org)
- [ ] Create job to call Edge Function URL
- [ ] Set schedule (e.g., every 3 hours)
- [ ] Test job runs successfully

### 3. Monitoring & Analytics
- [ ] Google Analytics added (optional)
- [ ] Error tracking configured (Sentry, LogRocket, etc.)
- [ ] Uptime monitoring setup (UptimeRobot, StatusCake)
- [ ] Database monitoring (Supabase dashboard)
- [ ] Function monitoring (Supabase logs)

### 4. Backup & Recovery
- [ ] Database backup strategy planned
- [ ] Supabase automatic backups enabled (check plan)
- [ ] Environment variables backed up securely
- [ ] Code repository backed up (Git remote)
- [ ] Recovery procedure documented

### 5. User Communication
- [ ] Privacy policy created (if collecting user data)
- [ ] Terms of service created (if needed)
- [ ] Contact information available
- [ ] Support email configured
- [ ] Social media links added (optional)

---

## 📊 Launch Day Checklist

### Before Launch
- [ ] Final test of all features
- [ ] Check database connection
- [ ] Verify RSS feeds are fetching
- [ ] Test user registration
- [ ] Test user login
- [ ] Test admin login
- [ ] Clear test data (if any)
- [ ] Review analytics setup
- [ ] Prepare announcement (social media, email, etc.)

### Launch
- [ ] Make site public
- [ ] Announce on social media
- [ ] Share with initial users
- [ ] Monitor error logs closely
- [ ] Monitor performance metrics
- [ ] Be ready to respond to issues

### First 24 Hours
- [ ] Monitor server/database load
- [ ] Check for errors in logs
- [ ] Verify users can sign up
- [ ] Verify articles are updating
- [ ] Respond to user feedback
- [ ] Fix critical bugs if any

---

## 🔧 Maintenance Schedule

### Daily
- [ ] Check error logs
- [ ] Monitor uptime
- [ ] Review user feedback

### Weekly
- [ ] Review analytics
- [ ] Check database size
- [ ] Verify RSS feeds are working
- [ ] Update content if needed
- [ ] Review and moderate comments

### Monthly
- [ ] Update dependencies (security patches)
- [ ] Review and optimize performance
- [ ] Backup database
- [ ] Review costs (Supabase, hosting)
- [ ] Plan new features

### Quarterly
- [ ] Major dependency updates
- [ ] Feature releases
- [ ] User survey
- [ ] Performance optimization

---

## 🚨 Emergency Contacts

Document important contacts and resources:

- **Supabase Support**: https://supabase.com/support
- **Firebase Support**: https://firebase.google.com/support
- **Hosting Support**: [Your hosting provider]
- **Domain Registrar**: [Your domain provider]
- **Team Contacts**:
  - Admin: [email]
  - Developer: [email]
  - Support: [email]

---

## 📝 Notes & Customization

Add your own notes here:

- Deployment Date: ___________
- Production URL: ___________
- Admin Email: ___________
- Special Configurations: ___________

---

## ✅ Final Sign-off

- [ ] All critical items completed
- [ ] Team reviewed checklist
- [ ] Documentation updated
- [ ] Stakeholders notified
- [ ] Launch approved

**Deployment Approved By**: ___________  
**Date**: ___________  
**Version**: ___________

---

**Congratulations! Your Newsleak app is production-ready!** 🎉

For ongoing support and updates, refer to:
- [COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md)
- [README.md](./README.md)
- [PRODUCTION_SETUP_GUIDE.md](./PRODUCTION_SETUP_GUIDE.md)
