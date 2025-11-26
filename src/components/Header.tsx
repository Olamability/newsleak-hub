import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-9 w-9 block md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-primary">Newsleak</h1>
        </div>
        <nav>
          <Link
            to="/admin"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
};
