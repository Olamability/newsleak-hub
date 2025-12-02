import { supabase } from './supabaseClient';

interface ArticleView {
  article_id: string;
  viewed_at: string;
}

// Track article view
export async function trackArticleView(articleId: string): Promise<void> {
  try {
    await supabase.from('article_views').insert([
      {
        article_id: articleId,
        viewed_at: new Date().toISOString(),
      }
    ]);
  } catch (error) {
    console.error('Failed to track article view:', error);
  }
}

// Get trending articles (most viewed in last 24 hours)
export async function getTrendingArticles(limit: number = 10): Promise<any[]> {
  try {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const { data, error } = await supabase
      .from('article_views')
      .select('article_id, count')
      .gte('viewed_at', twentyFourHoursAgo.toISOString())
      .order('count', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Get full article details for trending article IDs
    if (!data || data.length === 0) return [];

    const articleIds = data.map((item: any) => item.article_id);
    const { data: articles, error: articlesError } = await supabase
      .from('news_articles')
      .select('*')
      .in('id', articleIds);

    if (articlesError) throw articlesError;

    // Sort articles by view count
    const articlesMap = new Map(articles?.map(a => [a.id, a]) || []);
    return data
      .map((item: any) => articlesMap.get(item.article_id))
      .filter(Boolean);
  } catch (error) {
    console.error('Failed to get trending articles:', error);
    return [];
  }
}

// Like an article
export async function likeArticle(articleId: string, userId?: string): Promise<void> {
  try {
    // Check if already liked
    const identifier = userId || `anon_${localStorage.getItem('anon_id') || generateAnonId()}`;
    
    const { data: existing } = await supabase
      .from('article_likes')
      .select('*')
      .eq('article_id', articleId)
      .eq('user_identifier', identifier)
      .single();

    if (existing) {
      // Unlike
      await supabase
        .from('article_likes')
        .delete()
        .eq('article_id', articleId)
        .eq('user_identifier', identifier);
    } else {
      // Like
      await supabase.from('article_likes').insert([
        {
          article_id: articleId,
          user_identifier: identifier,
          created_at: new Date().toISOString(),
        }
      ]);
    }
  } catch (error) {
    console.error('Failed to like article:', error);
    throw error;
  }
}

// Get like count for an article
export async function getArticleLikes(articleId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('article_likes')
      .select('*', { count: 'exact', head: true })
      .eq('article_id', articleId);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Failed to get article likes:', error);
    return 0;
  }
}

// Check if user liked an article
export async function hasUserLiked(articleId: string, userId?: string): Promise<boolean> {
  try {
    const identifier = userId || `anon_${localStorage.getItem('anon_id') || generateAnonId()}`;
    
    const { data, error } = await supabase
      .from('article_likes')
      .select('*')
      .eq('article_id', articleId)
      .eq('user_identifier', identifier)
      .single();

    return !!data;
  } catch (error) {
    return false;
  }
}

function generateAnonId(): string {
  const id = Math.random().toString(36).substring(2, 15);
  localStorage.setItem('anon_id', id);
  return id;
}

// Get article analytics
export async function getArticleAnalytics(articleId: string) {
  try {
    const [likes, views] = await Promise.all([
      getArticleLikes(articleId),
      getArticleViews(articleId),
    ]);

    return { likes, views };
  } catch (error) {
    console.error('Failed to get article analytics:', error);
    return { likes: 0, views: 0 };
  }
}

async function getArticleViews(articleId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('article_views')
      .select('*', { count: 'exact', head: true })
      .eq('article_id', articleId);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Failed to get article views:', error);
    return 0;
  }
}
