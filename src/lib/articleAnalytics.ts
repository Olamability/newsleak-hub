// Local article analytics stub
export async function trackView(articleId: string, userId?: string) {
  const views = JSON.parse(localStorage.getItem('newsleak_article_views') || '[]');
  views.push({ articleId, userId: userId || 'anonymous', timestamp: new Date().toISOString() });
  localStorage.setItem('newsleak_article_views', JSON.stringify(views));
}

export async function getArticleViews(articleId: string): Promise<number> {
  const views = JSON.parse(localStorage.getItem('newsleak_article_views') || '[]');
  return views.filter((v: any) => v.articleId === articleId).length;
}
