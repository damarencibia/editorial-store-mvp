-- Fix sync_best_sellers to use sales_count threshold (>=5) instead of top-5 ranking.
-- Previous logic used LIMIT 5, which caused ALL books (≤5) to be marked as best-sellers
-- on every trigger invocation. Now any book reaching 5+ sales gets the badge.
CREATE OR REPLACE FUNCTION sync_best_sellers()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE books
  SET is_best_seller = true
  WHERE sales_count >= 5
    AND manual_best_seller = false
    AND is_best_seller = false;

  UPDATE books
  SET is_best_seller = false
  WHERE (sales_count < 5 OR sales_count IS NULL)
    AND manual_best_seller = false
    AND is_best_seller = true;
END;
$$;
