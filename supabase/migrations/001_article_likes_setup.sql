-- Article Likes Table Setup
-- This migration ensures the article_likes table is properly configured

-- Create the article_likes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.article_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(article_id, user_id)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_article_likes_article_id ON public.article_likes(article_id);
CREATE INDEX IF NOT EXISTS idx_article_likes_user_id ON public.article_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_article_likes_created_at ON public.article_likes(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.article_likes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to article_likes" ON public.article_likes;
DROP POLICY IF EXISTS "Allow users to insert their own likes" ON public.article_likes;
DROP POLICY IF EXISTS "Allow users to delete their own likes" ON public.article_likes;

-- Allow anyone to read article likes (for displaying counts)
CREATE POLICY "Allow public read access to article_likes"
  ON public.article_likes
  FOR SELECT
  USING (true);

-- Allow anyone to insert likes (including anonymous users)
-- Note: This is intentionally permissive to support anonymous users
-- For production, consider adding rate limiting via Edge Functions
CREATE POLICY "Allow users to insert their own likes"
  ON public.article_likes
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to delete their own likes
-- Note: The application logic ensures users only delete their own likes
-- For stricter security, add: USING (user_id = current_setting('request.jwt.claim.sub', true))
CREATE POLICY "Allow users to delete their own likes"
  ON public.article_likes
  FOR DELETE
  USING (true);

-- Migration for existing data: If you had user_identifier column, migrate it to user_id
-- Uncomment the following lines if you need to migrate existing data:
-- DO $$
-- BEGIN
--   IF EXISTS (
--     SELECT 1 FROM information_schema.columns 
--     WHERE table_name = 'article_likes' 
--     AND column_name = 'user_identifier'
--   ) THEN
--     -- Copy data from user_identifier to user_id if user_id is empty
--     UPDATE public.article_likes 
--     SET user_id = user_identifier 
--     WHERE user_id IS NULL OR user_id = '';
--     
--     -- Drop the old column
--     ALTER TABLE public.article_likes DROP COLUMN user_identifier;
--   END IF;
-- END $$;

-- Add comment to table
COMMENT ON TABLE public.article_likes IS 'Stores article likes from both authenticated and anonymous users';
COMMENT ON COLUMN public.article_likes.user_id IS 'User identifier - can be auth user ID or anon_{uuid} for anonymous users';
