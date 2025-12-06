// RSS fetcher using local feeds
import { loadFeeds } from './feedStorage';
import { parseRSSFeed } from './rssParser';
import { addNews } from './newsStorage';

export async function fetchFeeds() {
  try {
    const feeds = await loadFeeds();
    const activeFeeds = feeds.filter(feed => feed.is_active);
    
    const results = await Promise.allSettled(
      activeFeeds.map(async (feed) => {
        try {
          const articles = await parseRSSFeed(feed.url, feed.source, feed.category);
          // Store articles in local storage
          for (const article of articles) {
            await addNews(article);
          }
          return { feed: feed.source, count: articles.length };
        } catch (error) {
          console.error(`Error fetching feed ${feed.source}:`, error);
          return { feed: feed.source, count: 0, error: String(error) };
        }
      })
    );
    
    return {
      success: true,
      results: results.map(r => r.status === 'fulfilled' ? r.value : { error: 'Failed' })
    };
  } catch (error) {
    console.error('Error in fetchFeeds:', error);
    throw error;
  }
}
