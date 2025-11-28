import { supabase } from './supabaseClient';
import { NewsArticle } from './newsStorage';

const BOOKMARKS_TABLE = 'news_bookmarks';


export async function getBookmarks(userId: string): Promise<NewsArticle[]> {
  const { data, error } = await supabase
    .from(BOOKMARKS_TABLE)
    .select('article')
    .eq('user_id', userId);
  if (error) throw error;
  return data ? data.map((row: any) => row.article) : [];
}

export async function isBookmarked(id: string, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from(BOOKMARKS_TABLE)
    .select('id')
    .eq('user_id', userId)
    .eq('article_id', id)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return !!data;
}

export async function addBookmark(article: NewsArticle, userId: string) {
  const { error } = await supabase
    .from(BOOKMARKS_TABLE)
    .insert({
      user_id: userId,
      article_id: article.id,
      article
    });
  if (error) throw error;
}

export async function removeBookmark(id: string, userId: string) {
  const { error } = await supabase
    .from(BOOKMARKS_TABLE)
    .delete()
    .eq('user_id', userId)
    .eq('article_id', id);
  if (error) throw error;
}
