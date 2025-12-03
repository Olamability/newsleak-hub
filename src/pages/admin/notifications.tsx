import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { getAdminSession } from '@/lib/adminAuth';
import { sendPushNotification } from '@/lib/pushNotifications';
import { supabase } from '@/lib/supabaseClient';
import { ArrowLeft, Send, Bell, Clock, Users, Image as ImageIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Article {
  id: string;
  title: string;
  image: string;
  source: string;
}

export default function AdminNotifications() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    articleId: '',
    imageUrl: '',
    notificationType: 'breaking_news',
    targetAudience: 'all',
    categoryFilter: '',
    scheduleTime: '',
  });

  useEffect(() => {
    const session = getAdminSession();
    if (!session) {
      navigate('/admin/login');
      return;
    }
    
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      // Load recent articles
      const { data: articlesData } = await supabase
        .from('news_articles')
        .select('id, title, image, source')
        .eq('is_published', true)
        .order('published', { ascending: false })
        .limit(50);
      
      setArticles(articlesData || []);

      // Load categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('name')
        .eq('is_active', true)
        .order('display_order');
      
      setCategories((categoriesData || []).map(c => c.name));

      // Load recent notifications
      const { data: notificationsData } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      setRecentNotifications(notificationsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleArticleSelect = (articleId: string) => {
    const article = articles.find(a => a.id === articleId);
    if (article) {
      setFormData(prev => ({
        ...prev,
        articleId,
        title: formData.title || article.title,
        imageUrl: formData.imageUrl || article.image,
      }));
    }
  };

  const handleSendNotification = async () => {
    if (!formData.title || !formData.body) {
      toast({
        title: 'Validation Error',
        description: 'Title and message are required',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const params: any = {
        title: formData.title,
        body: formData.body,
        imageUrl: formData.imageUrl,
        articleId: formData.articleId,
      };

      // Apply filters based on target audience
      if (formData.targetAudience === 'category' && formData.categoryFilter) {
        params.categoryFilter = formData.categoryFilter;
      }

      const result = await sendPushNotification(params);

      if (result.success) {
        toast({
          title: 'Success',
          description: `Notification sent to ${result.sentTo} users`,
        });
        
        // Reset form
        setFormData({
          title: '',
          body: '',
          articleId: '',
          imageUrl: '',
          notificationType: 'breaking_news',
          targetAudience: 'all',
          categoryFilter: '',
          scheduleTime: '',
        });
        
        // Reload notifications
        loadData();
      } else {
        throw new Error(result.error || 'Failed to send notification');
      }
    } catch (error: any) {
      console.error('Error sending notification:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send notification',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center gap-4 px-4 max-w-7xl mx-auto">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/analytics')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-xl font-bold">Send Push Notification</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Notification Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Create Notification
              </CardTitle>
              <CardDescription>
                Send push notifications to your users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Notification Title *</Label>
                <Input
                  id="title"
                  placeholder="Breaking News: ..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  maxLength={65}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.title.length}/65 characters
                </p>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="body">Message *</Label>
                <Textarea
                  id="body"
                  placeholder="Enter notification message..."
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  rows={3}
                  maxLength={240}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.body.length}/240 characters
                </p>
              </div>

              {/* Article Selection */}
              <div className="space-y-2">
                <Label htmlFor="article">Link to Article (Optional)</Label>
                <Select onValueChange={handleArticleSelect} value={formData.articleId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an article" />
                  </SelectTrigger>
                  <SelectContent>
                    {articles.map(article => (
                      <SelectItem key={article.id} value={article.id}>
                        {article.title.substring(0, 60)}...
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Image URL */}
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                <div className="flex gap-2">
                  <Input
                    id="imageUrl"
                    placeholder="https://..."
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  />
                  {formData.imageUrl && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => window.open(formData.imageUrl, '_blank')}
                    >
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Notification Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Notification Type</Label>
                <Select 
                  onValueChange={(value) => setFormData({ ...formData, notificationType: value })}
                  value={formData.notificationType}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breaking_news">Breaking News</SelectItem>
                    <SelectItem value="personalized">Personalized</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Target Audience */}
              <div className="space-y-2">
                <Label htmlFor="audience">Target Audience</Label>
                <Select 
                  onValueChange={(value) => setFormData({ ...formData, targetAudience: value })}
                  value={formData.targetAudience}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="category">By Category Preference</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter (conditional) */}
              {formData.targetAudience === 'category' && (
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    onValueChange={(value) => setFormData({ ...formData, categoryFilter: value })}
                    value={formData.categoryFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Send Button */}
              <Button 
                onClick={handleSendNotification} 
                disabled={loading || !formData.title || !formData.body}
                className="w-full"
                size="lg"
              >
                <Send className="h-4 w-4 mr-2" />
                {loading ? 'Sending...' : 'Send Notification'}
              </Button>
            </CardContent>
          </Card>

          {/* Recent Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Notifications
              </CardTitle>
              <CardDescription>
                Notifications sent in the last 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentNotifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No notifications sent yet
                  </div>
                ) : (
                  recentNotifications.map(notification => (
                    <div 
                      key={notification.id}
                      className="p-3 border rounded-lg space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium line-clamp-1">{notification.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {notification.body}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {notification.sent_count || 0} sent
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(notification.created_at).toLocaleDateString()}
                        </span>
                        {notification.click_count > 0 && (
                          <span>
                            {notification.click_count} clicks
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        {(formData.title || formData.body) && (
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                How the notification will appear on devices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-w-sm mx-auto bg-card border rounded-lg shadow-lg p-4 space-y-2">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded bg-primary flex items-center justify-center flex-shrink-0">
                    <Bell className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{formData.title || 'Notification Title'}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {formData.body || 'Notification message will appear here...'}
                    </p>
                    {formData.imageUrl && (
                      <img 
                        src={formData.imageUrl} 
                        alt="Preview" 
                        className="mt-2 rounded w-full h-32 object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
