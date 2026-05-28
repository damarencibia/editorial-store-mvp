-- =============================================
-- Migration: Auto-sales trigger from orders table
-- Automatically updates books.sales_count when
-- orders are inserted (paid) or cancelled
-- =============================================

-- Grant execute on existing functions for all roles
GRANT EXECUTE ON FUNCTION increment_sales_count TO anon, service_role;
GRANT EXECUTE ON FUNCTION sync_best_sellers TO anon, service_role;

-- =============================================
-- Trigger function: process_order_sales
-- Fires AFTER INSERT on orders
-- Increments books.sales_count per item
-- =============================================
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

    PERFORM sync_best_sellers();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_process_order_sales ON public.orders;
CREATE TRIGGER trg_process_order_sales
AFTER INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION process_order_sales();

-- =============================================
-- Trigger function: reverse_order_sales
-- Fires AFTER UPDATE of status on orders
-- Decrements books.sales_count when cancelled
-- =============================================
CREATE OR REPLACE FUNCTION reverse_order_sales()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  item JSONB;
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status = 'paid' AND NEW.items IS NOT NULL THEN
    FOR item IN SELECT * FROM jsonb_array_elements(NEW.items)
    LOOP
      UPDATE books
      SET sales_count = sales_count - (item->>'quantity')::int
      WHERE id = (item->>'bookId')::bigint;
    END LOOP;

    PERFORM sync_best_sellers();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_reverse_order_sales ON public.orders;
CREATE TRIGGER trg_reverse_order_sales
AFTER UPDATE OF status ON public.orders
FOR EACH ROW
EXECUTE FUNCTION reverse_order_sales();

-- =============================================
-- Recalculate sales_count from all existing
-- paid orders (for historical data)
-- =============================================
UPDATE books SET sales_count = (
  SELECT COALESCE(SUM((item->>'quantity')::int), 0)
  FROM orders
  CROSS JOIN jsonb_array_elements(orders.items) AS item
  WHERE item->>'bookId' = books.id::text
    AND orders.status = 'paid'
);
