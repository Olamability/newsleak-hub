import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { loadNews, NewsArticle } from '@/lib/newsStorage';

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
        const found = allNews.find((article) => article.id === id);
        if (found) return found;
      }
      
      // Fallback to fetching single article from Supabase
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as NewsArticle;
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
    queryFn: async () => {
      const { data, error } = await supabase.from('rss_feeds').select('*');
      if (error) throw error;
      return data || [];
    },
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
    const feed = feeds.find((f: any) => f.id === (article as any).feed_id);
    
    // Compute time string robustly
    const time = article.published ? getTimeAgo(article.published) : '';

    return {
      ...article,
      source: (feed && feed.source) || article.source || "Unknown Source",
      favicon: (feed && feed.favicon) || article.favicon || '',
      category: article.category || (feed && feed.category) || "General",
      time,
      likes: 0,
      comments: 0,
      content: article.summary || '',
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
