CREATE TABLE IF NOT EXISTS monthly_picks (
  id SERIAL PRIMARY KEY,
  book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  position INTEGER NOT NULL CHECK (position >= 1 AND position <= 10),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(book_id),
  UNIQUE(position)
);

ALTER TABLE monthly_picks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public: select monthly_picks"
  ON monthly_picks FOR SELECT
  USING (true);

CREATE POLICY "Admin: all monthly_picks"
  ON monthly_picks FOR ALL
  USING (public.is_admin());
