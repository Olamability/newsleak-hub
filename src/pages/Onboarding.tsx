import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { 
  Newspaper, 
  TrendingUp, 
  Bell, 
  Bookmark, 
  Settings,
  ArrowRight,
  Check
} from "lucide-react";

const categories = [
  { name: "Football", icon: "⚽", color: "bg-green-100 text-green-700" },
  { name: "Entertainment", icon: "🎬", color: "bg-purple-100 text-purple-700" },
  { name: "Politics", icon: "🏛️", color: "bg-blue-100 text-blue-700" },
  { name: "Sports", icon: "🏃", color: "bg-orange-100 text-orange-700" },
  { name: "Lifestyle", icon: "🌟", color: "bg-pink-100 text-pink-700" },
  { name: "Fashion&Beauty", icon: "💄", color: "bg-rose-100 text-rose-700" },
  { name: "Technology", icon: "💻", color: "bg-indigo-100 text-indigo-700" },
  { name: "Business", icon: "💼", color: "bg-slate-100 text-slate-700" },
];

const features = [
  {
    icon: Newspaper,
    title: "Personalized Feed",
    description: "Get news tailored to your interests",
  },
  {
    icon: TrendingUp,
    title: "Trending Stories",
    description: "Stay updated with what's popular",
  },
  {
    icon: Bell,
    title: "Push Notifications",
    description: "Get alerts for breaking news",
  },
  {
    icon: Bookmark,
    title: "Save for Later",
    description: "Bookmark articles to read later",
  },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleFinish = async () => {
    try {
      const userId = user?.id || localStorage.getItem('userId') || `anon_${crypto.randomUUID()}`;
      localStorage.setItem('userId', userId);

      // Save preferences
      await supabase.from('user_preferences').upsert({
        user_id: userId,
        favorite_categories: selectedCategories,
        breaking_news_alerts: notificationsEnabled,
        personalized_alerts: notificationsEnabled,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      });

      // Save to localStorage as backup
      localStorage.setItem('favoriteCategories', JSON.stringify(selectedCategories));
      localStorage.setItem('onboardingCompleted', 'true');

      toast({
        title: "Welcome to Newsleak!",
        description: "Your preferences have been saved.",
      });

      navigate('/');
    } catch (error) {
      console.error('Error saving preferences:', error);
      // Still navigate even if save fails
      localStorage.setItem('onboardingCompleted', 'true');
      navigate('/');
    }
  };

  const totalSteps = 3;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i + 1 <= step ? 'w-12 bg-primary' : 'w-8 bg-muted'
                }`}
              />
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Step {step} of {totalSteps}
          </p>
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <Card className="border-2">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Newspaper className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-3xl">Welcome to Newsleak!</CardTitle>
              <CardDescription className="text-base">
                Your personalized news aggregator
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 rounded-lg bg-muted/50"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Button onClick={() => setStep(2)} className="w-full" size="lg">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Choose Categories */}
        {step === 2 && (
          <Card className="border-2">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Choose Your Interests</CardTitle>
              <CardDescription>
                Select categories you'd like to follow (select at least 3)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {categories.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => handleCategoryToggle(category.name)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedCategories.includes(category.name)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{category.icon}</span>
                      {selectedCategories.includes(category.name) && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <h3 className="font-medium text-sm">{category.name}</h3>
                  </button>
                ))}
              </div>
              
              <div className="flex items-center gap-2 mb-6">
                <Badge variant="outline" className="text-xs">
                  {selectedCategories.length} selected
                </Badge>
                {selectedCategories.length >= 3 && (
                  <Badge className="text-xs">
                    <Check className="h-3 w-3 mr-1" />
                    Ready to continue
                  </Badge>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="w-full"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={selectedCategories.length < 3}
                  className="w-full"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Notifications */}
        {step === 3 && (
          <Card className="border-2">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Bell className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Stay Updated</CardTitle>
              <CardDescription>
                Get notified about breaking news and trending stories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                <div className="p-4 rounded-lg border">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={notificationsEnabled}
                      onCheckedChange={(checked) => 
                        setNotificationsEnabled(checked as boolean)
                      }
                      id="notifications"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor="notifications"
                        className="font-medium cursor-pointer"
                      >
                        Enable Push Notifications
                      </label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Get alerts for breaking news and articles in your favorite categories
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    What you'll get:
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      Breaking news alerts
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      Trending stories in your interests
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      Personalized recommendations
                    </li>
                  </ul>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  You can change these settings anytime from your profile
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="w-full"
                >
                  Back
                </Button>
                <Button onClick={handleFinish} className="w-full" size="lg">
                  <Check className="mr-2 h-4 w-4" />
                  Complete Setup
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Skip option */}
        <div className="text-center mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              localStorage.setItem('onboardingCompleted', 'true');
              navigate('/');
            }}
            className="text-muted-foreground"
          >
            Skip for now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
