import { useQuery } from '@tanstack/react-query';
import { getArticleLikes, hasUserLiked } from '@/lib/localLikes';
import { isBookmarked } from '@/lib/localBookmarks';

/**
 * Batch fetch article likes for multiple articles at once
 * Reduces N+1 query problem
 */
export function useArticleLikes(articleIds: string[]) {
  return useQuery({
    queryKey: ['article-likes', articleIds],
    queryFn: async () => {
      if (articleIds.length === 0) return {};
      
      // Group by article_id using local storage
      const likesByArticle: Record<string, { count: number; userIds: string[] }> = {};
      
      // Get all likes from local storage
      const likesData = localStorage.getItem('newsleak_article_likes');
      const allLikes = likesData ? JSON.parse(likesData) : [];
      
      allLikes.forEach((like: any) => {
        if (articleIds.includes(like.articleId)) {
          if (!likesByArticle[like.articleId]) {
            likesByArticle[like.articleId] = { count: 0, userIds: [] };
          }
          likesByArticle[like.articleId].count++;
          likesByArticle[like.articleId].userIds.push(like.userId);
        }
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
      
      // Get bookmarks from local storage
      const bookmarksData = localStorage.getItem('newsleak_bookmarks');
      const allBookmarks = bookmarksData ? JSON.parse(bookmarksData) : [];
      
      // Filter for this user and these articles
      const userBookmarks = allBookmarks.filter(
        (b: any) => b.userId === userId && articleIds.includes(b.articleId)
      );
      
      // Convert to Set for O(1) lookup
      const bookmarkedIds = new Set(userBookmarks.map((b: any) => b.articleId));
      
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
