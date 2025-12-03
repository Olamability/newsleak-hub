// SEO Component for meta tags and structured data
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
  };
  noindex?: boolean;
}

export function SEO({
  title = 'Newsleak - Your Trusted News Aggregator',
  description = 'Stay informed with Newsleak. Get the latest news from trusted sources across Politics, Sports, Entertainment, Technology, and more.',
  image = '/og-image.png',
  url = typeof window !== 'undefined' ? window.location.href : 'https://newsleak.com',
  type = 'website',
  article,
  noindex = false,
}: SEOProps) {
  const siteName = 'Newsleak';
  const twitterHandle = '@newsleak';
  
  // Ensure URLs are absolute
  const absoluteUrl = url.startsWith('http') ? url : `https://newsleak.com${url}`;
  const absoluteImage = image.startsWith('http') ? image : `https://newsleak.com${image}`;
  
  // Generate structured data for articles
  const structuredData = type === 'article' && article ? {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: title,
    description: description,
    image: absoluteImage,
    datePublished: article.publishedTime,
    dateModified: article.modifiedTime || article.publishedTime,
    author: {
      '@type': 'Person',
      name: article.author || 'Newsleak Team',
    },
    publisher: {
      '@type': 'Organization',
      name: siteName,
      logo: {
        '@type': 'ImageObject',
        url: 'https://newsleak.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': absoluteUrl,
    },
    articleSection: article.section,
    keywords: article.tags?.join(', '),
  } : {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    description: description,
    url: absoluteUrl,
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absoluteImage} />
      <meta property="og:url" content={absoluteUrl} />
      <meta property="og:site_name" content={siteName} />
      
      {/* Article specific OG tags */}
      {type === 'article' && article && (
        <>
          {article.publishedTime && (
            <meta property="article:published_time" content={article.publishedTime} />
          )}
          {article.modifiedTime && (
            <meta property="article:modified_time" content={article.modifiedTime} />
          )}
          {article.author && (
            <meta property="article:author" content={article.author} />
          )}
          {article.section && (
            <meta property="article:section" content={article.section} />
          )}
          {article.tags?.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteImage} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={absoluteUrl} />
      
      {/* Structured Data (JSON-LD) */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
}

// Helper function to truncate description
export function truncateDescription(text: string, maxLength: number = 160): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

// Helper function to generate article SEO props
export function generateArticleSEO(article: {
  title: string;
  description?: string;
  content?: string;
  image?: string;
  published?: string;
  updated_at?: string;
  author?: string;
  source?: string;
  id: string;
}) {
  const description = truncateDescription(
    article.description || article.content || 'Read the full article on Newsleak',
    160
  );
  
  return {
    title: `${article.title} | Newsleak`,
    description,
    image: article.image || '/og-image.png',
    url: `/article/${article.id}`,
    type: 'article' as const,
    article: {
      publishedTime: article.published,
      modifiedTime: article.updated_at,
      author: article.author || article.source,
      section: 'News',
    },
  };
}

// Helper function to generate category SEO props
export function generateCategorySEO(category: string) {
  return {
    title: `${category} News | Newsleak`,
    description: `Latest ${category.toLowerCase()} news and updates. Stay informed with Newsleak's ${category.toLowerCase()} coverage.`,
    url: `/category/${category.toLowerCase()}`,
  };
}

// Helper function to generate search SEO props
export function generateSearchSEO(query: string) {
  return {
    title: `Search: ${query} | Newsleak`,
    description: `Search results for "${query}" on Newsleak`,
    url: `/search?q=${encodeURIComponent(query)}`,
    noindex: true, // Don't index search results
  };
}
