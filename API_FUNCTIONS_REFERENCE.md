# 🔌 API & Backend Functions Reference

Complete reference for all backend operations in the Newsleak platform.

## 📚 Table of Contents
1. [Supabase Client Setup](#supabase-client-setup)
2. [News Articles API](#news-articles-api)
3. [User Interactions API](#user-interactions-api)
4. [Authentication API](#authentication-api)
5. [RSS Feeds API](#rss-feeds-api)
6. [Comments API](#comments-api)
7. [User Preferences API](#user-preferences-api)
8. [Analytics API](#analytics-api)
9. [Edge Functions](#edge-functions)
10. [Real-time Subscriptions](#real-time-subscriptions)

---

## 🔧 Supabase Client Setup

All API calls use the Supabase client configured in `src/lib/supabaseClient.ts`:

```typescript
import { supabase } from '@/lib/supabaseClient';
```

---

## 📰 News Articles API

### Get All Published Articles

```typescript
const { data: articles, error } = await supabase
  .from('news_articles')
  .select('*')
  .eq('is_published', true)
  .order('published', { ascending: false });
```

### Get Articles with Pagination

```typescript
const { data: articles, error } = await supabase
  .from('news_articles')
  .select('*')
  .eq('is_published', true)
  .order('published', { ascending: false })
  .range(0, 9); // First 10 articles
```

### Get Single Article by ID

```typescript
const { data: article, error } = await supabase
  .from('news_articles')
  .select('*')
  .eq('id', articleId)
  .single();
```

### Get Articles by Category

```typescript
const { data: articles, error } = await supabase
  .from('news_articles')
  .select('*')
  .eq('category', 'Technology')
  .eq('is_published', true)
  .order('published', { ascending: false });
```

### Get Trending Articles

```typescript
// Using the trending_articles view
const { data: trending, error } = await supabase
  .from('trending_articles')
  .select('*')
  .limit(20);
```

### Get Breaking News

```typescript
const { data: breaking, error } = await supabase
  .from('news_articles')
  .select('*')
  .eq('is_breaking', true)
  .eq('is_published', true)
  .order('published', { ascending: false });
```

### Search Articles

```typescript
const { data: results, error } = await supabase
  .from('news_articles')
  .select('*')
  .eq('is_published', true)
  .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
  .order('published', { ascending: false });
```

### Get Articles with Related Data

```typescript
const { data: articles, error } = await supabase
  .from('news_articles')
  .select(`
    *,
    feed:rss_feeds(source, favicon, website_url),
    article_categories(
      category:categories(name, slug, icon)
    )
  `)
  .eq('is_published', true)
  .order('published', { ascending: false });
```

---

## 👤 User Interactions API

### Likes

#### Check if Article is Liked

```typescript
const { data, error } = await supabase
  .from('article_likes')
  .select('id')
  .eq('article_id', articleId)
  .eq('user_id', userId)
  .single();

const isLiked = !!data;
```

#### Add Like

```typescript
const { error } = await supabase
  .from('article_likes')
  .insert({
    article_id: articleId,
    user_id: userId
  });
```

#### Remove Like

```typescript
const { error } = await supabase
  .from('article_likes')
  .delete()
  .eq('article_id', articleId)
  .eq('user_id', userId);
```

#### Get Article Like Count

```typescript
const { data: article, error } = await supabase
  .from('news_articles')
  .select('like_count')
  .eq('id', articleId)
  .single();
```

#### Batch Get Likes for Multiple Articles

```typescript
const { data: likes, error } = await supabase
  .from('article_likes')
  .select('article_id')
  .eq('user_id', userId)
  .in('article_id', articleIds);

// Convert to a map
const likesMap = likes?.reduce((acc, like) => {
  acc[like.article_id] = true;
  return acc;
}, {});
```

### Bookmarks

#### Check if Article is Bookmarked

```typescript
const { data, error } = await supabase
  .from('article_bookmarks')
  .select('id')
  .eq('article_id', articleId)
  .eq('user_id', userId)
  .single();

const isBookmarked = !!data;
```

#### Add Bookmark

```typescript
const { error } = await supabase
  .from('article_bookmarks')
  .insert({
    article_id: articleId,
    user_id: userId,
    article: articleData // Store full article for offline access
  });
```

#### Remove Bookmark

```typescript
const { error } = await supabase
  .from('article_bookmarks')
  .delete()
  .eq('article_id', articleId)
  .eq('user_id', userId);
```

#### Get User's Bookmarks

```typescript
const { data: bookmarks, error } = await supabase
  .from('article_bookmarks')
  .select('article')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });

const articles = bookmarks?.map(b => b.article);
```

### Views

#### Record Article View

```typescript
const { error } = await supabase
  .from('article_views')
  .insert({
    article_id: articleId,
    user_id: userId, // Can be null for anonymous
    session_id: sessionId,
    user_agent: navigator.userAgent,
    referrer: document.referrer
  });
```

---

## 💬 Comments API

### Get Article Comments

```typescript
const { data: comments, error } = await supabase
  .from('comments')
  .select(`
    *,
    user:users(username, avatar_url)
  `)
  .eq('article_id', articleId)
  .eq('is_deleted', false)
  .is('parent_id', null) // Top-level comments only
  .order('created_at', { ascending: false });
```

### Get Comment Replies

```typescript
const { data: replies, error } = await supabase
  .from('comments')
  .select(`
    *,
    user:users(username, avatar_url)
  `)
  .eq('parent_id', commentId)
  .eq('is_deleted', false)
  .order('created_at', { ascending: true });
```

### Add Comment

```typescript
const { data: comment, error } = await supabase
  .from('comments')
  .insert({
    article_id: articleId,
    user_id: userId,
    content: commentText,
    parent_id: parentCommentId // null for top-level comment
  })
  .select()
  .single();
```

### Update Comment

```typescript
const { error } = await supabase
  .from('comments')
  .update({
    content: newContent,
    updated_at: new Date().toISOString()
  })
  .eq('id', commentId)
  .eq('user_id', userId); // Security: only own comments
```

### Delete Comment

```typescript
const { error } = await supabase
  .from('comments')
  .update({ is_deleted: true }) // Soft delete
  .eq('id', commentId)
  .eq('user_id', userId);
```

---

## 📡 RSS Feeds API (Admin Only)

### Get All Feeds

```typescript
const { data: feeds, error } = await supabase
  .from('rss_feeds')
  .select('*')
  .order('source', { ascending: true });
```

### Get Active Feeds

```typescript
const { data: feeds, error } = await supabase
  .from('rss_feeds')
  .select('*')
  .eq('is_active', true)
  .order('source', { ascending: true });
```

### Add RSS Feed

```typescript
const { data: feed, error } = await supabase
  .from('rss_feeds')
  .insert({
    source: 'Source Name',
    url: 'https://example.com/rss',
    category: 'Technology',
    language: 'en',
    is_active: true,
    description: 'Feed description',
    website_url: 'https://example.com',
    created_by: adminUserId
  })
  .select()
  .single();
```

### Update Feed

```typescript
const { error } = await supabase
  .from('rss_feeds')
  .update({
    is_active: false,
    category: 'Business'
  })
  .eq('id', feedId);
```

### Delete Feed

```typescript
const { error } = await supabase
  .from('rss_feeds')
  .delete()
  .eq('id', feedId);
```

---

## ⚙️ User Preferences API

### Get User Preferences

```typescript
const { data: prefs, error } = await supabase
  .from('user_preferences')
  .select('*')
  .eq('user_id', userId)
  .single();
```

### Create/Update User Preferences

```typescript
const { error } = await supabase
  .from('user_preferences')
  .upsert({
    user_id: userId,
    theme: 'dark',
    language: 'en',
    favorite_categories: ['Technology', 'Sports'],
    text_size: 'medium',
    notification_enabled: true,
    breaking_news_alerts: true,
    fcm_token: fcmToken
  });
```

### Update Favorite Categories

```typescript
const { error } = await supabase
  .from('user_preferences')
  .update({
    favorite_categories: ['Technology', 'Business', 'Science']
  })
  .eq('user_id', userId);
```

### Save FCM Token for Push Notifications

```typescript
const { error } = await supabase
  .from('user_preferences')
  .upsert({
    user_id: userId,
    fcm_token: token
  });
```

---

## 📊 Analytics API

### Get Article Stats

```typescript
const { data: article, error } = await supabase
  .from('news_articles')
  .select('view_count, like_count, comment_count, share_count, engagement_score')
  .eq('id', articleId)
  .single();
```

### Get Popular Articles

```typescript
const { data: popular, error } = await supabase
  .from('popular_articles')
  .select('*')
  .limit(20);
```

### Get User Activity

```typescript
const { data: activity, error } = await supabase
  .from('user_activity')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(50);
```

### Track User Activity

```typescript
const { error } = await supabase
  .from('user_activity')
  .insert({
    user_id: userId,
    activity_type: 'view', // 'view', 'like', 'bookmark', 'share', 'comment'
    article_id: articleId,
    metadata: { platform: 'web' }
  });
```

### Get Admin Dashboard Stats

```typescript
// Total users
const { count: userCount } = await supabase
  .from('users')
  .select('*', { count: 'exact', head: true });

// Total articles
const { count: articleCount } = await supabase
  .from('news_articles')
  .select('*', { count: 'exact', head: true })
  .eq('is_published', true);

// Total views today
const { count: viewsToday } = await supabase
  .from('article_views')
  .select('*', { count: 'exact', head: true })
  .gte('viewed_at', new Date().toISOString().split('T')[0]);

// Top sources
const { data: topSources } = await supabase
  .from('news_articles')
  .select('source, count(*)')
  .eq('is_published', true)
  .group('source')
  .order('count', { ascending: false })
  .limit(10);
```

---

## 🌐 Edge Functions

### Fetch RSS Feeds

Trigger the RSS feed fetcher:

```typescript
const { data, error } = await supabase.functions.invoke('fetchFeeds', {
  body: {
    feedId: 'optional-specific-feed-id' // Omit to fetch all active feeds
  }
});
```

### Send Push Notification

```typescript
const { data, error } = await supabase.functions.invoke('sendNotification', {
  body: {
    title: 'Breaking News',
    body: 'Important update...',
    article_id: articleId,
    image_url: 'https://...',
    user_id: userId, // Omit for broadcast to all users
    category_filter: 'Technology' // Optional: only users who follow this category
  }
});
```

---

## 🔴 Real-time Subscriptions

### Subscribe to New Articles

```typescript
const subscription = supabase
  .channel('news-articles')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'news_articles',
      filter: 'is_published=eq.true'
    },
    (payload) => {
      console.log('New article:', payload.new);
      // Update UI with new article
    }
  )
  .subscribe();

// Cleanup
subscription.unsubscribe();
```

### Subscribe to Article Updates

```typescript
const subscription = supabase
  .channel(`article-${articleId}`)
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'news_articles',
      filter: `id=eq.${articleId}`
    },
    (payload) => {
      console.log('Article updated:', payload.new);
    }
  )
  .subscribe();
```

### Subscribe to New Comments

```typescript
const subscription = supabase
  .channel(`article-comments-${articleId}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'comments',
      filter: `article_id=eq.${articleId}`
    },
    (payload) => {
      console.log('New comment:', payload.new);
    }
  )
  .subscribe();
```

---

## 🎯 React Query Hooks

The app uses React Query for caching. Here are the custom hooks:

### useNews

```typescript
import { useNews } from '@/hooks/useNews';

function MyComponent() {
  const { data: news, isLoading, error } = useNews();
  
  return (
    <div>
      {news?.map(article => (
        <div key={article.id}>{article.title}</div>
      ))}
    </div>
  );
}
```

### useArticle

```typescript
import { useArticle } from '@/hooks/useNews';

function ArticleDetail({ id }) {
  const { data: article, isLoading } = useArticle(id);
  
  return <div>{article?.title}</div>;
}
```

### useEnrichedNews

```typescript
import { useEnrichedNews } from '@/hooks/useNews';

function NewsFeed() {
  const { data: news, isLoading } = useEnrichedNews();
  
  // News includes feed info, computed time strings, etc.
  return <div>{/* ... */}</div>;
}
```

---

## 🔒 Authentication

### Sign Up with Email

```typescript
import { auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

const { user } = await createUserWithEmailAndPassword(
  auth,
  email,
  password
);
```

### Sign In

```typescript
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

const { user } = await signInWithEmailAndPassword(
  auth,
  email,
  password
);
```

### Sign Out

```typescript
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

await signOut(auth);
```

### Get Current User

```typescript
import { useAuth } from '@/components/AuthProvider';

function MyComponent() {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please sign in</div>;
  
  return <div>Hello {user.email}</div>;
}
```

---

## 🛡️ Error Handling

Always handle errors properly:

```typescript
const { data, error } = await supabase
  .from('news_articles')
  .select('*');

if (error) {
  console.error('Error fetching articles:', error);
  // Show user-friendly error message
  toast.error('Failed to load articles. Please try again.');
  return;
}

// Use data...
```

---

## ⚡ Performance Tips

1. **Use React Query hooks** - They handle caching automatically
2. **Batch queries** - Fetch multiple likes/bookmarks in one query
3. **Use indexes** - All tables have proper indexes
4. **Pagination** - Use `.range()` for large datasets
5. **Select specific columns** - Don't use `select('*')` if you only need a few fields
6. **Use views** - `popular_articles` and `trending_articles` are pre-computed

---

## 📚 Related Documentation

- [Complete Backend Setup Guide](./COMPLETE_BACKEND_INTEGRATION_GUIDE.md)
- [Sample Data SQL](./SAMPLE_DATA_SQL.md)
- [Database Schema](./supabase_complete_schema.sql)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)

---

**Last Updated**: December 2024  
**Version**: 2.0.0
