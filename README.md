# DiasporaMarket 🇨🇫

**La marketplace e-commerce de la diaspora centrafricaine.**

Achetez depuis l'étranger, recevez à Bangui. Paiement sécurisé par escrow, réseau de transporteurs GP certifiés, filtrage par pays d'origine.

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Base de données | PostgreSQL 16 |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Paiement | Orange Money (simulation) + Cash |
| Containerisation | Docker + Docker Compose |

---

## Architecture du projet

```
ProjetPerso/
├── frontend/                  # Next.js App
│   ├── app/
│   │   ├── page.tsx           # Accueil
│   │   ├── produits/          # Liste + détail produits
│   │   ├── auth/              # Login + Register
│   │   ├── dashboard/         # Tableau de bord (multi-rôle)
│   │   ├── transporteurs/     # Liste + publier trajet
│   │   ├── paiement/          # Checkout + escrow
│   │   ├── commandes/[id]/    # Suivi commande
│   │   ├── retrait/           # Points de retrait Bangui
│   │   └── comment-ca-marche/ # Guide utilisateur
│   ├── components/
│   │   ├── layout/            # Navbar + Footer
│   │   ├── product/           # ProductCard, SearchAndFilter, CountryFilter
│   │   ├── transporter/       # TransporterCard
│   │   └── home/              # HeroSection, StatsSection
│   └── lib/
│       ├── types.ts           # Types TypeScript
│       ├── countries.ts       # Liste des pays supportés
│       ├── data.ts            # Données mock pour le développement
│       └── utils.ts           # Helpers
│
├── backend/                   # API Express
│   └── src/
│       ├── index.ts           # Point d'entrée
│       ├── config/
│       │   ├── database.ts    # Connection PostgreSQL
│       │   └── schema.sql     # Schéma complet de la base
│       ├── routes/
│       │   ├── auth.ts        # Inscription / Connexion / Me
│       │   ├── products.ts    # CRUD produits + filtres pays
│       │   ├── orders.ts      # Gestion commandes
│       │   ├── transporters.ts # Profils transporteurs + avis
│       │   ├── trips.ts       # Trajets GP
│       │   ├── payments.ts    # Escrow (initiation + libération)
│       │   └── uploads.ts     # Upload images
│       └── middleware/
│           ├── auth.ts        # JWT authenticate + authorize
│           └── errorHandler.ts
│
└── docker-compose.yml         # Dev environment
```

---

## Démarrage rapide

### Option 1 — Docker (recommandé)

```bash
# Cloner & démarrer
git clone <repo>
cd ProjetPerso
docker-compose up -d

# Frontend : http://localhost:3000
# API      : http://localhost:4000
# DB       : localhost:5432
```

### Option 2 — Manuel

**Base de données**
```bash
# Créer la base PostgreSQL
psql -U postgres -c "CREATE DATABASE diasporamarket;"
psql -U postgres -d diasporamarket -f backend/src/config/schema.sql
```

**Backend**
```bash
cd backend
cp .env.example .env     # Configurez vos variables
npm install
npm run dev              # Port 4000
```

**Frontend**
```bash
cd frontend
npm install
npm run dev              # Port 3000
```

---

## Fonctionnalités implémentées

### Marketplace
- [x] Page d'accueil avec hero, stats, produits en vedette
- [x] Liste de produits avec filtres (pays, catégorie, prix, recherche)
- [x] **Filtre par pays d'origine avec badges visuels** (🇫🇷🇸🇳🇨🇲…)
- [x] Carte produit avec pays affiché en badge orange
- [x] Page détail produit avec pays en évidence
- [x] Grille/liste responsive (mobile-first)

### Utilisateurs
- [x] Inscription multi-rôle (client, vendeur, transporteur)
- [x] Connexion avec JWT
- [x] Comptes de démonstration

### Commandes & Paiement
- [x] Checkout avec choix du point de retrait
- [x] Paiement Orange Money (simulation)
- [x] Paiement en cash
- [x] Système **Escrow** — argent bloqué → libéré à la réception
- [x] Suivi commande avec timeline visuelle

