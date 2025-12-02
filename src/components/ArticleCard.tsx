import React, { useEffect, useState } from 'react';
import { likeArticle, getArticleLikes, hasUserLiked, unlikeArticle } from '@/lib/articleLikes';

interface ArticleCardProps {
  id: string;
  title: string;
  content: string;
}

const userId = 'demo-user-id'; // Replace with actual auth user id

export const ArticleCard: React.FC<ArticleCardProps> = ({ id, title, content }) => {
  const [likes, setLikes] = useState(0);
  const [alreadyLiked, setAlreadyLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchLikes() {
      setLoading(true);
      setLikes(await getArticleLikes(id));
      setAlreadyLiked(await hasUserLiked(id, userId));
      setLoading(false);
    }
    fetchLikes();
  }, [id]);

  const handleLike = async () => {
    setLoading(true);
    if (!alreadyLiked) {
      await likeArticle(id, userId);
      setAlreadyLiked(true);
      setLikes(likes + 1);
    } else {
      await unlikeArticle(id, userId);
      setAlreadyLiked(false);
      setLikes(likes - 1);
    }
    setLoading(false);
  };

  return (
    <div className="border rounded p-4 mb-4">
      <h2 className="text-lg font-bold mb-2">{title}</h2>
      <p className="mb-2">{content}</p>
      <div className="flex items-center gap-2">
        <button
          className={`px-3 py-1 rounded ${alreadyLiked ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-800'}`}
          onClick={handleLike}
          disabled={loading}
        >
          Like ❤️
        </button>
        <span>{likes} {likes === 1 ? 'Like' : 'Likes'}</span>
      </div>
    </div>
  );
};
