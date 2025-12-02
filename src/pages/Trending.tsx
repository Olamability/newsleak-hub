import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { Header } from "@/components/Header";
import { CategoryNav } from "@/components/CategoryNav";
import { NewsCard } from "@/components/NewsCard";
import { useEnrichedNews } from "@/hooks/useNews";
import { useArticleLikes, useBookmarks } from "@/hooks/useBatchedData";
import { useAuth } from "@/components/AuthProvider";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from "lucide-react";

const Trending = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: allNews = [], isLoading: loading } = useEnrichedNews();

  // For now, we'll show the most recent articles as "trending"
  // In production, this would use view counts, likes, etc.
  const trendingNews = allNews.slice(0, 20);
  
  // Batch fetch likes and bookmarks for trending articles
  const articleIds = useMemo(() => trendingNews.map(article => article.id), [trendingNews]);
  const { data: batchedLikes = {} } = useArticleLikes(articleIds);
  const { data: batchedBookmarks = {} } = useBookmarks(articleIds, user?.id);

  return (
    <div className="min-h-screen bg-background">
      <Header siteName="Newsleak" />
      <main className="max-w-4xl mx-auto px-2 sm:px-4">
        <div className="py-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Trending News</h1>
          </div>
          <p className="text-muted-foreground mb-6">
            The most popular stories right now
          </p>
        </div>

        <div className="divide-y divide-border">
          {loading ? (
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
          ) : trendingNews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No trending articles at the moment</p>
            </div>
          ) : (
            trendingNews.map((article, index) => (
              <div key={article.id} className="relative">
                <div className="absolute left-2 top-4 z-10 bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
                <div className="pl-8">
                  <NewsCard
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
                    batchedLikes={batchedLikes[article.id]}
                    batchedBookmark={batchedBookmarks[article.id]}
                    onClick={() => navigate(`/article/${article.id}`)}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Trending;
