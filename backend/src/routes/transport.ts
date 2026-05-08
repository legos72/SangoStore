import { Router } from "express";
import { query, queryOne } from "../config/database";
import { authenticate, authorize } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import type { AuthRequest } from "../middleware/auth";

export const transportRouter = Router();

// ─── Tracking number generator ────────────────────────────────────────────────
async function generateTrackingNumber(): Promise<string> {
  const row = await queryOne<{ nextval: string }>("SELECT nextval('transport_booking_seq')", []);
  const year = new Date().getFullYear();
  const seq  = String(row!.nextval).padStart(6, "0");
  return `SG-${year}-${seq}`;
}

// ─── CLIENT ROUTES ────────────────────────────────────────────────────────────

// POST /api/transport/bookings — create booking
transportRouter.post("/bookings", authenticate, async (req: AuthRequest, res) => {
  const {
    tripId,
    senderName, senderPhone, senderAddress,
    recipientName, recipientPhone, recipientAddress,
    packageDescription, weightKg, dimensions,
    packagePhotos, packageVideo, notes,
  } = req.body;

  if (!tripId || !senderName || !senderPhone || !senderAddress ||
      !recipientName || !recipientPhone || !recipientAddress ||
      !packageDescription || !weightKg) {
    throw new AppError("Champs obligatoires manquants", 400);
  }

  const trip = await queryOne<any>(
    "SELECT t.*, tr.currency FROM trips t LEFT JOIN transporters tr ON tr.id = t.transporter_id WHERE t.id = $1 AND t.is_active = TRUE",
    [tripId]
  );
  if (!trip) throw new AppError("Trajet introuvable ou inactif", 404);

  const weight = parseFloat(weightKg);
  if (isNaN(weight) || weight <= 0) throw new AppError("Poids invalide", 400);
  if (weight > parseFloat(trip.available_capacity)) {
    throw new AppError(`Capacité insuffisante. Disponible : ${trip.available_capacity} kg`, 400);
  }

  const totalPrice = (weight * parseFloat(trip.price_per_kg)).toFixed(2);

  const [booking] = await query<any>(
    `INSERT INTO transport_bookings
      (trip_id, client_id,
       sender_name, sender_phone, sender_address,
       recipient_name, recipient_phone, recipient_address,
       package_description, weight_kg, dimensions,
       package_photos, package_video, notes,
       total_price, currency, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,'pending')
     RETURNING *`,
    [
      tripId, req.user!.id,
      senderName, senderPhone, senderAddress,
      recipientName, recipientPhone, recipientAddress,
      packageDescription, weight, dimensions || null,
      packagePhotos || [], packageVideo || null, notes || null,
      totalPrice, trip.currency,
    ]
  );

  res.status(201).json({ status: "success", data: booking });
});

// GET /api/transport/bookings — client's bookings
transportRouter.get("/bookings", authenticate, async (req: AuthRequest, res) => {
  const bookings = await query<any>(
    `SELECT b.*,
       t.origin_country, t.destination_city, t.departure_date, t.arrival_date,
       tr.company_name AS transporter_company, tr.contact_phone AS transporter_phone, tr.contact_wa AS transporter_wa,
       u.name AS transporter_name
     FROM transport_bookings b
     LEFT JOIN trips t ON b.trip_id = t.id
     LEFT JOIN transporters tr ON t.transporter_id = tr.id
     LEFT JOIN users u ON tr.user_id = u.id
     WHERE b.client_id = $1
     ORDER BY b.created_at DESC`,
    [req.user!.id]
  );

  for (const b of bookings) {
    b.tracking_steps = await query<any>(
      "SELECT * FROM transport_tracking WHERE booking_id = $1 ORDER BY created_at ASC",
      [b.id]
    );
  }

  res.json({ status: "success", data: bookings });
});

