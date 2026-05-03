import { Router } from "express";
import { query, queryOne } from "../config/database";
import { authenticate, authorize } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import type { AuthRequest } from "../middleware/auth";

export const vendorRouter = Router();

// All vendor routes require authentication + vendeur (or admin) role
vendorRouter.use(authenticate, authorize("vendeur", "admin"));

// ─── GET /api/vendor/stats ────────────────────────────────────────────────────
vendorRouter.get("/stats", async (req: AuthRequest, res) => {
  const sid = req.user!.id;

  const [prodTotal]    = await query<any>("SELECT COUNT(*) AS n FROM products WHERE seller_id = $1", [sid]);
  const [prodActive]   = await query<any>("SELECT COUNT(*) AS n FROM products WHERE seller_id = $1 AND is_available = TRUE", [sid]);
  const [orderTotal]   = await query<any>(`
    SELECT COUNT(DISTINCT o.id) AS n
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    JOIN products    p  ON oi.product_id = p.id
    WHERE p.seller_id = $1`, [sid]);
  const [orderPending] = await query<any>(`
    SELECT COUNT(DISTINCT o.id) AS n
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    JOIN products    p  ON oi.product_id = p.id
    WHERE p.seller_id = $1 AND o.status NOT IN ('recupere','annule')`, [sid]);
  const [escrowBlocked] = await query<any>(`
    SELECT COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS total
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    JOIN orders   o ON oi.order_id = o.id
    WHERE p.seller_id = $1 AND o.payment_status = 'bloque'`, [sid]);
  const [escrowReleased] = await query<any>(`
    SELECT COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS total
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    JOIN orders   o ON oi.order_id = o.id
    WHERE p.seller_id = $1 AND o.payment_status = 'libere'`, [sid]);
  const [ratingRow] = await query<any>(`
    SELECT COALESCE(AVG(r.rating), 0) AS avg, COUNT(r.id) AS n
    FROM product_reviews r
    JOIN products p ON r.product_id = p.id
    WHERE p.seller_id = $1`, [sid]);

  res.json({
    status: "success",
    data: {
      totalProducts:   parseInt(prodTotal.n),
      activeProducts:  parseInt(prodActive.n),
      totalOrders:     parseInt(orderTotal.n),
      pendingOrders:   parseInt(orderPending.n),
      revenueBlocked:  parseFloat(escrowBlocked.total),
      revenueReleased: parseFloat(escrowReleased.total),
      totalRevenue:    parseFloat(escrowBlocked.total) + parseFloat(escrowReleased.total),
      avgRating:       parseFloat(parseFloat(ratingRow.avg).toFixed(1)),
      reviewCount:     parseInt(ratingRow.n),
    },
  });
});

// ─── GET /api/vendor/revenue ──────────────────────────────────────────────────
vendorRouter.get("/revenue", async (req: AuthRequest, res) => {
  const sid = req.user!.id;

  const rows = await query<any>(`
    SELECT
      TO_CHAR(DATE_TRUNC('month', o.created_at), 'Mon YYYY') AS label,
      DATE_TRUNC('month', o.created_at)                       AS month,
      COALESCE(SUM(oi.quantity * oi.unit_price), 0)           AS revenue,
      COUNT(DISTINCT o.id)                                     AS orders
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    JOIN products    p  ON oi.product_id = p.id
    WHERE p.seller_id = $1
      AND o.created_at >= NOW() - INTERVAL '6 months'
      AND o.payment_status IN ('bloque','libere')
    GROUP BY DATE_TRUNC('month', o.created_at)
    ORDER BY month ASC`, [sid]);

  res.json({ status: "success", data: rows });
});

