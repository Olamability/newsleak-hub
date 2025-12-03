import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { Settings, User, Bell, Eye, Shield, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { requestNotificationPermission, getNotificationPermission } from "@/lib/pushNotifications";

const categories = [
  "Football",
  "Entertainment",
  "Politics",
  "Sports",
  "Lifestyle",
  "Fashion&Beauty",
  "Technology",
  "Business"
];

const UserSettings = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  
  // Preferences state
  const [favoriteCategories, setFavoriteCategories] = useState<string[]>([]);
  const [notificationSettings, setNotificationSettings] = useState({
    breakingNews: true,
    recommendations: true,
    savedArticles: false,
  });
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [textSize, setTextSize] = useState<"small" | "medium" | "large">("medium");

  useEffect(() => {
    loadUserPreferences();
  }, [user]);

  const loadUserPreferences = async () => {
    const userId = user?.id || localStorage.getItem('userId') || `anon_${crypto.randomUUID()}`;
    localStorage.setItem('userId', userId);

    try {
      // Try to load from database first
      const { data: prefs } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (prefs) {
        if (prefs.favorite_categories) setFavoriteCategories(prefs.favorite_categories);
        if (prefs.theme) setTheme(prefs.theme);
        if (prefs.text_size) setTextSize(prefs.text_size);
        setNotificationSettings({
          breakingNews: prefs.breaking_news_alerts ?? true,
          recommendations: prefs.personalized_alerts ?? true,
          savedArticles: prefs.email_notifications ?? false,
        });
      } else {
        // Fallback to localStorage
        const savedCategories = localStorage.getItem("favoriteCategories");
        const savedNotifications = localStorage.getItem("notificationSettings");
        const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
        const savedTextSize = localStorage.getItem("textSize") as "small" | "medium" | "large" | null;

        if (savedCategories) setFavoriteCategories(JSON.parse(savedCategories));
        if (savedNotifications) setNotificationSettings(JSON.parse(savedNotifications));
        if (savedTheme) setTheme(savedTheme);
        if (savedTextSize) setTextSize(savedTextSize);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const toggleCategory = async (category: string) => {
    const newCategories = favoriteCategories.includes(category)
      ? favoriteCategories.filter(c => c !== category)
      : [...favoriteCategories, category];
    
    setFavoriteCategories(newCategories);
    localStorage.setItem("favoriteCategories", JSON.stringify(newCategories));
    
    // Save to database
    const userId = user?.id || localStorage.getItem('userId');
    if (userId) {
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          favorite_categories: newCategories,
        }, {
          onConflict: 'user_id'
        });
    }
    
    toast({
      title: "Preferences updated",
      description: "Your favorite categories have been saved.",
    });
  };

  const updateNotificationSetting = async (key: keyof typeof notificationSettings, value: boolean) => {
    const newSettings = { ...notificationSettings, [key]: value };
    setNotificationSettings(newSettings);
    localStorage.setItem("notificationSettings", JSON.stringify(newSettings));
    
    // Save to database
    const userId = user?.id || localStorage.getItem('userId');
    if (userId) {
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          breaking_news_alerts: newSettings.breakingNews,
          personalized_alerts: newSettings.recommendations,
          email_notifications: newSettings.savedArticles,
        }, {
          onConflict: 'user_id'
        });
    }
    
    toast({
      title: "Notification preferences updated",
      description: "Your notification settings have been saved.",
    });
  };

  const updateTheme = async (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    
    // Save to database
    const userId = user?.id || localStorage.getItem('userId');
    if (userId) {
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          theme: newTheme,
        }, {
          onConflict: 'user_id'
        });
    }
    
    toast({
      title: "Theme updated",
      description: `Switched to ${newTheme} mode.`,
    });
  };

  const updateTextSize = async (size: "small" | "medium" | "large") => {
    setTextSize(size);
    localStorage.setItem("textSize", size);
    
    // Apply text size to root element
    const root = document.documentElement;
    root.classList.remove("text-sm", "text-base", "text-lg");
    
    if (size === "small") root.classList.add("text-sm");
    else if (size === "large") root.classList.add("text-lg");
    
    // Save to database
    const userId = user?.id || localStorage.getItem('userId');
    if (userId) {
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          text_size: size,
        }, {
          onConflict: 'user_id'
        });
    }
    
    toast({
      title: "Text size updated",
      description: `Text size set to ${size}.`,
    });
  };

  const handleEnableNotifications = async () => {
    const permission = await requestNotificationPermission();
    if (permission) {
      toast({
        title: "Notifications enabled",
        description: "You will now receive push notifications.",
      });
      loadUserPreferences();
    } else {
      toast({
        title: "Notifications blocked",
        description: "Please enable notifications in your browser settings.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header siteName="Newsleak" />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in</h1>
          <p className="text-muted-foreground mb-6">
            You need to be logged in to access settings.
          </p>
          <Button onClick={() => navigate("/login")}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header siteName="Newsleak" />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences and settings
          </p>
        </div>

        <Tabs defaultValue="preferences" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="preferences">
              <Settings className="h-4 w-4 mr-2" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="account">
              <User className="h-4 w-4 mr-2" />
              Account
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <Shield className="h-4 w-4 mr-2" />
              Privacy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preferences" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Favorite Categories</CardTitle>
                <CardDescription>
                  Select your favorite news categories to personalize your feed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => toggleCategory(category)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        favoriteCategories.includes(category)
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reading Preferences</CardTitle>
                <CardDescription>
                  Customize your reading experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base mb-3 block">Theme</Label>
                  <div className="flex gap-3">
                    <Button
                      variant={theme === "light" ? "default" : "outline"}
                      onClick={() => updateTheme("light")}
                    >
                      Light
                    </Button>
                    <Button
                      variant={theme === "dark" ? "default" : "outline"}
                      onClick={() => updateTheme("dark")}
                    >
                      Dark
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-base mb-3 block">Text Size</Label>
                  <div className="flex gap-3">
                    <Button
                      variant={textSize === "small" ? "default" : "outline"}
                      onClick={() => updateTextSize("small")}
                    >
                      Small
                    </Button>
                    <Button
                      variant={textSize === "medium" ? "default" : "outline"}
                      onClick={() => updateTextSize("medium")}
                    >
                      Medium
                    </Button>
                    <Button
                      variant={textSize === "large" ? "default" : "outline"}
                      onClick={() => updateTextSize("large")}
                    >
                      Large
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  View and manage your account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <Input value={user.email || ""} disabled className="mt-2" />
                </div>
                <div>
                  <Label>User ID</Label>
                  <Input value={user.id || ""} disabled className="mt-2" />
                </div>
                <Separator />
                <Button variant="destructive" onClick={handleSignOut} className="w-full">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Push Notifications</CardTitle>
                <CardDescription>
                  Enable browser push notifications for breaking news
                </CardDescription>
              </CardHeader>
              <CardContent>
                {getNotificationPermission() === 'granted' ? (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Bell className="h-4 w-4" />
                    Push notifications are enabled
                  </div>
                ) : getNotificationPermission() === 'denied' ? (
                  <div className="text-sm text-destructive">
                    Push notifications are blocked. Please enable them in your browser settings.
                  </div>
                ) : (
                  <Button onClick={handleEnableNotifications}>
                    <Bell className="h-4 w-4 mr-2" />
                    Enable Push Notifications
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose what notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Breaking News Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about breaking news stories
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.breakingNews}
                    onCheckedChange={(checked) => updateNotificationSetting("breakingNews", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Personalized Recommendations</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive news recommendations based on your interests
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.recommendations}
                    onCheckedChange={(checked) => updateNotificationSetting("recommendations", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Saved Article Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Reminders to read your saved articles
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.savedArticles}
                    onCheckedChange={(checked) => updateNotificationSetting("savedArticles", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Privacy & Data</CardTitle>
                <CardDescription>
                  Manage your privacy settings and data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Data Collection</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    We collect data to improve your experience and provide personalized content.
                    This includes your reading history, preferences, and interactions.
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-semibold mb-2">GDPR Compliance</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    We are committed to protecting your privacy and complying with GDPR regulations.
                  </p>
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" onClick={() => {
                      toast({
                        title: "Data Export",
                        description: "Your data export will be sent to your email.",
                      });
                    }}>
                      Export My Data
                    </Button>
                    <Button variant="outline" onClick={() => navigate("/bookmarks")}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Reading History
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default UserSettings;
