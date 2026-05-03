# Manuel d'Administration — SangoMarket by Legos

---

## 1. DÉMARRAGE DE LA PLATEFORME

### Prérequis
- Docker + Docker Compose installés
- Node.js 20+ (développement local)
- PostgreSQL 16 (si sans Docker)

### Lancement avec Docker (recommandé)

```bash
# Depuis /home/legos/Documents/ProjetPerso/
docker-compose up -d

# Vérifier que tout tourne
docker-compose ps

# Consulter les logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

| Service  | URL                        | Conteneur               |
|----------|----------------------------|-------------------------|
| Frontend | http://localhost:3000      | diasporamarket_web      |
| API      | http://localhost:4000      | diasporamarket_api      |
| DB       | localhost:5432             | diasporamarket_db       |
| Health   | http://localhost:4000/health | —                     |

### Lancement en développement local

```bash
# Terminal 1 — Backend
cd backend
npm install
cp .env.example .env   # puis éditer .env
npm run dev            # ts-node-dev, rechargement automatique

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev            # Next.js dev server
```

---

## 2. CONFIGURATION DE L'ENVIRONNEMENT

### Fichier `backend/.env`

| Variable | Valeur par défaut | Description |
|----------|-------------------|-------------|
| `PORT` | `4000` | Port du serveur API |
| `NODE_ENV` | `development` | `development` / `production` |
| `DATABASE_URL` | `postgresql://postgres:password123@localhost:5432/diasporamarket` | URL complète PostgreSQL |
| `JWT_SECRET` | *(à changer)* | Clé secrète JWT, **minimum 32 caractères** |
| `JWT_EXPIRES_IN` | `7d` | Durée de vie des tokens |
| `FRONTEND_URL` | `http://localhost:3000` | CORS — URL du frontend |
| `ORANGE_MONEY_API_URL` | — | URL API Orange Money (production) |
| `ORANGE_MONEY_CLIENT_ID` | — | Clé API Orange Money |
| `ORANGE_MONEY_CLIENT_SECRET` | — | Secret API Orange Money |
| `UPLOAD_DIR` | `./uploads` | Répertoire images produits |
| `MAX_FILE_SIZE` | `5242880` | 5 Mo max par image |
| `SMTP_HOST` | — | Serveur email |
| `ADMIN_EMAIL` | `admin@diasporamarket.cf` | Email administrateur |

### Fichier `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

> **Production** : remplacer par l'URL publique du backend.

---

## 3. BASE DE DONNÉES

### Connexion directe

```bash
# Via Docker
docker exec -it diasporamarket_db psql -U postgres -d diasporamarket

# En local
psql -U postgres -d diasporamarket
```

### Initialisation du schéma

```bash
# Appliquer le schéma manuellement
cd backend
psql -U postgres -d diasporamarket -f src/config/schema.sql

# Via le script de migration
npm run migrate

# Charger des données de test
npm run seed
```

### Tables principales

| Table | Rôle |
|-------|------|
| `users` | Tous les comptes (clients, vendeurs, transporteurs, admins) |
| `products` | Catalogue de produits |
| `orders` | Commandes clients |
| `order_items` | Lignes de commande |
| `escrow_transactions` | Paiements en séquestre |
| `transporters` | Profils transporteurs |
| `trips` | Voyages GP annoncés |
| `pickup_points` | Points de retrait Bangui |
| `product_reviews` | Avis sur les produits |
| `transporter_reviews` | Avis sur les transporteurs |
| `notifications` | Notifications utilisateurs |

### Requêtes d'administration utiles

```sql
-- Lister tous les utilisateurs
SELECT id, name, email, role, is_verified, created_at FROM users ORDER BY created_at DESC;

-- Promouvoir un utilisateur en admin
UPDATE users SET role = 'admin' WHERE email = 'exemple@email.com';

-- Vérifier un transporteur manuellement
UPDATE transporters SET is_verified = true WHERE id = 'UUID_DU_TRANSPORTEUR';

-- Commandes en attente de libération escrow
SELECT o.order_number, o.total_amount, o.status, e.status as escrow_status
FROM orders o
JOIN escrow_transactions e ON e.order_id = o.id
WHERE o.escrow_released = false AND o.status = 'pret_retrait';

-- Chiffre d'affaires mensuel
SELECT DATE_TRUNC('month', created_at) as mois,
       SUM(total_amount) as ca_total
FROM orders
WHERE payment_status = 'libere'
GROUP BY mois ORDER BY mois DESC;

-- Produits par pays d'origine
SELECT origin_country, COUNT(*) as nb_produits
FROM products
WHERE is_available = true
GROUP BY origin_country ORDER BY nb_produits DESC;

-- Désactiver un utilisateur
UPDATE users SET is_active = false WHERE email = 'utilisateur@email.com';
```

---

## 4. GESTION DES UTILISATEURS

### Rôles disponibles

| Rôle | Description |
|------|-------------|
| `client` | Acheteur — navigue, commande, donne des avis |
| `vendeur` | Vendeur — crée produits, gère commandes reçues |
| `transporteur` | Logisticien — publie des voyages GP |
| `admin` | Accès complet — libère escrow, rembourse, tout gérer |

