-- Migration: ajout du champ status sur les utilisateurs
-- Exécuter: psql -U postgres -d diasporamarket -f migrate_user_status.sql

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'approved'
  CHECK (status IN ('pending', 'approved', 'rejected'));

-- Les clients existants restent approved
-- Les vendeurs/transporteurs existants passent en pending
UPDATE users
  SET status = 'pending'
  WHERE role IN ('vendeur', 'transporteur')
    AND status = 'approved';

CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
