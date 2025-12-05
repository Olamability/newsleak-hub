import Rooms from "./pages/Rooms";
import AddFeed from "./pages/AddFeed";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ArticleDetail from "./pages/ArticleDetail";
import Search from "./pages/Search";
import Trending from "./pages/Trending";
import UserSettings from "./pages/UserSettings";


import AdminDashboard from "./pages/admin/index";
import AdminAnalytics from "./pages/admin/analytics";
import AdminLogin from "./pages/AdminLogin";
import AdminLoginPage from "./pages/admin/login";
import AdminSignup from "./pages/admin/signup";
import AdminAddFeed from "./pages/admin/add-feed";
import AdminNotifications from "./pages/admin/notifications";
import AdminUserManagement from "./pages/admin/user-management";
import AdminArticleManagement from "./pages/admin/article-management";

import { AppProvider } from "@/context/AppContext";
import { NotificationsPlaceholder } from "@/components/NotificationsPlaceholder";



import Bookmarks from "./pages/Bookmarks";
import NotFound from "./pages/NotFound";

import UserLogin from "./pages/UserLogin";
import UserSignup from "./pages/signup";
import ForgotPassword from "./pages/forgot-password";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import Onboarding from "./pages/Onboarding";

// Configure React Query with optimized defaults to prevent over-firing requests
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // Cache for 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnReconnect: false, // Don't refetch on reconnect
      retry: 1, // Only retry once on failure
    },
  },
});


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
            <Route path="/search" element={<Search />} />
            <Route path="/trending" element={<Trending />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/settings" element={<UserSettings />} />
            <Route path="/article/:id" element={<ArticleDetail />} />
            <Route path="/login" element={<UserLogin />} />
            <Route path="/signup" element={<UserSignup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/signup" element={<AdminSignup />} />
            <Route path="/admin/add-feed" element={<AdminAddFeed />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/notifications" element={<AdminNotifications />} />
            <Route path="/admin/users" element={<AdminUserManagement />} />
            <Route path="/admin/articles" element={<AdminArticleManagement />} />
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
