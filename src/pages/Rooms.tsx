import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { getRooms, getComments, addComment } from "@/lib/comments";
import { Button } from "@/components/ui/button";

export default function Rooms() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<string[]>([]);
  const [activeRoom, setActiveRoom] = useState<string>("");
  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const loadedRooms = await getRooms('');
        setRooms(loadedRooms);
        setActiveRoom(loadedRooms[0] || "");
      } catch (e: any) {
        setError(e.message || "Failed to load rooms");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!activeRoom) return;
    (async () => {
      setLoading(true);
      try {
        const loadedComments = await getComments(undefined, activeRoom);
        setComments(loadedComments);
      } catch (e: any) {
        setError(e.message || "Failed to load comments");
      } finally {
        setLoading(false);
      }
    })();
  }, [activeRoom]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!text.trim()) return;
    await addComment({ articleId: null, room: activeRoom, user: user.email || user.id, text });
    const loadedComments = await getComments(undefined, activeRoom);
    setComments(loadedComments);
    setText("");
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Community Rooms</h1>
      <div className="flex gap-2 mb-4 flex-wrap">
        {rooms.map(room => (
          <Button key={room} variant={room === activeRoom ? "default" : "outline"} onClick={() => setActiveRoom(room)}>
            {room}
          </Button>
        ))}
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
      {user ? (
        <form onSubmit={handleAddComment} className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 px-2 py-1 text-xs border rounded"
            required
          />
          <Button type="submit">Post</Button>
        </form>
      ) : (
        <div className="text-sm text-muted-foreground">Log in to join the conversation.</div>
      )}
    </div>
  );
}
