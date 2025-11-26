import Parser from 'rss-parser';
import { NewsArticle } from '@/data/mockNews';

export interface RSSFeed {
  id: string;
  name: string;
  url: string;
  category: string;
  enabled: boolean;
  lastFetched?: string;
}

const parser = new Parser({
  customFields: {
    item: ['media:content', 'enclosure', 'media:thumbnail']
  }
});

// CORS proxy for RSS feeds (frontend limitation workaround)
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

export const parseRSSFeed = async (feedUrl: string): Promise<any[]> => {
  try {
    const proxyUrl = `${CORS_PROXY}${encodeURIComponent(feedUrl)}`;
    const feed = await parser.parseURL(proxyUrl);
    
    return feed.items.map((item: any) => ({
      title: item.title || '',
      link: item.link || '',
      pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
      content: item.contentSnippet || item.content || '',
      image: extractImage(item),
      source: feed.title || 'Unknown Source'
    }));
  } catch (error) {
    console.error('Error parsing RSS feed:', error);
    throw error;
  }
};

const extractImage = (item: any): string => {
  // Try multiple image sources
  if (item['media:content']?.$ && item['media:content'].$.url) {
    return item['media:content'].$.url;
  }
  if (item['media:thumbnail']?.$ && item['media:thumbnail'].$.url) {
    return item['media:thumbnail'].$.url;
  }
  if (item.enclosure?.url) {
    return item.enclosure.url;
  }
  if (item.content) {
    const imgMatch = item.content.match(/<img[^>]+src="([^">]+)"/);
    if (imgMatch) return imgMatch[1];
  }
  // Default placeholder
  return `https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&auto=format&fit=crop`;
};

export const convertToNewsArticle = (rssItem: any, category: string): NewsArticle => {
  const date = new Date(rssItem.pubDate);
  const now = new Date();
  const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  let timeAgo = '';
  if (diffHours < 1) timeAgo = 'Just now';
  else if (diffHours < 24) timeAgo = `${diffHours}h`;
  else timeAgo = `${Math.floor(diffHours / 24)}d`;

  return {
    id: `${date.getTime()}-${Math.random()}`,
    source: rssItem.source,
    time: timeAgo,
    title: rssItem.title,
    image: rssItem.image,
    likes: 0,
    comments: 0,
    category: category,
    link: rssItem.link,
    content: rssItem.content,
    pubDate: rssItem.pubDate
  };
};

export const fetchAllFeeds = async (feeds: RSSFeed[]): Promise<NewsArticle[]> => {
  const enabledFeeds = feeds.filter(f => f.enabled);
  const articles: NewsArticle[] = [];

  for (const feed of enabledFeeds) {
    try {
      const items = await parseRSSFeed(feed.url);
      const newsArticles = items.map(item => convertToNewsArticle(item, feed.category));
      articles.push(...newsArticles);
    } catch (error) {
      console.error(`Failed to fetch feed: ${feed.name}`, error);
    }
  }

  // Sort by date, newest first
  return articles.sort((a, b) => 
    new Date(b.pubDate || 0).getTime() - new Date(a.pubDate || 0).getTime()
  );
};
