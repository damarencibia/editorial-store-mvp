-- =============================================
-- Fix historical sales_count and trending data
-- Also ensures required functions exist
-- =============================================

-- =============================================
-- 1. Ensure increment_sales_count function exists
-- =============================================
CREATE OR REPLACE FUNCTION increment_sales_count(book_id BIGINT, quantity INT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE books SET sales_count = sales_count + quantity WHERE id = book_id;
END;
$$;

GRANT EXECUTE ON FUNCTION increment_sales_count TO anon, service_role;

-- =============================================
-- 2. Ensure sync_trending function exists
-- =============================================
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

GRANT EXECUTE ON FUNCTION sync_trending TO anon, service_role;

-- =============================================
-- 3. Recalculate sales_count for ALL books
--    from every paid order in history
-- =============================================
UPDATE books SET sales_count = (
  SELECT COALESCE(SUM((item->>'quantity')::int), 0)
  FROM orders
  CROSS JOIN jsonb_array_elements(orders.items) AS item
  WHERE item->>'bookId' = books.id::text
    AND orders.status = 'paid'
);

-- =============================================
-- 4. Run sync_trending to mark trending books
-- =============================================
SELECT sync_trending();
