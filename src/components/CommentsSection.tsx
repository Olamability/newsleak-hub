import { useState, useEffect } from "react";
import { getComments, addComment, getRooms } from "@/lib/localComments";
import { useAuth } from "@/components/AuthProvider";

interface CommentsSectionProps {
  articleId: string;
}


export const CommentsSection = ({ articleId }: CommentsSectionProps) => {
  const { user } = useAuth();
  const [room, setRoom] = useState('General');
  const [rooms, setRooms] = useState<string[]>(['General']);
  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [newRoom, setNewRoom] = useState("");
  const [showLoginMsg, setShowLoginMsg] = useState(false);

  // Load rooms and comments on mount or when articleId/room changes
  useEffect(() => {
    (async () => {
      const loadedRooms = await getRooms(articleId);
      setRooms(loadedRooms);
      setRoom(loadedRooms[0] || 'General');
    })();
  }, [articleId]);

  useEffect(() => {
    (async () => {
      const loadedComments = await getComments(articleId, room);
      setComments(loadedComments);
    })();
  }, [articleId, room]);

  // Change room
  const handleRoomChange = (r: string) => {
    setRoom(r);
  };

  // Add comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setShowLoginMsg(true);
      setTimeout(() => setShowLoginMsg(false), 2500);
      return;
    }
    if (!text.trim()) return;
    await addComment({ articleId, room, user: user.email || user.id, text });
    const loadedComments = await getComments(articleId, room);
    setComments(loadedComments);
    setText("");
  };

  // Add new room (implicit by adding a comment to it)
  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoom.trim() || rooms.includes(newRoom)) return;
    setRooms([...rooms, newRoom]);
    setRoom(newRoom);
    setNewRoom("");
    // No need to add a comment yet; comments will load when user posts
  };

  return (
    <section className="mt-10 border-t pt-8">
      <div className="flex flex-wrap gap-2 mb-4">
        {rooms.map((r) => (
          <button
            key={r}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${r === room ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-primary/10"}`}
            onClick={() => handleRoomChange(r)}
          >
            {r}
          </button>
        ))}
        <form onSubmit={handleAddRoom} className="flex gap-1">
          <input
            type="text"
            value={newRoom}
            onChange={e => setNewRoom(e.target.value)}
            placeholder="+ New Room"
            className="px-2 py-1 text-xs border rounded"
            style={{ width: 90 }}
          />
        </form>
      </div>
      <div className="mb-4">
        {comments.length === 0 ? (
          <div className="text-muted-foreground text-sm">No comments yet in this room.</div>
        ) : (
          <ul className="space-y-3">
            {comments.map((c) => (
              <li key={c.id} className="bg-muted rounded p-2">
                <div className="text-xs text-muted-foreground mb-1">{c.user} <span className="ml-2 text-[10px]">{new Date(c.created_at || c.createdAt).toLocaleString()}</span></div>
                <div className="text-sm">{c.text}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <form onSubmit={handleAddComment} className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={user ? user.email : ""}
            readOnly
            placeholder="Your email"
            className="px-2 py-1 text-xs border rounded w-32 bg-muted"
            disabled
          />
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={user ? "Add a comment..." : "Log in to comment"}
            className="flex-1 px-2 py-1 text-xs border rounded"
            disabled={!user}
          />
          <button type="submit" className="px-3 py-1 text-xs rounded bg-primary text-white hover:bg-primary/90" disabled={!user}>Post</button>
        </div>
      </form>
      {showLoginMsg && (
        <div className="text-xs text-destructive mb-2">Please log in to comment.</div>
      )}
    </section>
  );
}
