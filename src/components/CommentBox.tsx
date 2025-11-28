import { useState } from 'react';

export default function CommentBox({ articleId }: { articleId: string }) {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<string[]>([]); // Replace with real fetch

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setComments([...comments, comment]);
    setComment('');
  };

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-2">Comments</h2>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          value={comment}
          onChange={e => setComment(e.target.value)}
          className="flex-1 border px-3 py-2 rounded"
          placeholder="Add a comment..."
        />
        <button type="submit" className="bg-primary text-white px-4 py-2 rounded">Post</button>
      </form>
      <ul className="space-y-2">
        {comments.map((c, i) => (
          <li key={i} className="border-b pb-2">{c}</li>
        ))}
      </ul>
    </div>
  );
}
