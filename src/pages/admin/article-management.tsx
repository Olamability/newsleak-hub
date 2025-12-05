import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getAdminSession } from '@/lib/adminAuth';
import { supabase } from '@/lib/supabaseClient';
import { 
  ArrowLeft, 
  Search, 
  FileText, 
  Eye, 
  EyeOff,
  Edit,
  Trash2,
  MoreVertical,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface Article {
  id: string;
  title: string;
  source: string;
  category: string;
  image?: string;
  published: string;
  is_published: boolean;
  views?: number;
  likes?: number;
}

export default function AdminArticleManagement() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
  });

  useEffect(() => {
    const session = getAdminSession();
    if (!session) {
      navigate('/admin/login');
      return;
    }
    
    loadArticles();
  }, [navigate]);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .order('published', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error loading articles:', error);
        setArticles(getMockArticles());
      } else {
        setArticles(data || []);
      }
      
      calculateStats(data || getMockArticles());
    } catch (error) {
      console.error('Error:', error);
      setArticles(getMockArticles());
      calculateStats(getMockArticles());
    } finally {
      setLoading(false);
    }
  };

  const getMockArticles = (): Article[] => [
    {
      id: '1',
      title: 'Breaking: Major Technology Breakthrough Announced',
      source: 'Tech News',
      category: 'Technology',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475',
      published: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      is_published: true,
      views: 1520,
      likes: 45,
    },
    {
      id: '2',
      title: 'Sports Update: Championship Finals Results',
      source: 'Sports Daily',
      category: 'Sports',
      published: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      is_published: true,
      views: 890,
      likes: 32,
    },
    {
      id: '3',
      title: 'Draft: Economic Policy Changes Expected',
      source: 'Business Wire',
      category: 'Business',
      published: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      is_published: false,
      views: 0,
      likes: 0,
    },
  ];

  const calculateStats = (articlesData: Article[]) => {
    setStats({
      total: articlesData.length,
      published: articlesData.filter(a => a.is_published).length,
      draft: articlesData.filter(a => !a.is_published).length,
    });
  };

  const handleTogglePublish = async (articleId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('news_articles')
        .update({ is_published: !currentStatus })
        .eq('id', articleId);

      if (error) throw error;

      setArticles(prev =>
        prev.map(a => a.id === articleId ? { ...a, is_published: !currentStatus } : a)
      );

      toast({
        title: 'Success',
        description: `Article ${!currentStatus ? 'published' : 'unpublished'} successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update article status',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      const { error } = await supabase
        .from('news_articles')
        .delete()
        .eq('id', articleId);

      if (error) throw error;

      setArticles(prev => prev.filter(a => a.id !== articleId));

      toast({
        title: 'Success',
        description: 'Article deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete article',
        variant: 'destructive',
      });
    }
  };

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center gap-4 px-4 max-w-7xl mx-auto">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/analytics')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-xl font-bold">Article Management</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <Eye className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.published}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Drafts</CardTitle>
              <EyeOff className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.draft}</div>
            </CardContent>
          </Card>
        </div>

        {/* Articles Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Articles</CardTitle>
                <CardDescription>
                  Manage and moderate published articles
                </CardDescription>
              </div>
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-16 w-24 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Article</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Stats</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredArticles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No articles found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredArticles.map((article) => (
                      <TableRow key={article.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {article.image && (
                              <img
                                src={article.image}
                                alt=""
                                className="h-12 w-16 rounded object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            )}
                            <div className="max-w-md">
                              <div className="font-medium line-clamp-2">{article.title}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {article.source}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{article.category}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(article.published), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          <Badge variant={article.is_published ? 'default' : 'secondary'}>
                            {article.is_published ? 'Published' : 'Draft'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {article.views || 0} views · {article.likes || 0} likes
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => navigate(`/article/${article.id}`)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Article
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Article
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleTogglePublish(article.id, article.is_published)}
                              >
                                {article.is_published ? (
                                  <>
                                    <EyeOff className="h-4 w-4 mr-2" />
                                    Unpublish
                                  </>
                                ) : (
                                  <>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Publish
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteArticle(article.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
