import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { loadFeeds } from '@/lib/feedStorage';
import { loadNews } from '@/lib/newsStorage';
import { useEffect, useState } from 'react';

export default function AdminAnalytics() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState({ feeds: 0, articles: 0, categories: 0 });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const feeds = await loadFeeds();
    const articles = await loadNews();
    const categories = new Set(articles.map(a => a.category)).size;
    setStats({ feeds: feeds.length, articles: articles.length, categories });
  };

  if (!user) {
    navigate('/admin/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <div className="flex gap-2">
          <button onClick={() => navigate('/admin')} className="bg-primary text-white px-4 py-2 rounded">
            Back to Dashboard
          </button>
          <button onClick={signOut} className="text-red-500">Sign Out</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Total Feeds</h3>
          <p className="text-3xl font-bold text-primary mt-2">{stats.feeds}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Total Articles</h3>
          <p className="text-3xl font-bold text-primary mt-2">{stats.articles}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Categories</h3>
          <p className="text-3xl font-bold text-primary mt-2">{stats.categories}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Local Storage Stats</h2>
        <p className="text-gray-600">All data is stored locally in your browser's localStorage.</p>
        <p className="text-gray-600 mt-2">This is a fully frontend application with no backend database.</p>
      </div>
    </div>
  );
}