### Créer un compte admin

> Il n'existe pas de route d'inscription admin public. Pour créer un admin :

**Option A — Directement en base :**
```sql
INSERT INTO users (id, name, email, password_hash, role, country_code, is_verified)
VALUES (
  gen_random_uuid(),
  'Nom Admin',
  'admin@sangomarket.com',
  -- Générer un hash bcrypt (cost 12) pour le mot de passe voulu
  '$2a$12$HASH_BCRYPT_ICI',
  'admin',
  'CF',
  true
);
```

**Option B — Inscrire normalement puis promouvoir :**
```bash
# 1. S'inscrire via /auth/register avec role = 'client'
# 2. Promouvoir en admin en base
psql -c "UPDATE users SET role = 'admin' WHERE email = 'votre@email.com';"
```

### Suspension d'un compte

```sql
-- Désactiver (bloque la connexion)
UPDATE users SET is_active = false WHERE id = 'UUID';

-- Réactiver
UPDATE users SET is_active = true WHERE id = 'UUID';
```

---

## 5. GESTION DES COMMANDES

### Cycle de vie d'une commande

```
en_attente → paye → en_preparation → expedie → arrive_bangui → pret_retrait → recupere
                                                                             ↓
                                                                           annule (à tout moment)
```

### Actions admin sur les commandes

**Via l'API (avec token admin) :**

```bash
# Mettre à jour le statut d'une commande
curl -X PATCH http://localhost:4000/api/orders/ORDER_ID/status \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "arrive_bangui"}'
```

**Statuts disponibles pour PATCH :**
- `paye`, `en_preparation`, `expedie`, `arrive_bangui`, `pret_retrait`, `recupere`, `annule`

### Libération d'escrow (après réception)

```bash
curl -X POST http://localhost:4000/api/payments/release/ORDER_ID \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Remboursement

```bash
curl -X POST http://localhost:4000/api/payments/refund/ORDER_ID \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## 6. GESTION DES PAIEMENTS / ESCROW

### Fonctionnement de l'escrow

1. **Initiation** : Le client paie via Orange Money ou cash
2. **Blocage** : L'argent est mis en séquestre (`payment_status = 'bloque'`)
3. **Livraison** : Le vendeur expédie, le transporteur livre à Bangui
4. **Retrait** : Le client récupère sa commande au point de retrait
5. **Libération** : L'admin ou le vendeur libère l'argent (`payment_status = 'libere'`)

### Surveiller les escrows bloqués

```sql
SELECT 
  o.order_number,
  u.name AS client,
  o.total_amount,
  o.currency,
  e.reference,
  e.created_at AS bloque_le
FROM escrow_transactions e
JOIN orders o ON o.id = e.order_id
JOIN users u ON u.id = o.client_id
WHERE e.status = 'bloque'
ORDER BY e.created_at ASC;
```

### Configuration Orange Money (production)

Renseigner dans `.env` :
```env
ORANGE_MONEY_API_URL=https://api.orange.com/orange-money-webpay/...
ORANGE_MONEY_CLIENT_ID=votre_client_id
ORANGE_MONEY_CLIENT_SECRET=votre_client_secret
```

---

## 7. GESTION DES PRODUITS

### Via API (token vendeur ou admin)

```bash
# Créer un produit
curl -X POST http://localhost:4000/api/products \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tissu wax premium",
    "description": "Description...",
    "price": 15000,
    "currency": "XAF",
    "category": "mode",
    "originCountry": "SN",
    "stock": 50
  }'

# Désactiver un produit
curl -X PATCH http://localhost:4000/api/products/PRODUCT_ID \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"isAvailable": false}'

# Supprimer un produit
curl -X DELETE http://localhost:4000/api/products/PRODUCT_ID \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Upload d'images produit

```bash
curl -X POST http://localhost:4000/api/uploads \
  -H "Authorization: Bearer TOKEN" \
  -F "image=@/chemin/vers/image.jpg"
# Retourne: { "url": "/uploads/filename.jpg" }
```

Images stockées dans `backend/uploads/` (volume Docker persistant).

---

## 8. GESTION DES TRANSPORTEURS

### Vérifier un transporteur

```bash
# Via API
curl -X PATCH http://localhost:4000/api/transporters/TRANSPORTER_ID \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"isVerified": true}'

# Ou directement en base
psql -c "UPDATE transporters SET is_verified = true WHERE id = 'UUID';"
```

### Gérer les voyages (trips)

```bash
# Lister les voyages actifs
curl http://localhost:4000/api/trips

