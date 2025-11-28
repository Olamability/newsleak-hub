
import { RSSFeed } from './rssParser';
import { supabase } from './supabaseClient';

// All feed functions are now async and operate on the 'feeds' table in Supabase
// Each feed row: id, name, url, category, enabled, user_id, lastFetched

export const loadFeeds = async (userId: string): Promise<RSSFeed[]> => {
  const { data, error } = await supabase
    .from('feeds')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
};

export const addFeed = async (feed: Omit<RSSFeed, 'id'>, userId: string): Promise<void> => {
  const { error } = await supabase
    .from('feeds')
    .insert([{ ...feed, user_id: userId }]);
  if (error) throw error;
};

export const updateFeed = async (id: string, updates: Partial<RSSFeed>, userId: string): Promise<void> => {
  const { error } = await supabase
    .from('feeds')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
};

export const deleteFeed = async (id: string, userId: string): Promise<void> => {
  const { error } = await supabase
    .from('feeds')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
};


