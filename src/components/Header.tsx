import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";

import { useEffect, useState } from "react";

export const Header = ({ siteName, favicon }: { siteName?: string; favicon?: string }) => {
  const { user, signOut, loading } = useAuth();
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
        {/* No admin or logout controls for regular users */}
      </div>
    </header>
  );
};
