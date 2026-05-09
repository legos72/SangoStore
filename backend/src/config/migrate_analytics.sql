-- Analytics: page views + custom events
-- Run once: psql $DATABASE_URL -f migrate_analytics.sql

CREATE TABLE IF NOT EXISTS analytics_page_views (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  path        TEXT        NOT NULL,
  referrer    TEXT,
  device_type TEXT,       -- 'mobile' | 'tablet' | 'desktop'
  browser     TEXT,
  os_name     TEXT,
  session_id  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_apv_created    ON analytics_page_views (created_at);
CREATE INDEX IF NOT EXISTS idx_apv_path       ON analytics_page_views (path);
CREATE INDEX IF NOT EXISTS idx_apv_session    ON analytics_page_views (session_id);
CREATE INDEX IF NOT EXISTS idx_apv_device     ON analytics_page_views (device_type);

CREATE TABLE IF NOT EXISTS analytics_events (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name  TEXT        NOT NULL,
  properties  JSONB,
  session_id  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_aev_name       ON analytics_events (event_name);
CREATE INDEX IF NOT EXISTS idx_aev_created    ON analytics_events (created_at);
CREATE INDEX IF NOT EXISTS idx_aev_session    ON analytics_events (session_id);
