import { Router } from "express";
import { pool } from "../config/database";
import { authenticate, authorize } from "../middleware/auth";

export const analyticsRouter = Router();

// ── Ingest (public, no auth) ─────────────────────────────────────────────────

// POST /api/analytics/pageview
analyticsRouter.post("/pageview", async (req, res) => {
  const { path, referrer, device_type, browser, os_name, session_id } = req.body ?? {};
  if (!path) { res.json({ ok: true }); return; }

  await pool.query(
    `INSERT INTO analytics_page_views (path, referrer, device_type, browser, os_name, session_id)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      String(path).slice(0, 500),
      referrer   ? String(referrer).slice(0, 500)   : null,
      device_type ? String(device_type).slice(0, 20) : null,
      browser    ? String(browser).slice(0, 100)    : null,
      os_name    ? String(os_name).slice(0, 100)    : null,
      session_id ? String(session_id).slice(0, 64)  : null,
    ]
  );
  res.json({ ok: true });
});

// POST /api/analytics/event
analyticsRouter.post("/event", async (req, res) => {
  const { event_name, properties, session_id } = req.body ?? {};
  if (!event_name) { res.json({ ok: true }); return; }

  await pool.query(
    `INSERT INTO analytics_events (event_name, properties, session_id)
     VALUES ($1, $2, $3)`,
    [
      String(event_name).slice(0, 100),
      properties ? JSON.stringify(properties) : null,
      session_id ? String(session_id).slice(0, 64) : null,
    ]
  );
  res.json({ ok: true });
});

// ── Read (admin only) ────────────────────────────────────────────────────────

// GET /api/analytics/stats
analyticsRouter.get("/stats", authenticate, authorize("admin"), async (_req, res) => {
  const [
    visitorsToday,
    visitorsWeek,
    visitorsMonth,
    visitorsTotal,
    topPages,
    topEvents,
    deviceBreakdown,
    dailyVisitors,
  ] = await Promise.all([

    pool.query(`
      SELECT COUNT(DISTINCT session_id) AS count
      FROM analytics_page_views
      WHERE created_at >= CURRENT_DATE
    `),

    pool.query(`
      SELECT COUNT(DISTINCT session_id) AS count
      FROM analytics_page_views
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
    `),

    pool.query(`
      SELECT COUNT(DISTINCT session_id) AS count
      FROM analytics_page_views
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    `),

    pool.query(`
      SELECT COUNT(DISTINCT session_id) AS count
      FROM analytics_page_views
    `),

    pool.query(`
      SELECT path, COUNT(*) AS views, COUNT(DISTINCT session_id) AS unique_visitors
      FROM analytics_page_views
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY path
      ORDER BY views DESC
      LIMIT 10
    `),

    pool.query(`
      SELECT event_name, COUNT(*) AS count
      FROM analytics_events
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY event_name
      ORDER BY count DESC
      LIMIT 10
    `),

    pool.query(`
      SELECT
        COALESCE(device_type, 'unknown') AS device,
        COUNT(DISTINCT session_id) AS count
      FROM analytics_page_views
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY device_type
      ORDER BY count DESC
    `),

    pool.query(`
      SELECT
        DATE(created_at) AS day,
        COUNT(DISTINCT session_id) AS visitors
      FROM analytics_page_views
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY day ASC
    `),
  ]);

  res.json({
    status: "success",
    data: {
      visitors_today:   Number(visitorsToday.rows[0]?.count  ?? 0),
      visitors_week:    Number(visitorsWeek.rows[0]?.count   ?? 0),
      visitors_month:   Number(visitorsMonth.rows[0]?.count  ?? 0),
      visitors_total:   Number(visitorsTotal.rows[0]?.count  ?? 0),
      top_pages:        topPages.rows,
      top_events:       topEvents.rows,
      device_breakdown: deviceBreakdown.rows,
      daily_visitors:   dailyVisitors.rows,
    },
  });
});
