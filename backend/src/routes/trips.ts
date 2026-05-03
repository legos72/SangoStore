import { Router } from "express";
import Joi from "joi";
import { query, queryOne } from "../config/database";
import { authenticate, authorize } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import type { AuthRequest } from "../middleware/auth";

export const tripsRouter = Router();

// GET /api/trips
tripsRouter.get("/", async (req, res) => {
  const { country, date } = req.query as Record<string, string>;

  const conditions = ["t.is_active = TRUE", "t.departure_date >= CURRENT_DATE"];
  const params: any[] = [];

  if (country) {
    params.push(country.toUpperCase());
    conditions.push(`t.origin_country = $${params.length}`);
  }
  if (date) {
    params.push(date);
    conditions.push(`t.departure_date >= $${params.length}`);
  }

  const trips = await query(
    `SELECT t.*, tr.company_name, tr.is_verified, tr.contact_phone, tr.contact_wa,
       u.name AS transporter_name, u.country_code,
       COALESCE(AVG(r.rating), 0)::NUMERIC(3,2) AS transporter_rating
     FROM trips t
     LEFT JOIN transporters tr ON t.transporter_id = tr.id
     LEFT JOIN users u ON tr.user_id = u.id
     LEFT JOIN transporter_reviews r ON r.transporter_id = tr.id
     WHERE ${conditions.join(" AND ")}
     GROUP BY t.id, tr.company_name, tr.is_verified, tr.contact_phone, tr.contact_wa, u.name, u.country_code
     ORDER BY t.departure_date ASC`,
    params
  );

  res.json({ status: "success", data: trips });
});

// POST /api/trips
tripsRouter.post("/", authenticate, authorize("transporteur", "admin"), async (req: AuthRequest, res) => {
  const schema = Joi.object({
    originCountry:     Joi.string().length(2).uppercase().required(),
    destinationCity:   Joi.string().default("Bangui"),
    departureDate:     Joi.date().iso().greater("now").required(),
    arrivalDate:       Joi.date().iso().optional(),
    pricePerKg:        Joi.number().positive().required(),
    currency:          Joi.string().valid("XAF", "EUR", "USD").required(),
    availableCapacity: Joi.number().positive().required(),
    description:       Joi.string().max(2000).optional(),
  });

  const { error, value } = schema.validate(req.body);
  if (error) throw new AppError(error.details[0].message, 400);

  const transporter = await queryOne<any>(
    "SELECT id FROM transporters WHERE user_id = $1",
    [req.user!.id]
  );
  if (!transporter) throw new AppError("Vous devez d'abord créer un profil transporteur", 400);

  const [trip] = await query(
    `INSERT INTO trips
       (transporter_id, origin_country, destination_city, departure_date, arrival_date, price_per_kg, currency, available_capacity, description)
     VALUES ($1,$2,$3,$4,$5,$6,$7::currency,$8,$9)
     RETURNING *`,
    [
      transporter.id, value.originCountry, value.destinationCity,
      value.departureDate, value.arrivalDate, value.pricePerKg,
      value.currency, value.availableCapacity, value.description,
    ]
  );

  res.status(201).json({ status: "success", data: trip });
});

// PATCH /api/trips/:id
tripsRouter.patch("/:id", authenticate, authorize("transporteur", "admin"), async (req: AuthRequest, res) => {
  const [trip] = await query(
    `UPDATE trips SET
       price_per_kg = COALESCE($1, price_per_kg),
       available_capacity = COALESCE($2, available_capacity),
       departure_date = COALESCE($3, departure_date),
       is_active = COALESCE($4, is_active)
     WHERE id = $5 RETURNING *`,
    [req.body.pricePerKg, req.body.availableCapacity, req.body.departureDate, req.body.isActive, req.params.id]
  );
  if (!trip) throw new AppError("Trajet introuvable", 404);
  res.json({ status: "success", data: trip });
});
