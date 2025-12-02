import { supabase } from '../supabaseClient';

export async function likeArticle(articleId: string, userId: string): Promise<void> {
  await supabase.from('article_likes').insert({
    article_id: articleId,
    user_id: userId,
    created_at: new Date().toISOString(),
  });
}

export async function getArticleLikes(articleId: string): Promise<number> {
  const { count, error } = await supabase
    .from('article_likes')
    .select('*', { count: 'exact', head: true })
    .eq('article_id', articleId);
  if (error) throw error;
  return count || 0;
}

export async function hasUserLiked(articleId: string, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('article_likes')
    .select('id')
    .eq('article_id', articleId)
    .eq('user_id', userId);
  if (error) throw error;
  return !!(data && data.length);
}

export async function unlikeArticle(articleId: string, userId: string): Promise<void> {
  await supabase
    .from('article_likes')
    .delete()
    .eq('article_id', articleId)
    .eq('user_id', userId);
}
