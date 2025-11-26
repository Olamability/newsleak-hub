import { MessageCircle, ThumbsUp } from "lucide-react";
import { Card } from "@/components/ui/card";

interface NewsCardProps {
  source: string;
  time: string;
  title: string;
  image: string;
  likes: number;
  comments: number;
  onClick?: () => void;
}

export const NewsCard = ({
  source,
  time,
  title,
  image,
  likes,
  comments,
  onClick
}: NewsCardProps) => {
  return (
    <Card 
      className="flex gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer border-0 border-b rounded-none"
      onClick={onClick}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <span className="font-medium">{source}</span>
          <span>·</span>
          <span>{time}</span>
        </div>
        
        <h3 className="text-base font-medium leading-snug line-clamp-3 mb-3">
          {title}
        </h3>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <button className="flex items-center gap-1 hover:text-primary transition-colors">
            <ThumbsUp className="h-3.5 w-3.5" />
            <span>{likes}</span>
          </button>
          <button className="flex items-center gap-1 hover:text-primary transition-colors">
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
