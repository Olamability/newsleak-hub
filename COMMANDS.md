# 📋 Quick Command Reference

Essential commands and snippets for Newsleak development.

---

## 🚀 Initial Setup

```bash
# Clone and setup
git clone https://github.com/Olamability/newsleak-hub.git
cd newsleak-hub
bash scripts/quick-start.sh

# Or manual
npm install --legacy-peer-deps
cp .env.example .env
# Edit .env
npm run dev
```

---

## 📦 npm Commands

```bash
npm run dev          # Start dev server (http://localhost:8080)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run linter
```

---

## 🗄️ Database Quick Commands

### In Supabase SQL Editor

```sql
-- Verify tables (should return 15)
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public';

-- List all tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;

-- Check categories (should have 8)
SELECT * FROM categories ORDER BY display_order;

-- Count articles
SELECT COUNT(*) FROM news_articles;

-- List RSS feeds
SELECT source, url, category, is_active FROM rss_feeds;

-- View recent articles
SELECT title, source, published FROM news_articles 
ORDER BY published DESC LIMIT 10;
```

---

## 🛠️ Supabase CLI

```bash
# Install and login
npm install -g supabase
supabase login

# Link project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy edge functions
supabase functions deploy fetchFeeds
supabase functions deploy sendNotification

# View logs
supabase functions logs fetchFeeds
```

---

## 🚀 Deployment

### Vercel
```bash
npm install -g vercel
vercel --prod
```

### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Firebase Hosting
```bash
npm install -g firebase-tools
firebase init hosting
npm run build
firebase deploy --only hosting
```

---

## 🧪 Verification

```bash
# Check local setup
bash scripts/verify-setup.sh

# Check Node.js
node --version  # Should be v18+

# Test build
npm run build
```

---

## 🔧 Common Fixes

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Reset env
cp .env.example .env
# Edit with your values

# Kill port 8080
kill -9 $(lsof -ti:8080)

# Fix permissions
chmod +x scripts/*.sh
```

---

## 📚 Documentation

- [COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md) - Full setup guide
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues
- [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) - Deployment checklist

---

**For full reference, see [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)**
