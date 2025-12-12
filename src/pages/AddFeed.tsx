import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { addFeed } from "@/lib/feedStorage";
import { Button } from "@/components/ui/button";

export default function AddFeed() {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !url.trim() || !category.trim()) {
      setError("All fields are required.");
      return;
    }
    if (!user) {
      setError("You must be logged in to add a feed.");
      return;
    }
    setLoading(true);
    try {
      await addFeed({ name, url, category, enabled: true });
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Failed to add feed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-4">
        <h2 className="text-2xl font-bold mb-4">Add RSS Feed</h2>
        <input
          type="text"
          placeholder="Feed Name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full px-3 py-2 border rounded"
          required
        />
        <input
          type="url"
          placeholder="Feed URL (https://...)"
          value={url}
          onChange={e => setUrl(e.target.value)}
          className="w-full px-3 py-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Category (e.g. News, Sports)"
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="w-full px-3 py-2 border rounded"
          required
        />
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Adding..." : "Add Feed"}
        </Button>
      </form>
    </div>
  );
}
