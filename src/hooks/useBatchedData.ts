import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

/**
 * Batch fetch article likes for multiple articles at once
 * Reduces N+1 query problem
 */
export function useArticleLikes(articleIds: string[]) {
  return useQuery({
    queryKey: ['article-likes', articleIds],
    queryFn: async () => {
      if (articleIds.length === 0) return {};
      
      const { data, error } = await supabase
        .from('article_likes')
        .select('article_id, user_identifier')
        .in('article_id', articleIds);
      
      if (error) {
        console.error('Error fetching batched likes:', error);
        throw error;
      }
      
      // Group by article_id
      const likesByArticle: Record<string, { count: number; userIds: string[] }> = {};
      
      (data || []).forEach((like: any) => {
        if (!likesByArticle[like.article_id]) {
          likesByArticle[like.article_id] = { count: 0, userIds: [] };
        }
        likesByArticle[like.article_id].count++;
        likesByArticle[like.article_id].userIds.push(like.user_identifier);
      });
      
      return likesByArticle;
    },
    enabled: articleIds.length > 0,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Batch fetch bookmarks for multiple articles at once
 */
export function useBookmarks(articleIds: string[], userId?: string) {
  return useQuery({
    queryKey: ['bookmarks', userId, articleIds],
    queryFn: async () => {
      if (!userId || articleIds.length === 0) return {};
      
      const { data, error } = await supabase
        .from('bookmarks')
        .select('article_id')
        .eq('user_id', userId)
        .in('article_id', articleIds);
      
      if (error) throw error;
      
      // Convert to Set for O(1) lookup
      const bookmarkedIds = new Set((data || []).map((b: any) => b.article_id));
      
      // Convert to object for easier consumption
      const bookmarksByArticle: Record<string, boolean> = {};
      articleIds.forEach(id => {
        bookmarksByArticle[id] = bookmarkedIds.has(id);
      });
      
      return bookmarksByArticle;
    },
    enabled: !!userId && articleIds.length > 0,
    staleTime: 30 * 1000,
    gcTime: 2 * 60 * 1000,
  });
}

/**
 * Get likes for a specific article from batched data
 */
export function useArticleLike(articleId: string | undefined, userId?: string, batchedLikes?: Record<string, { count: number; userIds: string[] }>) {
  if (!articleId || !batchedLikes) {
    return { count: 0, isLiked: false };
  }
  
  const likes = batchedLikes[articleId];
  if (!likes) {
    return { count: 0, isLiked: false };
  }
  
  return {
    count: likes.count,
    isLiked: userId ? likes.userIds.includes(userId) : false,
  };
}

/**
 * Get bookmark status for a specific article from batched data
 */
export function useArticleBookmark(articleId: string | undefined, batchedBookmarks?: Record<string, boolean>) {
  if (!articleId || !batchedBookmarks) {
    return false;
  }
  
  return batchedBookmarks[articleId] || false;
}
