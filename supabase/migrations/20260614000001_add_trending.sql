-- Replace best-seller system with trending system.
-- Removes is_best_seller, manual_best_seller columns, adds is_trending.
-- sync_trending() marks top 20 books by sales in the last 14 days.

ALTER TABLE books DROP COLUMN IF EXISTS is_best_seller;
ALTER TABLE books DROP COLUMN IF EXISTS manual_best_seller;
DROP FUNCTION IF EXISTS sync_best_sellers;
ALTER TABLE books ADD COLUMN IF NOT EXISTS is_trending BOOLEAN NOT NULL DEFAULT false;

GRANT EXECUTE ON FUNCTION sync_trending TO anon, service_role;

CREATE OR REPLACE FUNCTION sync_trending()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE books SET is_trending = false;

  UPDATE books SET is_trending = true
  WHERE id IN (
    SELECT (item->>'bookId')::bigint
    FROM orders
    CROSS JOIN jsonb_array_elements(items) AS item
    WHERE status = 'paid'
      AND created_at >= NOW() - INTERVAL '14 days'
    GROUP BY (item->>'bookId')::bigint
    ORDER BY SUM((item->>'quantity')::int) DESC
    LIMIT 20
  );
END;
$$;
