import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { CategoryNav } from "@/components/CategoryNav";
import { NewsCard } from "@/components/NewsCard";
import { mockNews } from "@/data/mockNews";

const Index = () => {
  const navigate = useNavigate();
  const [news] = useState(mockNews);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CategoryNav />
      
      <main className="max-w-4xl mx-auto">
        <div className="divide-y divide-border">
          {news.map((article) => (
            <NewsCard
              key={article.id}
              source={article.source}
              time={article.time}
              title={article.title}
              image={article.image}
              likes={article.likes}
              comments={article.comments}
              onClick={() => navigate("/article/1")}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Index;
