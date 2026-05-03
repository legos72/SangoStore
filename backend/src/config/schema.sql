-- ============================================================
-- DiasporaMarket — Schéma PostgreSQL
-- ============================================================

-- Reset idempotent (dev) — drop dans l'ordre inverse des FK
DROP TABLE IF EXISTS notifications        CASCADE;
DROP TABLE IF EXISTS escrow_transactions  CASCADE;
DROP TABLE IF EXISTS order_items          CASCADE;
DROP TABLE IF EXISTS orders               CASCADE;
DROP TABLE IF EXISTS transporter_reviews  CASCADE;
DROP TABLE IF EXISTS product_reviews      CASCADE;
DROP TABLE IF EXISTS trips                CASCADE;
DROP TABLE IF EXISTS transporters         CASCADE;
DROP TABLE IF EXISTS pickup_points        CASCADE;
DROP TABLE IF EXISTS products             CASCADE;
DROP TABLE IF EXISTS users                CASCADE;
DROP FUNCTION IF EXISTS update_updated_at CASCADE;
DROP TYPE IF EXISTS currency         CASCADE;
DROP TYPE IF EXISTS product_category CASCADE;
DROP TYPE IF EXISTS payment_status   CASCADE;
DROP TYPE IF EXISTS payment_method   CASCADE;
DROP TYPE IF EXISTS order_status     CASCADE;
DROP TYPE IF EXISTS user_role        CASCADE;

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

-- ─── ENUM TYPES ──────────────────────────────────────────────

CREATE TYPE user_role AS ENUM ('client', 'vendeur', 'transporteur', 'admin');
CREATE TYPE order_status AS ENUM (
  'en_attente', 'paye', 'en_preparation', 'expedie',
  'arrive_bangui', 'pret_retrait', 'recupere', 'annule'
);
CREATE TYPE payment_method AS ENUM ('orange_money', 'cash');
CREATE TYPE payment_status AS ENUM ('en_attente', 'bloque', 'libere', 'rembourse');
CREATE TYPE product_category AS ENUM (
  'electronique', 'mode', 'alimentation', 'maison',
  'beaute', 'jouets', 'sante', 'sport', 'auto', 'autre'
);
CREATE TYPE currency AS ENUM ('XAF', 'EUR', 'USD');

-- ─── USERS ───────────────────────────────────────────────────

CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            VARCHAR(255) NOT NULL,
  email           CITEXT UNIQUE NOT NULL,
  phone           VARCHAR(30),
  password_hash   VARCHAR(255) NOT NULL,
  role            user_role NOT NULL DEFAULT 'client',
  country_code    CHAR(2) NOT NULL,
  avatar_url      TEXT,
  is_verified     BOOLEAN DEFAULT FALSE,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ─── PRODUCTS ────────────────────────────────────────────────

