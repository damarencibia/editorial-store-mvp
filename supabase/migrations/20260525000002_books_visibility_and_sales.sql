-- Add visibility, best-seller, and sales tracking columns to books
ALTER TABLE books ADD COLUMN IF NOT EXISTS is_visible          BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE books ADD COLUMN IF NOT EXISTS is_best_seller      BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE books ADD COLUMN IF NOT EXISTS manual_best_seller  BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE books ADD COLUMN IF NOT EXISTS sales_count         INTEGER NOT NULL DEFAULT 0;

-- Function to increment sales_count (used by webhook on payment confirmation)
CREATE OR REPLACE FUNCTION increment_sales_count(book_id BIGINT, quantity INT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE books SET sales_count = sales_count + quantity WHERE id = book_id;
END;
$$;

-- Function to sync automatic best-sellers (top 5 by sales_count, excluding manually marked books)
CREATE OR REPLACE FUNCTION sync_best_sellers()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Mark top 5 automatic best-sellers
  UPDATE books
  SET is_best_seller = true
  WHERE id IN (
    SELECT id FROM books
    WHERE manual_best_seller = false
    ORDER BY sales_count DESC
    LIMIT 5
  );

  -- Unmark those no longer in top 5 (unless manually set)
  UPDATE books
  SET is_best_seller = false
  WHERE manual_best_seller = false
    AND id NOT IN (
      SELECT id FROM books
      ORDER BY sales_count DESC
      LIMIT 5
    );
END;
$$;
