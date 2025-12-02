
import { MessageCircle, ThumbsUp, Bookmark, BookmarkCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate, useLocation } from "react-router-dom";
import { isBookmarked, addBookmark, removeBookmark } from "../lib/bookmarks";
import { isLocalBookmarked, addLocalBookmark, removeLocalBookmark } from "@/utils/localBookmarks";
import { likeArticle, hasUserLiked, getArticleLikes } from "@/lib/articleAnalytics";
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
  id?: string;
  article?: any; // for full article object if needed
}

export const NewsCard = (props: NewsCardProps) => {
  const {
    source,
    time,
    title,
    image,
    likes: initialLikes,
    comments,
    favicon,
    content,
    link,
    onClick,
    id,
    article
  } = props;

  const [bookmarked, setBookmarked] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikes);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLoginMsg, setShowLoginMsg] = useState(false);

  useEffect(() => {
    const checkBookmark = async () => {
      if (id && user) {
        try {
          const result = await isBookmarked(id, user.id);
          setBookmarked(result);
        } catch {
          setBookmarked(false);
        }
      } else if (id) {
        setBookmarked(isLocalBookmarked(id));
      } else {
        setBookmarked(false);
      }
    };
    checkBookmark();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  useEffect(() => {
    const checkLike = async () => {
      if (id) {
        try {
          const [isLiked, count] = await Promise.all([
            hasUserLiked(id, user?.id),
            getArticleLikes(id)
          ]);
          setLiked(isLiked);
          setLikesCount(count);
        } catch {
          setLiked(false);
        }
      }
    };
    checkLike();
  }, [id, user]);

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!id) return;
    if (user) {
      if (bookmarked) {
        try {
          await removeBookmark(id, user.id);
          setBookmarked(false);
        } catch {}
      } else {
        try {
          if (article) {
            await addBookmark(article, user.id);
          } else {
            await addBookmark({
              id,
              source,
              title,
              image,
              category: article?.category || "",
              link,
              favicon,
              published: '',
            }, user.id);
          }
          setBookmarked(true);
        } catch {}
      }
    } else {
      if (bookmarked) {
        removeLocalBookmark(id);
        setBookmarked(false);
      } else {
        if (article) {
          addLocalBookmark(article);
        } else {
          addLocalBookmark({
            id,
            source,
            title,
            image,
            category: article?.category || "",
            link,
            favicon,
            published: '',
          });
        }
        setBookmarked(true);
      }
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!id) return;
    
    try {
      await likeArticle(id, user?.id);
      setLiked(!liked);
      setLikesCount(liked ? likesCount - 1 : likesCount + 1);
    } catch (error) {
      console.error('Failed to like article:', error);
    }
  };

  // Keyboard and screen reader accessibility
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.key === "Enter" || e.key === " ") && onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <Card
      className="flex gap-4 p-4 hover:bg-muted/50 active:bg-muted/70 transition-colors cursor-pointer border-0 border-b rounded-none focus:outline-none focus:ring-2 focus:ring-primary relative"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={title}
    >
      {/* Bookmark button top right */}
      <button
        className="absolute top-3 right-3 z-10 p-1 rounded-full bg-background/80 hover:bg-primary/10 focus:bg-primary/20 border border-border shadow transition-colors"
        aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
        onClick={handleBookmark}
        tabIndex={0}
      >
          {bookmarked ? <BookmarkCheck className="w-5 h-5 text-primary" /> : <Bookmark className="w-5 h-5 text-muted-foreground" />}
      </button>
      {showLoginMsg && (
        <div className="absolute top-12 right-3 bg-destructive text-white text-xs rounded px-2 py-1 shadow z-20">
          Please log in to bookmark, comment, or follow topics.
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <span>{time}</span>
          <span>·</span>
          {favicon && (
            <img src={favicon} className="w-4 h-4 rounded mr-1 inline-block align-middle" />
          )}
          <span className="font-medium">{source}</span>
        </div>
        <h3 className="text-base font-medium leading-snug line-clamp-3 mb-2">
          {title}
        </h3>
        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
          <button 
            className={`flex items-center gap-1 hover:text-primary focus:text-primary transition-colors ${liked ? 'text-primary' : ''}`}
            aria-label="Like"
            onClick={handleLike}
          >
            <ThumbsUp className={`h-3.5 w-3.5 ${liked ? 'fill-current' : ''}`} />
            <span>{likesCount}</span>
          </button>
          <button className="flex items-center gap-1 hover:text-primary focus:text-primary transition-colors" aria-label="Comments">
            <MessageCircle className="h-3.5 w-3.5" />
            <span>{comments}</span>
          </button>
        </div>
      </div>
      <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-muted flex items-center justify-center relative">
        <img
          src={image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&auto=format&fit=crop'}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {favicon && (
          <img
            src={favicon}
            className="w-8 h-8 rounded-full absolute bottom-1 left-1 border-2 border-white shadow"
            loading="lazy"
          />
        )}
      </div>
    </Card>
  );
};
