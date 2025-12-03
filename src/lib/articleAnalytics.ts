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

    // Get all views from the last 24 hours
    const { data: viewsData, error } = await supabase
      .from('article_views')
      .select('article_id')
      .gte('viewed_at', twentyFourHoursAgo.toISOString());

    if (error) throw error;

    if (!viewsData || viewsData.length === 0) return [];

    // Count views per article in client
    const viewsByArticle = viewsData.reduce((acc: any, view: any) => {
      acc[view.article_id] = (acc[view.article_id] || 0) + 1;
      return acc;
    }, {});

    // Get top article IDs
    const topArticleIds = Object.entries(viewsByArticle)
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => id);

    if (topArticleIds.length === 0) return [];

    // Get full article details for trending article IDs
    const { data: articles, error: articlesError } = await supabase
      .from('news_articles')
      .select('*')
      .in('id', topArticleIds);

    if (articlesError) throw articlesError;

    // Sort articles by view count
    const articlesMap = new Map(articles?.map(a => [a.id, a]) || []);
    return Object.entries(viewsByArticle)
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => articlesMap.get(id))
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
    
    const { data: existing, error: selectError } = await supabase
      .from('article_likes')
      .select('*')
      .eq('article_id', articleId)
      .eq('user_id', identifier);

    if (selectError) {
      console.error('Error checking existing like:', selectError);
      throw selectError;
    }

    if (existing && existing.length > 0) {
      // Unlike
      const { error: deleteError } = await supabase
        .from('article_likes')
        .delete()
        .eq('article_id', articleId)
        .eq('user_id', identifier);
      
      if (deleteError) {
        console.error('Error deleting like:', deleteError);
        throw deleteError;
      }
    } else {
      // Like
      const { error: insertError } = await supabase.from('article_likes').insert([
        {
          article_id: articleId,
          user_id: identifier,
          created_at: new Date().toISOString(),
        }
      ]);
      
      if (insertError) {
        console.error('Error inserting like:', insertError);
        throw insertError;
      }
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
      .eq('user_id', identifier)
      .maybeSingle();

    if (error) {
      console.error('Error checking if user liked:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Exception checking if user liked:', error);
    return false;
  }
}

function generateAnonId(): string {
  // Use crypto.randomUUID if available, otherwise fallback
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    const id = crypto.randomUUID();
    localStorage.setItem('anon_id', id);
    return id;
  }
  // Fallback for older browsers
  const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
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
