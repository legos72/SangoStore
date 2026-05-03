import { Router } from "express";
import Joi from "joi";
import { v4 as uuidv4 } from "uuid";
import { query, queryOne } from "../config/database";
import { authenticate, authorize } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import type { AuthRequest } from "../middleware/auth";

export const ordersRouter = Router();

// GET /api/orders — get my orders
ordersRouter.get("/", authenticate, async (req: AuthRequest, res) => {
  const { status, page = "1", limit = "10" } = req.query as Record<string, string>;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const params: any[] = [req.user!.id];
  let where = `o.client_id = $1`;

  if (req.user!.role === "admin") {
    params.pop();
    where = "TRUE";
  }

  if (status) {
    params.push(status);
    where += ` AND o.status = $${params.length}::order_status`;
  }

  const orders = await query(
    `SELECT o.*, u.name AS client_name
     FROM orders o
     LEFT JOIN users u ON o.client_id = u.id
     WHERE ${where}
     ORDER BY o.created_at DESC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, parseInt(limit), offset]
  );

  for (const order of orders) {
    order.items = await query(
      `SELECT oi.*, p.title, p.images[1] AS image, p.origin_country
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [order.id]
    );
  }

  res.json({ status: "success", data: orders });
});

// GET /api/orders/:id
ordersRouter.get("/:id", authenticate, async (req: AuthRequest, res) => {
  const order = await queryOne<any>(
    `SELECT o.*, u.name AS client_name, pp.name AS pickup_name, pp.address AS pickup_address
     FROM orders o
     LEFT JOIN users u ON o.client_id = u.id
     LEFT JOIN pickup_points pp ON o.pickup_point_id = pp.id
     WHERE o.id = $1`,
    [req.params.id]
  );
  if (!order) throw new AppError("Commande introuvable", 404);
  if (order.client_id !== req.user!.id && req.user!.role !== "admin") {
    throw new AppError("Non autorisé", 403);
  }

  order.items = await query(
    `SELECT oi.*, p.title, p.images[1] AS image, p.origin_country, p.currency
     FROM order_items oi
     LEFT JOIN products p ON oi.product_id = p.id
     WHERE oi.order_id = $1`,
    [order.id]
  );

  res.json({ status: "success", data: order });
});

// POST /api/orders — create order
ordersRouter.post("/", authenticate, authorize("client", "admin"), async (req: AuthRequest, res) => {
  const schema = Joi.object({
    items: Joi.array().items(Joi.object({
      productId: Joi.string().uuid().required(),
      quantity:  Joi.number().integer().min(1).required(),
    })).min(1).required(),
    paymentMethod: Joi.string().valid("orange_money", "cash").required(),
    pickupPointId: Joi.string().uuid().required(),
  });

  const { error, value } = schema.validate(req.body);
  if (error) throw new AppError(error.details[0].message, 400);

  // Validate products and compute total
  let totalAmount = 0;
  const resolvedItems: any[] = [];

  for (const item of value.items) {
    const product = await queryOne<any>(
      "SELECT * FROM products WHERE id = $1 AND is_available = TRUE",
      [item.productId]
    );
    if (!product) throw new AppError(`Produit ${item.productId} introuvable ou indisponible`, 400);
    if (product.stock < item.quantity) throw new AppError(`Stock insuffisant pour ${product.title}`, 400);

    totalAmount += product.price * item.quantity;
    resolvedItems.push({ ...item, product, unitPrice: product.price });
  }

  // Create order
  const orderNumber = `DM-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
  const currency = resolvedItems[0].product.currency;

  const [order] = await query(
    `INSERT INTO orders (client_id, order_number, total_amount, currency, payment_method, pickup_point_id)
     VALUES ($1, $2, $3, $4, $5::payment_method, $6)
     RETURNING *`,
    [req.user!.id, orderNumber, totalAmount, currency, value.paymentMethod, value.pickupPointId]
  );

  // Insert items & reduce stock
  for (const item of resolvedItems) {
    await query(
      "INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ($1,$2,$3,$4)",
      [order.id, item.productId, item.quantity, item.unitPrice]
    );
    await query(
      "UPDATE products SET stock = stock - $1 WHERE id = $2",
      [item.quantity, item.productId]
    );
  }

  // Create escrow transaction
  await query(
    "INSERT INTO escrow_transactions (order_id, amount, currency, reference) VALUES ($1,$2,$3,$4)",
    [order.id, totalAmount, currency, `ESC-${uuidv4().slice(0, 8).toUpperCase()}`]
  );

  res.status(201).json({ status: "success", data: order });
});

// PATCH /api/orders/:id/status — update order status (admin/transporteur)
ordersRouter.patch("/:id/status", authenticate, authorize("admin", "transporteur", "vendeur"), async (req: AuthRequest, res) => {
  const { status } = req.body;

  const validStatuses = ["paye", "en_preparation", "expedie", "arrive_bangui", "pret_retrait", "recupere", "annule"];
  if (!validStatuses.includes(status)) throw new AppError("Statut invalide", 400);

  const [order] = await query(
    "UPDATE orders SET status = $1::order_status WHERE id = $2 RETURNING *",
    [status, req.params.id]
  );
  if (!order) throw new AppError("Commande introuvable", 404);

  // Auto-release escrow when order is recovered
  if (status === "recupere") {
    await query(
      "UPDATE orders SET payment_status = 'libere', escrow_released = TRUE WHERE id = $1",
      [req.params.id]
    );
    await query(
      "UPDATE escrow_transactions SET status = 'libere', released_at = NOW() WHERE order_id = $1",
      [req.params.id]
    );
  }

  res.json({ status: "success", data: order });
});
