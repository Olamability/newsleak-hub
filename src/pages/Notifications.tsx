import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/AuthProvider";
import { Bell, BellOff, Newspaper, TrendingUp, Bookmark, Settings, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  article_id?: string;
  image_url?: string;
  is_read: boolean;
  created_at: string;
}

const Notifications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const userId = user?.id || localStorage.getItem('userId') || `anon_${crypto.randomUUID()}`;
      localStorage.setItem('userId', userId);

      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error loading notifications:', error);
        // Use mock data if database fails
        setNotifications(getMockNotifications());
      } else {
        setNotifications(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
      setNotifications(getMockNotifications());
    } finally {
      setLoading(false);
    }
  };

  const getMockNotifications = (): Notification[] => [
    {
      id: '1',
      title: 'Breaking News Alert',
      body: 'Major tech announcement: New AI breakthrough changes everything',
      type: 'breaking_news',
      article_id: '123',
      image_url: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c',
      is_read: false,
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    },
    {
      id: '2',
      title: 'Trending in Technology',
      body: 'The future of programming: What developers need to know',
      type: 'trending',
      article_id: '124',
      image_url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6',
      is_read: false,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    },
    {
      id: '3',
      title: 'New Article in Your Interests',
      body: 'Politics: Understanding the latest policy changes',
      type: 'personalized',
      article_id: '125',
      is_read: true,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    },
    {
      id: '4',
      title: 'Reminder',
      body: 'You have 3 saved articles waiting to be read',
      type: 'reminder',
      is_read: true,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    },
  ];

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('user_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const userId = user?.id || localStorage.getItem('userId');
      await supabase
        .from('user_notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    
    if (notification.article_id) {
      navigate(`/article/${notification.article_id}`);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'breaking_news':
        return <Bell className="h-5 w-5 text-red-500" />;
      case 'trending':
        return <TrendingUp className="h-5 w-5 text-orange-500" />;
      case 'personalized':
        return <Newspaper className="h-5 w-5 text-blue-500" />;
      case 'reminder':
        return <Bookmark className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-primary" />;
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !n.is_read;
    return n.type === activeTab;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-background">
      <Header siteName="Newsleak" />
      
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Bell className="h-8 w-8 text-primary" />
                Notifications
              </h1>
              {unreadCount > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            {unreadCount > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={markAllAsRead}
              >
                Mark all as read
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="all" className="relative">
              All
              {unreadCount > 0 && (
                <Badge className="ml-2 h-5 min-w-5 px-1.5 rounded-full bg-primary text-xs">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
            <TabsTrigger value="breaking_news">Breaking</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="personalized">For You</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-3">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredNotifications.length === 0 ? (
              // Empty state
              <div className="text-center py-12">
                <BellOff className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No notifications</h3>
                <p className="text-sm text-muted-foreground">
                  {activeTab === "unread" 
                    ? "You're all caught up! No unread notifications."
                    : "Check back later for updates and breaking news."}
                </p>
              </div>
            ) : (
              // Notifications list
              filteredNotifications.map((notification) => (
                <Card 
                  key={notification.id}
                  className={`overflow-hidden cursor-pointer transition-colors hover:bg-accent ${
                    !notification.is_read ? 'border-primary/50 bg-primary/5' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Icon or Image */}
                      <div className="shrink-0">
                        {notification.image_url ? (
                          <img 
                            src={notification.image_url} 
                            alt="" 
                            className="h-16 w-16 rounded-lg object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                            {getNotificationIcon(notification.type)}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className={`font-medium line-clamp-1 ${
                            !notification.is_read ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {notification.title}
                          </h3>
                          {!notification.is_read && (
                            <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {notification.body}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </span>
                          {notification.type && (
                            <>
                              <span>•</span>
                              <span className="capitalize">{notification.type.replace('_', ' ')}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Settings hint */}
        {!loading && notifications.length > 0 && (
          <div className="mt-8 p-4 bg-muted rounded-lg">
            <div className="flex items-start gap-3">
              <Settings className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">Manage notification preferences</p>
                <p className="text-muted-foreground">
                  Customize which notifications you receive in your{' '}
                  <Button 
                    variant="link" 
                    className="h-auto p-0 text-sm"
                    onClick={() => navigate('/settings')}
                  >
                    settings
                  </Button>
                  .
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Notifications;
