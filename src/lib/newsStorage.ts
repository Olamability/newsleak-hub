import { createClient } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';

export interface NewsArticle {
  id: string;
  title: string;
  link: string;
  image?: string;
  source: string;
  category: string;
  published: string;
  summary?: string;
  favicon?: string;
}

const NEWS_TABLE = 'news_articles';

export async function loadNews(): Promise<NewsArticle[]> {
  const { data, error } = await supabase
    .from(NEWS_TABLE)
    .select('*')
    .order('published', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function addNews(article: NewsArticle, userId: string) {
  const { error } = await supabase
    .from(NEWS_TABLE)
    .insert([{ ...article, user_id: userId }]);
  if (error) throw error;
}

export async function deleteNews(id: string, userId: string) {
  const { error } = await supabase
    .from(NEWS_TABLE)
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function updateNews(id: string, updates: Partial<NewsArticle>, userId: string) {
  const { error } = await supabase
    .from(NEWS_TABLE)
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
}
