import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// CORS proxy for fetching RSS feeds and pages
const CORS_PROXY = 'https://corsproxy.io/?';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const logs: string[] = [];

  try {
    // 1. Get all RSS feeds
    const { data: feeds, error: feedsError } = await supabase
      .from("rss_feeds")
      .select("*");
    
    if (feedsError) {
      throw new Error(`Failed to fetch feeds: ${feedsError.message}`);
    }

    logs.push(`Found ${feeds?.length || 0} feeds to process`);

    // 2. For each feed, fetch and parse RSS
    for (const feed of feeds || []) {
      try {
        logs.push(`Processing feed: ${feed.source} (${feed.url})`);
        
        const res = await fetch(`${CORS_PROXY}${feed.url}`);
        const xmlText = await res.text();
        
        // Parse XML using DOMParser
        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlText, "text/xml");
        
        // Get items
        const items = Array.from(xml.querySelectorAll("item"));
        logs.push(`  Found ${items.length} items in feed`);
        
        let upsertedCount = 0;
        
        for (const item of items) {
          try {
            const title = item.querySelector("title")?.textContent || "";
            const link = item.querySelector("link")?.textContent?.trim() || "";
            const pubDateStr = item.querySelector("pubDate")?.textContent || "";
            
            if (!title || !link) {
              continue; // Skip items without title or link
            }
            
            // Extract image using multiple strategies
            const image = await extractImage(item, link);
            
            // Extract content/summary
            let summary = "";
            const contentEncoded = item.querySelector("content\\:encoded");
            if (contentEncoded && contentEncoded.textContent) {
              summary = contentEncoded.textContent.substring(0, 500);
            } else if (item.querySelector("description")?.textContent) {
              summary = item.querySelector("description")!.textContent.substring(0, 500);
            }
            
            // Prepare article data
            const articleData = {
              title,
              link,
              source: feed.source,
              category: feed.category || "General",
              published: pubDateStr ? new Date(pubDateStr).toISOString() : new Date().toISOString(),
              summary,
              image: image || null, // Store null if no image found (will use fallback in UI)
              feed_id: feed.id,
            };
            
            // Upsert article (use link as unique constraint)
            const { error: upsertError } = await supabase
              .from("news_articles")
              .upsert(articleData, { 
                onConflict: "link",
                ignoreDuplicates: false 
              });
            
            if (upsertError) {
              logs.push(`  Error upserting article "${title.substring(0, 50)}...": ${upsertError.message}`);
            } else {
              upsertedCount++;
            }
          } catch (itemError) {
            logs.push(`  Error processing item: ${itemError.message}`);
          }
        }
        
        logs.push(`  Successfully upserted ${upsertedCount} articles from ${feed.source}`);
        
        // Update feed's last_fetched timestamp
        await supabase
          .from("rss_feeds")
          .update({ last_fetched: new Date().toISOString() })
          .eq("id", feed.id);
          
      } catch (feedError) {
        logs.push(`Failed to process feed ${feed.source}: ${feedError.message}`);
      }
    }
    
    return new Response(
      JSON.stringify({ 
        status: "ok", 
        message: "Feeds processed successfully",
        logs 
      }), 
      { 
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*' 
        } 
      }
    );
    
  } catch (error) {
    logs.push(`Error: ${error.message}`);
    return new Response(
      JSON.stringify({ 
        status: "error",
        error: error.message,
        logs 
      }), 
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*' 
        } 
      }
    );
  }
});

/**
 * Extract image from RSS item using multiple strategies
 */
async function extractImage(item: Element, link: string): Promise<string> {
  // Strategy 1: media:content
  const mediaContent = item.querySelector("media\\:content");
  if (mediaContent?.getAttribute("url")) {
    return mediaContent.getAttribute("url")!;
  }
  
  // Strategy 2: media:thumbnail
  const mediaThumbnail = item.querySelector("media\\:thumbnail");
  if (mediaThumbnail?.getAttribute("url")) {
    return mediaThumbnail.getAttribute("url")!;
  }
  
  // Strategy 3: enclosure
  const enclosure = item.querySelector("enclosure");
  if (enclosure?.getAttribute("url")) {
    const enclosureType = enclosure.getAttribute("type") || "";
    if (enclosureType.startsWith("image/")) {
      return enclosure.getAttribute("url")!;
    }
  }
  
  // Strategy 4: og:image or img in content/description
  const contentEncoded = item.querySelector("content\\:encoded")?.textContent;
  const description = item.querySelector("description")?.textContent;
  const html = contentEncoded || description || "";
  
  // Try og:image meta tag
  const ogImgMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"'>]+)["']/i);
  if (ogImgMatch) {
    return ogImgMatch[1];
  }
  
  // Try img src
  const imgMatch = html.match(/<img[^>]+src=["']([^"'>]+)["']/i);
  if (imgMatch && !imgMatch[1].includes('1x1') && !imgMatch[1].includes('spacer')) {
    return imgMatch[1];
  }
  
  // Strategy 5: Fetch og:image from actual page (expensive, use sparingly)
  // Only do this for important articles (uncomment if needed)
  /*
  if (link) {
    try {
      const pageRes = await fetch(`${CORS_PROXY}${link}`);
      const pageHtml = await pageRes.text();
      const pageOgMatch = pageHtml.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"'>]+)["']/i);
      if (pageOgMatch) {
        return pageOgMatch[1];
      }
    } catch {
      // Ignore fetch errors
    }
  }
  */
  
  return ""; // No image found
}
