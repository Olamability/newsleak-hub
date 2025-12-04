-- Migration: Add category column to news_articles table
-- This fixes the issue where RSS feed articles couldn't be inserted due to missing category column

-- Add category column to news_articles table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'news_articles' 
    AND column_name = 'category'
  ) THEN
    ALTER TABLE public.news_articles ADD COLUMN category TEXT;
    RAISE NOTICE 'Added category column to news_articles table';
  ELSE
    RAISE NOTICE 'Category column already exists in news_articles table';
  END IF;
END $$;

-- Add index on category for better query performance
CREATE INDEX IF NOT EXISTS idx_news_articles_category ON public.news_articles(category);

COMMENT ON COLUMN public.news_articles.category IS 'Article category (e.g., Technology, Sports, Politics)';
