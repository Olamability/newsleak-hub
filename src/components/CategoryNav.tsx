import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HEADER_HEIGHT_PX } from "@/lib/constants";

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
  return (
    <div className="sticky z-40 bg-background border-b border-border" style={{ top: `${HEADER_HEIGHT_PX}px` }}>
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