// GET /api/transport/bookings/:id — booking detail (client or transporter)
transportRouter.get("/bookings/:id", authenticate, async (req: AuthRequest, res) => {
  const booking = await queryOne<any>(
    `SELECT b.*,
       t.origin_country, t.destination_city, t.departure_date, t.arrival_date,
       t.price_per_kg, t.currency AS trip_currency,
       tr.id AS transporter_id, tr.company_name, tr.contact_phone, tr.contact_wa,
       u.name AS transporter_name,
       uc.name AS client_name, uc.email AS client_email
     FROM transport_bookings b
     LEFT JOIN trips t        ON b.trip_id = t.id
     LEFT JOIN transporters tr ON t.transporter_id = tr.id
     LEFT JOIN users u        ON tr.user_id = u.id
     LEFT JOIN users uc       ON b.client_id = uc.id
     WHERE b.id = $1`,
    [req.params.id]
  );

  if (!booking) throw new AppError("Réservation introuvable", 404);

  // Only client or the transporter owner can view
  const isClient      = booking.client_id === req.user!.id;
  const transporter   = await queryOne<any>("SELECT user_id FROM transporters WHERE id = $1", [booking.transporter_id]);
  const isTransporter = transporter?.user_id === req.user!.id;

  if (!isClient && !isTransporter && req.user!.role !== "admin") {
    throw new AppError("Accès refusé", 403);
  }

  booking.tracking_steps = await query<any>(
    "SELECT * FROM transport_tracking WHERE booking_id = $1 ORDER BY created_at ASC",
    [booking.id]
  );

  res.json({ status: "success", data: booking });
});

// GET /api/transport/track/:trackingNumber — public tracking
transportRouter.get("/track/:trackingNumber", async (req, res) => {
  const booking = await queryOne<any>(
    `SELECT b.tracking_number, b.status, b.weight_kg, b.package_description,
       b.sender_name, b.recipient_name, b.recipient_address,
       t.origin_country, t.destination_city, t.departure_date, t.arrival_date,
       tr.company_name, tr.contact_wa
     FROM transport_bookings b
     LEFT JOIN trips t        ON b.trip_id = t.id
     LEFT JOIN transporters tr ON t.transporter_id = tr.id
     WHERE b.tracking_number = $1`,
    [req.params.trackingNumber.toUpperCase()]
  );

  if (!booking) throw new AppError("Numéro de suivi introuvable", 404);

  const steps = await query<any>(
    "SELECT status, description, location, created_at FROM transport_tracking WHERE booking_id = (SELECT id FROM transport_bookings WHERE tracking_number = $1) ORDER BY created_at ASC",
    [req.params.trackingNumber.toUpperCase()]
  );

  res.json({ status: "success", data: { ...booking, tracking_steps: steps } });
});

// ─── TRANSPORTER ROUTES ───────────────────────────────────────────────────────

// GET /api/transport/transporter/bookings — incoming bookings for transporter
transportRouter.get("/transporter/bookings", authenticate, authorize("transporteur"), async (req: AuthRequest, res) => {
  const transporter = await queryOne<any>("SELECT id FROM transporters WHERE user_id = $1", [req.user!.id]);
  if (!transporter) throw new AppError("Profil transporteur introuvable", 404);

  const { status } = req.query as Record<string, string>;
  const params: any[] = [transporter.id];
  let statusFilter = "";
  if (status && status !== "all") {
    params.push(status);
    statusFilter = `AND b.status = $${params.length}`;
  }

  const bookings = await query<any>(
    `SELECT b.*,
       t.origin_country, t.destination_city, t.departure_date,
       uc.name AS client_name, uc.email AS client_email, uc.phone AS client_phone
     FROM transport_bookings b
     LEFT JOIN trips t   ON b.trip_id = t.id
     LEFT JOIN users uc  ON b.client_id = uc.id
     WHERE t.transporter_id = $1 ${statusFilter}
     ORDER BY b.created_at DESC`,
    params
  );

  res.json({ status: "success", data: bookings });
});

