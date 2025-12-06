import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { loadNews, deleteNews } from '@/lib/newsStorage';
import { useEffect, useState } from 'react';

export default function AdminArticleManagement() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [articles, setArticles] = useState<any[]>([]);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    const data = await loadNews();
    setArticles(data);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this article?')) {
      await deleteNews(id);
      await loadArticles();
    }
  };

  if (!user) {
    navigate('/admin/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Article Management</h1>
        <div className="flex gap-2">
          <button onClick={() => navigate('/admin')} className="bg-primary text-white px-4 py-2 rounded">
            Back
          </button>
          <button onClick={signOut} className="text-red-500">Sign Out</button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {articles.map((article) => (
              <tr key={article.id}>
                <td className="px-6 py-4">{article.title}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{article.source}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{article.category}</td>
                <td className="px-6 py-4">
                  <button onClick={() => handleDelete(article.id)} className="text-red-600 hover:text-red-900">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
