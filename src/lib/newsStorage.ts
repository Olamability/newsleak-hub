export interface NewsArticle {
  id: string;
  title: string;
  link: string;
  image?: string;
  source: string;
  category: string;
  published: string;
  summary?: string;
  favicon?: string;
  likes?: number;
  comments?: number;
}

const NEWS_STORAGE_KEY = 'newsleak_news_articles';

export async function loadNews(): Promise<NewsArticle[]> {
  const stored = localStorage.getItem(NEWS_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export async function addNews(article: NewsArticle, userId?: string) {
  const articles = await loadNews();
  articles.unshift(article);
  localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(articles));
}

export async function deleteNews(id: string, userId?: string) {
  const articles = await loadNews();
  const filtered = articles.filter(a => a.id !== id);
  localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(filtered));
}

export async function updateNews(id: string, updates: Partial<NewsArticle>, userId?: string) {
  const articles = await loadNews();
  const index = articles.findIndex(a => a.id === id);
  if (index !== -1) {
    articles[index] = { ...articles[index], ...updates };
    localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(articles));
  }
}
