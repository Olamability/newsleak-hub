import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { NewsCard } from "@/components/NewsCard";
import { useEnrichedNews } from "@/hooks/useNews";
import { useArticleLikes, useBookmarks } from "@/hooks/useBatchedData";
import { useAuth } from "@/components/AuthProvider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categories = [
  "All",
  "Latest",
  "Football",
  "Entertainment",
  "Politics",
  "Sports",
  "Lifestyle",
  "Fashion&Beauty",
  "Technology",
  "Business"
];

const Search = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "All");
  const { data: allNews = [], isLoading: loading } = useEnrichedNews();
  const [filteredNews, setFilteredNews] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  // Batch fetch likes and bookmarks for filtered articles
  const articleIds = filteredNews.map(article => article.id);
  const { data: batchedLikes = {} } = useArticleLikes(articleIds);
  const { data: batchedBookmarks = {} } = useBookmarks(articleIds, user?.id);

  useEffect(() => {
    const q = searchParams.get("q") || "";
    const cat = searchParams.get("category") || "All";
    setQuery(q);
    setSelectedCategory(cat);
    performSearch(q, cat);
  }, [searchParams, allNews]);

  const performSearch = (searchQuery: string, category: string) => {
    if (!searchQuery.trim() && category === "All") {
      setFilteredNews([]);
      return;
    }

    let results = allNews;

    // Filter by category
    if (category !== "All") {
      results = results.filter(article => article.category === category);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      results = results.filter(article =>
        article.title?.toLowerCase().includes(lowerQuery) ||
        article.content?.toLowerCase().includes(lowerQuery) ||
        article.source?.toLowerCase().includes(lowerQuery)
      );
    }

    setFilteredNews(results);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query);
    if (selectedCategory !== "All") params.set("category", selectedCategory);
    setSearchParams(params);
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    
    // Generate suggestions
    if (value.trim().length > 1) {
      const lowerValue = value.toLowerCase();
      const titleSuggestions = allNews
        .filter(article => article.title?.toLowerCase().includes(lowerValue))
        .map(article => article.title)
        .slice(0, 5);
      setSuggestions(titleSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setSuggestions([]);
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-background">
      <Header siteName="Newsleak" />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4">Search News</h1>
          
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search for news..."
                value={query}
                onChange={(e) => handleInputChange(e.target.value)}
                className="w-full pr-20"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                {query && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearSearch}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                <Button type="submit" size="sm" className="h-8">
                  <SearchIcon className="h-4 w-4" />
                </Button>
              </div>

              {/* Auto-suggestions */}
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-10">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      className="w-full text-left px-4 py-2 hover:bg-muted transition-colors text-sm"
                      onClick={() => {
                        setQuery(suggestion);
                        setSuggestions([]);
                        const params = new URLSearchParams();
                        params.set("q", suggestion);
                        if (selectedCategory !== "All") params.set("category", selectedCategory);
                        setSearchParams(params);
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4 items-center">
              <label className="text-sm font-medium">Filter by category:</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </form>
        </div>

        <div className="mb-4">
          {searchParams.get("q") || selectedCategory !== "All" ? (
            <p className="text-sm text-muted-foreground">
              {filteredNews.length} result{filteredNews.length !== 1 ? "s" : ""} found
              {searchParams.get("q") && ` for "${searchParams.get("q")}"`}
              {selectedCategory !== "All" && ` in ${selectedCategory}`}
            </p>
          ) : null}
        </div>

        <div className="divide-y divide-border">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4 p-4">
                <Skeleton className="w-24 h-24 rounded-lg shrink-0" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))
          ) : filteredNews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-2">
                {searchParams.get("q") || selectedCategory !== "All" 
                  ? "No articles found matching your search" 
                  : "Enter a search term to find articles"}
              </p>
            </div>
          ) : (
            filteredNews.map((article) => (
              <NewsCard
                key={article.id}
                id={article.id}
                source={article.source}
                time={article.time}
                title={article.title}
                image={article.image}
                likes={article.likes || 0}
                comments={article.comments || 0}
                favicon={article.favicon}
                content={article.content}
                link={article.link}
                article={article}
                batchedLikes={batchedLikes[article.id]}
                batchedBookmark={batchedBookmarks[article.id]}
                onClick={() => navigate(`/article/${article.id}`)}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Search;
