import { loadNews } from "@/lib/newsStorage";

export async function getFeedAnalytics(feedUrl: string) {
  const articles = await loadNews();
  const count = articles.filter(a => a.link && a.link.startsWith(feedUrl)).length;
  return { count };
}
