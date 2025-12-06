import { useEffect, useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { NewsCard } from "@/components/NewsCard";
import { getBookmarks, removeBookmark } from "@/lib/localBookmarks";
import { getLocalBookmarks, removeLocalBookmark } from "@/utils/localBookmarks";
import { useArticleLikes } from "@/hooks/useBatchedData";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Batch fetch likes for bookmarked articles
  const articleIds = useMemo(() => bookmarks.map((article: any) => article.id), [bookmarks]);
  const { data: batchedLikes = {} } = useArticleLikes(articleIds);

  useEffect(() => {
    if (user) {
      (async () => {
        const loaded = await getBookmarks(user.id);
        setBookmarks(loaded);
      })();
    } else {
      setBookmarks(getLocalBookmarks());
    }
  }, [user]);

  const handleRemove = async (id: string) => {
    if (user) {
      await removeBookmark(id, user.id);
      const loaded = await getBookmarks(user.id);
      setBookmarks(loaded);
    } else {
      removeLocalBookmark(id);
      setBookmarks(getLocalBookmarks());
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold px-4 py-6">Bookmarked Articles</h1>
        <div className="divide-y divide-border">
          {bookmarks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No bookmarks yet.</div>
          ) : (
            bookmarks.map((article: any) => (
              <div key={article.id} className="relative group">
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
                  batchedBookmark={true}
                  onClick={() => navigate(`/article/${article.id}`)}
                />
                <button
                  className="absolute top-4 right-4 text-xs text-red-500 opacity-0 group-hover:opacity-100 transition"
                  onClick={e => { e.stopPropagation(); handleRemove(article.id); }}
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Bookmarks;
