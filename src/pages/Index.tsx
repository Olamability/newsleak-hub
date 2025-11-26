import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { CategoryNav } from "@/components/CategoryNav";
import { NewsCard } from "@/components/NewsCard";
import { mockNews, NewsArticle } from "@/data/mockNews";
import { loadArticles, loadFeeds, saveArticles } from "@/lib/feedStorage";
import { fetchAllFeeds } from "@/lib/rssParser";
import { Button } from "@/components/ui/button";
import { RefreshCw, Settings, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  useEffect(() => {
    loadStoredArticles();
  }, []);

  useEffect(() => {
    if (!autoRefreshEnabled) return;

    // Auto-refresh every 15 minutes
    const interval = setInterval(() => {
      refreshFeeds(true);
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [autoRefreshEnabled]);

  const loadStoredArticles = () => {
    const stored = loadArticles();
    if (stored.length > 0) {
      setNews(stored);
    } else {
      // Use mock data as fallback
      setNews(mockNews);
    }
  };

  const refreshFeeds = async (silent = false) => {
    const feeds = loadFeeds();
    if (feeds.length === 0) {
      if (!silent) {
        toast({
          title: "No feeds configured",
          description: "Add RSS feeds in the admin panel to get started"
        });
      }
      return;
    }

    setIsRefreshing(true);
    try {
      const articles = await fetchAllFeeds(feeds);
      if (articles.length > 0) {
        saveArticles(articles);
        setNews(articles);
        if (!silent) {
          toast({
            title: "Success",
            description: `Loaded ${articles.length} articles`
          });
        }
      }
    } catch (error) {
      if (!silent) {
        toast({
          title: "Error",
          description: "Failed to refresh feeds",
          variant: "destructive"
        });
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CategoryNav />
      
      <main className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refreshFeeds()}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <span className="text-xs text-muted-foreground">
              {news.length} articles
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(isAuthenticated ? "/admin" : "/login")}
          >
            {isAuthenticated ? (
              <>
                <Settings className="h-4 w-4 mr-2" />
                Manage Feeds
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Admin Login
              </>
            )}
          </Button>
        </div>

        <div className="divide-y divide-border">
          {news.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No articles yet</p>
              <Button onClick={() => navigate(isAuthenticated ? "/admin" : "/login")}>
                {isAuthenticated ? (
                  <>
                    <Settings className="h-4 w-4 mr-2" />
                    Add RSS Feeds
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Admin Login
                  </>
                )}
              </Button>
            </div>
          ) : (
            news.map((article) => (
              <NewsCard
                key={article.id}
                source={article.source}
                time={article.time}
                title={article.title}
                image={article.image}
                likes={article.likes}
                comments={article.comments}
                onClick={() => navigate("/article/1")}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
