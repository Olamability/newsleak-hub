import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate, useLocation } from "react-router-dom";
import { isTopicFollowed, followTopic, unfollowTopic } from "@/lib/followedTopics";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = [
  "Latest",
  "Football",
  "Entertainment",
  "Politics",
  "Sports",
  "Lifestyle",
  "Fashion&Beauty",
  "Technology",
  "Business"
];

interface CategoryNavProps {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}

export const CategoryNav = ({ activeCategory, setActiveCategory }: CategoryNavProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loginMsg, setLoginMsg] = useState<string | null>(null);

  return (
    <div className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="flex items-center gap-2 px-4 py-3 max-w-7xl mx-auto">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex gap-6 overflow-x-auto scrollbar-hide flex-1">
          {categories.map((category) => {
            const [followed, setFollowed] = useState(isTopicFollowed(category));
            const handleFollow = (e: React.MouseEvent) => {
              e.stopPropagation();
              if (!user) {
                setLoginMsg("Please log in to follow topics.");
                setTimeout(() => setLoginMsg(null), 2500);
                navigate('/login', {
                  state: {
                    from: location.pathname,
                    action: 'follow',
                    category
                  }
                });
                return;
              }
              if (followed) {
                unfollowTopic(category);
                setFollowed(false);
              } else {
                followTopic(category);
                setFollowed(true);
              }
            };
            return (
              <div key={category} className="flex items-center gap-1">
                <button
                  onClick={() => setActiveCategory(category)}
                  className={cn(
                    "text-sm font-medium whitespace-nowrap pb-2 border-b-2 transition-colors relative focus:outline-none focus:ring-2 focus:ring-primary",
                    activeCategory === category
                      ? "text-primary border-primary"
                      : "text-muted-foreground border-transparent hover:text-foreground"
                  )}
                  aria-pressed={activeCategory === category}
                  tabIndex={0}
                >
                  {category}
                </button>
                {category !== "For you" && (
                  <button
                    onClick={handleFollow}
                    className={cn(
                      "ml-1 text-xs px-1 py-0.5 rounded border",
                      followed ? "bg-primary text-white border-primary" : "bg-muted text-muted-foreground border-border hover:bg-primary/10"
                    )}
                    aria-label={followed ? `Unfollow ${category}` : `Follow ${category}`}
                  >
                    {followed ? "Unfollow" : "Follow"}
                  </button>
                )}
                {loginMsg && (
                  <div className="absolute top-10 left-0 bg-destructive text-white text-xs rounded px-2 py-1 shadow z-20">
                    {loginMsg}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
