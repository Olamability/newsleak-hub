// Local bookmarks storage
import { NewsArticle } from './newsStorage';

const BOOKMARKS_STORAGE_KEY = 'newsleak_bookmarks';

interface BookmarkEntry {
  userId: string;
  articleId: string;
  article: NewsArticle;
  createdAt: string;
}

function getBookmarksData(): BookmarkEntry[] {
  const stored = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveBookmarksData(bookmarks: BookmarkEntry[]) {
  localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
}

export async function getBookmarks(userId: string): Promise<NewsArticle[]> {
  const allBookmarks = getBookmarksData();
  return allBookmarks
    .filter(b => b.userId === userId)
    .map(b => b.article);
}

export async function isBookmarked(articleId: string, userId: string): Promise<boolean> {
  const allBookmarks = getBookmarksData();
  return allBookmarks.some(b => b.userId === userId && b.articleId === articleId);
}

export async function addBookmark(article: NewsArticle, userId: string) {
  const allBookmarks = getBookmarksData();
  
  // Check if already bookmarked
  if (allBookmarks.some(b => b.userId === userId && b.articleId === article.id)) {
    return;
  }
  
  allBookmarks.push({
    userId,
    articleId: article.id,
    article,
    createdAt: new Date().toISOString(),
  });
  
  saveBookmarksData(allBookmarks);
}

export async function removeBookmark(articleId: string, userId: string) {
  const allBookmarks = getBookmarksData();
  const filtered = allBookmarks.filter(
    b => !(b.userId === userId && b.articleId === articleId)
  );
  saveBookmarksData(filtered);
}
