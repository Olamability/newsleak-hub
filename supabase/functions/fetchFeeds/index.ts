import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

serve(async (req) => {
  // CORS preflight handler
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*", // Or your frontend URL
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
      },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  const logs: string[] = [];

  const { data: feeds, error: feedsError } = await supabase
    .from("rss_feeds")
    .select("*");
  if (feedsError)
    return new Response(JSON.stringify({ error: feedsError.message }), {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
      },
    });

  for (const feed of feeds) {
    try {
      const res = await fetch(feed.url);
      const xml = await res.text();
      const items = Array.from(xml.matchAll(/<item>([\s\S]*?)<\/item>/g));
      for (const item of items) {
        const title = item[1].match(/<title>(.*?)<\/title>/)?.[1] ?? "";
        const link = item[1].match(/<link>(.*?)<\/link>/)?.[1] ?? "";
        const pubDate = item[1].match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? "";
        if (!title || !link) continue;

        await supabase.from("news_articles").upsert(
          {
            title,
            link,
            source: feed.source,
            category: feed.category,
            published: pubDate
              ? new Date(pubDate).toISOString()
              : new Date().toISOString(),
          },
          { onConflict: "link" }
        );
        logs.push(`Upserted: ${title}`);
      }
    } catch (e) {
      logs.push(`Failed to fetch or parse feed: ${feed.url} - ${e}`);
    }
  }

  return new Response(JSON.stringify({ status: "ok", logs }), {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
    },
  });
});