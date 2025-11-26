export interface NewsArticle {
  id: string;
  source: string;
  time: string;
  title: string;
  image: string;
  likes: number;
  comments: number;
  category: string;
  link?: string;
  content?: string;
  pubDate?: string;
}

export const mockNews: NewsArticle[] = [
  {
    id: "1",
    source: "News Hub Creator",
    time: "2h",
    title: "In Lagos State, Bandits Are Planning To Attack Shagamu, They Are Also Walking Around–Ayodele",
    image: "https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=400&auto=format&fit=crop",
    likes: 0,
    comments: 0,
    category: "For you"
  },
  {
    id: "2",
    source: "News Hub Creator",
    time: "1d",
    title: "Final Premier League Table after Man Utd lost 0-1 to 10-Men Everton today.",
    image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=400&auto=format&fit=crop",
    likes: 0,
    comments: 0,
    category: "Football"
  },
  {
    id: "3",
    source: "tori.ng",
    time: "20h",
    title: "They Killed You - Heartbroken Nigerian Man Mourns As His Fiancé Dies Just Weeks Before Their Wedding (Photos)",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&auto=format&fit=crop",
    likes: 0,
    comments: 18,
    category: "Entertainment"
  },
  {
    id: "4",
    source: "dailypost.ng",
    time: "1d",
    title: "2027: Before you speak, check the mirror – Atiku blasts Nigerian senator, Oshiomhole",
    image: "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=400&auto=format&fit=crop",
    likes: 0,
    comments: 75,
    category: "Politics"
  },
  {
    id: "5",
    source: "theportcitynews.com",
    time: "2d",
    title: "Popular Content Creator Passes Away",
    image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&auto=format&fit=crop",
    likes: 0,
    comments: 5,
    category: "Entertainment"
  },
  {
    id: "6",
    source: "SportsPulse",
    time: "3h",
    title: "Breaking: Manchester United Signs New Star Player in Record Deal",
    image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&auto=format&fit=crop",
    likes: 124,
    comments: 45,
    category: "Sports"
  },
  {
    id: "7",
    source: "TechDaily",
    time: "5h",
    title: "Apple Announces Revolutionary New iPhone with AI Integration",
    image: "https://images.unsplash.com/photo-1592286927505-c47c2f79279b?w=400&auto=format&fit=crop",
    likes: 89,
    comments: 32,
    category: "Technology"
  },
  {
    id: "8",
    source: "LifeStyle Magazine",
    time: "6h",
    title: "Top 10 Wellness Trends Taking Over 2025",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&auto=format&fit=crop",
    likes: 67,
    comments: 12,
    category: "Lifestyle"
  },
  {
    id: "9",
    source: "Business Insider",
    time: "4h",
    title: "Stock Market Reaches All-Time High Amid Economic Recovery",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&auto=format&fit=crop",
    likes: 156,
    comments: 89,
    category: "Business"
  },
  {
    id: "10",
    source: "Fashion Forward",
    time: "7h",
    title: "Paris Fashion Week 2025: The Most Stunning Runway Looks",
    image: "https://images.unsplash.com/photo-1558769132-cb1aea1f5615?w=400&auto=format&fit=crop",
    likes: 234,
    comments: 56,
    category: "Fashion&Beauty"
  }
];
