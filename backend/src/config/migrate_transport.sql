-- ─── TRANSPORT BOOKINGS ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS transport_bookings (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tracking_number     VARCHAR(20) UNIQUE,
  trip_id             UUID NOT NULL REFERENCES trips(id) ON DELETE RESTRICT,
  client_id           UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

  -- Sender
  sender_name         VARCHAR(200) NOT NULL,
  sender_phone        VARCHAR(50)  NOT NULL,
  sender_address      TEXT         NOT NULL,

  -- Recipient
  recipient_name      VARCHAR(200) NOT NULL,
  recipient_phone     VARCHAR(50)  NOT NULL,
  recipient_address   TEXT         NOT NULL,

  -- Package
  package_description TEXT         NOT NULL,
  weight_kg           NUMERIC(8,2) NOT NULL CHECK (weight_kg > 0),
  dimensions          VARCHAR(100),
  package_photos      TEXT[]       DEFAULT '{}',
  package_video       TEXT,
  notes               TEXT,

  -- Pricing
  total_price         NUMERIC(12,2),
  currency            VARCHAR(10)  DEFAULT 'EUR',

  -- Status
  status              VARCHAR(30)  NOT NULL DEFAULT 'pending',
  -- pending | accepted | refused | in_transit | arrived | delivered | cancelled

  created_at          TIMESTAMPTZ  DEFAULT NOW(),
  updated_at          TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tb_client   ON transport_bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_tb_trip     ON transport_bookings(trip_id);
CREATE INDEX IF NOT EXISTS idx_tb_status   ON transport_bookings(status);
CREATE INDEX IF NOT EXISTS idx_tb_tracking ON transport_bookings(tracking_number);

-- ─── TRANSPORT TRACKING ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS transport_tracking (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id  UUID NOT NULL REFERENCES transport_bookings(id) ON DELETE CASCADE,
  status      VARCHAR(50) NOT NULL,
  description TEXT,
  location    VARCHAR(200),
  updated_by  UUID REFERENCES users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tt_booking ON transport_tracking(booking_id);

-- ─── Sequence for tracking numbers ───────────────────────────────────────────
CREATE SEQUENCE IF NOT EXISTS transport_booking_seq START 1000;
