# Newsleak API Documentation

This document provides comprehensive API documentation for the Newsleak platform, including Supabase database operations and Edge Functions.

## Table of Contents

1. [Authentication](#authentication)
2. [Database Tables](#database-tables)
3. [Edge Functions](#edge-functions)
4. [Client-Side APIs](#client-side-apis)
5. [Rate Limiting](#rate-limiting)
6. [Error Handling](#error-handling)

---

## Authentication

### User Authentication

Newsleak supports both authenticated and anonymous users:

- **Authenticated Users**: Via Firebase Authentication (Email, Google, Phone)
- **Anonymous Users**: Assigned a UUID stored in localStorage

### Admin Authentication

Admins are authenticated via Firebase and must exist in the `admin_users` table.

```typescript
// Check if user is admin
const { data } = await supabase
  .from('admin_users')
  .select('*')
  .eq('auth_uid', user.uid)
  .eq('is_active', true)
  .single();
```

---

## Database Tables

### Articles (`news_articles`)

#### Get Published Articles

```typescript
const { data, error } = await supabase
  .from('news_articles')
  .select('*')
  .eq('is_published', true)
  .order('published', { ascending: false })
  .limit(50);
```

#### Get Single Article

```typescript
const { data, error } = await supabase
  .from('news_articles')
  .select('*')
  .eq('id', articleId)
  .single();
```

#### Get Trending Articles

```typescript
const { data, error } = await supabase
  .from('news_articles')
  .select('*')
  .eq('is_published', true)
  .eq('is_trending', true)
  .order('engagement_score', { ascending: false })
  .limit(20);
```

#### Get Breaking News

```typescript
const { data, error } = await supabase
  .from('news_articles')
  .select('*')
  .eq('is_published', true)
  .eq('is_breaking', true)
  .order('published', { ascending: false });
```

### Likes (`article_likes`)

#### Check if User Liked Article

```typescript
const { data, error } = await supabase
  .from('article_likes')
  .select('*')
  .eq('article_id', articleId)
  .eq('user_id', userId)
  .maybeSingle();

const isLiked = !!data;
```

#### Like Article

```typescript
const { error } = await supabase
  .from('article_likes')
  .insert({
    article_id: articleId,
    user_id: userId,
  });
```

#### Unlike Article

```typescript
const { error } = await supabase
  .from('article_likes')
  .delete()
  .eq('article_id', articleId)
  .eq('user_id', userId);
```

#### Get Like Count

```typescript
const { count, error } = await supabase
  .from('article_likes')
  .select('*', { count: 'exact', head: true })
  .eq('article_id', articleId);
```

### Bookmarks (`article_bookmarks`)

#### Get User Bookmarks

```typescript
const { data, error } = await supabase
  .from('article_bookmarks')
  .select(`
    *,
    news_articles (*)
  `)
  .eq('user_id', userId)
  .order('created_at', { ascending: false });
```

#### Add Bookmark

```typescript
const { error } = await supabase
  .from('article_bookmarks')
  .insert({
    article_id: articleId,
    user_id: userId,
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

### Comments (`comments`)

#### Get Article Comments

```typescript
const { data, error } = await supabase
  .from('comments')
  .select('*')
  .eq('article_id', articleId)
  .eq('is_deleted', false)
  .order('created_at', { ascending: false });
```

#### Add Comment

```typescript
const { data, error } = await supabase
  .from('comments')
  .insert({
    article_id: articleId,
    user_id: userId,
    content: commentText,
    parent_id: parentCommentId, // null for top-level comments
  })
  .select()
  .single();
```

#### Update Comment

```typescript
const { error } = await supabase
  .from('comments')
  .update({ content: newContent })
  .eq('id', commentId)
  .eq('user_id', userId);
```

#### Delete Comment (Soft Delete)

```typescript
const { error } = await supabase
  .from('comments')
  .update({ is_deleted: true })
  .eq('id', commentId)
  .eq('user_id', userId);
```

### User Preferences (`user_preferences`)

#### Get User Preferences

```typescript
const { data, error } = await supabase
  .from('user_preferences')
  .select('*')
  .eq('user_id', userId)
  .single();
```

#### Update Preferences

```typescript
const { error } = await supabase
  .from('user_preferences')
  .upsert({
    user_id: userId,
    theme: 'dark',
    favorite_categories: ['Politics', 'Technology'],
    notification_enabled: true,
    breaking_news_alerts: true,
    fcm_token: token,
  }, {
    onConflict: 'user_id'
  });
```

### RSS Feeds (`rss_feeds`)

#### Get Active Feeds (Admin Only)

```typescript
const { data, error } = await supabase
  .from('rss_feeds')
  .select('*')
  .eq('is_active', true)
  .order('source');
```

#### Add Feed (Admin Only)

```typescript
const { data, error } = await supabase
  .from('rss_feeds')
  .insert({
    source: 'BBC News',
    url: 'http://feeds.bbci.co.uk/news/rss.xml',
    category: 'World',
    language: 'en',
    created_by: adminUserId,
  })
  .select()
  .single();
```

#### Update Feed (Admin Only)

```typescript
const { error } = await supabase
  .from('rss_feeds')
  .update({
    is_active: false,
    fetch_errors: 0,
  })
  .eq('id', feedId);
```

### Categories (`categories`)

#### Get All Categories

```typescript
const { data, error } = await supabase
  .from('categories')
  .select('*')
  .eq('is_active', true)
  .order('display_order');
```

#### Get Articles by Category

```typescript
const { data, error } = await supabase
  .from('article_categories')
  .select(`
    news_articles (*)
  `)
  .eq('categories.slug', categorySlug)
  .eq('news_articles.is_published', true);
```

### Analytics

#### Track Article View

```typescript
const { error } = await supabase
  .from('article_views')
  .insert({
    article_id: articleId,
    user_id: userId,
    session_id: sessionId,
    viewed_at: new Date().toISOString(),
  });
```

#### Get Article Analytics

```typescript
const { data, error } = await supabase
  .from('news_articles')
  .select('view_count, like_count, comment_count, share_count, engagement_score')
  .eq('id', articleId)
  .single();
```

---

## Edge Functions

### 1. fetchFeeds

Fetches articles from RSS feeds and stores them in the database.

**Endpoint**: `POST /functions/v1/fetchFeeds`

**Authentication**: Requires anon key or service role key

**Request**: No body required

**Response**:
```json
{
  "success": true,
  "articlesAdded": 42,
  "feedsProcessed": 10,
  "errors": []
}
```

**Usage**:
```typescript
const { data, error } = await supabase.functions.invoke('fetchFeeds');
```

### 2. sendNotification

Sends push notifications via Firebase Cloud Messaging.

**Endpoint**: `POST /functions/v1/sendNotification`

**Authentication**: Requires anon key or service role key

**Request Body**:
```json
{
  "title": "Breaking News",
  "body": "Major event happening now!",
  "imageUrl": "https://example.com/image.jpg",
  "articleId": "uuid-here",
  "tokens": ["fcm-token-1", "fcm-token-2"]
}
```

**Response**:
```json
{
  "success": true,
  "sent": 2,
  "failed": 0,
  "invalidTokens": [],
  "total": 2
}
```

**Usage**:
```typescript
const { data, error } = await supabase.functions.invoke('sendNotification', {
  body: {
    title: 'Breaking News',
    body: 'Something important happened',
    articleId: 'article-id',
    tokens: ['token1', 'token2'],
  },
});
```

---

## Client-Side APIs

### Push Notifications

#### Request Permission

```typescript
import { requestNotificationPermission } from '@/lib/pushNotifications';

const token = await requestNotificationPermission();
if (token) {
  console.log('FCM Token:', token);
}
```

#### Send Notification (Admin)

```typescript
import { sendPushNotification } from '@/lib/pushNotifications';

const result = await sendPushNotification({
  title: 'Breaking News',
  body: 'Major event happening',
  articleId: 'article-id',
  imageUrl: 'https://...',
  categoryFilter: 'Politics', // Optional
});
```

### News Algorithms

#### Get Trending Articles

```typescript
import { getTrendingArticles } from '@/lib/newsAlgorithms';

const trending = await getTrendingArticles(20);
```

#### Get Related Articles

```typescript
import { getRelatedArticles } from '@/lib/newsAlgorithms';

const related = await getRelatedArticles(currentArticle, 6);
```

#### Get Personalized Recommendations

```typescript
import { getPersonalizedArticles } from '@/lib/newsAlgorithms';

const recommended = await getPersonalizedArticles(userId, 20);
```

### SEO

#### Add SEO to Article Page

```typescript
import { SEO, generateArticleSEO } from '@/components/SEO';

function ArticlePage({ article }) {
  const seoProps = generateArticleSEO(article);
  
  return (
    <>
      <SEO {...seoProps} />
      {/* Page content */}
    </>
  );
}
```

---

## Rate Limiting

### Recommended Limits

- **Article Views**: 1000 per hour per IP
- **Likes/Bookmarks**: 100 per hour per user
- **Comments**: 20 per hour per user
- **Feed Fetching**: Once every 5 minutes (admin)
- **Push Notifications**: 100 per day per admin

### Implementation

Rate limiting should be implemented at the Edge Function level using Supabase's built-in rate limiting or a custom Redis-based solution.

---

## Error Handling

### Common Errors

#### 406 Not Acceptable
- **Cause**: RLS policy blocking request
- **Solution**: Ensure user has proper permissions or is authenticated

#### 409 Conflict
- **Cause**: Duplicate entry (e.g., liking same article twice)
- **Solution**: Handle gracefully on client side

#### 500 Internal Server Error
- **Cause**: Database or server issue
- **Solution**: Retry with exponential backoff

### Error Response Format

```json
{
  "error": {
    "message": "Description of the error",
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

### Best Practices

1. **Always handle errors**: Use try-catch blocks
2. **Show user-friendly messages**: Don't expose internal errors
3. **Log errors**: Use console.error for debugging
4. **Retry failed requests**: With exponential backoff
5. **Validate input**: Before making API calls

---

## Performance Tips

1. **Use React Query**: For caching and deduplication
2. **Batch operations**: Combine multiple queries when possible
3. **Use indexes**: Leverage database indexes for fast queries
4. **Paginate results**: Don't load all data at once
5. **Lazy load images**: Use loading="lazy" attribute
6. **Cache static data**: Categories, tags, etc.
7. **Optimize images**: Use CDN and appropriate formats

---

## Security Best Practices

1. **Never expose service role key**: Use only on server
2. **Validate user input**: Prevent SQL injection
3. **Use RLS policies**: Protect sensitive data
4. **Rate limit endpoints**: Prevent abuse
5. **Sanitize HTML**: Prevent XSS attacks
6. **Use HTTPS**: Always use secure connections
7. **Rotate keys regularly**: Update API keys periodically

---

## Support

For API issues or questions:
- Check the [database schema](./DATABASE_SCHEMA.md)
- Review the [setup guide](./PRODUCTION_SETUP_GUIDE.md)
- Contact: api-support@newsleak.com

---

**Last Updated**: December 2024  
**API Version**: 1.0.0
