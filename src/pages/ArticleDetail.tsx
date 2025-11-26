
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Share2, Facebook, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { useEffect, useState } from "react";
import { loadArticles } from "@/lib/feedStorage";


const ArticleDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [article, setArticle] = useState<any>(null);

  useEffect(() => {
    const articles = loadArticles();
    // id param may be string, match with article.id
    const found = articles.find((a) => a.id === id);
    setArticle(found);
  }, [id]);

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-3xl mx-auto px-4 py-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to feed
          </Button>
          <div className="text-center text-muted-foreground py-12">Article not found.</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to feed
        </Button>
        <article>
          <div className="mb-4">
            <div className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
              {article.favicon && (
                <img src={article.favicon} alt="site logo" className="w-4 h-4 rounded mr-1 inline-block align-middle" />
              )}
              <span className="font-medium">{article.source}</span>
              <span className="mx-2">·</span>
              <span>{article.time}</span>
            </div>
            <h1 className="text-3xl font-bold mb-4">
              {article.title}
            </h1>
          </div>
          <div className="w-full h-64 md:h-96 rounded-lg overflow-hidden mb-6 bg-muted">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="prose max-w-none mb-8">
            {/* Render HTML content safely */}
            <div dangerouslySetInnerHTML={{ __html: article.content || "" }} />
            {article.link && (
              <div className="mt-4">
                <a
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary font-medium hover:underline"
                >
                  Read More
                </a>
              </div>
            )}
          </div>
          <div className="border-t pt-6">
            <h3 className="text-sm font-semibold mb-4">Share this story</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href={article.link} target="_blank" rel="noopener noreferrer">
                  <Share2 className="h-4 w-4 mr-2" />
                  Visit Source
                </a>
              </Button>
              <Button variant="outline" size="sm">
                <Facebook className="h-4 w-4 mr-2" />
                Facebook
              </Button>
              <Button variant="outline" size="sm">
                <Twitter className="h-4 w-4 mr-2" />
                Twitter
              </Button>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
};

export default ArticleDetail;
