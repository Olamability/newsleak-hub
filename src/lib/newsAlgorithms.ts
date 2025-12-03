// Algorithms for news recommendation, trending, and related articles
import { supabase } from './supabaseClient';

export interface Article {
  id: string;
  title: string;
  description?: string;
  content?: string;
  source: string;
  published: string;
  image?: string;
  link: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  share_count: number;
  engagement_score: number;
}

/**
 * Calculate trending score for articles
 * Factors: recency, views, likes, comments, shares
 * Higher score = more trending
 */
export function calculateTrendingScore(article: Article): number {
  const now = new Date();
  const publishedDate = new Date(article.published);
  const hoursSincePublished = (now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60);
  
  // Recency factor (exponential decay over 48 hours)
  const recencyFactor = Math.exp(-hoursSincePublished / 24);
  
  // Engagement weights
  const viewWeight = 1;
  const likeWeight = 3;
  const commentWeight = 5;
  const shareWeight = 10;
  
  const engagementScore = 
    (article.view_count * viewWeight) +
    (article.like_count * likeWeight) +
    (article.comment_count * commentWeight) +
    (article.share_count * shareWeight);
  
  // Velocity factor (engagement rate per hour)
  const velocity = hoursSincePublished > 0 ? engagementScore / hoursSincePublished : engagementScore;
  
  // Final trending score combines recency and velocity
  return recencyFactor * velocity;
}

/**
 * Get trending articles from the last 24-48 hours
 */
export async function getTrendingArticles(limit: number = 20): Promise<Article[]> {
  try {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    
    const { data, error } = await supabase
      .from('news_articles')
      .select('*')
      .eq('is_published', true)
      .gte('published', twoDaysAgo.toISOString())
      .order('engagement_score', { ascending: false })
      .limit(limit * 2); // Get more to filter
    
    if (error) throw error;
    
    if (!data || data.length === 0) return [];
    
    // Calculate trending scores and sort
    const articlesWithScores = data.map(article => ({
      ...article,
      trendingScore: calculateTrendingScore(article as Article),
    }));
    
    // Sort by trending score and return top N
    return articlesWithScores
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting trending articles:', error);
    return [];
  }
}

/**
 * Simple text similarity using cosine similarity of word frequencies
 */
function textSimilarity(text1: string, text2: string): number {
  const words1 = text1.toLowerCase().split(/\W+/).filter(w => w.length > 3);
  const words2 = text2.toLowerCase().split(/\W+/).filter(w => w.length > 3);
  
  const allWords = new Set([...words1, ...words2]);
  const vector1: number[] = [];
  const vector2: number[] = [];
  
  allWords.forEach(word => {
    vector1.push(words1.filter(w => w === word).length);
    vector2.push(words2.filter(w => w === word).length);
  });
  
  // Calculate cosine similarity
  const dotProduct = vector1.reduce((sum, val, i) => sum + val * vector2[i], 0);
  const magnitude1 = Math.sqrt(vector1.reduce((sum, val) => sum + val * val, 0));
  const magnitude2 = Math.sqrt(vector2.reduce((sum, val) => sum + val * val, 0));
  
  if (magnitude1 === 0 || magnitude2 === 0) return 0;
  return dotProduct / (magnitude1 * magnitude2);
}

/**
 * Get related articles based on content similarity
 */
export async function getRelatedArticles(
  article: Article,
  limit: number = 6
): Promise<Article[]> {
  try {
    // Combine title, description, and content for similarity matching
    const articleText = `${article.title} ${article.description || ''} ${article.content || ''}`;
    
    // Get articles from the same source or similar timeframe
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data, error } = await supabase
      .from('news_articles')
      .select('*')
      .eq('is_published', true)
      .neq('id', article.id)
      .gte('published', sevenDaysAgo.toISOString())
      .limit(50); // Get a pool of candidates
    
    if (error) throw error;
    
    if (!data || data.length === 0) return [];
    
    // Calculate similarity scores
    const articlesWithScores = data.map(relatedArticle => {
      const relatedText = `${relatedArticle.title} ${relatedArticle.description || ''} ${relatedArticle.content || ''}`;
      const similarity = textSimilarity(articleText, relatedText);
      
      // Boost score if same source
      const sourceBoost = relatedArticle.source === article.source ? 1.2 : 1.0;
      
      return {
        ...relatedArticle,
        similarityScore: similarity * sourceBoost,
      };
    });
    
    // Sort by similarity and return top N
    return articlesWithScores
      .filter(a => a.similarityScore > 0.1) // Minimum similarity threshold
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting related articles:', error);
    return [];
  }
}

