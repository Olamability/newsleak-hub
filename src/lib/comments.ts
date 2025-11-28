import { supabase } from './supabaseClient';
// src/lib/comments.ts
// MVP: LocalStorage-based comments and rooms for articles

export interface Comment {
  id: string;
  articleId: string;
  room: string; // e.g. 'General', 'Hot Takes'
  user: string;
  text: string;
  createdAt: string;
}

const COMMENTS_TABLE = 'comments';

export async function getComments(articleId: string, room: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from(COMMENTS_TABLE)
    .select('*')
    .eq('article_id', articleId)
    .eq('room', room)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function addComment(comment: Omit<Comment, 'id' | 'createdAt'>) {
  const newComment = {
    ...comment,
    created_at: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from(COMMENTS_TABLE)
    .insert(newComment)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getRooms(articleId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from(COMMENTS_TABLE)
    .select('room')
    .eq('article_id', articleId);
  if (error) throw error;
  const rooms: string[] = data ? Array.from(new Set(data.map((c: any) => c.room))) : [];
  return rooms.length ? rooms : ['General'];
}

export async function addRoom(articleId: string, room: string) {
  // No-op for Supabase, rooms are implicit by comments
}
