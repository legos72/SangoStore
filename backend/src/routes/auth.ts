import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Joi from "joi";
import { query, queryOne } from "../config/database";
import { AppError } from "../middleware/errorHandler";
import { authenticate } from "../middleware/auth";
import type { AuthRequest } from "../middleware/auth";
import { sendAccountPendingEmail } from "../services/email";

export const authRouter = Router();

const registerSchema = Joi.object({
  name:        Joi.string().min(2).max(100).required(),
  email:       Joi.string().email().required(),
  phone:       Joi.string().pattern(/^\+?[0-9]{8,15}$/).optional(),
  password:    Joi.string().min(8).required(),
  role:        Joi.string().valid("client", "vendeur", "transporteur").required(),
  countryCode: Joi.string().length(2).uppercase().required(),
});

const loginSchema = Joi.object({
  email:    Joi.string().email().required(),
  password: Joi.string().required(),
});

function signToken(user: { id: string; email: string; role: string }) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" } as any
  );
}

// POST /api/auth/register
authRouter.post("/register", async (req, res) => {
  const { error, value } = registerSchema.validate(req.body);
  if (error) throw new AppError(error.details[0].message, 400);

  const existing = await queryOne("SELECT id FROM users WHERE email = $1", [value.email]);
  if (existing) throw new AppError("Cet email est déjà utilisé", 409);

  const passwordHash = await bcrypt.hash(value.password, 12);

  // Clients accèdent immédiatement ; vendeurs/transporteurs doivent être validés
  const status = value.role === "client" ? "approved" : "pending";

  const [user] = await query<any>(
    `INSERT INTO users (name, email, phone, password_hash, role, country_code, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, name, email, role, status`,
    [value.name, value.email, value.phone ?? null, passwordHash, value.role, value.countryCode.toUpperCase(), status]
  );

  // Email de notification pour vendeur/transporteur
  if (status === "pending") {
    sendAccountPendingEmail(user.email, user.name, user.role).catch(() => {});
  }

  if (status === "approved") {
    const token = signToken(user);
    return res.status(201).json({
      status: "success",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, accountStatus: "approved" },
    });
  }

  // Compte en attente — pas de token
  res.status(201).json({
    status: "pending",
    message: "Votre compte est en cours de validation. Vous recevrez un email sous 24–48h.",
    user: { id: user.id, name: user.name, email: user.email, role: user.role, accountStatus: "pending" },
  });
});

// POST /api/auth/login
authRouter.post("/login", async (req, res) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) throw new AppError(error.details[0].message, 400);

  const user = await queryOne<any>(
    "SELECT id, name, email, password_hash, role, status FROM users WHERE email = $1 AND is_active = TRUE",
    [value.email]
  );
  if (!user) throw new AppError("Email ou mot de passe incorrect", 401);

  const valid = await bcrypt.compare(value.password, user.password_hash);
  if (!valid) throw new AppError("Email ou mot de passe incorrect", 401);

  if (user.status === "pending") {
    throw new AppError("Votre compte est en attente de validation par notre équipe.", 403);
  }
  if (user.status === "rejected") {
    throw new AppError("Votre demande de compte n'a pas été approuvée. Contactez-nous pour plus d'informations.", 403);
  }

  const token = signToken(user);

  res.json({
    status: "success",
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, accountStatus: user.status },
  });
});

// GET /api/auth/me
authRouter.get("/me", authenticate, async (req: AuthRequest, res) => {
  const user = await queryOne(
    "SELECT id, name, email, phone, role, status, country_code, avatar_url, is_verified, created_at FROM users WHERE id = $1",
    [req.user!.id]
  );
  if (!user) throw new AppError("Utilisateur introuvable", 404);
  res.json({ status: "success", user });
});
