import { Router } from "express";
import Joi from "joi";
import { query, queryOne } from "../config/database";
import { authenticate } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import type { AuthRequest } from "../middleware/auth";

export const paymentsRouter = Router();

/**
 * POST /api/payments/initiate
 * Initiate an Orange Money or cash payment — puts order in escrow
 */
paymentsRouter.post("/initiate", authenticate, async (req: AuthRequest, res) => {
  const schema = Joi.object({
    orderId:       Joi.string().uuid().required(),
    paymentMethod: Joi.string().valid("orange_money", "cash").required(),
    phoneNumber:   Joi.when("paymentMethod", {
      is: "orange_money",
      then: Joi.string().pattern(/^\+?[0-9]{8,15}$/).required(),
      otherwise: Joi.optional(),
    }),
  });

  const { error, value } = schema.validate(req.body);
  if (error) throw new AppError(error.details[0].message, 400);

  const order = await queryOne<any>(
    "SELECT * FROM orders WHERE id = $1 AND client_id = $2",
    [value.orderId, req.user!.id]
  );
  if (!order) throw new AppError("Commande introuvable", 404);
  if (order.payment_status !== "en_attente") throw new AppError("Paiement déjà traité", 409);

  // Simulate Orange Money
  if (value.paymentMethod === "orange_money") {
    // In production: call Orange Money API here
    const mockOmReference = `OM-${Date.now()}-${Math.floor(Math.random() * 9999)}`;

    await query(
      `UPDATE orders SET payment_status = 'bloque', status = 'paye' WHERE id = $1`,
      [order.id]
    );
    await query(
      `UPDATE escrow_transactions SET status = 'bloque', reference = $1 WHERE order_id = $2`,
      [mockOmReference, order.id]
    );

    return res.json({
      status: "success",
      message: "Paiement Orange Money simulé — argent bloqué en escrow",
      reference: mockOmReference,
      escrowStatus: "bloque",
    });
  }

  // Cash: mark as pending manual validation
  await query(
    `UPDATE orders SET payment_status = 'en_attente', notes = 'Paiement cash en attente de validation' WHERE id = $1`,
    [order.id]
  );

  res.json({
    status: "success",
    message: "Commande enregistrée. Payez en espèces au point de retrait pour valider.",
    instructions: "Apportez le montant exact au point de retrait avec votre numéro de commande.",
  });
});

/**
 * POST /api/payments/release/:orderId
 * Release escrow after client confirms receipt (admin or auto)
 */
paymentsRouter.post("/release/:orderId", authenticate, async (req: AuthRequest, res) => {
  const order = await queryOne<any>(
    "SELECT * FROM orders WHERE id = $1",
    [req.params.orderId]
  );
  if (!order) throw new AppError("Commande introuvable", 404);

  const isOwner = order.client_id === req.user!.id;
  const isAdmin = req.user!.role === "admin";
  if (!isOwner && !isAdmin) throw new AppError("Non autorisé", 403);

  if (order.escrow_released) throw new AppError("Escrow déjà libéré", 409);
  if (order.status !== "pret_retrait" && order.status !== "recupere") {
    throw new AppError("La commande doit être prête au retrait pour libérer l'escrow", 400);
  }

  await query(
    `UPDATE orders SET payment_status = 'libere', escrow_released = TRUE, status = 'recupere', updated_at = NOW() WHERE id = $1`,
    [req.params.orderId]
  );
  await query(
    `UPDATE escrow_transactions SET status = 'libere', released_at = NOW() WHERE order_id = $1`,
    [req.params.orderId]
  );

  // In production: trigger payout to vendor here

  res.json({
    status: "success",
    message: "Escrow libéré — le vendeur sera payé sous 24–48h",
  });
});

/**
 * POST /api/payments/refund/:orderId — admin only
 */
paymentsRouter.post("/refund/:orderId", authenticate, async (req: AuthRequest, res) => {
  if (req.user!.role !== "admin") throw new AppError("Accès réservé aux admins", 403);

  const order = await queryOne<any>("SELECT * FROM orders WHERE id = $1", [req.params.orderId]);
  if (!order) throw new AppError("Commande introuvable", 404);
  if (order.payment_status === "rembourse") throw new AppError("Déjà remboursé", 409);

  await query(
    `UPDATE orders SET payment_status = 'rembourse', status = 'annule', updated_at = NOW() WHERE id = $1`,
    [req.params.orderId]
  );
  await query(
    `UPDATE escrow_transactions SET status = 'rembourse' WHERE order_id = $1`,
    [req.params.orderId]
  );

  res.json({ status: "success", message: "Remboursement initié — client notifié" });
});
