# SangoMarket by Legos — Diagramme d'Architecture

## Vue d'ensemble système

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        UTILISATEURS FINAUX                              │
│   Client Diaspora │ Vendeur (Afrique/Europe) │ Transporteur │ Admin     │
└────────────┬────────────────────────────────────────────────────────────┘
             │ HTTPS (port 3000)
             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    FRONTEND — Next.js 14 (App Router)                   │
│                         localhost:3000                                  │
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │   Pages      │  │  Composants  │  │  Contextes   │  │   Lib      │  │
│  │              │  │              │  │              │  │            │  │
│  │ / (home)     │  │ Navbar       │  │ CartContext  │  │ api.ts     │  │
│  │ /produits    │  │ Footer       │  │ CurrencyCtx  │  │ types.ts   │  │
│  │ /produits/id │  │ HeroSection  │  │ DeliveryCtx  │  │ i18n/      │  │
│  │ /panier      │  │ ProductCard  │  │              │  │ countries  │  │
│  │ /paiement    │  │ CartDrawer   │  │  5 langues   │  │ utils.ts   │  │
│  │ /commandes   │  │ CountryFilter│  │  FR EN ES    │  │            │  │
│  │ /dashboard   │  │ Transporter  │  │  PT DE       │  │ Zustand    │  │
│  │ /dashboard/  │  │  Card        │  │              │  │ React Query│  │
│  │  vendeur     │  │ DeliverySection              │  │            │  │
│  │ /dashboard/  │  │ CurrencySwtchr               │  │  3 devises │  │
│  │  admin       │  │ LanguageSwtchr               │  │  XAF EUR $ │  │
│  │ /transporteurs│  └──────────────┘  └──────────────┘  └────────────┘  │
│  │ /retrait     │                                                        │
│  │ /auth/login  │                                                        │
│  │ /auth/register│                                                       │
│  └──────────────┘                                                        │
└─────────────────────────────┬───────────────────────────────────────────┘
                              │ HTTP REST (port 4000)
                              │ Bearer JWT Token
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    BACKEND — Express.js + TypeScript                    │
│                         localhost:4000                                  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                      MIDDLEWARES GLOBAUX                        │    │
│  │  Helmet (sécurité)  │  CORS  │  Morgan (logs)  │  Rate Limiter  │    │
│  │  200 req/15min global  │  10 req/15min sur /auth                │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                         ROUTES API                              │    │
│  │                                                                  │    │
│  │  POST  /api/auth/register       GET    /api/products            │    │
│  │  POST  /api/auth/login          POST   /api/products            │    │
│  │  GET   /api/auth/me             GET    /api/products/:id        │    │
│  │                                 PATCH  /api/products/:id        │    │
│  │  GET   /api/orders              DELETE /api/products/:id        │    │
│  │  POST  /api/orders                                              │    │
│  │  GET   /api/orders/:id          GET    /api/vendor/stats        │    │
│  │  PATCH /api/orders/:id/status   GET    /api/vendor/revenue      │    │
│  │                                 GET    /api/vendor/products     │    │
│  │  POST  /api/payments/initiate   GET    /api/vendor/orders       │    │
│  │  POST  /api/payments/release/:id                               │    │
│  │  POST  /api/payments/refund/:id GET    /api/transporters        │    │
│  │                                 POST   /api/transporters        │    │
│  │  GET   /api/trips               GET    /api/transporters/:id    │    │
│  │  POST  /api/trips               POST   /api/transporters/:id/   │    │
│  │  PATCH /api/trips/:id                        reviews            │    │
│  │                                                                  │    │
│  │  POST  /api/uploads             GET    /health                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌──────────────────────────────┐  ┌──────────────────────────────┐    │
│  │     MIDDLEWARE AUTH          │  │    GESTION ERREURS           │    │
│  │                              │  │                              │    │
│  │  authenticate()              │  │  AppError (operational)      │    │
│  │  → vérifie JWT Bearer        │  │  JWT errors                  │    │
│  │  → injecte req.user          │  │  PG constraint errors        │    │
│  │                              │  │  Validation errors           │    │
│  │  authorize(...roles)         │  │  404 handler                 │    │
│  │  → client                    │  │                              │    │
│  │  → vendeur                   │  └──────────────────────────────┘    │
│  │  → transporteur              │                                       │
│  │  → admin                     │                                       │
│  └──────────────────────────────┘                                       │
└─────────────────────────────┬───────────────────────────────────────────┘
                              │ pg Pool (max 20 conn)
                              │ Requêtes paramétrées
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     BASE DE DONNÉES — PostgreSQL 16                     │
│                         localhost:5432                                  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                        TABLES PRINCIPALES                        │   │
│  │                                                                  │   │
│  │  users                    products                               │   │
│  │  ├── id (UUID PK)         ├── id (UUID PK)                      │   │
│  │  ├── name, email (UNIQUE) ├── seller_id (FK users)              │   │
│  │  ├── password_hash        ├── title, description                │   │
│  │  ├── role (enum)          ├── price, currency                   │   │
│  │  ├── country_code         ├── images (TEXT[])                   │   │
│  │  └── is_verified          ├── category (enum)                   │   │
│  │                           ├── origin_country ◄── INDEX          │   │
│  │                           └── stock                             │   │
│  │                                                                  │   │
│  │  orders                   order_items                           │   │
│  │  ├── id (UUID PK)         ├── order_id (FK CASCADE)             │   │
│  │  ├── order_number (UNIQUE)├── product_id (FK)                   │   │
│  │  ├── client_id (FK)       ├── quantity                         │   │
│  │  ├── status (enum)        └── unit_price                       │   │
│  │  ├── total_amount                                               │   │
│  │  ├── payment_method       escrow_transactions                   │   │
│  │  ├── payment_status       ├── order_id (FK)                    │   │
│  │  ├── escrow_released      ├── amount, currency                  │   │
│  │  ├── pickup_point_id (FK) ├── status (enum)                    │   │
│  │  └── transporter_id (FK) └── reference (UNIQUE)               │   │
│  │                                                                  │   │
│  │  transporters             trips                                  │   │
│  │  ├── id (UUID PK)         ├── id (UUID PK)                     │   │
│  │  ├── user_id (FK UNIQUE)  ├── transporter_id (FK)              │   │
│  │  ├── company_name         ├── origin_country ◄── INDEX         │   │
│  │  ├── is_verified          ├── departure_date                    │   │
│  │  └── contact_*            └── price_per_kg                     │   │
│  │                                                                  │   │
│  │  pickup_points            notifications                         │   │
│  │  product_reviews          ← rating 1-5, UNIQUE(product,author) │   │
│  │  transporter_reviews      ← rating 1-5, UNIQUE(transp,author)  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                           ÉNUMÉRATIONS                           │   │
│  │  user_role: client | vendeur | transporteur | admin              │   │
│  │  order_status: en_attente → paye → en_preparation → expedie     │   │
│  │                → arrive_bangui → pret_retrait → recupere         │   │
│  │                | annule                                          │   │
│  │  payment_status: en_attente → bloque → libere | rembourse        │   │
│  │  payment_method: orange_money | cash                             │   │
│  │  product_category: electronique | mode | alimentation | maison   │   │
│  │                    | beaute | jouets | sante | sport | auto | autre│   │
│  │  currency: XAF | EUR | USD                                       │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                          STOCKAGE FICHIERS                              │
│                 ./backend/uploads/ (images produits)                    │
│                    Multer — max 5 MB par fichier                        │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Flux d'authentification

