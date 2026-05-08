import { Router } from "express";
import Joi from "joi";
import { query, queryOne } from "../config/database";
import { authenticate, authorize } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import type { AuthRequest } from "../middleware/auth";

export const transportersRouter = Router();

// GET /api/transporters
transportersRouter.get("/", async (req, res) => {
  const { country, verified } = req.query as Record<string, string>;

  const conditions: string[] = [];
  const params: any[] = [];

  if (country) {
    params.push(country.toUpperCase());
    conditions.push(`u.country_code = $${params.length}`);
  }
  if (verified === "true") {
    conditions.push(`t.is_verified = TRUE`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const transporters = await query(
    `SELECT t.*,
       u.name, u.country_code, u.avatar_url,
       COALESCE(AVG(r.rating), 0)::NUMERIC(3,2) AS avg_rating,
       COUNT(DISTINCT r.id) AS review_count,
       (SELECT row_to_json(tr)
        FROM (
          SELECT id, origin_country, destination_city, departure_date, price_per_kg, currency, available_capacity
          FROM trips
          WHERE transporter_id = t.id AND is_active = TRUE AND departure_date >= NOW()
          ORDER BY departure_date ASC
          LIMIT 1
        ) tr
       ) AS next_trip
     FROM transporters t
     LEFT JOIN users u ON t.user_id = u.id
     LEFT JOIN transporter_reviews r ON r.transporter_id = t.id
     ${where}
     GROUP BY t.id, u.name, u.country_code, u.avatar_url
     ORDER BY avg_rating DESC`,
    params
  );

  res.json({ status: "success", data: transporters });
});

// GET /api/transporters/:id
transportersRouter.get("/:id", async (req, res) => {
  const transporter = await queryOne(
    `SELECT t.*, u.name, u.country_code, u.avatar_url, u.email
     FROM transporters t LEFT JOIN users u ON t.user_id = u.id
     WHERE t.id = $1`,
    [req.params.id]
  );
  if (!transporter) throw new AppError("Transporteur introuvable", 404);

  const reviews = await query(
    `SELECT r.*, u.name AS author_name FROM transporter_reviews r
     LEFT JOIN users u ON r.author_id = u.id
     WHERE r.transporter_id = $1 ORDER BY r.created_at DESC LIMIT 10`,
    [req.params.id]
  );

  const trips = await query(
    "SELECT * FROM trips WHERE transporter_id = $1 AND is_active = TRUE ORDER BY departure_date ASC",
    [req.params.id]
  );

  res.json({ status: "success", data: { ...transporter, reviews, trips } });
});

// POST /api/transporters — create transporter profile
transportersRouter.post("/", authenticate, authorize("transporteur", "admin"), async (req: AuthRequest, res) => {
  const schema = Joi.object({
    companyName:   Joi.string().min(2).max(255).required(),
    description:   Joi.string().max(2000).optional(),
    contactPhone:  Joi.string().required(),
    contactWa:     Joi.string().optional(),
    contactEmail:  Joi.string().email().optional(),
  });

  const { error, value } = schema.validate(req.body);
  if (error) throw new AppError(error.details[0].message, 400);

  const existing = await queryOne("SELECT id FROM transporters WHERE user_id = $1", [req.user!.id]);
  if (existing) throw new AppError("Vous avez déjà un profil transporteur", 409);

  const [transporter] = await query(
    `INSERT INTO transporters (user_id, company_name, description, contact_phone, contact_wa, contact_email)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [req.user!.id, value.companyName, value.description, value.contactPhone, value.contactWa, value.contactEmail]
  );

  res.status(201).json({ status: "success", data: transporter });
});

// POST /api/transporters/:id/reviews
transportersRouter.post("/:id/reviews", authenticate, async (req: AuthRequest, res) => {
  const schema = Joi.object({
    rating:  Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().max(1000).optional(),
  });

  const { error, value } = schema.validate(req.body);
  if (error) throw new AppError(error.details[0].message, 400);

  const [review] = await query(
    `INSERT INTO transporter_reviews (transporter_id, author_id, rating, comment)
     VALUES ($1,$2,$3,$4)
     ON CONFLICT (transporter_id, author_id) DO UPDATE SET rating = $3, comment = $4
     RETURNING *`,
    [req.params.id, req.user!.id, value.rating, value.comment]
  );

  res.status(201).json({ status: "success", data: review });
});
