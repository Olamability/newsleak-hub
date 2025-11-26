import { MessageCircle, ThumbsUp } from "lucide-react";
import { Card } from "@/components/ui/card";

interface NewsCardProps {
  source: string;
  time: string;
  title: string;
  image: string;
  likes: number;
  comments: number;
  favicon?: string;
  content?: string;
  link?: string;
  onClick?: () => void;
}

export const NewsCard = ({
  source,
  time,
  title,
  image,
  likes,
  comments,
  favicon,
  content,
  link,
  onClick
}: NewsCardProps) => {
  // Keyboard and screen reader accessibility
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.key === "Enter" || e.key === " ") && onClick) {
      e.preventDefault();
      onClick();
    }
  };
  return (
    <Card
      className="flex gap-4 p-4 hover:bg-muted/50 active:bg-muted/70 transition-colors cursor-pointer border-0 border-b rounded-none focus:outline-none focus:ring-2 focus:ring-primary"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={title}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          {favicon && (
            <img src={favicon} alt="site logo" className="w-4 h-4 rounded mr-1 inline-block align-middle" />
          )}
          <span className="font-medium">{source}</span>
          <span>·</span>
          <span>{time}</span>
        </div>
        <h3 className="text-base font-medium leading-snug line-clamp-3 mb-2">
          {title}
        </h3>
        {content && (
          <div className="text-sm text-muted-foreground line-clamp-2 mb-2" dangerouslySetInnerHTML={{ __html: content }} />
        )}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
          <button className="flex items-center gap-1 hover:text-primary focus:text-primary transition-colors" aria-label="Like">
            <ThumbsUp className="h-3.5 w-3.5" />
            <span>{likes}</span>
          </button>
          <button className="flex items-center gap-1 hover:text-primary focus:text-primary transition-colors" aria-label="Comments">
            <MessageCircle className="h-3.5 w-3.5" />
            <span>{comments}</span>
          </button>
        </div>
      </div>
      <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-muted">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
    </Card>
  );
};
