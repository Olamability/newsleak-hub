# Quick Start: Recreate Your Database

## TL;DR - 3 Simple Steps

### 1️⃣ Open Supabase SQL Editor
- Go to https://app.supabase.com
- Select your project
- Click **SQL Editor** → **New query**

### 2️⃣ Run the Schema
- Open `supabase_complete_schema.sql`
- Copy all contents
- Paste into SQL Editor
- Click **Run** (or Ctrl+Enter)
- Wait ~20 seconds

### 3️⃣ Verify Success
```sql
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';
```
Should return **15** tables

## ✅ What You Get

| Component | Count | What It Does |
|-----------|-------|--------------|
| **Tables** | 15 | All database tables |
| **Indexes** | 80+ | Fast queries |
| **Functions** | 5 | Auto calculations |
| **Triggers** | 10 | Auto updates |
| **RLS Policies** | 21 | Security |
| **Views** | 2 | Analytics |
| **Default Categories** | 8 | News categories |

## 📋 Tables Created

✅ admin_users
✅ users  
✅ rss_feeds
✅ news_articles
✅ article_likes
✅ article_bookmarks
✅ article_views
✅ comments
✅ notifications
✅ user_preferences
✅ categories
✅ article_categories
✅ tags
✅ article_tags
✅ user_activity

## 🔍 Quick Verification

```sql
-- Should return 15
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';

-- Should return 8 categories
SELECT * FROM categories;

-- Should return 21+ policies
SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';
```

## 🚀 Next Steps

1. Configure `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

2. Create admin user:
   ```sql
   INSERT INTO admin_users (email, full_name, role)
   VALUES ('admin@example.com', 'Admin', 'super_admin');
   ```

3. Add RSS feed:
   ```sql
   INSERT INTO rss_feeds (source, url, category)
   VALUES ('BBC', 'http://feeds.bbci.co.uk/news/rss.xml', 'World');
   ```

4. Start app:
   ```bash
   npm run dev
   ```

## 📖 Full Documentation

- [SUPABASE_DATABASE_SETUP.md](./SUPABASE_DATABASE_SETUP.md) - Detailed guide
- [DATABASE_RECREATION_SUMMARY.md](./DATABASE_RECREATION_SUMMARY.md) - Complete overview
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Schema reference

## ❓ Problems?

**Tables already exist?** → Normal, script is safe to re-run

**Permission error?** → Use SQL Editor as project owner

**No tables?** → Check SQL Editor output for errors

---

**That's it!** Your database is ready in under 1 minute! 🎉
