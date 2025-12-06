// Local article likes storage
const LIKES_STORAGE_KEY = 'newsleak_article_likes';

interface LikeEntry {
  articleId: string;
  userId: string;
  createdAt: string;
}

function getLikesData(): LikeEntry[] {
  const stored = localStorage.getItem(LIKES_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveLikesData(likes: LikeEntry[]) {
  localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(likes));
}

export async function likeArticle(articleId: string, userId: string): Promise<void> {
  const allLikes = getLikesData();
  
  // Check if already liked
  if (allLikes.some(l => l.articleId === articleId && l.userId === userId)) {
    return;
  }
  
  allLikes.push({
    articleId,
    userId,
    createdAt: new Date().toISOString(),
  });
  
  saveLikesData(allLikes);
}

export async function getArticleLikes(articleId: string): Promise<number> {
  const allLikes = getLikesData();
  return allLikes.filter(l => l.articleId === articleId).length;
}

export async function hasUserLiked(articleId: string, userId: string): Promise<boolean> {
  const allLikes = getLikesData();
  return allLikes.some(l => l.articleId === articleId && l.userId === userId);
}

export async function unlikeArticle(articleId: string, userId: string): Promise<void> {
  const allLikes = getLikesData();
  const filtered = allLikes.filter(
    l => !(l.articleId === articleId && l.userId === userId)
  );
  saveLikesData(filtered);
}
