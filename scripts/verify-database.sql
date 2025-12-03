-- ============================================================================
-- NEWSLEAK DATABASE VERIFICATION SCRIPT
-- ============================================================================
-- This script verifies that your database is correctly set up
-- Run this in Supabase SQL Editor after running supabase_complete_schema.sql
-- ============================================================================

-- 1. Check all required tables exist
SELECT 
  'Checking Tables...' as step,
  COUNT(*) as table_count,
  CASE 
    WHEN COUNT(*) >= 15 THEN '✓ All tables created'
    ELSE '✗ Missing tables! Expected 15, found ' || COUNT(*)::text
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public';

-- 2. List all tables
SELECT 
  'Table List' as step,
  table_name,
  '✓' as status
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 3. Check categories (should have 8 default categories)
SELECT 
  'Checking Categories...' as step,
  COUNT(*) as category_count,
  CASE 
    WHEN COUNT(*) >= 8 THEN '✓ Default categories loaded'
    WHEN COUNT(*) = 0 THEN '✗ No categories! Run schema again'
    ELSE '⚠ Only ' || COUNT(*)::text || ' categories (expected 8)'
  END as status
FROM categories;

-- 4. List all categories
SELECT 
  'Category Details' as step,
  name,
  slug,
  display_order,
  '✓' as status
FROM categories
ORDER BY display_order;

-- 5. Check indexes
SELECT 
  'Checking Indexes...' as step,
  COUNT(*) as index_count,
  CASE 
    WHEN COUNT(*) >= 80 THEN '✓ All indexes created'
    ELSE '⚠ Found ' || COUNT(*)::text || ' indexes (expected 80+)'
  END as status
FROM pg_indexes 
WHERE schemaname = 'public';

-- 6. Check Row Level Security policies
SELECT 
  'Checking RLS Policies...' as step,
  COUNT(*) as policy_count,
  CASE 
    WHEN COUNT(*) >= 21 THEN '✓ All RLS policies created'
    ELSE '⚠ Found ' || COUNT(*)::text || ' policies (expected 21+)'
  END as status
FROM pg_policies 
WHERE schemaname = 'public';

-- 7. Check triggers
SELECT 
  'Checking Triggers...' as step,
  COUNT(*) as trigger_count,
  CASE 
    WHEN COUNT(*) >= 10 THEN '✓ All triggers created'
    ELSE '⚠ Found ' || COUNT(*)::text || ' triggers (expected 10+)'
  END as status
FROM information_schema.triggers 
WHERE trigger_schema = 'public';

-- 8. Check functions
SELECT 
  'Checking Functions...' as step,
  COUNT(*) as function_count,
  CASE 
    WHEN COUNT(*) >= 5 THEN '✓ All functions created'
    ELSE '⚠ Found ' || COUNT(*)::text || ' functions (expected 5+)'
  END as status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
  AND p.prokind = 'f';

-- 9. Check views
SELECT 
  'Checking Views...' as step,
  COUNT(*) as view_count,
  CASE 
    WHEN COUNT(*) >= 2 THEN '✓ Views created'
    ELSE '⚠ Found ' || COUNT(*)::text || ' views (expected 2+)'
  END as status
FROM information_schema.views 
WHERE table_schema = 'public';

-- 10. Check admin users
SELECT 
  'Checking Admin Users...' as step,
  COUNT(*) as admin_count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✓ Admin users exist'
    ELSE '⚠ No admin users! Create one using the guide'
  END as status
FROM admin_users;

-- 11. Check RSS feeds
SELECT 
  'Checking RSS Feeds...' as step,
  COUNT(*) as feed_count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✓ RSS feeds configured'
    ELSE '⚠ No RSS feeds! Add some using the guide'
  END as status
FROM rss_feeds;

-- 12. Check articles
SELECT 
  'Checking Articles...' as step,
  COUNT(*) as article_count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✓ Articles exist (' || COUNT(*)::text || ')'
    ELSE '⚠ No articles yet. Fetch feeds to populate'
  END as status
FROM news_articles;

-- 13. Overall Summary
SELECT 
  '============================================' as divider,
  'DATABASE VERIFICATION SUMMARY' as title,
  '============================================' as divider2;

-- Final status check
WITH verification_results AS (
  SELECT 
    CASE 
      WHEN (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') >= 15 THEN 1
      ELSE 0 
    END as tables_ok,
    CASE 
      WHEN (SELECT COUNT(*) FROM categories) >= 8 THEN 1
      ELSE 0 
    END as categories_ok,
    CASE 
      WHEN (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') >= 21 THEN 1
      ELSE 0 
    END as policies_ok,
    CASE 
      WHEN (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public') >= 80 THEN 1
      ELSE 0 
    END as indexes_ok
)
SELECT 
  CASE 
    WHEN tables_ok + categories_ok + policies_ok + indexes_ok = 4 
    THEN '✓✓✓ DATABASE SETUP COMPLETE! ✓✓✓'
    WHEN tables_ok + categories_ok + policies_ok + indexes_ok >= 2 
    THEN '⚠⚠⚠ DATABASE PARTIALLY SETUP - Check warnings above'
    ELSE '✗✗✗ DATABASE SETUP INCOMPLETE - Run schema again'
  END as final_status,
  tables_ok::text || '/1 Tables' as tables,
  categories_ok::text || '/1 Categories' as categories,
  policies_ok::text || '/1 Policies' as policies,
  indexes_ok::text || '/1 Indexes' as indexes
FROM verification_results;

-- Helpful next steps
SELECT 
  '============================================' as divider,
  'NEXT STEPS' as title,
  '============================================' as divider2;

SELECT 
  step_number,
  description,
  status
FROM (
  SELECT 1 as step_number, '1. Create admin user' as description,
    CASE WHEN (SELECT COUNT(*) FROM admin_users) > 0 
    THEN '✓ Done' ELSE '⚠ TODO' END as status
  UNION ALL
  SELECT 2, '2. Add RSS feeds',
    CASE WHEN (SELECT COUNT(*) FROM rss_feeds) > 0 
    THEN '✓ Done' ELSE '⚠ TODO' END
  UNION ALL
  SELECT 3, '3. Configure .env file',
    'See COMPLETE_SETUP_GUIDE.md'
  UNION ALL
  SELECT 4, '4. Deploy Edge Functions',
    'Optional but recommended'
  UNION ALL
  SELECT 5, '5. Fetch first articles',
    CASE WHEN (SELECT COUNT(*) FROM news_articles) > 0 
    THEN '✓ Done' ELSE '⚠ TODO' END
  UNION ALL
  SELECT 6, '6. Start application',
    'Run: npm run dev'
) steps
ORDER BY step_number;
