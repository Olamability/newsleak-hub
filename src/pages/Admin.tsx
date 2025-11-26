import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Header } from "@/components/Header";
import { RSSFeed, fetchAllFeeds } from "@/lib/rssParser";
import { loadFeeds, saveFeeds, addFeed, deleteFeed, updateFeed, saveArticles } from "@/lib/feedStorage";
import { useToast } from "@/hooks/use-toast";

const categories = ["For you", "Football", "Entertainment", "Politics", "Sports", "Technology", "Business", "Lifestyle", "Fashion&Beauty"];

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [feeds, setFeeds] = useState<RSSFeed[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newFeed, setNewFeed] = useState({
    name: '',
    url: '',
    category: 'For you'
  });

  useEffect(() => {
    setFeeds(loadFeeds());
  }, []);

  const handleAddFeed = () => {
    if (!newFeed.name || !newFeed.url) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    addFeed({
      name: newFeed.name,
      url: newFeed.url,
      category: newFeed.category,
      enabled: true
    });

    setFeeds(loadFeeds());
    setNewFeed({ name: '', url: '', category: 'For you' });
    
    toast({
      title: "Success",
      description: "RSS feed added successfully"
    });
  };

  const handleDeleteFeed = (id: string) => {
    deleteFeed(id);
    setFeeds(loadFeeds());
    toast({
      title: "Deleted",
      description: "RSS feed removed"
    });
  };

  const handleToggleFeed = (id: string, enabled: boolean) => {
    updateFeed(id, { enabled });
    setFeeds(loadFeeds());
  };

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    try {
      const articles = await fetchAllFeeds(feeds);
      saveArticles(articles);
      
      const updatedFeeds = feeds.map(f => ({ ...f, lastFetched: new Date().toISOString() }));
      saveFeeds(updatedFeeds);
      setFeeds(updatedFeeds);
      
      toast({
        title: "Success",
        description: `Fetched ${articles.length} articles from ${feeds.filter(f => f.enabled).length} feeds`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh feeds",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to feed
        </Button>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">RSS Feed Management</h1>
            <Button onClick={handleRefreshAll} disabled={isRefreshing || feeds.length === 0}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
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
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
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
              <p className="text-muted-foreground text-sm">No feeds added yet. Add your first RSS feed above.</p>
            ) : (
              feeds.map(feed => (
                <Card key={feed.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{feed.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">{feed.url}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                          {feed.category}
                        </span>
                        {feed.lastFetched && (
                          <span className="text-xs text-muted-foreground">
                            Last fetched: {new Date(feed.lastFetched).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={feed.enabled}
                        onCheckedChange={(checked) => handleToggleFeed(feed.id, checked)}
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
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
