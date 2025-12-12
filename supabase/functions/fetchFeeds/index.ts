import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

interface RSSFeed {
  id: string;
  source: string;
  url: string;
  category: string;
  is_active: boolean;
  fetch_errors?: number;
  last_error?: string | null;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

// Simple XML text extraction helper
function extractTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>|<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const match = xml.match(regex);
  if (match) {
    return (match[1] || match[2] || '').trim();
  }
  return '';
}

// Extract image from various RSS sources
function extractImage(itemXml: string): string | null {
  // Try media:content
  const mediaMatch = itemXml.match(/<media:content[^>]+url=["']([^"']+)["']/i);
  if (mediaMatch) return mediaMatch[1];
  
  // Try media:thumbnail
  const thumbMatch = itemXml.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/i);
  if (thumbMatch) return thumbMatch[1];
  
  // Try enclosure
  const enclosureMatch = itemXml.match(/<enclosure[^>]+url=["']([^"']+)["'][^>]+type=["']image/i);
  if (enclosureMatch) return enclosureMatch[1];
  
  // Try image tag
  const imgMatch = itemXml.match(/<image>[\s\S]*?<url>([^<]+)<\/url>/i);
  if (imgMatch) return imgMatch[1];
  
  // Try img tag in content
  const contentImgMatch = itemXml.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (contentImgMatch) return contentImgMatch[1];
  
  return null;
}

// Parse RSS items from XML text
function parseRSSItems(xml: string): Array<{ title: string; link: string; description: string; content: string; published: string; author: string | null; image: string | null }> {
  const items: Array<{ title: string; link: string; description: string; content: string; published: string; author: string | null; image: string | null }> = [];
  
  // Match all <item> blocks
  const itemRegex = /<item[\s\S]*?<\/item>/gi;
  const itemMatches = xml.match(itemRegex) || [];
  
  for (const itemXml of itemMatches) {
    const title = extractTag(itemXml, 'title');
    const link = extractTag(itemXml, 'link');
    
    if (!title || !link) continue;
    
    const description = extractTag(itemXml, 'description');
    const contentEncoded = extractTag(itemXml, 'content:encoded') || extractTag(itemXml, 'content');
    const content = contentEncoded || description;
    
    let published = new Date().toISOString();
    const pubDate = extractTag(itemXml, 'pubDate');
    if (pubDate) {
      try {
        published = new Date(pubDate).toISOString();
      } catch {
        // Keep default
      }
    }
    
    const author = extractTag(itemXml, 'author') || extractTag(itemXml, 'dc:creator') || null;
    const image = extractImage(itemXml);
    
    items.push({ title, link, description, content, published, author, image });
  }
  
  return items;
}

Deno.serve(async (req) => {
  // CORS preflight handler
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseKey) {
    return new Response(
      JSON.stringify({ 
        error: "Missing environment variables",
        details: "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set"
      }), 
      { status: 500, headers: corsHeaders }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const logs: string[] = [];

  try {
    // Fetch only active feeds
    const { data: feeds, error: feedsError } = await supabase
      .from("rss_feeds")
      .select("*")
      .eq("is_active", true);

    if (feedsError) {
      throw new Error(`Failed to fetch feeds: ${feedsError.message}`);
    }

    if (!feeds || feeds.length === 0) {
      logs.push("No active RSS feeds found in database");
      return new Response(
        JSON.stringify({ status: "ok", logs, articles_added: 0 }), 
        { status: 200, headers: corsHeaders }
      );
    }

    let totalArticlesAdded = 0;

    for (const feed of feeds as RSSFeed[]) {
      try {
        logs.push(`Fetching feed: ${feed.source} (${feed.url})`);
        
        const res = await fetch(feed.url, {
          headers: {
            "User-Agent": "Newsleak RSS Fetcher/1.0",
            "Accept": "application/rss+xml, application/xml, text/xml, */*"
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const xml = await res.text();
        const items = parseRSSItems(xml);
        
        logs.push(`Found ${items.length} items in feed`);

        let feedArticlesAdded = 0;

        for (const item of items) {
          try {
            const { error: insertError } = await supabase
              .from("news_articles")
              .upsert(
                {
                  feed_id: feed.id,
                  title: item.title,
                  link: item.link,
                  summary: item.description,
                  image: item.image,
                  source: feed.source,
                  published: item.published,
                  category: feed.category,
                },
                { onConflict: "link" }
              );

            if (insertError) {
              logs.push(`Error inserting article "${item.title}": ${insertError.message}`);
            } else {
              feedArticlesAdded++;
            }
          } catch (itemError) {
            logs.push(`Error processing item: ${itemError}`);
          }
        }

        totalArticlesAdded += feedArticlesAdded;
        logs.push(`Added ${feedArticlesAdded} articles from ${feed.source}`);

        // Update last_fetched timestamp
        await supabase
          .from("rss_feeds")
          .update({ 
            last_fetched: new Date().toISOString(),
            fetch_errors: 0,
            last_error: null
          })
          .eq("id", feed.id);

      } catch (feedError) {
        const errorMsg = `Failed to fetch/parse feed ${feed.source}: ${feedError}`;
        logs.push(errorMsg);
        
        // Update error count
        await supabase
          .from("rss_feeds")
          .update({ 
            fetch_errors: (feed.fetch_errors || 0) + 1,
            last_error: errorMsg
          })
          .eq("id", feed.id);
      }
    }

    logs.push(`Total articles processed: ${totalArticlesAdded}`);

    return new Response(
      JSON.stringify({ 
        status: "ok", 
        logs, 
        articles_added: totalArticlesAdded,
        feeds_processed: feeds.length 
      }), 
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    logs.push(`Fatal error: ${error}`);
    return new Response(
      JSON.stringify({ 
        status: "error", 
        error: String(error), 
        logs 
      }), 
      { status: 500, headers: corsHeaders }
    );
  }
});
