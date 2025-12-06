

import { RSSFeed } from './rssParser';
import { supabase } from './supabaseClient';

// All feed functions now operate on the 'rss_feeds' table in Supabase
// Each feed row: id, source, url, category, is_active, description, logo_url, website_url, etc.

export const loadFeeds = async (): Promise<RSSFeed[]> => {
  const { data, error } = await supabase
    .from('rss_feeds')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
};

export const addFeed = async (feed: Omit<RSSFeed, 'id'>): Promise<void> => {
  // Map 'name' to 'source' for compatibility
  const { error } = await supabase
    .from('rss_feeds')
    .insert([{ 
      source: feed.name || feed.source, 
      url: feed.url, 
      category: feed.category, 
      is_active: true, 
      description: feed.description || '',
      logo_url: feed.logo_url || null,
      website_url: feed.website_url || null
    }]);
  if (error) throw error;
};

export const updateFeed = async (id: string, updates: Partial<RSSFeed>): Promise<void> => {
  // Map 'name' to 'source' if present
  const mappedUpdates = { ...updates };
  if ('name' in mappedUpdates) {
    mappedUpdates.source = mappedUpdates.name;
    delete mappedUpdates.name;
  }
  const { error } = await supabase
    .from('rss_feeds')
    .update(mappedUpdates)
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


