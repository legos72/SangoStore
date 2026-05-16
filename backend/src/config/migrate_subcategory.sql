-- Migration: ajouter la colonne subcategory à la table products
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS subcategory VARCHAR(100);

-- Index pour filtrage par sous-catégorie
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON products(subcategory)
  WHERE subcategory IS NOT NULL;
