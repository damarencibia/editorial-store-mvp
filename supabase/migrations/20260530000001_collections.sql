-- =============================================
-- Migration: Collections table + category update
-- Creates collections as top-level grouping for
-- categories. Each category belongs to a collection.
-- Slug uniqueness is now per-collection.
-- =============================================

CREATE TABLE IF NOT EXISTS collections (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  cover_url   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE categories ADD COLUMN IF NOT EXISTS collection_id INTEGER
  REFERENCES collections(id) ON DELETE RESTRICT;

ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_slug_key;
ALTER TABLE categories ADD UNIQUE (collection_id, slug);

ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin: all collections"
  ON collections FOR ALL
  USING (public.is_admin());

CREATE POLICY "Public: select collections"
  ON collections FOR SELECT
  USING (true);
