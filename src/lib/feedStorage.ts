import { RSSFeed } from './rssParser';
import { supabase } from './supabaseClient';

// All feed functions now operate on the 'rss_feeds' table in Supabase

export const loadFeeds = async (): Promise<RSSFeed[]> => {
  const { data, error } = await supabase
    .from('rss_feeds')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  
  // Map database fields to RSSFeed interface
  return (data || []).map((row: any) => ({
    id: row.id,
    name: row.source || row.name || '',
    url: row.url,
    category: row.category,
    enabled: row.is_active ?? true,
    lastFetched: row.last_fetched,
    source: row.source,
    description: row.description,
    logo_url: row.logo_url,
    website_url: row.website_url,
    favicon: row.favicon,
  }));
};

export const addFeed = async (feed: Omit<RSSFeed, 'id'>): Promise<void> => {
  const { error } = await supabase
    .from('rss_feeds')
    .insert([{ 
      source: feed.name || feed.source || '', 
      url: feed.url, 
      category: feed.category, 
      is_active: feed.enabled ?? true, 
      description: feed.description || '',
      logo_url: feed.logo_url || null,
      website_url: feed.website_url || null
    }]);
  if (error) throw error;
};

export const updateFeed = async (id: string, updates: Partial<RSSFeed>): Promise<void> => {
  // Map RSSFeed fields to database fields
  const dbUpdates: Record<string, any> = {};
  
  if (updates.name !== undefined) dbUpdates.source = updates.name;
  if (updates.source !== undefined) dbUpdates.source = updates.source;
  if (updates.url !== undefined) dbUpdates.url = updates.url;
  if (updates.category !== undefined) dbUpdates.category = updates.category;
  if (updates.enabled !== undefined) dbUpdates.is_active = updates.enabled;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.logo_url !== undefined) dbUpdates.logo_url = updates.logo_url;
  if (updates.website_url !== undefined) dbUpdates.website_url = updates.website_url;
  
  const { error } = await supabase
    .from('rss_feeds')
    .update(dbUpdates)
    .eq('id', id);
  if (error) throw error;
};

export const deleteFeed = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('rss_feeds')
    .delete()
    .eq('id', id);
  if (error) throw error;
};
