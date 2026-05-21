CREATE TABLE IF NOT EXISTS books (
  id          BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  slug        TEXT UNIQUE NOT NULL,
  title       TEXT NOT NULL,
  author      TEXT NOT NULL,
  description TEXT,
  price       INTEGER NOT NULL,
  cover_url   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id                BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  customer_email    TEXT,
  items             JSONB NOT NULL,
  total             INTEGER NOT NULL,
  stripe_session_id TEXT UNIQUE,
  status            TEXT DEFAULT 'pending',
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS but allow public read access for books
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.books
  FOR SELECT USING (true);
