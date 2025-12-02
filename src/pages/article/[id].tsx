import { useParams } from 'react-router-dom';
import { useArticle } from '@/hooks/useNews';
import CommentBox from '@/components/CommentBox';

export default function ArticleDetail() {
  const { id } = useParams();
  const { data: article, isLoading: loading } = useArticle(id);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!article) return <div className="p-8">Article not found.</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">{article.title}</h1>
      <div className="text-muted-foreground mb-4">{article.source} | {article.category}</div>
      {article.image && <img src={article.image} alt="" className="w-full rounded mb-4" />}
      <div className="mb-6">{article.summary}</div>
      <CommentBox articleId={article.id} />
    </div>
  );
}
