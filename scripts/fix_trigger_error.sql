-- =============================================
-- Fix: drop broken trigger, fix sync_trending(),
-- and provide safe insert_order function
-- =============================================
-- The webhook already handles sales_count updates
-- and sync_trending directly. The trigger is
-- redundant and causes errors.
-- =============================================

-- 1. Drop the problematic trigger and its function
DROP TRIGGER IF EXISTS trg_process_order_sales ON public.orders;
DROP TRIGGER IF EXISTS trg_reverse_order_sales ON public.orders;

-- 2. Fix sync_trending() to use WHERE clause
--    (Supabase blocks bare UPDATE without WHERE)
CREATE OR REPLACE FUNCTION sync_trending()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE books SET is_trending = false WHERE is_trending = true;

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

-- 3. Safe insert function that bypasses triggers
--    Used as RPC fallback in webhook
CREATE OR REPLACE FUNCTION insert_order(
  p_email TEXT,
  p_items JSONB,
  p_total INTEGER,
  p_session_id TEXT,
  p_status TEXT
) RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id BIGINT;
BEGIN
  SET session_replication_role = 'replica';
  INSERT INTO orders (customer_email, items, total, stripe_session_id, status)
  VALUES (p_email, p_items, p_total, p_session_id, p_status)
  RETURNING id INTO v_id;
  SET session_replication_role = 'origin';
  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION insert_order TO anon, service_role;
