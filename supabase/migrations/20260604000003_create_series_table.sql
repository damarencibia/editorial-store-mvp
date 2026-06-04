CREATE TABLE IF NOT EXISTS series (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO series (name)
SELECT DISTINCT TRIM(series) FROM books
WHERE series IS NOT NULL AND TRIM(series) != '';

ALTER TABLE books ADD COLUMN IF NOT EXISTS series_id INTEGER REFERENCES series(id) ON DELETE SET NULL;

UPDATE books SET series_id = series.id
FROM series WHERE TRIM(books.series) = series.name;

ALTER TABLE books DROP COLUMN IF EXISTS series;

ALTER TABLE series ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public: select series"
  ON series FOR SELECT
  USING (true);

CREATE POLICY "Admin: all series"
  ON series FOR ALL
  USING (public.is_admin());
