import { useState } from 'react';
import { fetchFeeds } from '@/lib/rssFetcher';
import { addFeed } from '@/lib/feedStorage';

const categories = [
  'For you', 'Football', 'Entertainment', 'Politics', 'Sports', 'Technology', 'Business', 'Lifestyle', 'Fashion&Beauty'
];

export default function AddFeed() {
  const [url, setUrl] = useState('');
  const [source, setSource] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await addFeed({ 
        name: source, 
        source, 
        url, 
        category,
        is_active: true,
      });
      
      // Automatically fetch news after adding feed
      try {
        const result = await fetchFeeds();
        if (result && result.success) {
          setSuccess('Feed added and news fetched!');
        } else {
          setSuccess('Feed added successfully!');
        }
        setUrl('');
        setSource('');
        setCategory(categories[0]);
      } catch (edgeErr: any) {
        setError(edgeErr.message || 'Failed to fetch news from feeds');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to add feed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold mb-4">Add RSS Feed</h1>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}
        <input
          type="text"
          placeholder="Feed URL"
          value={url}
          onChange={e => setUrl(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-2"
          required
        />
        <input
          type="text"
          placeholder="Source Name"
          value={source}
          onChange={e => setSource(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-2"
          required
        />
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-2"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <button
          type="submit"
          className="w-full bg-primary text-white py-2 rounded hover:bg-primary/90"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Feed'}
        </button>
      </form>
    </div>
  );
}
