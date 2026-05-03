-- Migration: add promotion and wholesale pricing to products
-- Safe to run multiple times (IF NOT EXISTS / IF EXISTS guards)

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS promo_price      NUMERIC(12, 2)    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS promo_end        TIMESTAMPTZ       DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS wholesale_prices JSONB             DEFAULT '[]'::jsonb;

-- Partial index: fast lookup of active promotions
CREATE INDEX IF NOT EXISTS idx_products_promo
  ON products (promo_price, promo_end)
  WHERE promo_price IS NOT NULL;
