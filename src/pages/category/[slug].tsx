import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { loadNews } from '@/lib/newsStorage';
import { NewsCard } from '@/components/NewsCard';

export default function CategoryPage() {
  const { slug } = useParams();
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
  const articles = await loadNews();
  setNews(articles.filter(a => a.category === slug));
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!news.length) return <div className="p-8">No articles in this category.</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Category: {slug}</h1>
      <div className="space-y-4">
        {news.map(article => (
          <NewsCard key={article.id} {...article} />
        ))}
      </div>
    </div>
  );
}
