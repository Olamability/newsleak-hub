import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { 
  isBookmarked, 
  addBookmark, 
  removeBookmark 
} from '@/lib/bookmarks';
import {
  isLocalBookmarked,
  addLocalBookmark,
  removeLocalBookmark,
} from '@/utils/localBookmarks';

/**
 * Hook to check if an article is bookmarked (with caching)
 */
export function useIsBookmarked(
  articleId: string | undefined, 
  userId: string | undefined,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['bookmark', articleId, userId],
    queryFn: async () => {
      if (!articleId) return false;
      
      if (userId) {
        return await isBookmarked(articleId, userId);
      } else {
        return isLocalBookmarked(articleId);
      }
    },
    enabled: options?.enabled !== undefined ? options.enabled : !!articleId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to toggle bookmark with optimistic updates
 */
export function useToggleBookmark(articleId: string | undefined, userId: string | undefined) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ article, isCurrentlyBookmarked }: { article: any; isCurrentlyBookmarked: boolean }) => {
      if (!articleId) throw new Error('No article ID');
      
      if (userId) {
        if (isCurrentlyBookmarked) {
          await removeBookmark(articleId, userId);
          return false;
        } else {
          await addBookmark(article, userId);
          return true;
        }
      } else {
        if (isCurrentlyBookmarked) {
          removeLocalBookmark(articleId);
          return false;
        } else {
          addLocalBookmark(article);
          return true;
        }
      }
    },
    onMutate: async ({ isCurrentlyBookmarked }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ['bookmark', articleId, userId] });
      
      // Snapshot previous value
      const previousBookmark = queryClient.getQueryData(['bookmark', articleId, userId]);
      
      // Optimistically update
      queryClient.setQueryData(['bookmark', articleId, userId], !isCurrentlyBookmarked);
      
      return { previousBookmark };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousBookmark !== undefined) {
        queryClient.setQueryData(['bookmark', articleId, userId], context.previousBookmark);
      }
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: ['bookmark', articleId, userId] });
    },
  });
}
