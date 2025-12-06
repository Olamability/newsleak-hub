import { useQuery } from '@tanstack/react-query';
import { loadNews } from '@/lib/newsStorage';
import { loadFeeds } from '@/lib/feedStorage';

/**
 * Custom hook to fetch all news articles with caching
 * Uses React Query to prevent over-firing requests
 */
export function useNews() {
  return useQuery({
    queryKey: ['news'],
    queryFn: loadNews,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Cache for 10 minutes (formerly cacheTime)
  });
}

/**
 * Custom hook to fetch a single article by ID
 * Optimized to use the cached news list if available
 */
export function useArticle(id: string | undefined) {
  const { data: allNews, isLoading: newsLoading } = useNews();
  
  return useQuery({
    queryKey: ['article', id],
    queryFn: async () => {
      if (!id) return null;
      
      // Try to find in cached news first
      if (allNews) {
        const found = allNews.find((article: any) => article.id === id);
        if (found) return found;
      }
      
      // Fallback to loading from local storage
      const allArticles = await loadNews();
      return allArticles.find((article: any) => article.id === id) || null;
    },
    enabled: !!id, // Only run query if id exists
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Custom hook to fetch RSS feeds with caching
 */
export function useFeeds() {
  return useQuery({
    queryKey: ['feeds'],
    queryFn: loadFeeds,
    staleTime: 10 * 60 * 1000, // Feeds change less frequently
    gcTime: 20 * 60 * 1000,
  });
}

/**
 * Custom hook to get enriched news with feed information
 */
export function useEnrichedNews() {
  const { data: news = [], isLoading: newsLoading, error: newsError } = useNews();
  const { data: feeds = [], isLoading: feedsLoading, error: feedsError } = useFeeds();

  const isLoading = newsLoading || feedsLoading;
  const error = newsError || feedsError;

  const enrichedNews = news.map(article => {
    const feed = feeds.find((f: any) => f.id === article.feed_id);
    
    // Compute time string robustly
    let time = '';
    if (article.published) {
      time = getTimeAgo(article.published);
    } else if (article.pubDate) {
      time = getTimeAgo(article.pubDate);
    } else if (article.time) {
      time = article.time;
    }

    return {
      ...article,
      source: (feed && feed.source) || article.source || "Unknown Source",
      favicon: (feed && feed.favicon) || article.favicon || '',
      category: article.category || (feed && feed.category) || "General",
      time,
      likes: article.likes || 0,
      comments: article.comments || 0,
      content: article.summary || article.content || '',
      image: article.image || '',
    };
  });

  return {
    data: enrichedNews,
    isLoading,
    error,
  };
}

// Helper to get time ago string
function getTimeAgo(published: string) {
  const date = new Date(published);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h`;
  return `${Math.floor(diffHours / 24)}d`;
}
