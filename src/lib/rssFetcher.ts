import { supabase } from './supabaseClient';

export async function fetchFeeds() {
  // This should call the Supabase Edge Function to fetch and ingest RSS feeds
  const { data, error } = await supabase.functions.invoke('fetchFeeds');
  if (error) throw error;
  return data;
}
