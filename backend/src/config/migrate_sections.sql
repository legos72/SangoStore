-- Migration: sections marketplace (isTrending, isFlashSale, isFeatured, isFastDelivery)
-- Run: npm run db:migrate:sections

ALTER TABLE products ADD COLUMN IF NOT EXISTS is_trending      BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_flash_sale    BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured      BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_fast_delivery BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS flash_sale_end   TIMESTAMPTZ;
ALTER TABLE products ADD COLUMN IF NOT EXISTS section_priority INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_products_trending
  ON products (section_priority DESC)
  WHERE is_trending = TRUE AND is_available = TRUE;

CREATE INDEX IF NOT EXISTS idx_products_flash_sale
  ON products (flash_sale_end)
  WHERE is_flash_sale = TRUE AND is_available = TRUE;

CREATE INDEX IF NOT EXISTS idx_products_featured
  ON products (section_priority DESC)
  WHERE is_featured = TRUE AND is_available = TRUE;

CREATE INDEX IF NOT EXISTS idx_products_fast_delivery
  ON products (created_at DESC)
  WHERE is_fast_delivery = TRUE AND is_available = TRUE;

CREATE INDEX IF NOT EXISTS idx_products_new_arrivals
  ON products (created_at DESC)
  WHERE is_available = TRUE;
