import { NewsArticle } from '@/data/mockNews';

export interface RSSFeed {
  id: string;
  name: string;
  url: string;
  category: string;
  enabled: boolean;
  lastFetched?: string;
}

// CORS proxy for RSS feeds (frontend limitation workaround)
const CORS_PROXY = 'https://corsproxy.io/?';

export const parseRSSFeed = async (feedUrl: string): Promise<any[]> => {
  try {
  const proxyUrl = `${CORS_PROXY}${feedUrl}`;
    const response = await fetch(proxyUrl);
    const xmlText = await response.text();

    // Parse XML
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlText, "application/xml");

    // Get items
    const items = Array.from(xml.querySelectorAll("item"));

    // Get source (channel > title)
    const feedTitle = xml.querySelector("channel > title")?.textContent || "Unknown Source";

    // Use Promise.all to handle async image extraction
    return Promise.all(items.map(async item => {
      const link = item.querySelector("link")?.textContent || '';
      // Try to get full content from <content:encoded> or <content> or <description>
      let content = '';
      const contentEncoded = item.querySelector("content\\:encoded");
      if (contentEncoded && contentEncoded.textContent) {
        content = contentEncoded.textContent;
      } else if (item.querySelector("content")?.textContent) {
        content = item.querySelector("content")?.textContent || '';
      } else {
        content = item.querySelector("description")?.textContent || '';
      }

      // Try to get featured image from all possible sources
      let image = extractImage(item);
      if ((!image || image.includes('unsplash.com/photo-1504711434969-e33886168f5c')) && link) {
        // Try to fetch og:image from the news source page
        try {
          const pageHtml = await fetch(`${CORS_PROXY}${link}`).then(res => res.text());
          const ogMatch = pageHtml.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"'>]+)["']/i);
          if (ogMatch) image = ogMatch[1];
          else {
            const imgMatch2 = pageHtml.match(/<img[^>]+src=["']([^"'>]+)["']/i);
            if (imgMatch2) image = imgMatch2[1];
          }
        } catch {
          // ignore fetch errors, fallback will be used
        }
      }

      // Favicon extraction (site logo)
      let favicon = '';
      try {
        if (link) {
          const url = new URL(link);
          favicon = `${url.origin}/favicon.ico`;
        }
      } catch {}

      return {
        title: item.querySelector("title")?.textContent || '',
        link,
        pubDate:
          item.querySelector("pubDate")?.textContent ||
          item.querySelector("isoDate")?.textContent ||
          new Date().toISOString(),
        content,
        image,
        source: feedTitle,
        favicon,
      };
    }));
  } catch (error) {
    console.error('Error parsing RSS feed:', error);
    throw error;
  }
};

const extractImage = (item: Element): string => {
  // Try media:content, enclosure, media:thumbnail, og:image, <img> in content/description
  const mediaContent = item.querySelector("media\\:content");
  if (mediaContent && mediaContent.getAttribute("url")) {
    return mediaContent.getAttribute("url")!;
  }
  const mediaThumbnail = item.querySelector("media\\:thumbnail");
  if (mediaThumbnail && mediaThumbnail.getAttribute("url")) {
    return mediaThumbnail.getAttribute("url")!;
  }
  const enclosure = item.querySelector("enclosure");
  if (enclosure && enclosure.getAttribute("url")) {
    return enclosure.getAttribute("url")!;
  }
  // Try og:image in content:encoded or description
  const contentEncoded = item.querySelector("content\\:encoded")?.textContent;
  const description = item.querySelector("description")?.textContent;
  const html = contentEncoded || description || "";
  // og:image meta tag
  const ogImgMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"'>]+)["']/i);
  if (ogImgMatch) return ogImgMatch[1];
  // <img src=...>
  const imgMatch = html.match(/<img[^>]+src=["']([^"'>]+)["']/i);
  if (imgMatch) return imgMatch[1];
  // Try to find a data-src image (lazy loaded)
  const dataImgMatch = html.match(/<img[^>]+data-src=["']([^"'>]+)["']/i);
  if (dataImgMatch) return dataImgMatch[1];
  // No image found, return empty string
  return '';
};


// Simple keyword-based category detection
const detectCategory = (title: string, content: string): string => {
  const text = `${title} ${content}`.toLowerCase();
  if (/football|premier league|soccer|manchester|chelsea|arsenal|goal|match|fifa|uefa|laliga|serie a|bundesliga/.test(text)) return "Football";
  if (/entertainment|movie|music|celebrity|film|tv|show|hollywood|bollywood|actor|actress|award/.test(text)) return "Entertainment";
  if (/politic|election|senate|president|government|parliament|senator|congress|bill|law|policy/.test(text)) return "Politics";
  if (/sport|olympic|athlete|nba|nfl|mlb|tennis|basketball|cricket|golf|tournament/.test(text)) return "Sports";
  if (/lifestyle|wellness|health|fitness|diet|travel|food|drink|recipe|home|garden/.test(text)) return "Lifestyle";
  if (/fashion|beauty|style|makeup|clothing|runway|model|designer|trend/.test(text)) return "Fashion&Beauty";
  if (/tech|technology|gadget|ai |artificial intelligence|robot|software|hardware|app|device|smartphone|computer|internet|startup/.test(text)) return "Technology";
  if (/business|stock|market|finance|economy|company|startup|trade|investment|bank|money|revenue|profit/.test(text)) return "Business";
  return "For you";
};

export const convertToNewsArticle = (rssItem: any, _category: string): NewsArticle => {
  const date = new Date(rssItem.pubDate);
  const now = new Date();
  const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

  let timeAgo = '';
  if (diffHours < 1) timeAgo = 'Just now';
  else if (diffHours < 24) timeAgo = `${diffHours}h`;
  else timeAgo = `${Math.floor(diffHours / 24)}d`;

  // Auto-detect category
  const detectedCategory = detectCategory(rssItem.title || '', rssItem.content || '');

  return {
    id: `${date.getTime()}-${Math.random()}`,
    source: rssItem.source,
    time: timeAgo,
    title: rssItem.title,
    image: rssItem.image,
    likes: 0,
    comments: 0,
    category: detectedCategory,
    link: rssItem.link,
    content: rssItem.content,
    pubDate: rssItem.pubDate,
    favicon: rssItem.favicon || '',
  };
};

export const fetchAllFeeds = async (feeds: RSSFeed[]): Promise<NewsArticle[]> => {
  const enabledFeeds = feeds.filter(f => f.enabled);
  const articles: NewsArticle[] = [];

  for (const feed of enabledFeeds) {
    try {
      const items = await parseRSSFeed(feed.url); // await the async function
      const newsArticles = items.map(item => convertToNewsArticle(item, feed.category));
      articles.push(...newsArticles);
    } catch (error) {
      console.error(`Failed to fetch feed: ${feed.name}`, error);
    }
  }

  // Sort by date, newest first
  return articles.sort((a, b) =>
    new Date(b.pubDate || 0).getTime() - new Date(a.pubDate || 0).getTime()
  );
};