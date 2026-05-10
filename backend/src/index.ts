import "express-async-errors";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

import { authRouter } from "./routes/auth";
import { productsRouter } from "./routes/products";
import { ordersRouter } from "./routes/orders";
import { transportersRouter } from "./routes/transporters";
import { tripsRouter } from "./routes/trips";
import { paymentsRouter } from "./routes/payments";
import { uploadsRouter } from "./routes/uploads";
import { vendorRouter } from "./routes/vendor";
import { adminRouter } from "./routes/admin";
import { transportRouter } from "./routes/transport";
import { analyticsRouter } from "./routes/analytics";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Security ─────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, server-to-server SSR)
      if (!origin) return callback(null, true);
      // Support comma-separated list: FRONTEND_URL=https://sangostore.com,http://localhost:3000
      const allowed = (process.env.FRONTEND_URL || "http://localhost:3000")
        .split(",")
        .map(s => s.trim());
      if (allowed.includes(origin)) return callback(null, true);
      callback(null, false);
    },
    credentials: true,
  })
);

// ─── Rate limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de requêtes, veuillez réessayer plus tard." },
});
app.use(limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Trop de tentatives de connexion." },
});

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ─── Logging ──────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// ─── Static uploads ───────────────────────────────────────────────────────────
// Override Helmet's same-origin CORP so the frontend (different port) can load images.
app.use("/uploads", (_req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
}, express.static(path.join(__dirname, "../uploads")));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth",         authLimiter, authRouter);
app.use("/api/products",     productsRouter);
app.use("/api/orders",       ordersRouter);
app.use("/api/transporters", transportersRouter);
app.use("/api/trips",        tripsRouter);
app.use("/api/payments",     paymentsRouter);
app.use("/api/uploads",      uploadsRouter);
app.use("/api/vendor",       vendorRouter);
app.use("/api/admin",        adminRouter);
app.use("/api/transport",    transportRouter);
app.use("/api/analytics",    analyticsRouter);

// ─── Error handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════╗
  ║   DiasporaMarket API — v1.0.0         ║
  ║   Running on port ${PORT}               ║
  ║   ENV: ${process.env.NODE_ENV || "development"}                ║
  ╚═══════════════════════════════════════╝
  `);
});

export default app;
