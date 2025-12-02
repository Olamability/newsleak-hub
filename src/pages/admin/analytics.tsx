import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getAdminSession, adminSignOut } from '@/lib/adminAuth';
import { fetchFeeds } from '@/lib/rssFetcher';
import { supabase } from '@/lib/supabaseClient';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart3, 
  Newspaper, 
  TrendingUp, 
  Users, 
  Eye, 
  Heart,
  MessageCircle,
  RefreshCw,
  Settings,
  Plus
} from 'lucide-react';

interface AnalyticsData {
  totalArticles: number;
  totalFeeds: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  recentArticles: any[];
  topArticles: any[];
}

export default function AdminAnalyticsDashboard() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalArticles: 0,
    totalFeeds: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    recentArticles: [],
    topArticles: [],
  });
  const [feeds, setFeeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    const session = getAdminSession();
    if (!session) {
      navigate('/admin/login');
      return;
    }
    
    loadAnalytics();
  }, [navigate]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Get all feeds
      const { data: feedsData } = await supabase.from('rss_feeds').select('*');
      setFeeds(feedsData || []);

      // Get all articles
      const { data: articlesData } = await supabase
        .from('news_articles')
        .select('*')
        .order('published', { ascending: false });

      // Get views count
      const { count: viewsCount } = await supabase
        .from('article_views')
        .select('*', { count: 'exact', head: true });

      // Get likes count
      const { count: likesCount } = await supabase
        .from('article_likes')
        .select('*', { count: 'exact', head: true });

      // Get comments count
      const { count: commentsCount } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true });

      // Get top articles by views (aggregate in client for simplicity)
      const { data: viewsData } = await supabase
        .from('article_views')
        .select('article_id');

      // Count views per article
      const viewsByArticle = (viewsData || []).reduce((acc: any, view: any) => {
        acc[view.article_id] = (acc[view.article_id] || 0) + 1;
        return acc;
      }, {});

      // Get top 5 articles
      const topArticleIds = Object.entries(viewsByArticle)
        .sort((a: any, b: any) => b[1] - a[1])
        .slice(0, 5)
        .map(([id]) => id);

      const topArticles = (articlesData || [])
        .filter((article: any) => topArticleIds.includes(article.id))
        .map((article: any) => ({
          ...article,
          views: viewsByArticle[article.id] || 0,
        }));

      setAnalytics({
        totalArticles: articlesData?.length || 0,
        totalFeeds: feedsData?.length || 0,
        totalViews: viewsCount || 0,
        totalLikes: likesCount || 0,
        totalComments: commentsCount || 0,
        recentArticles: (articlesData || []).slice(0, 10),
        topArticles,
      });
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchFeeds = async () => {
    setFetching(true);
    try {
      await fetchFeeds();
      await loadAnalytics();
    } catch (error) {
      alert('Failed to fetch feeds');
    } finally {
      setFetching(false);
    }
  };

  const handleSignOut = async () => {
    await adminSignOut();
    navigate('/admin/login');
  };

  const session = getAdminSession();
  if (!session) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-4 max-w-7xl mx-auto">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/admin/add-feed')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Feed
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
              <Newspaper className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-20" /> : analytics.totalArticles}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Feeds</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-20" /> : analytics.totalFeeds}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-20" /> : analytics.totalViews}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-20" /> : analytics.totalLikes}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-20" /> : analytics.totalComments}</div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your news feeds and content</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button onClick={handleFetchFeeds} disabled={fetching}>
              <RefreshCw className={`h-4 w-4 mr-2 ${fetching ? 'animate-spin' : ''}`} />
              {fetching ? 'Fetching Feeds...' : 'Refresh Feeds'}
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/add-feed')}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Feed
            </Button>
          </CardContent>
        </Card>

        {/* Tabs for detailed views */}
        <Tabs defaultValue="feeds" className="w-full">
          <TabsList>
            <TabsTrigger value="feeds">RSS Feeds</TabsTrigger>
            <TabsTrigger value="recent">Recent Articles</TabsTrigger>
            <TabsTrigger value="trending">Top Performing</TabsTrigger>
          </TabsList>

          <TabsContent value="feeds" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>RSS Feeds ({feeds.length})</CardTitle>
                <CardDescription>Manage your news sources</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {feeds.map((feed) => (
                      <div key={feed.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{feed.source}</div>
                          <div className="text-sm text-muted-foreground">{feed.category}</div>
                        </div>
                        <div className="text-xs text-muted-foreground">{feed.url}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Articles</CardTitle>
                <CardDescription>Latest published articles</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {analytics.recentArticles.map((article) => (
                      <div key={article.id} className="p-3 border rounded-lg">
                        <div className="font-medium line-clamp-1">{article.title}</div>
                        <div className="text-sm text-muted-foreground flex justify-between mt-1">
                          <span>{article.source}</span>
                          <span>{new Date(article.published).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Articles</CardTitle>
                <CardDescription>Most viewed articles</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
                  </div>
                ) : analytics.topArticles.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No analytics data yet
                  </div>
                ) : (
                  <div className="space-y-2">
                    {analytics.topArticles.map((article, index) => (
                      <div key={article.id} className="p-3 border rounded-lg flex items-start gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium line-clamp-1">{article.title}</div>
                          <div className="text-sm text-muted-foreground flex gap-4 mt-1">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {article.views} views
                            </span>
                            <span>{article.source}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
