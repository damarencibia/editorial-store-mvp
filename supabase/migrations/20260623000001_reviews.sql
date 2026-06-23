-- Migration: reviews table + RLS + auto-update trigger + stats function

-- 1. Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id BIGSERIAL PRIMARY KEY,
  book_id BIGINT NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  is_edited BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_book_id ON public.reviews(book_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_book_user ON public.reviews(book_id, user_id);

-- 2. Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 3. RLS policies
CREATE POLICY IF NOT EXISTS "Reviews are publicly readable"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY IF NOT EXISTS "Users can insert own review"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own review"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete own review"
  ON public.reviews FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Admins can update any review"
  ON public.reviews FOR UPDATE
  USING (public.is_admin());

CREATE POLICY IF NOT EXISTS "Admins can delete any review"
  ON public.reviews FOR DELETE
  USING (public.is_admin());

-- 4. Trigger: auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_review_updated()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_review_updated
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_review_updated();

-- 5. Function: get review stats for admin dashboard
CREATE OR REPLACE FUNCTION public.get_review_stats()
RETURNS TABLE (total_reviews BIGINT, avg_rating NUMERIC, total_bytes BIGINT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COUNT(*)::bigint AS total_reviews,
    COALESCE(ROUND(AVG(rating)::numeric, 2), 0) AS avg_rating,
    COALESCE(SUM(pg_column_size(reviews)), 0)::bigint AS total_bytes
  FROM public.reviews;
$$;