# Désactiver un voyage
curl -X PATCH http://localhost:4000/api/trips/TRIP_ID \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"isActive": false}'
```

---

## 9. POINTS DE RETRAIT

### Données en base

Les points de retrait Bangui sont pré-chargés via le seed. Pour en ajouter :

```sql
INSERT INTO pickup_points (id, name, address, city, phone, opening_hours, is_active)
VALUES (
  gen_random_uuid(),
  'Nouveau Point Retrait',
  'Avenue des Martyrs, Bangui',
  'Bangui',
  '+23672XXXXXXX',
  'Lun-Sam 8h-18h',
  true
);
```

---

## 10. SÉCURITÉ

### Rate Limiting

| Endpoint | Limite |
|----------|--------|
| Global | 200 req / 15 min / IP |
| `/api/auth/*` | 10 req / 15 min / IP |

Configurable dans `backend/src/index.ts`.

### JWT

- **Durée** : 7 jours (variable `JWT_EXPIRES_IN`)
- **Algorithme** : HS256 par défaut
- **Rotation** : Aucune rotation automatique — en cas de compromission, changer `JWT_SECRET` invalide tous les tokens

```bash
# Invalider tous les tokens (changer le secret)
# Dans backend/.env :
JWT_SECRET=nouveau_secret_long_et_aleatoire_min_32_chars
# Redémarrer le backend
docker-compose restart backend
```

### Mots de passe

- Bcrypt cost 12 (lent intentionnellement)
- Aucun mot de passe en clair stocké

### Sauvegardes base de données

```bash
# Backup
docker exec diasporamarket_db pg_dump -U postgres diasporamarket > backup_$(date +%Y%m%d).sql

# Restaurer
docker exec -i diasporamarket_db psql -U postgres diasporamarket < backup_20260101.sql
```

---

## 11. LOGS ET MONITORING

### Consulter les logs

```bash
# Logs en temps réel
docker-compose logs -f

# Backend seulement
docker-compose logs -f backend

# Dernières 100 lignes
docker-compose logs --tail=100 backend
```

### Health check

```bash
curl http://localhost:4000/health
# Réponse : { "status": "ok", "timestamp": "...", "uptime": 123 }
```

### Logs Morgan (backend)

Format : `METHOD /route status ms - bytes`  
Ex : `POST /api/auth/login 200 45ms - 312`

---

## 12. DÉPLOIEMENT EN PRODUCTION

### Variables critiques à changer

```env
NODE_ENV=production
JWT_SECRET=<secret_aléatoire_64_chars_minimum>
DATABASE_URL=<url_postgresql_production>
FRONTEND_URL=https://sangomarket.com
ORANGE_MONEY_CLIENT_ID=<production_key>
ORANGE_MONEY_CLIENT_SECRET=<production_secret>
```

### Build production

```bash
# Backend
cd backend && npm run build
# Génère ./dist/

# Frontend
cd frontend && npm run build
# Génère ./.next/standalone/
```

### SSL / HTTPS

En production, placer un reverse proxy (Nginx ou Caddy) devant :

```nginx
# Exemple Nginx
server {
    listen 443 ssl;
    server_name sangomarket.com;
    location / { proxy_pass http://localhost:3000; }
}

server {
    listen 443 ssl;
    server_name api.sangomarket.com;
    location / { proxy_pass http://localhost:4000; }
}
```

---

## 13. INTERNATIONALISATION

### Langues supportées

| Code | Langue |
|------|--------|
| `fr` | Français (défaut) |
| `en` | English |
| `es` | Español |
| `pt` | Português |
| `de` | Deutsch |

### Ajouter une traduction

Éditer `frontend/lib/i18n/translations.ts` et ajouter les clés dans chaque section :

```typescript
// Exemple : ajouter l'arabe
ar: {
  nav: {
    home: "الرئيسية",
    products: "المنتجات",
    // ...
  }
}
```

Puis ajouter la langue dans `LanguageSwitcher.tsx`.

---

## 14. TABLEAU DE BORD ADMIN

### Accès

1. Se connecter avec un compte `admin`
2. Naviguer vers `/dashboard/admin`

### Fonctionnalités disponibles

- Vue globale des utilisateurs (clients, vendeurs, transporteurs)
- Gestion des commandes et statuts
- Libération / remboursement des escrows
- Vérification des transporteurs
- Consultation des statistiques générales

---

## 15. DÉPANNAGE COURANT

### Backend ne démarre pas

```bash
# Vérifier la connexion DB
docker-compose logs postgres
docker exec diasporamarket_db pg_isready -U postgres

# Vérifier les variables d'env
docker-compose exec backend env | grep DATABASE
```

### Erreur CORS

Vérifier que `FRONTEND_URL` dans `.env` correspond exactement à l'origine du frontend (avec `http://` et sans slash final).

### Uploads qui échouent

```bash
# Vérifier les permissions du dossier uploads
ls -la backend/uploads/
chmod 755 backend/uploads/
```

### Token JWT refusé

- Vérifier que le client envoie `Authorization: Bearer <token>`
- Vérifier que le token n'est pas expiré (7 jours par défaut)
- Vérifier que `JWT_SECRET` n'a pas changé depuis l'émission du token

### Réinitialiser la base de données

```bash
# ATTENTION : supprime toutes les données
docker-compose down -v
docker-compose up -d
# Attendre que postgres soit prêt, puis re-seeder
docker-compose exec backend npm run seed
```

---

## 16. CONTACTS ET SUPPORT

- **Email admin** : ldirose29@gmail.com
- **Projet** : SangoMarket by Legos
- **Repository** : /home/legos/Documents/ProjetPerso
