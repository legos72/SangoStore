-- Migration: ajouter seller_category pour distinguer mode-africaine / mode-femme / mode-homme
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS seller_category VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_products_seller_category ON products(seller_category)
  WHERE seller_category IS NOT NULL;
