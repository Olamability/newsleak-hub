
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Share2, Facebook, Twitter } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";

import { useEffect, useState } from "react";
import { loadNews } from "@/lib/newsStorage";
import { useAuth } from "@/components/AuthProvider";
import { CommentsSection } from "@/components/CommentsSection";
import { Skeleton } from "@/components/ui/skeleton";


const ArticleDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [article, setArticle] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();


  useEffect(() => {
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const articles = await loadNews();
        const found = articles.find((a: any) => a.id === id);
        setArticle(found || null);
        setLoading(false);
      } catch (e) {
        setError("Failed to load article.");
        setLoading(false);
      }
    })();
  }, [id]);


  if (loading) {
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
            Back
          </Button>
          <article aria-busy="true" aria-label="Loading article details">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="w-4 h-4 rounded mr-1" />
                <Skeleton className="w-20 h-4" />
                <span className="mx-2">·</span>
                <Skeleton className="w-12 h-4" />
              </div>
              <Skeleton className="h-8 w-3/4 mb-4" />
            </div>
            <Skeleton className="w-full h-64 md:h-96 rounded-lg mb-6" />
            <div className="prose max-w-none mb-8">
              <Skeleton className="h-5 w-full mb-2" />
              <Skeleton className="h-5 w-2/3 mb-2" />
              <Skeleton className="h-5 w-1/2" />
            </div>
            <div className="border-t pt-6">
              <Skeleton className="h-6 w-32 mb-2" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </article>
        </main>
      </div>
    );
  }

  if (error || !article) {
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
            Back
          </Button>
          <div className="text-center text-destructive py-12" role="alert" aria-live="assertive">
            {error || "Article not found."}
          </div>
        </main>
      </div>
    );
  }

  // Build share URLs and meta tags only after article is loaded
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = encodeURIComponent(article.title);
  const shareUrl = encodeURIComponent(pageUrl);
  const twitterShare = `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`;
  const facebookShare = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{article.title} | Newsleak</title>
        <meta name="description" content={article.content?.slice(0, 160) || article.title} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.content?.slice(0, 160) || article.title} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={article.image} />
        <meta property="og:url" content={pageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.content?.slice(0, 160) || article.title} />
        <meta name="twitter:image" content={article.image} />
      </Helmet>
  <Header siteName="Newsleak" />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <article>
          <div className="mb-4">
            <div className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
              <span className="font-medium">{
                (() => {
                  // Always prefer a real source, but fallback to domain if missing or 'Unknown Source'
                  let source = '';
                  if (article.source && article.source !== 'Unknown Source') source = article.source;
                  else if (article.feed_source) source = article.feed_source;
                  else if (article.site) source = article.site;
                  if ((!source || source.trim().toLowerCase().includes('unknown')) && article.link) {
                    try {
                      const url = new URL(article.link);
                      source = url.hostname.replace(/^www\./, '');
                    } catch {}
                  }
                  return source;
                })()
              }</span>
              <span className="mx-2">·</span>
              <span>{article.time}</span>
            </div>
            <h1 className="text-3xl font-bold mb-4">
              {article.title}
            </h1>
          </div>
          {article.image && (
            <div className="w-full aspect-video rounded-lg overflow-hidden mb-6 bg-muted flex items-center justify-center">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}
          <div className="prose max-w-none mb-8">
            {/* Show only a preview/snippet, not full article, and render HTML safely */}
            {(() => {
              const html = article.summary || article.content || '';
              // Extract only the first paragraph
              const matches = html.match(/<p>([\s\S]*?)<\/p>/i);
              if (matches && matches.length > 0) {
                return <div dangerouslySetInnerHTML={{ __html: matches[0] }} />;
              } else {
                // Fallback: show first 200 chars, no HTML
                return <div>{(html.replace(/<[^>]+>/g, '').slice(0, 200)) + (html.length > 200 ? '...' : '')}</div>;
              }
            })()}
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
              <Button variant="outline" size="sm" asChild>
                <a href={facebookShare} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook">
                  <Facebook className="h-4 w-4 mr-2" />
                  Facebook
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={twitterShare} target="_blank" rel="noopener noreferrer" aria-label="Share on Twitter">
                  <Twitter className="h-4 w-4 mr-2" />
                  Twitter
                </a>
              </Button>
            </div>
          </div>
        </article>
        {article.id && (
          <CommentsSection articleId={article.id} />
        )}
      </main>
    </div>
  );
};

export default ArticleDetail;
