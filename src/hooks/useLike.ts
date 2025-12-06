import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { likeArticle, hasUserLiked, getArticleLikes, unlikeArticle } from '@/lib/localLikes';

/**
 * Hook to get article like status and count (with caching)
 */
export function useArticleLikeStatus(
  articleId: string | undefined, 
  userId: string | undefined,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['article-like-status', articleId, userId],
    queryFn: async () => {
      if (!articleId) return { isLiked: false, count: 0 };
      
      const [isLiked, count] = await Promise.all([
        hasUserLiked(articleId, userId),
        getArticleLikes(articleId),
      ]);
      
      return { isLiked, count };
    },
    enabled: options?.enabled !== undefined ? options.enabled : !!articleId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to toggle like with optimistic updates
 */
export function useToggleLike(articleId: string | undefined, userId: string | undefined) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      if (!articleId) throw new Error('No article ID');
      await likeArticle(articleId, userId);
    },
    onMutate: async () => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ['article-like-status', articleId, userId] });
      
      // Snapshot previous value
      const previousStatus = queryClient.getQueryData(['article-like-status', articleId, userId]) as { isLiked: boolean; count: number } | undefined;
      
      // Optimistically update
      if (previousStatus) {
        queryClient.setQueryData(['article-like-status', articleId, userId], {
          isLiked: !previousStatus.isLiked,
          count: previousStatus.isLiked ? previousStatus.count - 1 : previousStatus.count + 1,
        });
      }
      
      return { previousStatus };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousStatus) {
        queryClient.setQueryData(['article-like-status', articleId, userId], context.previousStatus);
      }
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: ['article-like-status', articleId, userId] });
    },
  });
}
