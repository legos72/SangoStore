import { Router } from "express";
import { query, queryOne } from "../config/database";
import { AppError } from "../middleware/errorHandler";
import { authenticate, authorize } from "../middleware/auth";
import type { AuthRequest } from "../middleware/auth";
import { sendAccountApprovedEmail, sendAccountRejectedEmail, sendAccountSuspendedEmail, sendAdminMessageEmail } from "../services/email";

export const adminRouter = Router();

adminRouter.use(authenticate, authorize("admin"));

// GET /api/admin/users?status=pending&role=vendeur
adminRouter.get("/users", async (req: AuthRequest, res) => {
  const { status, role, search } = req.query;

  const conditions: string[] = ["u.role != 'admin'"];
  const params: any[] = [];

  if (status) {
    params.push(status);
    conditions.push(`u.status = $${params.length}`);
  }
  if (role) {
    params.push(role);
    conditions.push(`u.role = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(u.name ILIKE $${params.length} OR u.email ILIKE $${params.length})`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const users = await query(
    `SELECT u.id, u.name, u.email, u.phone, u.role, u.status,
            u.country_code, u.is_verified, u.is_active, u.created_at
     FROM users u
     ${where}
     ORDER BY u.created_at DESC`,
    params
  );

  res.json({ status: "success", data: users });
});

// PATCH /api/admin/users/:id/status  { status: "approved" | "rejected" }
adminRouter.patch("/users/:id/status", async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    throw new AppError("Statut invalide. Valeurs acceptées : approved, rejected", 400);
  }

  const user = await queryOne<any>(
    "SELECT id, name, email, role FROM users WHERE id = $1",
    [id]
  );
  if (!user) throw new AppError("Utilisateur introuvable", 404);

  await query("UPDATE users SET status = $1 WHERE id = $2", [status, id]);

  if (status === "approved") {
    sendAccountApprovedEmail(user.email, user.name, user.role).catch((err: Error) => {
      console.error(`[Admin] Email d'approbation non envoyé à ${user.email}:`, err.message);
    });
  } else {
    const reason = typeof req.body.reason === "string" ? req.body.reason.trim() : undefined;
    sendAccountRejectedEmail(user.email, user.name, reason || undefined).catch((err: Error) => {
      console.error(`[Admin] Email de rejet non envoyé à ${user.email}:`, err.message);
    });
  }

  res.json({
    status: "success",
    message: status === "approved" ? "Compte approuvé" : "Compte rejeté",
  });
});

// GET /api/admin/users/pending-count
adminRouter.get("/users/pending-count", async (_req, res) => {
  const row = await queryOne<{ count: string }>(
    "SELECT COUNT(*) as count FROM users WHERE status = 'pending'",
    []
  );
  res.json({ status: "success", count: parseInt(row?.count ?? "0") });
});

// GET /api/admin/stats
adminRouter.get("/stats", async (_req, res) => {
  const row = await queryOne<any>(`
    SELECT
      (SELECT COUNT(*) FROM users WHERE role != 'admin')::int                             AS total_users,
      (SELECT COUNT(*) FROM users WHERE status = 'pending')::int                          AS pending_users,
      (SELECT COUNT(*) FROM users WHERE status = 'approved' AND role != 'admin')::int     AS approved_users,
      (SELECT COUNT(*) FROM users WHERE role = 'vendeur')::int                            AS total_vendeurs,
      (SELECT COUNT(*) FROM users WHERE role = 'transporteur')::int                       AS total_transporteurs,
      (SELECT COUNT(*) FROM products)::int                                                AS total_products,
      (SELECT COUNT(*) FROM products WHERE is_available = TRUE)::int                      AS active_products,
      (SELECT COUNT(*) FROM orders)::int                                                  AS total_orders,
      (SELECT COUNT(*) FROM orders WHERE status = 'expedie')::int                        AS orders_in_transit,
      (SELECT COUNT(*) FROM orders WHERE status = 'pret_retrait')::int                   AS orders_ready,
      (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE payment_status = 'bloque') AS escrow_total,
      (SELECT COUNT(*) FROM orders WHERE payment_status = 'bloque')::int                  AS escrow_count
  `, []);
  res.json({ status: "success", data: row });
});

