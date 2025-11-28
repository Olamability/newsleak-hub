import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { getAdminSession, adminSignOut } from '@/lib/adminAuth';
import { fetchFeeds } from '@/lib/rssFetcher';
import { supabase } from '@/lib/supabaseClient';

export default function AdminDashboard() {
  const [feeds, setFeeds] = useState<any[]>([]);
  const [editingFeedId, setEditingFeedId] = useState<string | null>(null);
  const [editFeed, setEditFeed] = useState<{ url: string; source: string; category: string }>({ url: '', source: '', category: '' });
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    const session = getAdminSession();
    if (!session) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        setLoading(true);
        const { data: feeds } = await supabase.from('rss_feeds').select('*');
        const { data: articles } = await supabase.from('news_articles').select('*').order('published', { ascending: false });
        setFeeds(feeds || []);
        setArticles(articles || []);
      } catch (e: any) {
        setError(e.message || 'Failed to load admin data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleFetchFeeds = async () => {
    setFetching(true);
    try {
      await fetchFeeds();
      window.location.reload();
    } catch (e: any) {
      alert(e.message || 'Failed to fetch feeds');
    } finally {
      setFetching(false);
    }
  };

  const session = getAdminSession();
  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-8">
        <h1 className="text-2xl font-bold mb-8">Admin Area</h1>
        <div className="flex gap-4">
          <a href="/admin/login" className="bg-primary text-white px-6 py-3 rounded hover:bg-primary/90 font-semibold">Login</a>
          <a href="/admin/signup" className="bg-secondary text-primary px-6 py-3 rounded border font-semibold">Register</a>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button onClick={adminSignOut} className="text-red-500">Sign Out</button>
      </div>
      <button
        onClick={handleFetchFeeds}
        className="mb-6 bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
        disabled={fetching}
      >
        {fetching ? 'Fetching Feeds...' : 'Fetch RSS Now'}
      </button>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          <h2 className="text-xl font-semibold mb-2">RSS Feeds</h2>
          <ul className="mb-8">
            {feeds.map(feed => (
              <li key={feed.id} className="mb-2 flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                {editingFeedId === feed.id ? (
                  <form
                    className="flex flex-col md:flex-row gap-2 md:gap-2 flex-1"
                    onSubmit={async e => {
                      e.preventDefault();
                      try {
                        const { error } = await supabase.from('rss_feeds').update(editFeed).eq('id', feed.id);
                        if (error) throw error;
                        const { data: feeds } = await supabase.from('rss_feeds').select('*');
                        setFeeds(feeds || []);
                        setEditingFeedId(null);
                      } catch (err: any) {
                        alert(err.message || 'Failed to update feed');
                      }
                    }}
                  >
                    <input
                      className="border rounded px-2 py-1 text-sm w-40"
                      value={editFeed.source}
                      onChange={e => setEditFeed({ ...editFeed, source: e.target.value })}
                      placeholder="Source"
                      required
                    />
                    <input
                      className="border rounded px-2 py-1 text-sm w-64"
                      value={editFeed.url}
                      onChange={e => setEditFeed({ ...editFeed, url: e.target.value })}
                      placeholder="Feed URL"
                      required
                    />
                    <select
                      className="border rounded px-2 py-1 text-sm"
                      value={editFeed.category}
                      onChange={e => setEditFeed({ ...editFeed, category: e.target.value })}
                    >
                      {[ 'For you', 'Football', 'Entertainment', 'Politics', 'Sports', 'Technology', 'Business', 'Lifestyle', 'Fashion&Beauty' ].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <Button type="submit" size="sm">Save</Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => setEditingFeedId(null)}>Cancel</Button>
                  </form>
                ) : (
                  <>
                    <span className="font-medium">{feed.source}</span> - {feed.url} ({feed.category})
                    <Button size="sm" variant="ghost" onClick={() => {
                      setEditingFeedId(feed.id);
                      setEditFeed({ source: feed.source, url: feed.url, category: feed.category });
                    }}>Edit</Button>
                  </>
                )}
              </li>
            ))}
          </ul>
          <h2 className="text-xl font-semibold mb-2">Articles</h2>
          <ul>
            {articles.map(article => (
              <li key={article.id} className="mb-2 border-b pb-2">
                <div className="font-medium">{article.title}</div>
                <div className="text-xs text-muted-foreground">{article.source} | {article.category}</div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
