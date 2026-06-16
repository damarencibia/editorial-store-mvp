-- Adds manual_trending column for admin overrides
-- Updates sync_trending() with:
--   - Respect manual_trending flag (skip manual books on reset)
--   - Minimum threshold of 3 sales in 14 days
--   - Only set trending for visible books (is_visible = true)

ALTER TABLE books ADD COLUMN IF NOT EXISTS manual_trending BOOLEAN NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION sync_trending()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Reset auto-trending books only (skip manually trending)
  UPDATE books SET is_trending = false
  WHERE COALESCE(manual_trending, false) = false
    AND is_trending = true;

  -- Top 20 visible books with >= 3 sales in last 14 days
  UPDATE books SET is_trending = true
  WHERE id IN (
    SELECT (item->>'bookId')::bigint
    FROM orders
    CROSS JOIN jsonb_array_elements(items) AS item
    WHERE status = 'paid'
      AND created_at >= NOW() - INTERVAL '14 days'
    GROUP BY (item->>'bookId')::bigint
    HAVING SUM((item->>'quantity')::int) >= 3
    ORDER BY SUM((item->>'quantity')::int) DESC
    LIMIT 20
  )
  AND is_visible = true;
END;
$$;

GRANT EXECUTE ON FUNCTION sync_trending TO anon, service_role;