/**
 * Get personalized article recommendations based on user preferences
 */
export async function getPersonalizedArticles(
  userId: string,
  limit: number = 20
): Promise<Article[]> {
  try {
    // Get user preferences
    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('favorite_categories, followed_sources')
      .eq('user_id', userId)
      .single();
    
    // Get user's reading history
    const { data: history } = await supabase
      .from('user_activity')
      .select('article_id')
      .eq('user_id', userId)
      .eq('activity_type', 'view')
      .order('created_at', { ascending: false })
      .limit(50);
    
    const viewedArticleIds = history?.map(h => h.article_id) || [];
    
    let query = supabase
      .from('news_articles')
      .select('*')
      .eq('is_published', true)
      .order('engagement_score', { ascending: false });
    
    // Filter by favorite categories if set
    if (prefs?.favorite_categories && prefs.favorite_categories.length > 0) {
      // This would require a join with article_categories table
      // For simplicity, we'll fetch all and filter in memory
    }
    
    // Exclude already viewed articles
    if (viewedArticleIds.length > 0) {
      query = query.not('id', 'in', `(${viewedArticleIds.join(',')})`);
    }
    
    const { data, error } = await query.limit(limit);
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error getting personalized articles:', error);
    return [];
  }
}

/**
 * Get breaking news articles (manually flagged by admins)
 */
export async function getBreakingNews(limit: number = 5): Promise<Article[]> {
  try {
    const { data, error } = await supabase
      .from('news_articles')
      .select('*')
      .eq('is_published', true)
      .eq('is_breaking', true)
      .order('published', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error getting breaking news:', error);
    return [];
  }
}

/**
 * Update trending status for articles based on their trending scores
 * Should be run periodically (e.g., every hour) via cron
 */
export async function updateTrendingArticles(): Promise<void> {
  try {
    const trendingArticles = await getTrendingArticles(50);
    const trendingIds = trendingArticles.map(a => a.id);
    
    // Mark articles as trending
    if (trendingIds.length > 0) {
      await supabase
        .from('news_articles')
        .update({ is_trending: true })
        .in('id', trendingIds);
    }
    
    // Remove trending flag from articles no longer trending
    await supabase
      .from('news_articles')
      .update({ is_trending: false })
      .not('id', 'in', `(${trendingIds.join(',')})`);
    
    console.log(`Updated ${trendingIds.length} trending articles`);
  } catch (error) {
    console.error('Error updating trending articles:', error);
  }
}

/**
 * Track article view for analytics and recommendations
 */
export async function trackArticleView(articleId: string, userId?: string): Promise<void> {
  try {
    const sessionId = sessionStorage.getItem('sessionId') || crypto.randomUUID();
    sessionStorage.setItem('sessionId', sessionId);
    
    await supabase.from('article_views').insert({
      article_id: articleId,
      user_id: userId || localStorage.getItem('userId'),
      session_id: sessionId,
      viewed_at: new Date().toISOString(),
    });
    
    // Also track in user activity
    await supabase.from('user_activity').insert({
      user_id: userId || localStorage.getItem('userId') || `anon_${crypto.randomUUID()}`,
      activity_type: 'view',
      article_id: articleId,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error tracking article view:', error);
  }
}

/**
 * Get popular articles by category
 */
export async function getPopularByCategory(
  category: string,
  limit: number = 10
): Promise<Article[]> {
  try {
    // This would require joining with article_categories
    // For now, we'll use a simple approach based on the category in rss_feeds
    
    const { data, error } = await supabase
      .from('news_articles')
      .select(`
        *,
        rss_feeds!inner(category)
      `)
      .eq('is_published', true)
      .eq('rss_feeds.category', category)
      .order('engagement_score', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error getting popular by category:', error);
    return [];
  }
}
