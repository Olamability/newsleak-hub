import { RSSFeed } from './rssParser';
import { NewsArticle } from '@/data/mockNews';

const FEEDS_KEY = 'newshub_feeds';
const ARTICLES_KEY = 'newshub_articles';
const LAST_UPDATE_KEY = 'newshub_last_update';

export const saveFeeds = (feeds: RSSFeed[]): void => {
  localStorage.setItem(FEEDS_KEY, JSON.stringify(feeds));
};

export const loadFeeds = (): RSSFeed[] => {
  const stored = localStorage.getItem(FEEDS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveArticles = (articles: NewsArticle[]): void => {
  localStorage.setItem(ARTICLES_KEY, JSON.stringify(articles));
  localStorage.setItem(LAST_UPDATE_KEY, new Date().toISOString());
};

export const loadArticles = (): NewsArticle[] => {
  const stored = localStorage.getItem(ARTICLES_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const getLastUpdate = (): string | null => {
  return localStorage.getItem(LAST_UPDATE_KEY);
};

export const addFeed = (feed: Omit<RSSFeed, 'id'>): void => {
  const feeds = loadFeeds();
  const newFeed: RSSFeed = {
    ...feed,
    id: `feed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  };
  feeds.push(newFeed);
  saveFeeds(feeds);
};

export const updateFeed = (id: string, updates: Partial<RSSFeed>): void => {
  const feeds = loadFeeds();
  const index = feeds.findIndex(f => f.id === id);
  if (index !== -1) {
    feeds[index] = { ...feeds[index], ...updates };
    saveFeeds(feeds);
  }
};

export const deleteFeed = (id: string): void => {
  const feeds = loadFeeds();
  const filtered = feeds.filter(f => f.id !== id);
  saveFeeds(filtered);
};