```
Client                     Frontend                    Backend              DB
  │                            │                          │                 │
  │──── Formulaire Login ──────►│                          │                 │
  │                            │──POST /api/auth/login────►│                 │
  │                            │                          │──SELECT user────►│
  │                            │                          │◄─────────────────│
  │                            │                          │ bcrypt.compare() │
  │                            │◄──{ token, user } ───────│                 │
  │                            │ localStorage.setItem()   │                 │
  │◄── Redirect /dashboard ────│                          │                 │
  │                            │                          │                 │
  │──── Appel protégé ─────────►│                          │                 │
  │                            │──GET /api/... + Bearer───►│                 │
  │                            │                          │ jwt.verify()    │
  │                            │                          │ req.user = {id} │
  │                            │◄──{ données } ───────────│                 │
```

---

## Flux de commande & escrow

```
Client ──► Panier ──► Paiement ──► POST /api/orders ──► Commande créée (en_attente)
                                        │
                                        ▼
                              POST /api/payments/initiate
                                        │
                         ┌─────────────▼─────────────┐
                         │   Orange Money / Cash      │
                         │   Paiement simulé          │
                         │   escrow_transaction créé  │
                         │   status: bloque           │
                         └─────────────┬─────────────┘
                                        │
                         Vendeur traite la commande
                         (en_preparation → expedie → arrive_bangui)
                                        │
                                        ▼
                              Client récupère au point retrait
                              (pret_retrait → recupere)
                                        │
                                        ▼
                              POST /api/payments/release/:orderId
                              escrow_transaction: libere
                              → Argent libéré au vendeur
```

---

## Rôles et accès

```
┌──────────────┬──────────────────────────────────────────────────────────┐
│     Rôle     │                    Accès                                 │
├──────────────┼──────────────────────────────────────────────────────────┤
│ client       │ Browse produits, panier, commandes, avis produits/transp  │
├──────────────┼──────────────────────────────────────────────────────────┤
│ vendeur      │ + CRUD produits, dashboard stats, gestion commandes       │
├──────────────┼──────────────────────────────────────────────────────────┤
│ transporteur │ + Profil transporteur, publication voyages (trips)        │
├──────────────┼──────────────────────────────────────────────────────────┤
│ admin        │ TOUT : release escrow, remboursement, gestion complète    │
└──────────────┴──────────────────────────────────────────────────────────┘
```

---

## Infrastructure Docker

```
docker-compose.yml
├── postgres (diasporamarket_db)  ← port 5432, volume postgres_data
├── backend  (diasporamarket_api) ← port 4000, dépend de postgres
└── frontend (diasporamarket_web) ← port 3000, dépend de backend
```

---

## Pays supportés

```
Afrique Centrale : CF (🇨🇫 RCA), CG (🇨🇬 Congo), GA (🇬🇦 Gabon), CM (🇨🇲 Cameroun)
Afrique de l'Ouest : SN (🇸🇳 Sénégal), CI (🇨🇮 Côte d'Ivoire), MA (🇲🇦 Maroc)
Europe : FR (🇫🇷), BE (🇧🇪), CH (🇨🇭), DE (🇩🇪), GB (🇬🇧)
Amérique : CA (🇨🇦)
```