### Transporteurs
- [x] Liste des transporteurs certifiés
- [x] Trajets avec pays de départ, date, prix/kg
- [x] Filtrage par pays
- [x] Formulaire de publication de trajet
- [x] Système d'avis

### Points de retrait
- [x] 3 points de retrait à Bangui
- [x] Horaires + contacts
- [x] Guide de retrait

### Dashboard
- [x] Vue client — commandes, historique
- [x] Vue vendeur — produits, revenus
- [x] Vue transporteur — trajets
- [x] Multi-rôle dans le même composant

---

## API Reference

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/auth/register` | Créer un compte |
| POST | `/api/auth/login` | Se connecter |
| GET | `/api/auth/me` | Profil utilisateur courant |
| GET | `/api/products` | Liste avec filtres `?country=FR&category=electronique` |
| GET | `/api/products/:id` | Détail produit |
| POST | `/api/products` | Créer un produit (vendeur) |
| PATCH | `/api/products/:id` | Modifier un produit |
| DELETE | `/api/products/:id` | Supprimer un produit |
| GET | `/api/orders` | Mes commandes |
| GET | `/api/orders/:id` | Détail commande |
| POST | `/api/orders` | Passer une commande |
| PATCH | `/api/orders/:id/status` | Mettre à jour le statut |
| GET | `/api/transporters` | Liste transporteurs `?country=FR` |
| POST | `/api/transporters` | Créer un profil transporteur |
| POST | `/api/transporters/:id/reviews` | Laisser un avis |
| GET | `/api/trips` | Trajets disponibles `?country=FR` |
| POST | `/api/trips` | Publier un trajet |
| POST | `/api/payments/initiate` | Initier paiement + escrow |
| POST | `/api/payments/release/:id` | Libérer l'escrow |
| POST | `/api/payments/refund/:id` | Rembourser (admin) |

---

## Gestion des pays (feature centrale)

Le pays d'origine est la feature la plus visible de l'UX :

1. **Badge orange sur chaque carte produit** : `📦 Départ : 🇫🇷 France`
2. **Filtre visuel en pills** cliquables sur la page produits
3. **Index PostgreSQL** sur `products.origin_country` pour des requêtes performantes
4. **Filtrage côté client** (mock) et **côté serveur** (`?country=FR`)
5. **Navigation pays→produits** depuis la page d'accueil

---

## Design System

- **Couleur principale** : Orange `#f97316` (inspiré Orange Money)
- **Fond** : Blanc / Gray-50
- **Texte** : Gray-900 / Gray-500
- **Police** : Inter
- **Composants** : `card`, `card-hover`, `btn-primary`, `btn-secondary`, `badge`, `input`, `select`
- **Mobile-first** avec breakpoints Tailwind standard

---

## Roadmap

- [ ] Intégration Orange Money API réelle
- [ ] Upload images vers Cloudinary / S3
- [ ] Notifications push (Firebase)
- [ ] Tracking GPS des transporteurs
- [ ] Application mobile (React Native)
- [ ] Intégration cartes (Google Maps / OpenStreetMap)
- [ ] Système de messagerie vendeur-acheteur
- [ ] Programme de fidélité

---

## Sécurité

- Helmet.js (headers HTTP)
- Rate limiting (200 req/15min, 10 req/15min sur /auth)
- Validation Joi sur toutes les routes
- JWT avec expiration configurable
- Bcrypt (coût 12) pour les mots de passe
- Escrow — protection financière bidirectionnelle
- CORS restreint au domaine frontend

---

## Variables d'environnement clés

```env
DATABASE_URL=postgresql://...
JWT_SECRET=min_32_chars_secret
JWT_EXPIRES_IN=7d
ORANGE_MONEY_CLIENT_ID=...
ORANGE_MONEY_CLIENT_SECRET=...
FRONTEND_URL=https://diasporamarket.cf
```

---

*Construit avec ❤️ pour la diaspora centrafricaine.*
