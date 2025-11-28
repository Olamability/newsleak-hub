import Rooms from "./pages/Rooms";
import AddFeed from "./pages/AddFeed";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ArticleDetail from "./pages/ArticleDetail";


import AdminDashboard from "./pages/admin/index";
import AdminLogin from "./pages/AdminLogin";
import AdminLoginPage from "./pages/admin/login";
import AdminSignup from "./pages/admin/signup";
import AdminAddFeed from "./pages/admin/add-feed";


import { AppProvider } from "@/context/AppContext";
import { NotificationsPlaceholder } from "@/components/NotificationsPlaceholder";



import Bookmarks from "./pages/Bookmarks";
import NotFound from "./pages/NotFound";

import UserLogin from "./pages/UserLogin";

const queryClient = new QueryClient();


// Remove ProtectedRoute and admin login logic since admin login is deleted



const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/article/:id" element={<ArticleDetail />} />
            <Route path="/login" element={<UserLogin />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/signup" element={<AdminSignup />} />
            <Route path="/admin/add-feed" element={<AdminAddFeed />} />
            <Route path="/add-feed" element={<AddFeed />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <NotificationsPlaceholder />
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
