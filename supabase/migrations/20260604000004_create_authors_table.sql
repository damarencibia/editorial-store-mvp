CREATE TABLE IF NOT EXISTS authors (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  bio TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE books ADD COLUMN IF NOT EXISTS author_id INTEGER REFERENCES authors(id) ON DELETE RESTRICT;

INSERT INTO authors (name, slug)
SELECT DISTINCT
  TRIM(author),
  LOWER(REGEXP_REPLACE(REGEXP_REPLACE(TRIM(author), '[^a-zA-Z0-9 ]', '', 'g'), '\s+', '-', 'g'))
FROM books
WHERE author IS NOT NULL AND TRIM(author) != '';

UPDATE books SET author_id = authors.id
FROM authors WHERE TRIM(books.author) = authors.name;

ALTER TABLE books DROP COLUMN IF EXISTS author;

ALTER TABLE authors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public: select authors"
  ON authors FOR SELECT
  USING (true);

CREATE POLICY "Admin: all authors"
  ON authors FOR ALL
  USING (public.is_admin());
