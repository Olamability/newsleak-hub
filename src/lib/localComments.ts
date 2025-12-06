// Local comments storage
export interface Comment {
  id: string;
  articleId: string;
  room: string;
  user: string;
  text: string;
  createdAt: string;
}

const COMMENTS_STORAGE_KEY = 'newsleak_comments';

function getCommentsData(): Comment[] {
  const stored = localStorage.getItem(COMMENTS_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveCommentsData(comments: Comment[]) {
  localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(comments));
}

export async function getComments(articleId: string, room: string): Promise<Comment[]> {
  const allComments = getCommentsData();
  return allComments
    .filter(c => c.articleId === articleId && c.room === room)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export async function addComment(comment: Omit<Comment, 'id' | 'createdAt'>) {
  const allComments = getCommentsData();
  
  const newComment: Comment = {
    ...comment,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  
  allComments.push(newComment);
  saveCommentsData(allComments);
  
  return newComment;
}

export async function getRooms(articleId: string): Promise<string[]> {
  const allComments = getCommentsData();
  const rooms = new Set(
    allComments
      .filter(c => c.articleId === articleId)
      .map(c => c.room)
  );
  
  const roomsList = Array.from(rooms);
  return roomsList.length > 0 ? roomsList : ['General'];
}

export async function addRoom(articleId: string, room: string) {
  // Rooms are created implicitly when comments are added
  // This function is kept for API compatibility
}
