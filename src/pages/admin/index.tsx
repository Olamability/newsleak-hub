import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { fetchFeeds } from '@/lib/rssFetcher';
import { loadFeeds, deleteFeed } from '@/lib/feedStorage';
import { loadNews } from '@/lib/newsStorage';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [feeds, setFeeds] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const feedsData = await loadFeeds();
      const articlesData = await loadNews();
      setFeeds(feedsData || []);
      setArticles(articlesData || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchFeeds = async () => {
    setFetching(true);
    try {
      await fetchFeeds();
      await loadData();
      alert('Feeds fetched successfully!');
    } catch (e: any) {
      alert(e.message || 'Failed to fetch feeds');
    } finally {
      setFetching(false);
    }
  };

  const handleDeleteFeed = async (id: string) => {
    if (confirm('Are you sure you want to delete this feed?')) {
      try {
        await deleteFeed(id);
        await loadData();
      } catch (e: any) {
        alert(e.message || 'Failed to delete feed');
      }
    }
  };

  if (!user) {
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
        <div className="flex gap-2">
          <button onClick={() => navigate('/admin/analytics')} className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90">
            View Analytics
          </button>
          <button onClick={() => navigate('/admin/add-feed')} className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90">
            Add Feed
          </button>
          <button onClick={signOut} className="text-red-500">Sign Out</button>
        </div>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <button
        onClick={handleFetchFeeds}
        className="mb-6 bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
        disabled={fetching}
      >
        {fetching ? 'Fetching Feeds...' : 'Fetch RSS Now'}
      </button>

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">RSS Feeds ({feeds.length})</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">URL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {feeds.map((feed) => (
                <tr key={feed.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{feed.source || feed.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{feed.url}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{feed.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => handleDeleteFeed(feed.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Recent Articles ({articles.length})</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Published</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {articles.slice(0, 10).map((article) => (
                <tr key={article.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{article.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{article.source}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{article.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {article.published ? new Date(article.published).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
