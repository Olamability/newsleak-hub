import { useNavigate } from "react-router-dom";
import { ArrowLeft, Share2, Facebook, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";

const ArticleDetail = () => {
  const navigate = useNavigate();

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
            <div className="text-sm text-muted-foreground mb-2">
              <span className="font-medium">dailypost.ng</span>
              <span className="mx-2">·</span>
              <span>1d</span>
            </div>
            <h1 className="text-3xl font-bold mb-4">
              2027: Before you speak, check the mirror – Atiku blasts Nigerian senator, Oshiomhole
            </h1>
          </div>

          <div className="w-full h-64 md:h-96 rounded-lg overflow-hidden mb-6 bg-muted">
            <img
              src="https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&auto=format&fit=crop"
              alt="Article"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="prose max-w-none mb-8">
            <p className="text-base leading-relaxed mb-4">
              Former Vice President Atiku Abubakar has responded to Edo North Senator Adams Oshiomhole, 
              who criticised him as he prepares to contest the 2027 presidential election under the African 
              Democratic Congress ADC.
            </p>
            <p className="text-base leading-relaxed mb-4">
              In a statement by Atiku's spokesperson, Phrank Shaibu, the former governor was advised to 
              first look at himself in a mirror before speaking.
            </p>
            <p className="text-base leading-relaxed">
              The statement highlighted various controversies and challenges that have marked Oshiomhole's 
              political career, suggesting he should reflect on his own record before criticizing others.
            </p>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-sm font-semibold mb-4">Share this story</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
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
