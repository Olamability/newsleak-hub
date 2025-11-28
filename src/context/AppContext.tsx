import React, { createContext, useContext, useState, useEffect } from "react";
import { getLocalBookmarks, addLocalBookmark, removeLocalBookmark } from "@/utils/localBookmarks";
import { loadFeeds } from "@/lib/feedStorage";
import { useAuth } from "@/components/AuthProvider";

const AppContext = createContext({
  bookmarks: [],
  addBookmark: (article: any) => {},
  removeBookmark: (id: string) => {},
  feeds: [],
  refreshFeeds: () => {},
});

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [feeds, setFeeds] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      // Optionally: fetch bookmarks from Supabase here if needed
      setBookmarks([]); // Placeholder for Supabase bookmarks
    } else {
      setBookmarks(getLocalBookmarks());
    }
  }, [user]);

  const addBookmarkCtx = (article: any) => {
    if (user) {
      // Optionally: add to Supabase
    } else {
      addLocalBookmark(article);
      setBookmarks(getLocalBookmarks());
    }
  };

  const removeBookmarkCtx = (id: string) => {
    if (user) {
      // Optionally: remove from Supabase
    } else {
      removeLocalBookmark(id);
      setBookmarks(getLocalBookmarks());
    }
  };

  const refreshFeeds = async () => {
    if (user) {
      const loaded = await loadFeeds(user.id);
      setFeeds(loaded);
    } else {
      setFeeds([]);
    }
  };

  useEffect(() => {
    refreshFeeds();
    // eslint-disable-next-line
  }, [user]);

  return (
    <AppContext.Provider value={{ bookmarks, addBookmark: addBookmarkCtx, removeBookmark: removeBookmarkCtx, feeds, refreshFeeds }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
