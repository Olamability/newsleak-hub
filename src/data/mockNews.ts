/**
 * News Article Type Definition
 * 
 * This interface defines the structure of a news article in the Newsleak platform.
 * All articles are fetched from the Supabase database (news_articles table).
 */
export interface NewsArticle {
  id: string;
  source: string;
  time: string;
  title: string;
  image: string;
  likes: number;
  comments: number;
  category: string;
  link?: string;
  content?: string;
  pubDate?: string;
  favicon?: string; // site logo
}
