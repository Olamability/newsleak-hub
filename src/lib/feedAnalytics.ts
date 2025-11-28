import { loadNews } from "@/lib/newsStorage";

export async function getFeedAnalytics(feedUrl: string, userId: string) {
  const articles = await loadNews(userId);
  const count = articles.filter(a => a.link && a.link.startsWith(feedUrl)).length;
  // Fallback: count by source if link doesn't match
  // const count = articles.filter(a => a.source === feedName).length;
  return { count };
}
