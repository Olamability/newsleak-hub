import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { User, Mail, Calendar, TrendingUp, Bookmark, Heart, MessageCircle, Settings, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    username: '',
    email: '',
    bio: '',
    avatar_url: '',
  });
  const [stats, setStats] = useState({
    articlesRead: 0,
    bookmarks: 0,
    likes: 0,
    comments: 0,
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadProfile();
    loadStats();
  }, [user, navigate]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (data) {
        setProfile({
          name: data.name || '',
          username: data.username || '',
          email: user?.email || '',
          bio: data.bio || '',
          avatar_url: data.avatar_url || '',
        });
      } else {
        // Set from auth user
        setProfile(prev => ({
          ...prev,
          email: user?.email || '',
          name: user?.user_metadata?.name || '',
          username: user?.user_metadata?.username || '',
        }));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Load user statistics
      const { data: bookmarksData } = await supabase
        .from('bookmarks')
        .select('id', { count: 'exact' })
        .eq('user_id', user?.id);

      const { data: likesData } = await supabase
        .from('article_likes')
        .select('id', { count: 'exact' })
        .eq('user_id', user?.id);

      const { data: commentsData } = await supabase
        .from('comments')
        .select('id', { count: 'exact' })
        .eq('user_id', user?.id);

      setStats({
        articlesRead: 0, // This would require tracking
        bookmarks: bookmarksData?.length || 0,
        likes: likesData?.length || 0,
        comments: commentsData?.length || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user?.id,
          name: profile.name,
          username: profile.username,
          bio: profile.bio,
          avatar_url: profile.avatar_url,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header siteName="Newsleak" />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header siteName="Newsleak" />
      
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="text-2xl">
                  {profile.name ? getInitials(profile.name) : <User className="h-12 w-12" />}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl font-bold mb-1">{profile.name || 'User'}</h1>
                {profile.username && (
                  <p className="text-muted-foreground mb-2">@{profile.username}</p>
                )}
                <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-muted-foreground mb-4">
                  <Mail className="h-4 w-4" />
                  <span>{profile.email}</span>
                </div>
                {profile.bio && (
                  <p className="text-sm mb-4">{profile.bio}</p>
                )}
                
                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <Bookmark className="h-5 w-5 mx-auto mb-1 text-primary" />
                    <div className="font-bold">{stats.bookmarks}</div>
                    <div className="text-xs text-muted-foreground">Bookmarks</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <Heart className="h-5 w-5 mx-auto mb-1 text-red-500" />
                    <div className="font-bold">{stats.likes}</div>
                    <div className="text-xs text-muted-foreground">Likes</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <MessageCircle className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                    <div className="font-bold">{stats.comments}</div>
                    <div className="text-xs text-muted-foreground">Comments</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <TrendingUp className="h-5 w-5 mx-auto mb-1 text-green-500" />
                    <div className="font-bold">{stats.articlesRead}</div>
                    <div className="text-xs text-muted-foreground">Articles Read</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="edit" className="space-y-4">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="edit">Edit Profile</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          {/* Edit Profile Tab */}
          <TabsContent value="edit">
            <Card>
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>
                  Update your profile information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={profile.username}
                    onChange={(e) => setProfile(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="johndoe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed here. Contact support to update your email.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about yourself..."
                    maxLength={160}
                  />
                  <p className="text-xs text-muted-foreground">
                    {profile.bio.length}/160 characters
                  </p>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your interactions and engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Activity history coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Quick Preferences</CardTitle>
                <CardDescription>
                  Manage your notification and display preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate('/settings')} className="w-full">
                  <Settings className="mr-2 h-4 w-4" />
                  Go to Full Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Sign Out */}
        <Card className="mt-6 border-destructive/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium mb-1">Sign Out</h3>
                <p className="text-sm text-muted-foreground">
                  Sign out of your account
                </p>
              </div>
              <Button variant="destructive" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Profile;
