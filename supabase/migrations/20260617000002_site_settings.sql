CREATE TABLE IF NOT EXISTS site_settings (
  id integer PRIMARY KEY DEFAULT 1,
  show_top_picks boolean NOT NULL DEFAULT true,
  show_trending boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

INSERT INTO site_settings (id, show_top_picks, show_trending)
VALUES (1, true, true)
ON CONFLICT (id) DO NOTHING;
