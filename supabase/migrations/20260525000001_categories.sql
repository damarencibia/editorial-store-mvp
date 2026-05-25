CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE books ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES categories(id) ON DELETE RESTRICT;

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin: all categories"
  ON categories FOR ALL
  USING (public.is_admin());

CREATE POLICY "Authenticated: select categories"
  ON categories FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Public: select categories"
  ON categories FOR SELECT
  USING (true);