// GET /api/admin/products
adminRouter.get("/products", async (req, res) => {
  const { search, category, available } = req.query as Record<string, string>;

  const conditions: string[] = [];
  const params: any[] = [];

  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(p.title ILIKE $${params.length} OR p.description ILIKE $${params.length})`);
  }
  if (category) {
    params.push(category);
    conditions.push(`p.category = $${params.length}::product_category`);
  }
  if (available !== undefined) {
    params.push(available === "true");
    conditions.push(`p.is_available = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const products = await query(`
    SELECT p.id, p.title, p.price, p.currency, p.images, p.category,
           p.origin_country, p.stock, p.is_available, p.created_at,
           u.name AS seller_name, u.country_code AS seller_country,
           COALESCE(AVG(r.rating), 0) AS avg_rating,
           COUNT(DISTINCT r.id) AS review_count
    FROM products p
    LEFT JOIN users u ON p.seller_id = u.id
    LEFT JOIN product_reviews r ON r.product_id = p.id
    ${where}
    GROUP BY p.id, u.name, u.country_code
    ORDER BY p.created_at DESC
    LIMIT 200
  `, params);

  res.json({ status: "success", data: products });
});

// GET /api/admin/orders
adminRouter.get("/orders", async (req, res) => {
  const { status } = req.query as Record<string, string>;

  const params: any[] = [];
  let where = "TRUE";

  if (status && status !== "all") {
    params.push(status);
    where = `o.status = $1::order_status`;
  }

  const orders = await query(`
    SELECT o.id, o.order_number, o.status, o.total_amount, o.currency,
           o.payment_status, o.escrow_released, o.created_at,
           u.name AS client_name, u.email AS client_email
    FROM orders o
    LEFT JOIN users u ON o.client_id = u.id
    WHERE ${where}
    ORDER BY o.created_at DESC
    LIMIT 200
  `, params);

  for (const order of orders) {
    order.items = await query(
      `SELECT oi.product_id, p.title, p.images[1] AS image, oi.quantity, oi.unit_price, p.currency, p.category
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [order.id]
    );
  }

  res.json({ status: "success", data: orders });
});

// PATCH /api/admin/users/:id/active  { isActive: boolean }
adminRouter.patch("/users/:id/active", async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { isActive } = req.body;
  if (typeof isActive !== "boolean") {
    throw new AppError("isActive doit être un booléen", 400);
  }
  const user = await queryOne<any>("SELECT id, name, email FROM users WHERE id = $1", [id]);
  if (!user) throw new AppError("Utilisateur introuvable", 404);

  await query("UPDATE users SET is_active = $1 WHERE id = $2", [isActive, id]);

  if (!isActive) {
    sendAccountSuspendedEmail(user.email, user.name).catch((err: Error) => {
      console.error(`[Admin] Email de suspension non envoyé à ${user.email}:`, err.message);
    });
  }

  res.json({ status: "success", message: isActive ? "Compte réactivé" : "Compte suspendu" });
});

// POST /api/admin/users/:id/message  { subject, message }
adminRouter.post("/users/:id/message", async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { subject, message } = req.body;
  if (!subject?.trim() || !message?.trim()) {
    throw new AppError("Sujet et message requis", 400);
  }
  const user = await queryOne<any>("SELECT id, name, email FROM users WHERE id = $1", [id]);
  if (!user) throw new AppError("Utilisateur introuvable", 404);

  await sendAdminMessageEmail(user.email, user.name, subject.trim(), message.trim());

  res.json({ status: "success", message: "Message envoyé" });
});

// PATCH /api/admin/products/:id/availability  { isAvailable: boolean }
adminRouter.patch("/products/:id/availability", async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { isAvailable } = req.body;
  if (typeof isAvailable !== "boolean") {
    throw new AppError("isAvailable doit être un booléen", 400);
  }
  const product = await queryOne<any>("SELECT id, title FROM products WHERE id = $1", [id]);
  if (!product) throw new AppError("Produit introuvable", 404);

  await query("UPDATE products SET is_available = $1 WHERE id = $2", [isAvailable, id]);

  res.json({ status: "success", message: isAvailable ? "Produit activé" : "Produit désactivé" });
});

// DELETE /api/admin/products/:id
adminRouter.delete("/products/:id", async (req: AuthRequest, res) => {
  const { id } = req.params;
  const product = await queryOne<any>("SELECT id FROM products WHERE id = $1", [id]);
  if (!product) throw new AppError("Produit introuvable", 404);

  await query("DELETE FROM order_items WHERE product_id = $1", [id]);
  await query("DELETE FROM product_reviews WHERE product_id = $1", [id]);
  await query("DELETE FROM products WHERE id = $1", [id]);

  res.json({ status: "success", message: "Produit supprimé" });
});
