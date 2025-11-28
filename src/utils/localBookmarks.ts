// src/utils/localBookmarks.ts

export function getLocalBookmarks() {
  const data = localStorage.getItem('newsleak_bookmarks');
  return data ? JSON.parse(data) : [];
}

export function addLocalBookmark(article) {
  const bookmarks = getLocalBookmarks();
  if (!bookmarks.find((a) => a.id === article.id)) {
    bookmarks.push(article);
    localStorage.setItem('newsleak_bookmarks', JSON.stringify(bookmarks));
  }
}

export function removeLocalBookmark(id) {
  const bookmarks = getLocalBookmarks().filter((a) => a.id !== id);
  localStorage.setItem('newsleak_bookmarks', JSON.stringify(bookmarks));
}

export function isLocalBookmarked(id) {
  return getLocalBookmarks().some((a) => a.id === id);
}
