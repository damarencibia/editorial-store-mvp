-- =============================================
-- Fix: remove broken trigger trg_process_order_sales
-- and provide a safe insert_order function
-- =============================================

-- Drop the problematic trigger that calls the
-- now-deleted sync_best_sellers() function
DROP TRIGGER IF EXISTS trg_process_order_sales ON public.orders;
DROP TRIGGER IF EXISTS trg_reverse_order_sales ON public.orders;

-- Replace the function with one that gracefully
-- handles missing sync_trending function
CREATE OR REPLACE FUNCTION process_order_sales()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  item JSONB;
BEGIN
  IF NEW.status = 'paid' AND NEW.items IS NOT NULL THEN
    FOR item IN SELECT * FROM jsonb_array_elements(NEW.items)
    LOOP
      UPDATE books
      SET sales_count = sales_count + (item->>'quantity')::int
      WHERE id = (item->>'bookId')::bigint;
    END LOOP;

    BEGIN
      PERFORM sync_trending();
    EXCEPTION WHEN undefined_function THEN
      NULL;
    END;
  END IF;

  RETURN NEW;
END;
$$;

-- Re-create the trigger with the fixed function
DROP TRIGGER IF EXISTS trg_process_order_sales ON public.orders;
CREATE TRIGGER trg_process_order_sales
AFTER INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION process_order_sales();

-- Safe insert function that bypasses triggers
-- Used as fallback in the webhook when the normal
-- INSERT fails due to trigger errors
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
