import { RSSFeed } from './rssParser';

// Local storage implementation for RSS feeds
const FEEDS_STORAGE_KEY = 'newsleak_rss_feeds';

const getDefaultFeeds = (): RSSFeed[] => [
  {
    id: '1',
    name: 'TechCrunch',
    source: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    category: 'Technology',
    is_active: true,
    description: 'Technology news and analysis',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'BBC News',
    source: 'BBC News',
    url: 'https://feeds.bbci.co.uk/news/rss.xml',
    category: 'News',
    is_active: true,
    description: 'World news from BBC',
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'The Verge',
    source: 'The Verge',
    url: 'https://www.theverge.com/rss/index.xml',
    category: 'Technology',
    is_active: true,
    description: 'Technology and culture news',
    created_at: new Date().toISOString(),
  },
];

export const loadFeeds = async (): Promise<RSSFeed[]> => {
  const stored = localStorage.getItem(FEEDS_STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  const defaultFeeds = getDefaultFeeds();
  localStorage.setItem(FEEDS_STORAGE_KEY, JSON.stringify(defaultFeeds));
  return defaultFeeds;
};

export const addFeed = async (feed: Omit<RSSFeed, 'id'>): Promise<void> => {
  const feeds = await loadFeeds();
  const newFeed: RSSFeed = {
    ...feed,
    id: Date.now().toString(),
    source: feed.name || feed.source,
    is_active: true,
    created_at: new Date().toISOString(),
  };
  feeds.push(newFeed);
  localStorage.setItem(FEEDS_STORAGE_KEY, JSON.stringify(feeds));
};

export const updateFeed = async (id: string, updates: Partial<RSSFeed>): Promise<void> => {
  const feeds = await loadFeeds();
  const index = feeds.findIndex(f => f.id === id);
  if (index !== -1) {
    feeds[index] = { ...feeds[index], ...updates };
    localStorage.setItem(FEEDS_STORAGE_KEY, JSON.stringify(feeds));
  }
};

export const deleteFeed = async (id: string): Promise<void> => {
  const feeds = await loadFeeds();
  const filtered = feeds.filter(f => f.id !== id);
  localStorage.setItem(FEEDS_STORAGE_KEY, JSON.stringify(filtered));
};