// PATCH /api/transport/bookings/:id/status — transporter accepts/refuses
transportRouter.patch("/bookings/:id/status", authenticate, authorize("transporteur", "admin"), async (req: AuthRequest, res) => {
  const { status } = req.body;

  if (!["accepted", "refused"].includes(status)) {
    throw new AppError("Statut invalide. Valeurs : accepted, refused", 400);
  }

  const booking = await queryOne<any>(
    `SELECT b.*, t.transporter_id, t.available_capacity, tr.user_id AS transporter_user_id
     FROM transport_bookings b
     LEFT JOIN trips t         ON b.trip_id = t.id
     LEFT JOIN transporters tr ON t.transporter_id = tr.id
     WHERE b.id = $1`,
    [req.params.id]
  );
  if (!booking) throw new AppError("Réservation introuvable", 404);
  if (booking.transporter_user_id !== req.user!.id && req.user!.role !== "admin") {
    throw new AppError("Accès refusé", 403);
  }
  if (booking.status !== "pending") {
    throw new AppError("Cette réservation a déjà été traitée", 400);
  }

  let trackingNumber = booking.tracking_number;

  if (status === "accepted") {
    // Reduce available capacity
    await query(
      "UPDATE trips SET available_capacity = available_capacity - $1 WHERE id = $2",
      [booking.weight_kg, booking.trip_id]
    );
    // Generate tracking number
    trackingNumber = await generateTrackingNumber();
    // Add initial tracking step
    await query(
      "INSERT INTO transport_tracking (booking_id, status, description, updated_by) VALUES ($1,'accepted','Réservation acceptée par le transporteur',$2)",
      [booking.id, req.user!.id]
    );
  }

  const [updated] = await query<any>(
    "UPDATE transport_bookings SET status=$1, tracking_number=$2, updated_at=NOW() WHERE id=$3 RETURNING *",
    [status, trackingNumber, booking.id]
  );

  res.json({ status: "success", data: updated });
});

// PATCH /api/transport/bookings/:id/tracking — transporter updates tracking status
transportRouter.patch("/bookings/:id/tracking", authenticate, authorize("transporteur", "admin"), async (req: AuthRequest, res) => {
  const { trackingStatus, description, location } = req.body;

  const VALID_STATUSES = ["colis_recu", "depart_confirme", "arrive_aeroport", "arrive_destination", "disponible_relais", "livre"];
  if (!trackingStatus || !VALID_STATUSES.includes(trackingStatus)) {
    throw new AppError(`Statut invalide. Valeurs : ${VALID_STATUSES.join(", ")}`, 400);
  }

  const booking = await queryOne<any>(
    `SELECT b.id, b.status, tr.user_id AS transporter_user_id
     FROM transport_bookings b
     LEFT JOIN trips t         ON b.trip_id = t.id
     LEFT JOIN transporters tr ON t.transporter_id = tr.id
     WHERE b.id = $1`,
    [req.params.id]
  );
  if (!booking) throw new AppError("Réservation introuvable", 404);
  if (booking.transporter_user_id !== req.user!.id && req.user!.role !== "admin") {
    throw new AppError("Accès refusé", 403);
  }
  if (booking.status !== "accepted" && booking.status !== "in_transit") {
    throw new AppError("La réservation doit être acceptée avant de mettre à jour le suivi", 400);
  }

  // Map tracking status to booking status
  const bookingStatus = trackingStatus === "livre" ? "delivered"
    : trackingStatus === "colis_recu" ? "accepted"
    : "in_transit";

  await query(
    "INSERT INTO transport_tracking (booking_id, status, description, location, updated_by) VALUES ($1,$2,$3,$4,$5)",
    [booking.id, trackingStatus, description || null, location || null, req.user!.id]
  );

  await query(
    "UPDATE transport_bookings SET status=$1, updated_at=NOW() WHERE id=$2",
    [bookingStatus, booking.id]
  );

  res.json({ status: "success", message: "Statut mis à jour" });
});

// GET /api/transport/transporter/trips — transporter's trips with booking stats
transportRouter.get("/transporter/trips", authenticate, authorize("transporteur"), async (req: AuthRequest, res) => {
  const transporter = await queryOne<any>("SELECT id FROM transporters WHERE user_id = $1", [req.user!.id]);
  if (!transporter) throw new AppError("Profil transporteur introuvable", 404);

  const trips = await query<any>(
    `SELECT t.*,
       COUNT(b.id) FILTER (WHERE b.status = 'pending')  AS pending_bookings,
       COUNT(b.id) FILTER (WHERE b.status = 'accepted') AS accepted_bookings,
       COALESCE(SUM(b.weight_kg) FILTER (WHERE b.status = 'accepted'), 0) AS booked_kg
     FROM trips t
     LEFT JOIN transport_bookings b ON b.trip_id = t.id
     WHERE t.transporter_id = $1
     GROUP BY t.id
     ORDER BY t.departure_date DESC`,
    [transporter.id]
  );

  res.json({ status: "success", data: trips });
});
