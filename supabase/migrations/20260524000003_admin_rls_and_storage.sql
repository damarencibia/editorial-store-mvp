-- =============================================
-- Migration: Admin RLS policies + Storage bucket
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. RLS for books: INSERT / UPDATE / DELETE (admin only)
DROP POLICY IF EXISTS "Admins can insert books" ON public.books;
CREATE POLICY "Admins can insert books" ON public.books
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update books" ON public.books;
CREATE POLICY "Admins can update books" ON public.books
  FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete books" ON public.books;
CREATE POLICY "Admins can delete books" ON public.books
  FOR DELETE USING (public.is_admin());

-- 2. RLS for orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.orders;
CREATE POLICY "Enable read access for all users" ON public.orders
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;
CREATE POLICY "Anyone can insert orders" ON public.orders
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
CREATE POLICY "Admins can update orders" ON public.orders
  FOR UPDATE USING (public.is_admin());

-- 3. Storage bucket for book covers
INSERT INTO storage.buckets (id, name, public)
VALUES ('book-covers', 'book-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to book covers
DROP POLICY IF EXISTS "Public read access for book-covers" ON storage.objects;
CREATE POLICY "Public read access for book-covers"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'book-covers');

-- Allow authenticated admin users to upload/delete in book-covers
DROP POLICY IF EXISTS "Admin upload to book-covers" ON storage.objects;
CREATE POLICY "Admin upload to book-covers"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'book-covers'
    AND public.is_admin()
  );

DROP POLICY IF EXISTS "Admin delete from book-covers" ON storage.objects;
CREATE POLICY "Admin delete from book-covers"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'book-covers'
    AND public.is_admin()
  );
