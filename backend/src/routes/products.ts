import { Router } from "express";
import Joi from "joi";
import { query, queryOne } from "../config/database";
import { authenticate, authorize } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import type { AuthRequest } from "../middleware/auth";

export const productsRouter = Router();

// GET /api/products — list with filters
productsRouter.get("/", async (req, res) => {
  const {
    search, country, category, minPrice, maxPrice,
    sortBy = "newest", page = "1", limit = "24",
  } = req.query as Record<string, string>;

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const params: any[] = [];
  const conditions: string[] = ["p.is_available = TRUE"];

  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(p.title ILIKE $${params.length} OR p.description ILIKE $${params.length})`);
  }
  if (country) {
    params.push(country.toUpperCase());
    conditions.push(`p.origin_country = $${params.length}`);
  }
  if (category) {
    params.push(category);
    conditions.push(`p.category = $${params.length}::product_category`);
  }
  if (minPrice) {
    params.push(parseFloat(minPrice));
    conditions.push(`p.price >= $${params.length}`);
  }
  if (maxPrice) {
    params.push(parseFloat(maxPrice));
    conditions.push(`p.price <= $${params.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const orderMap: Record<string, string> = {
    newest:     "p.created_at DESC",
    price_asc:  "p.price ASC",
    price_desc: "p.price DESC",
    rating:     "avg_rating DESC NULLS LAST",
  };
  const orderBy = orderMap[sortBy] || orderMap.newest;

  const sql = `
    SELECT
      p.*,
      u.name AS seller_name,
      u.country_code AS seller_country,
      u.is_verified AS seller_verified,
      COALESCE(AVG(r.rating), 0) AS avg_rating,
      COUNT(DISTINCT r.id) AS review_count
    FROM products p
    LEFT JOIN users u ON p.seller_id = u.id
    LEFT JOIN product_reviews r ON r.product_id = p.id
    ${whereClause}
    GROUP BY p.id, u.name, u.country_code, u.is_verified
    ORDER BY ${orderBy}
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;

  params.push(parseInt(limit), offset);
  const products = await query(sql, params);

  // Total count
  const countSql = `SELECT COUNT(*) FROM products p ${whereClause}`;
  const [{ count }] = await query(countSql, params.slice(0, -2));

  res.json({
    status: "success",
    data: products,
    pagination: {
      total: parseInt(count),
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(parseInt(count) / parseInt(limit)),
    },
  });
});

// GET /api/products/:id
productsRouter.get("/:id", async (req, res) => {
  const product = await queryOne(
    `SELECT p.*, u.name AS seller_name, u.country_code AS seller_country, u.is_verified AS seller_verified
     FROM products p
     LEFT JOIN users u ON p.seller_id = u.id
     WHERE p.id = $1`,
    [req.params.id]
  );
  if (!product) throw new AppError("Produit introuvable", 404);

  const reviews = await query(
    `SELECT r.*, u.name AS author_name FROM product_reviews r
     LEFT JOIN users u ON r.author_id = u.id
     WHERE r.product_id = $1 ORDER BY r.created_at DESC LIMIT 10`,
    [req.params.id]
  );

  res.json({ status: "success", data: { ...product, reviews } });
});

// POST /api/products — vendeur only
productsRouter.post("/", authenticate, authorize("vendeur", "admin"), async (req: AuthRequest, res) => {
  const wholesaleTierSchema = Joi.object({
    min_qty: Joi.number().integer().min(1).required(),
    max_qty: Joi.number().integer().min(1).optional().allow(null),
    price:   Joi.number().positive().required(),
  });

  const schema = Joi.object({
    title:           Joi.string().min(3).max(500).required(),
    description:     Joi.string().max(5000).optional(),
    price:           Joi.number().positive().required(),
    currency:        Joi.string().valid("XAF", "EUR", "USD").required(),
    images:          Joi.array().items(Joi.string().min(1)).default([]),
    category:        Joi.string().required(),
    originCountry:   Joi.string().length(2).uppercase().required(),
    stock:           Joi.number().integer().min(0).required(),
    weightKg:        Joi.number().positive().optional(),
    dimensions:      Joi.string().max(100).optional(),
    tags:            Joi.array().items(Joi.string()).default([]),
    // Promotion
    promoPrice:      Joi.number().positive().optional().allow(null),
    promoEnd:        Joi.string().isoDate().optional().allow(null, ""),
    // Wholesale tiers
    wholesalePrices: Joi.array().items(wholesaleTierSchema).default([]),
  });

  const { error, value } = schema.validate(req.body);
  if (error) throw new AppError(error.details[0].message, 400);

  // Validate promo price is below normal price
  if (value.promoPrice && value.promoPrice >= value.price) {
    throw new AppError("Le prix promotionnel doit être inférieur au prix normal", 400);
  }

  const [product] = await query(
    `INSERT INTO products
      (seller_id, title, description, price, currency, images, category, origin_country,
       stock, weight_kg, dimensions, tags, promo_price, promo_end, wholesale_prices)
     VALUES ($1,$2,$3,$4,$5,$6,$7::product_category,$8,$9,$10,$11,$12,$13,$14,$15)
     RETURNING *`,
    [
      req.user!.id, value.title, value.description, value.price, value.currency,
      value.images, value.category, value.originCountry.toUpperCase(),
      value.stock, value.weightKg, value.dimensions, value.tags,
      value.promoPrice ?? null,
      value.promoEnd   ? new Date(value.promoEnd) : null,
      JSON.stringify(value.wholesalePrices),
    ]
  );

  res.status(201).json({ status: "success", data: product });
});

// PATCH /api/products/:id
productsRouter.patch("/:id", authenticate, authorize("vendeur", "admin"), async (req: AuthRequest, res) => {
  const existing = await queryOne<any>(
    "SELECT * FROM products WHERE id = $1",
    [req.params.id]
  );
  if (!existing) throw new AppError("Produit introuvable", 404);
  if (existing.seller_id !== req.user!.id && req.user!.role !== "admin") {
    throw new AppError("Non autorisé à modifier ce produit", 403);
  }

  const allowed = ["title", "description", "price", "currency", "images", "category", "origin_country", "stock", "weight_kg", "dimensions", "tags", "is_available", "promo_price", "promo_end", "wholesale_prices"];
  const updates: string[] = [];
  const params: any[] = [];

  for (const key of allowed) {
    const bodyKey = key.replace(/_([a-z])/g, (_, l) => l.toUpperCase());
    if (req.body[bodyKey] !== undefined) {
      let value = req.body[bodyKey];

      // JSONB columns: pg doesn't auto-serialize JS arrays/objects
      if (key === "wholesale_prices") value = JSON.stringify(value ?? []);

      params.push(value);

      // Enum cast required: pg sends text, PostgreSQL won't implicitly coerce to enum
      const placeholder = key === "category"
        ? `$${params.length}::product_category`
        : `$${params.length}`;

      updates.push(`${key} = ${placeholder}`);
    }
  }

  if (updates.length === 0) throw new AppError("Aucune donnée à mettre à jour", 400);

  params.push(req.params.id);
  const [product] = await query(
    `UPDATE products SET ${updates.join(", ")} WHERE id = $${params.length} RETURNING *`,
    params
  );

  res.json({ status: "success", data: product });
});

// DELETE /api/products/:id
productsRouter.delete("/:id", authenticate, authorize("vendeur", "admin"), async (req: AuthRequest, res) => {
  const existing = await queryOne<any>("SELECT seller_id FROM products WHERE id = $1", [req.params.id]);
  if (!existing) throw new AppError("Produit introuvable", 404);
  if (existing.seller_id !== req.user!.id && req.user!.role !== "admin") {
    throw new AppError("Non autorisé", 403);
  }

  await query("DELETE FROM products WHERE id = $1", [req.params.id]);
  res.status(204).send();
});
