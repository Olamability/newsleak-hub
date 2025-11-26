import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { CategoryNav } from "@/components/CategoryNav";
import { NewsCard } from "@/components/NewsCard";
import { NewsArticle } from "@/data/mockNews";
import { loadArticles, loadFeeds, saveArticles } from "@/lib/feedStorage";
import { fetchAllFeeds } from "@/lib/rssParser";
import { Button } from "@/components/ui/button";
import { RefreshCw, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";


const categories = [
  "For you",
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
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>(categories[0]);

  useEffect(() => {
    loadStoredArticles();
  }, []);

  useEffect(() => {
    if (!autoRefreshEnabled) return;

    // Auto-refresh every 10 minutes
    const interval = setInterval(() => {
      refreshFeeds(true);
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [autoRefreshEnabled]);

  const loadStoredArticles = () => {
    const stored = loadArticles();
    setNews(stored);
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

  // Filter news by active category
  const filteredNews = activeCategory === "For you"
    ? news
    : news.filter(article => article.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CategoryNav activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
      <main className="max-w-4xl mx-auto">
        <div className="px-4 py-3 border-b"></div>
        <div className="divide-y divide-border">
          {filteredNews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No articles yet</p>
            </div>
          ) : (
            filteredNews.map((article) => (
              <NewsCard
                key={article.id}
                source={article.source}
                time={article.time}
                title={article.title}
                image={article.image}
                likes={article.likes}
                comments={article.comments}
                favicon={article.favicon}
                content={article.content}
                link={article.link}
                onClick={() => navigate(`/article/${article.id}`)}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
