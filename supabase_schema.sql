-- 6.1 — CMS Strategy: Articles Table (Safe Update)
-- Run this in your Supabase SQL Editor

-- 1. Create table only if it doesn't exist
CREATE TABLE IF NOT EXISTS public.articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add columns safely (DO block ensures we don't error if columns exist)
DO $$
BEGIN
    ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS title TEXT;
    ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS slug TEXT;
    ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS body TEXT;
    ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS excerpt TEXT;
    ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS image_url TEXT;
    ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS author_name TEXT DEFAULT 'CryptoBrain Editorial';
    ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS author_avatar TEXT;
    ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'News';
    ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
    ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ DEFAULT NOW();
    ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
    ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'editorial';
    ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS external_url TEXT;
END $$;

-- 3. Ensure Uniqueness on Slug (Drop constraint first to avoid errors, then recreate)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'articles_slug_key') THEN
    ALTER TABLE public.articles ADD CONSTRAINT articles_slug_key UNIQUE (slug);
  END IF;
END $$;

-- 4. Recreate Indexes (Drop existing to ensure they match our new definition)
DROP INDEX IF EXISTS idx_articles_published;
CREATE INDEX idx_articles_published ON public.articles (published_at DESC);

DROP INDEX IF EXISTS idx_articles_featured;
CREATE INDEX idx_articles_featured ON public.articles (is_featured) WHERE is_featured = TRUE;

DROP INDEX IF EXISTS idx_articles_slug;
CREATE INDEX idx_articles_slug ON public.articles (slug);

-- 5. Security (RLS)
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- 6. Policies (Drop first to avoid "policy already exists" errors)
DROP POLICY IF EXISTS "Public read" ON public.articles;
CREATE POLICY "Public read" ON public.articles FOR SELECT USING (true);

-- (Optional) Write policy for authenticated users
DROP POLICY IF EXISTS "Authenticated write" ON public.articles;
CREATE POLICY "Authenticated write" ON public.articles 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated update" ON public.articles;
CREATE POLICY "Authenticated update" ON public.articles 
  FOR UPDATE 
  TO authenticated 
  USING (true);