CREATE TABLE products (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title            VARCHAR(500) NOT NULL,
  description      TEXT,
  price            NUMERIC(12, 2) NOT NULL CHECK (price > 0),
  currency         currency NOT NULL DEFAULT 'XAF',
  images           TEXT[] DEFAULT '{}',
  category         product_category NOT NULL DEFAULT 'autre',
  origin_country   CHAR(2) NOT NULL,   -- OBLIGATOIRE
  stock            INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  weight_kg              NUMERIC(8, 3),
  dimensions             VARCHAR(100),
  tags                   TEXT[] DEFAULT '{}',
  local_delivery_cost_xaf NUMERIC(10, 2) DEFAULT 2500,
  is_available           BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_country ON products(origin_country);   -- INDEX SUR LE PAYS
CREATE INDEX idx_products_available ON products(is_available);
CREATE INDEX idx_products_fulltext ON products USING gin(to_tsvector('french', title || ' ' || COALESCE(description, '')));

-- ─── PRODUCT REVIEWS ─────────────────────────────────────────

CREATE TABLE product_reviews (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  author_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (product_id, author_id)
);

-- ─── PICKUP POINTS ───────────────────────────────────────────

CREATE TABLE pickup_points (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(255) NOT NULL,
  address       TEXT NOT NULL,
  city          VARCHAR(100) NOT NULL DEFAULT 'Bangui',
  phone         VARCHAR(30),
  opening_hours TEXT,
  lat           NUMERIC(10, 7),
  lng           NUMERIC(10, 7),
  is_active     BOOLEAN DEFAULT TRUE
);

-- ─── ORDERS ──────────────────────────────────────────────────

CREATE TABLE orders (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number     VARCHAR(30) UNIQUE NOT NULL DEFAULT ('DM-' || to_char(NOW(), 'YYYY') || '-' || LPAD(floor(random()*99999)::text, 5, '0')),
  client_id        UUID NOT NULL REFERENCES users(id),
  status           order_status NOT NULL DEFAULT 'en_attente',
  total_amount     NUMERIC(12, 2) NOT NULL,
  currency         currency NOT NULL DEFAULT 'XAF',
  payment_method   payment_method NOT NULL,
  payment_status   payment_status NOT NULL DEFAULT 'en_attente',
  escrow_released  BOOLEAN DEFAULT FALSE,
  pickup_point_id  UUID REFERENCES pickup_points(id),
  transporter_id   UUID REFERENCES users(id),
  tracking_number  VARCHAR(100),
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_client ON orders(client_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);

-- ─── ORDER ITEMS ─────────────────────────────────────────────

CREATE TABLE order_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id),
  quantity    INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price  NUMERIC(12, 2) NOT NULL
);

-- ─── TRANSPORTERS ────────────────────────────────────────────

CREATE TABLE transporters (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  company_name  VARCHAR(255) NOT NULL,
  description   TEXT,
  is_verified   BOOLEAN DEFAULT FALSE,
  contact_phone VARCHAR(30),
  contact_wa    VARCHAR(30),
  contact_email CITEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── TRANSPORTER REVIEWS ─────────────────────────────────────

CREATE TABLE transporter_reviews (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transporter_id   UUID NOT NULL REFERENCES transporters(id) ON DELETE CASCADE,
  author_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating           SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment          TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (transporter_id, author_id)
);

-- ─── TRIPS ───────────────────────────────────────────────────

CREATE TABLE trips (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transporter_id      UUID NOT NULL REFERENCES transporters(id) ON DELETE CASCADE,
  origin_country      CHAR(2) NOT NULL,
  destination_city    VARCHAR(100) NOT NULL DEFAULT 'Bangui',
  departure_date      DATE NOT NULL,
  arrival_date        DATE,
  price_per_kg        NUMERIC(10, 2) NOT NULL CHECK (price_per_kg > 0),
  currency            currency NOT NULL DEFAULT 'EUR',
  available_capacity  NUMERIC(8, 2) NOT NULL,
  description         TEXT,
  is_active           BOOLEAN DEFAULT TRUE,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trips_country ON trips(origin_country);
CREATE INDEX idx_trips_active ON trips(is_active);
CREATE INDEX idx_trips_departure ON trips(departure_date);

-- ─── ESCROW TRANSACTIONS ─────────────────────────────────────

CREATE TABLE escrow_transactions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id      UUID NOT NULL REFERENCES orders(id),
  amount        NUMERIC(12, 2) NOT NULL,
  currency      currency NOT NULL,
  status        payment_status NOT NULL DEFAULT 'en_attente',
  reference     VARCHAR(100) UNIQUE,
  released_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── NOTIFICATIONS ────────────────────────────────────────────

CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(255) NOT NULL,
  body        TEXT,
  type        VARCHAR(50),
  is_read     BOOLEAN DEFAULT FALSE,
  data        JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifs_user ON notifications(user_id, is_read);

-- ─── UPDATED_AT TRIGGER ───────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated    BEFORE UPDATE ON users    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_orders_updated   BEFORE UPDATE ON orders   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
