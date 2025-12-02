import { Menu, Search, TrendingUp, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";

import { useEffect, useState } from "react";

export const Header = ({ siteName, favicon }: { siteName?: string; favicon?: string }) => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-9 w-9 block md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          {favicon && (
            <img src={favicon} alt="site icon" className="w-6 h-6 rounded mr-2" />
          )}
          <Link to="/" className="text-xl font-bold text-primary hover:underline focus:underline outline-none">
            {siteName || "Newsleak"}
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9"
            onClick={() => navigate("/trending")}
            aria-label="Trending"
          >
            <TrendingUp className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9"
            onClick={() => navigate("/search")}
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9"
            onClick={() => navigate("/bookmarks")}
            aria-label="Bookmarks"
          >
            <Bookmark className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};
