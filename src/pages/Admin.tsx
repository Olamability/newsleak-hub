import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, RefreshCw } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { loadFeeds, addFeed, updateFeed, deleteFeed } from "@/lib/feedStorage";
import { loadNews } from "@/lib/newsStorage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Header } from "@/components/Header";
import { RSSFeed, fetchAllFeeds } from "@/lib/rssParser";
import { useToast } from "@/hooks/use-toast";
import { isAdmin } from "@/lib/isAdmin";

const categories = [
  "For you",
  "Football",
  "Entertainment",
  "Politics",
  "Sports",
  "Technology",
  "Business",
  "Lifestyle",
  "Fashion&Beauty",
];

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast().toast;
  const [feeds, setFeeds] = useState<RSSFeed[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [adminChecked, setAdminChecked] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [newFeed, setNewFeed] = useState({
    name: "",
    url: "",
    category: "For you",
  });
  const [editingFeedId, setEditingFeedId] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    name: "",
    url: "",
    category: "For you",
  });

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    (async () => {
      try {
        const admin = await isAdmin(user.id);
        setIsAdminUser(admin);
        setAdminChecked(true);
        if (admin) {
          const loadedFeeds = await loadFeeds();
          setFeeds(loadedFeeds);
          const loadedArticles = await loadNews();
          setArticles(loadedArticles);
        }
      } catch (e: any) {
        setError(e.message || "Failed to load admin data");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const handleAddFeed = async () => {
    if (!newFeed.name || !newFeed.url) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    try {
      await addFeed({
        name: newFeed.name,
        url: newFeed.url,
        category: newFeed.category,
        enabled: true,
      });
      const loaded = await loadFeeds();
      setFeeds(loaded);
      setNewFeed({ name: "", url: "", category: "For you" });
      toast({
        title: "Success",
        description: "RSS feed added successfully",
      });
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Failed to add feed",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFeed = async (id: string) => {
    try {
      await deleteFeed(id);
      const loaded = await loadFeeds();
      setFeeds(loaded);
      toast({
        title: "Deleted",
        description: "RSS feed removed",
      });
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Failed to delete feed",
        variant: "destructive",
      });
    }
  };

  const handleToggleFeed = async (id: string, enabled: boolean) => {
    try {
      await updateFeed(id, { enabled });
      const loaded = await loadFeeds();
      setFeeds(loaded);
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Failed to update feed",
        variant: "destructive",
      });
    }
  };

  /** FIXED VERSION — NO AWAIT OUTSIDE ASYNC FUNCTION */
  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    try {
      const articles = await fetchAllFeeds(feeds);

      if (user) {
        // dynamic import MUST be inside async
        const newsModule = await import("@/lib/newsStorage");
        const addNews = newsModule.addNews;

        await Promise.all(
          articles.map((article) =>
            addNews(
              {
                id: article.id,
                title: article.title,
                link: article.link || article.id || "",
                image: article.image,
                source: article.source,
                category: article.category,
                published: article.pubDate || new Date().toISOString(),
                favicon: article.favicon || "",
              },
              user.id
            ).catch(() => {})
          )
        );
      }

      setFeeds(
        feeds.map((f) => ({
          ...f,
          lastFetched: new Date().toISOString(),
        }))
      );

      toast({
        title: "Success",
        description: `Fetched and saved ${articles.length} articles from ${feeds.filter(
          (f) => f.enabled
        ).length} feeds`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh feeds",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!user) return <div className="p-8">You must be logged in as admin.</div>;
  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!adminChecked) return <div className="p-8">Checking admin access...</div>;
  if (!isAdminUser) return <div className="p-8 text-red-500">Access denied. Admins only.</div>;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to feed
        </Button>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">RSS Feed Management</h1>
            <Button onClick={handleRefreshAll} disabled={isRefreshing || feeds.length === 0}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh All
            </Button>
          </div>

          <Card className="p-4 mb-6">
            <h2 className="text-lg font-semibold mb-4">Add New RSS Feed</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Feed Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., BBC News"
                  value={newFeed.name}
                  onChange={(e) => setNewFeed({ ...newFeed, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="url">RSS Feed URL</Label>
                <Input
                  id="url"
                  placeholder="https://example.com/feed.rss"
                  value={newFeed.url}
                  onChange={(e) => setNewFeed({ ...newFeed, url: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={newFeed.category}
                  onChange={(e) => setNewFeed({ ...newFeed, category: e.target.value })}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <Button onClick={handleAddFeed}>
                <Plus className="h-4 w-4 mr-2" />
                Add Feed
              </Button>
            </div>
          </Card>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Active Feeds ({feeds.length})</h2>

            {feeds.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No feeds added yet. Add your first RSS feed above.
              </p>
            ) : (
              feeds.map((feed) => {
                const isEditing = editingFeedId === feed.id;
                return (
                  <Card key={feed.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        {isEditing ? (
                          <form
                            className="flex flex-col gap-2 mb-2"
                            onSubmit={async (e) => {
                              e.preventDefault();
                              try {
                                await updateFeed(feed.id, editData);
                                const loaded = await loadFeeds();
                                setFeeds(loaded);
                                setEditingFeedId(null);
                                toast({ title: "Feed updated" });
                              } catch (err: any) {
                                toast({
                                  title: "Error",
                                  description: err.message || "Failed to update feed",
                                  variant: "destructive",
                                });
                              }
                            }}
                          >
                            <input
                              className="border rounded px-2 py-1 text-sm"
                              value={editData.name}
                              onChange={(e) =>
                                setEditData({ ...editData, name: e.target.value })
                              }
                              placeholder="Feed name"
                            />
                            <input
                              className="border rounded px-2 py-1 text-sm"
                              value={editData.url}
                              onChange={(e) =>
                                setEditData({ ...editData, url: e.target.value })
                              }
                              placeholder="Feed URL"
                            />
                            <select
                              className="border rounded px-2 py-1 text-sm"
                              value={editData.category}
                              onChange={(e) =>
                                setEditData({ ...editData, category: e.target.value })
                              }
                            >
                              {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                  {cat}
                                </option>
                              ))}
                            </select>

                            <div className="flex gap-2 mt-1">
                              <Button type="submit" size="sm">
                                Save
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingFeedId(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </form>
                        ) : (
                          <>
                            <h3 className="font-medium flex items-center gap-2">
                              {feed.name}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingFeedId(feed.id);
                                  setEditData({
                                    name: feed.name,
                                    url: feed.url,
                                    category: feed.category,
                                  });
                                }}
                              >
                                Edit
                              </Button>
                            </h3>

                            <p className="text-sm text-muted-foreground truncate">
                              {feed.url}
                            </p>

                            <div className="flex gap-2 mt-1 flex-wrap">
                              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                {feed.category}
                              </span>

                              {feed.lastFetched && (
                                <span className="text-xs text-muted-foreground">
                                  Last fetched:{" "}
                                  {new Date(feed.lastFetched).toLocaleString()}
                                </span>
                              )}
                            </div>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <Switch
                          checked={feed.enabled}
                          onCheckedChange={(checked) =>
                            handleToggleFeed(feed.id, checked)
                          }
                        />

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteFeed(feed.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* Articles */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-2">News Articles</h2>
          <ul>
            {articles.map((article) => (
              <li key={article.id} className="mb-2 border-b pb-2">
                <div className="font-medium">{article.title}</div>
                <div className="text-xs text-muted-foreground">
                  {article.source} | {article.category}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
