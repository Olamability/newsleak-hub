import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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

serve(async (req) => {
  // CORS preflight handler
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
      },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseKey) {
    return new Response(
      JSON.stringify({ 
        error: "Missing environment variables",
        details: "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set"
      }), 
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
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
      return new Response(JSON.stringify({ status: "ok", logs, articles_added: 0 }), {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      });
    }

    let totalArticlesAdded = 0;

    for (const feed of feeds as RSSFeed[]) {
      try {
        logs.push(`Fetching feed: ${feed.source} (${feed.url})`);
        
        const res = await fetch(feed.url, {
          headers: {
            "User-Agent": "Newsleak RSS Fetcher/1.0",
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const xml = await res.text();
        
        // Parse XML using DOMParser
        const parser = new DOMParser();
        const doc = parser.parseFromString(xml, "text/xml");

        if (!doc) {
          throw new Error("Failed to parse XML");
        }

        // Check for parse errors
        const parseError = doc.querySelector("parsererror");
        if (parseError) {
          throw new Error(`XML parse error: ${parseError.textContent}`);
        }

        // Get all item elements
        const items = doc.querySelectorAll("item");
        logs.push(`Found ${items.length} items in feed`);

        let feedArticlesAdded = 0;

        for (const item of Array.from(items)) {
          try {
            // Extract title
            const titleEl = item.querySelector("title");
            const title = titleEl?.textContent?.trim() || "";

            // Extract link
            const linkEl = item.querySelector("link");
            const link = linkEl?.textContent?.trim() || "";

            // Skip if no title or link
            if (!title || !link) {
              logs.push(`Skipping item: missing title or link`);
              continue;
            }

            // Extract description
            const descEl = item.querySelector("description");
            const description = descEl?.textContent?.trim() || "";

            // Extract content (for RSS 2.0 with content:encoded)
            // Try multiple approaches to find encoded content
            let contentEl = item.querySelector("encoded");
            if (!contentEl) {
              // Try with namespace prefix
              const encodedElements = item.getElementsByTagName("content:encoded");
              if (encodedElements.length > 0) {
                contentEl = encodedElements[0];
              }
            }
            const content = contentEl?.textContent?.trim() || description;

            // Extract publication date
            const pubDateEl = item.querySelector("pubDate");
            let published = new Date().toISOString();
            if (pubDateEl?.textContent) {
              try {
                published = new Date(pubDateEl.textContent).toISOString();
              } catch {
                // Keep default if date parsing fails
              }
            }

            // Extract author
            const authorEl = item.querySelector("author") || 
                           item.querySelector("dc\\:creator") ||
                           item.querySelector("creator");
            const author = authorEl?.textContent?.trim() || null;

            // Extract image from various sources
            let image = null;
            
            // Try media:content with namespace
            let mediaElements = item.getElementsByTagName("media:content");
            if (mediaElements.length > 0) {
              image = mediaElements[0].getAttribute("url");
            }
            
            // Try media:thumbnail with namespace
            if (!image) {
              mediaElements = item.getElementsByTagName("media:thumbnail");
              if (mediaElements.length > 0) {
                image = mediaElements[0].getAttribute("url");
              }
            }

            // Try enclosure
            if (!image) {
              const enclosure = item.querySelector("enclosure[url]");
              if (enclosure && enclosure.getAttribute("type")?.startsWith("image/")) {
                image = enclosure.getAttribute("url");
              }
            }

            // Upsert the article
            if (!feed.id) {
              logs.push(`Skipping article: feed missing ID`);
              continue;
            }

            const { error: insertError } = await supabase
              .from("news_articles")
              .upsert(
                {
                  feed_id: feed.id,
                  title,
                  link,
                  description,
                  content,
                  image,
                  source: feed.source,
                  author,
                  published,
                  category: feed.category,
                  is_published: true,
                },
                { onConflict: "link" }
              );

            if (insertError) {
              logs.push(`Error inserting article "${title}": ${insertError.message}`);
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
            fetch_errors: feed.fetch_errors ? feed.fetch_errors + 1 : 1,
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
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      }
    );

  } catch (error) {
    logs.push(`Fatal error: ${error}`);
    return new Response(
      JSON.stringify({ 
        status: "error", 
        error: String(error), 
        logs 
      }), 
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      }
    );
  }
});