// ─── GET /api/vendor/products ─────────────────────────────────────────────────
vendorRouter.get("/products", async (req: AuthRequest, res) => {
  const { page = "1", limit = "12", search, category, available } = req.query as Record<string, string>;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const sid = req.user!.id;

  const params: any[] = [sid];
  const conds = ["p.seller_id = $1"];

  if (search) {
    params.push(`%${search}%`);
    conds.push(`p.title ILIKE $${params.length}`);
  }
  if (category) {
    params.push(category);
    conds.push(`p.category = $${params.length}::product_category`);
  }
  if (available !== undefined) {
    params.push(available === "true");
    conds.push(`p.is_available = $${params.length}`);
  }

  const where = `WHERE ${conds.join(" AND ")}`;

  const products = await query<any>(`
    SELECT p.*,
      COALESCE(AVG(r.rating), 0)   AS avg_rating,
      COUNT(DISTINCT r.id)          AS review_count,
      COUNT(DISTINCT oi.order_id)   AS order_count
    FROM products p
    LEFT JOIN product_reviews r  ON r.product_id  = p.id
    LEFT JOIN order_items     oi ON oi.product_id = p.id
    ${where}
    GROUP BY p.id
    ORDER BY p.created_at DESC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, parseInt(limit), offset]);

  const [{ count }] = await query<any>(`SELECT COUNT(*) FROM products p ${where}`, params);

  res.json({
    status: "success",
    data: products,
    pagination: {
      total: parseInt(count),
      page:  parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(parseInt(count) / parseInt(limit)),
    },
  });
});

// ─── GET /api/vendor/orders ───────────────────────────────────────────────────
vendorRouter.get("/orders", async (req: AuthRequest, res) => {
  const { status, page = "1", limit = "10" } = req.query as Record<string, string>;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const sid = req.user!.id;

  const params: any[] = [sid];
  const conds = ["p.seller_id = $1"];
  if (status) {
    params.push(status);
    conds.push(`o.status = $${params.length}::order_status`);
  }

  const orders = await query<any>(`
    SELECT DISTINCT
      o.*,
      u.name  AS client_name,
      u.phone AS client_phone,
      pp.name    AS pickup_name,
      pp.address AS pickup_address,
      pp.phone   AS pickup_phone
    FROM orders o
    JOIN order_items  oi ON oi.order_id   = o.id
    JOIN products      p ON oi.product_id = p.id
    JOIN users         u ON o.client_id   = u.id
    LEFT JOIN pickup_points pp ON o.pickup_point_id = pp.id
    WHERE ${conds.join(" AND ")}
    ORDER BY o.created_at DESC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, parseInt(limit), offset]);

  for (const order of orders) {
    order.items = await query<any>(`
      SELECT oi.*, p.title, p.images[1] AS image, p.origin_country, p.currency, p.category
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1 AND p.seller_id = $2`,
      [order.id, sid]);
  }

  res.json({ status: "success", data: orders });
});

// ─── PATCH /api/vendor/orders/:id/status ─────────────────────────────────────
// Vendeur peut faire avancer : en_preparation → expedie → arrive_bangui
vendorRouter.patch("/orders/:id/status", async (req: AuthRequest, res) => {
  const { status } = req.body;
  const allowed = ["en_preparation", "expedie", "arrive_bangui"];
  if (!allowed.includes(status)) throw new AppError("Statut non autorisé pour un vendeur", 400);

  // Ensure at least one product in this order belongs to this vendor
  const check = await queryOne<any>(`
    SELECT o.id FROM orders o
    JOIN order_items oi ON oi.order_id   = o.id
    JOIN products    p  ON oi.product_id = p.id
    WHERE o.id = $1 AND p.seller_id = $2 LIMIT 1`,
    [req.params.id, req.user!.id]);
  if (!check) throw new AppError("Commande introuvable ou non autorisée", 404);

  const [order] = await query<any>(
    "UPDATE orders SET status = $1::order_status, updated_at = NOW() WHERE id = $2 RETURNING *",
    [status, req.params.id]);

  res.json({ status: "success", data: order });
});

// ─── GET /api/vendor/notifications ───────────────────────────────────────────
vendorRouter.get("/notifications", async (req: AuthRequest, res) => {
  const rows = await query<any>(
    "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20",
    [req.user!.id]);
  res.json({ status: "success", data: rows });
});

// ─── PATCH /api/vendor/notifications/read ────────────────────────────────────
vendorRouter.patch("/notifications/read", async (req: AuthRequest, res) => {
  await query(
    "UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE",
    [req.user!.id]);
  res.json({ status: "success" });
});
