import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { CategoryNav } from "@/components/CategoryNav";
import { NewsCard } from "@/components/NewsCard";
// import { NewsArticle } from "@/data/mockNews";
import { loadNews } from "@/lib/newsStorage";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/AuthProvider";
import { fetchAllFeeds } from "@/lib/rssParser";

import { Skeleton } from "@/components/ui/skeleton";

import { useToast } from "@/hooks/use-toast";

import { requestNotificationPermission, sendBreakingNewsNotification } from "@/lib/notifications";
import { getFollowedTopics } from "@/lib/followedTopics";


const categories = [
  "Latest",
  "Football",
  "Entertainment",
  "Politics",
  "Sports",
  "Lifestyle",
  "Fashion&Beauty",
  "Technology",
  "Business"
];

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [news, setNews] = useState<any[]>([]);
  // const { user } = useAuth();
  const [visibleCount, setVisibleCount] = useState(10); // Number of articles to show initially
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>(categories[0]);


  // Request notification permission on mount
  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        // Fetch all feeds (site info)
        const { data: feeds } = await supabase.from('rss_feeds').select('*');
        const feedsById = (feeds || []).reduce((acc, feed) => {
          acc[feed.id] = feed;
          return acc;
        }, {});
        // Fetch news articles
        const loaded = await loadNews();
        // Map loaded articles to include required fields for NewsCard
        const mapped = loaded.map(article => {
          const feed = feedsById[article.feed_id];
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
            likes: 0,
            comments: 0,
            content: article.summary || article.content || '',
            image: article.image || '',
          };
        });
        setNews(mapped);
      } catch (e) {
        setNews([]);
      } finally {
        setLoading(false);
      }
    })();

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
    requestNotificationPermission();
  }, []);

  // Remove auto-refresh of user feeds for public news

  const BATCH_SIZE = 10;

  // Removed: loadStoredArticles (localStorage logic)

  // Remove refreshFeeds logic; news is managed by admin only

  // Filter news by active category
  const filteredNews = activeCategory === "For you"
    ? news
    : news.filter(article => article.category === activeCategory);

  // Infinite scroll: show only up to visibleCount
  const visibleNews = filteredNews.slice(0, visibleCount);

  // Intersection Observer for infinite scroll
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && visibleCount < filteredNews.length) {
      setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, filteredNews.length));
    }
  }, [filteredNews.length, visibleCount]);

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: "20px",
      threshold: 1.0
    };
    const observer = new window.IntersectionObserver(handleObserver, option);
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [handleObserver]);

  return (
    <div className="min-h-screen bg-background">
  <Header siteName="Newsleak" />
      <CategoryNav activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
      <main className="max-w-4xl mx-auto px-2 sm:px-4">
        {/* Removed '+ Add RSS Feed' button for public users */}
        <div className="divide-y divide-border">
          {loading || isRefreshing ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4 p-4">
                <Skeleton className="w-24 h-24 rounded-lg shrink-0" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            ))
          ) : filteredNews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No articles yet</p>
            </div>
          ) : (
            <>
              {visibleNews.map((article) => (
                <NewsCard
                  key={article.id}
                  id={article.id}
                  source={article.source}
                  time={article.time}
                  title={article.title}
                  image={article.image}
                  likes={article.likes}
                  comments={article.comments}
                  favicon={article.favicon}
                  content={article.content}
                  link={article.link}
                  article={article}
                  onClick={() => navigate(`/article/${article.id}`)}
                />
              ))}
              {/* Loader for infinite scroll */}
              {visibleCount < filteredNews.length && (
                <div ref={loaderRef} className="flex justify-center py-6" aria-label="Loading more articles">
                  <Skeleton className="w-24 h-24 rounded-lg" />
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
