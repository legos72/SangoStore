/**
 * seed.ts — Populates the database with realistic SangoMarket demo data.
 * Usage: npm run db:seed
 *
 * Inserts (idempotent — skips rows that already exist via ON CONFLICT DO NOTHING):
 *   5 users (1 client, 3 vendeurs, 1 transporteur)
 *   4 transporteurs profiles
 *   9 trips
 *   3 pickup_points (Bangui)
 *  12 products (spread across categories)
 *   2 orders with items + escrow
 *   4 product_reviews
 *   6 notifications
 */

import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { pool } from "./database";

// ─── IDs (deterministic so relations work) ───────────────────────────────────

const U = {
  client:      "00000000-0000-0000-0000-000000000001",
  vendeur1:    "00000000-0000-0000-0000-000000000002", // FR
  vendeur2:    "00000000-0000-0000-0000-000000000003", // SN
  vendeur3:    "00000000-0000-0000-0000-000000000004", // CM
  transporteur:"00000000-0000-0000-0000-000000000005", // FR
};
const T = {
  t1: "00000000-0000-0000-0001-000000000001",
  t2: "00000000-0000-0000-0001-000000000002",
  t3: "00000000-0000-0000-0001-000000000003",
  t4: "00000000-0000-0000-0001-000000000004",
};
const TRIP = {
  r1: uuidv4(), r2: uuidv4(), r3: uuidv4(),
  r4: uuidv4(), r5: uuidv4(), r6: uuidv4(),
};
const PP = {
  pp1: "00000000-0000-0000-0002-000000000001",
  pp2: "00000000-0000-0000-0002-000000000002",
  pp3: "00000000-0000-0000-0002-000000000003",
};
const P = {
  p1:  uuidv4(), p2:  uuidv4(), p3:  uuidv4(), p4:  uuidv4(),
  p5:  uuidv4(), p6:  uuidv4(), p7:  uuidv4(), p8:  uuidv4(),
  p9:  uuidv4(), p10: uuidv4(), p11: uuidv4(), p12: uuidv4(),
};
const O = {
  o1: uuidv4(), o2: uuidv4(),
};

async function seed() {
  const HASH = await bcrypt.hash("Demo1234!", 12);
  const client = await pool.connect();
  console.log("🌱  Seeding SangoMarket database…\n");

  try {
    await client.query("BEGIN");

    // ── Users ──────────────────────────────────────────────────────────────
    console.log("  → Users");
    const users = [
      [U.client,       "Marie-Claire Samba",  "client@sangomarket.io",       "+23672000001", "client",       "CF", true ],
      [U.vendeur1,     "Parfait Nguembo",      "vendeur1@sangomarket.io",     "+33600000001", "vendeur",      "FR", true ],
      [U.vendeur2,     "Christelle Mbaye",     "vendeur2@sangomarket.io",     "+22170000001", "vendeur",      "SN", true ],
      [U.vendeur3,     "Emmanuel Biyong",      "vendeur3@sangomarket.io",     "+23760000001", "vendeur",      "CM", true ],
      [U.transporteur, "Serge Malonga",        "transport@sangomarket.io",    "+33700000001", "transporteur", "FR", true ],
    ];
    for (const [id, name, email, phone, role, cc, verified] of users) {
      await client.query(`
        INSERT INTO users (id, name, email, phone, password_hash, role, country_code, is_verified)
        VALUES ($1,$2,$3,$4,$5,$6::user_role,$7,$8)
        ON CONFLICT (id) DO NOTHING`,
        [id, name, email, phone, HASH, role, cc, verified]);
    }

    // ── Transporters ───────────────────────────────────────────────────────
    console.log("  → Transporters");
    await client.query(`
      INSERT INTO transporters (id, user_id, company_name, description, is_verified, contact_phone, contact_wa)
      VALUES
        ($1,$2,'Serge Express','Spécialiste Paris–Bangui depuis 8 ans. Délai 7–12j. Colis sécurisé.',TRUE,'+33700000001','+33700000001'),
        ($3,$4,'Alpha Logistics','Dakar–Bangui fiable. Délai 10–15j. Tarifs compétitifs.',TRUE,'+22170000001','+22170000001'),
        ($5,$6,'Douala Transit','Douala–Bangui 8–14j. Alimentation, colis fragiles acceptés.',TRUE,'+23760000001','+23760000001'),
        ($7,$8,'Abidjan Cargo','Abidjan–Bangui 12–18j. Grand volume disponible.',TRUE,'+2250700000','+2250700000')
      ON CONFLICT (id) DO NOTHING`,
      [T.t1, U.transporteur, T.t2, U.vendeur2, T.t3, U.vendeur3, T.t4, U.vendeur1]);

    // ── Trips ──────────────────────────────────────────────────────────────
    console.log("  → Trips");
    const d = (offset: number) => {
      const dt = new Date();
      dt.setDate(dt.getDate() + offset);
      return dt.toISOString().split("T")[0];
    };
    const trips = [
      [TRIP.r1, T.t1, "FR", d(15), d(25),  7.5,  "EUR", 80 ],
      [TRIP.r2, T.t1, "FR", d(30), d(40),  8.0,  "EUR", 60 ],
      [TRIP.r3, T.t2, "SN", d(18), d(30),  3200, "XAF", 120],
      [TRIP.r4, T.t2, "SN", d(35), d(47),  3500, "XAF", 90 ],
      [TRIP.r5, T.t3, "CM", d(20), d(32),  2200, "XAF", 150],
      [TRIP.r6, T.t3, "CM", d(40), d(52),  2500, "XAF", 100],
    ];
    for (const [id, tid, oc, dep, arr, ppkg, cur, cap] of trips) {
      await client.query(`
        INSERT INTO trips (id, transporter_id, origin_country, destination_city, departure_date, arrival_date, price_per_kg, currency, available_capacity, is_active)
        VALUES ($1,$2,$3,'Bangui',$4,$5,$6,$7::currency,$8,TRUE)
        ON CONFLICT (id) DO NOTHING`,
        [id, tid, oc, dep, arr, ppkg, cur, cap]);
    }

    // ── Pickup Points ──────────────────────────────────────────────────────
    console.log("  → Pickup points");
    await client.query(`
      INSERT INTO pickup_points (id, name, address, city, phone, opening_hours, lat, lng)
      VALUES
        ($1,'DiasporaMarket — Dépôt Central','Avenue Boganda, Quartier Lakouanga','Bangui','+23672100001','Lun–Sam 8h–18h',4.3612,18.5550),
        ($2,'Marché Central','Rue du Commerce, Centre-ville','Bangui','+23672100002','Lun–Sam 7h30–17h',4.3601,18.5615),
        ($3,'Agence Saïd','Boulevard du Général de Gaulle','Bangui','+23672100003','Lun–Ven 8h–17h · Sam 8h–12h',4.3589,18.5487)
      ON CONFLICT (id) DO NOTHING`,
      [PP.pp1, PP.pp2, PP.pp3]);

    // ── Products ───────────────────────────────────────────────────────────
    console.log("  → Products");
    const products = [
      // Électronique
      [P.p1,  U.vendeur1, "iPhone 14 Pro 256 Go — Violet", "iPhone 14 Pro 256 Go, puce A16 Bionic, triple caméra 48 MP. Neuf sous blister, garantie 1 an.", 850,  "EUR", ["https://images.unsplash.com/photo-1677547208440-b5cde2f10bda?w=600&fit=crop"], "electronique", "FR", 5,  0.206],
      [P.p2,  U.vendeur1, "Samsung Galaxy S24 Ultra",        "Galaxy S24 Ultra 512 Go, S Pen intégré, écran AMOLED 6.8\", 200 MP. Neuf.",                        950,  "EUR", ["https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&fit=crop"], "electronique", "FR", 3,  0.232],
      [P.p3,  U.vendeur2, "Casque Sony WH-1000XM5",          "Casque à réduction de bruit Sony, autonomie 30h, Bluetooth 5.2. Neuf en boîte.",                   280,  "EUR", ["https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&fit=crop"], "electronique", "SN", 8,  0.250],
      // Mode
      [P.p4,  U.vendeur1, "Robe Wax Africaine — Pagne Premium", "Robe wax 100% coton, motifs traditionnels centrafricains. Tailles S–XXL. Fabriqué artisanalement.", 45,  "EUR", ["https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=600&fit=crop"], "mode", "FR", 20, 0.500],
      [P.p5,  U.vendeur2, "Boubou Brodé — Grand Boubou",     "Grand boubou brodé à la main, tissu bazin riche. Couleurs : bleu royal, blanc, beige. T. unique.",  75,  "EUR", ["https://images.unsplash.com/photo-1594938298603-c8148c4b5d5a?w=600&fit=crop"], "mode", "SN", 12, 0.800],
      // Alimentation
      [P.p6,  U.vendeur3, "Huile de palme rouge — 5L bidon", "Huile de palme rouge non raffinée, pressée à froid, origine Cameroun. Bidon hermétique 5L.",        8500,"XAF",["https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&fit=crop"], "alimentation","CM",30, 5.000],
      [P.p7,  U.vendeur3, "Café Robusta du Cameroun — 500g", "Café Robusta torréfié artisanalement, issu des hauts plateaux camerounais. Mouture fine. 500g.",      18,  "EUR", ["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&fit=crop"], "alimentation","CM",50, 0.550],
      // Maison
      [P.p8,  U.vendeur1, "Ventilateur sur pied 45 cm",      "Ventilateur tour 45 cm, 3 vitesses, silencieux, 220V–50Hz compatible. Parfait pour Bangui.",         65,  "EUR", ["https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&fit=crop"], "maison",       "FR", 10, 3.500],
      [P.p9,  U.vendeur1, "Lampe solaire LED 20W rechargeable","Lampe 20W panneau solaire intégré, autonomie 8h, IP65, idéale coupures.",                          38,  "EUR", ["https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=600&fit=crop"], "maison",       "FR", 15, 0.800],
      // Santé / Beauté
      [P.p10, U.vendeur2, "Huile de coco vierge — 500ml",    "Huile de coco extra-vierge, pression à froid, certifiée bio. Cheveux, peau, cuisine.",                12,  "EUR", ["https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=600&fit=crop"], "beaute",       "SN", 40, 0.600],
      // Jouets / Scolaire
      [P.p11, U.vendeur1, "LEGO City — Set Construction 450 pcs","LEGO City 60271, 450 pièces, 8 figurines. Dès 6 ans. Neuf sous blister.",                        55,  "EUR", ["https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&fit=crop"], "jouets",       "FR", 6,  1.200],
      // Sport
      [P.p12, U.vendeur3, "Ballon Nike Premier League officiel","Ballon de football Nike taille 5, cousu, homologué. Idéal terrains naturels et synthétiques.",      35,  "EUR", ["https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab?w=600&fit=crop"], "sport",        "CM", 20, 0.450],
    ];
    for (const [id, sid, title, desc, price, cur, images, cat, oc, stock, wkg] of products) {
      await client.query(`
        INSERT INTO products (id, seller_id, title, description, price, currency, images, category, origin_country, stock, weight_kg, local_delivery_cost_xaf, is_available)
        VALUES ($1,$2,$3,$4,$5,$6::currency,$7,$8::product_category,$9,$10,$11,2500,TRUE)
        ON CONFLICT (id) DO NOTHING`,
        [id, sid, title, desc, price, cur, images, cat, oc, stock, wkg]);
    }

    // ── Orders ─────────────────────────────────────────────────────────────
    console.log("  → Orders");
    // Order 1: iPhone, status=expedie, bloqué
    await client.query(`
      INSERT INTO orders (id, order_number, client_id, status, total_amount, currency, payment_method, payment_status, escrow_released, pickup_point_id, transporter_id, tracking_number)
      VALUES ($1,'DM-2026-00142',$2,'expedie'::order_status,850,'EUR','orange_money'::payment_method,'bloque'::payment_status,FALSE,$3,$4,'SGX-2026-142')
      ON CONFLICT (id) DO NOTHING`,
      [O.o1, U.client, PP.pp1, U.transporteur]);
    await client.query(`
      INSERT INTO order_items (order_id, product_id, quantity, unit_price)
      VALUES ($1,$2,1,850)
      ON CONFLICT DO NOTHING`,
      [O.o1, P.p1]);
    await client.query(`
      INSERT INTO escrow_transactions (order_id, amount, currency, status, reference)
      VALUES ($1,850,'EUR','bloque','ESC-OM-142')
      ON CONFLICT DO NOTHING`,
      [O.o1]);

    // Order 2: café + huile, status=pret_retrait, bloqué
    await client.query(`
      INSERT INTO orders (id, order_number, client_id, status, total_amount, currency, payment_method, payment_status, escrow_released, pickup_point_id, transporter_id)
      VALUES ($1,'DM-2026-00138',$2,'pret_retrait'::order_status,44700,'XAF','orange_money'::payment_method,'bloque'::payment_status,FALSE,$3,$4)
      ON CONFLICT (id) DO NOTHING`,
      [O.o2, U.client, PP.pp2, U.vendeur2]);
    await client.query(`
      INSERT INTO order_items (order_id, product_id, quantity, unit_price)
      VALUES ($1,$2,2,8500),($1,$3,1,27700)
      ON CONFLICT DO NOTHING`,
      [O.o2, P.p6, P.p5]);
    await client.query(`
      INSERT INTO escrow_transactions (order_id, amount, currency, status, reference)
      VALUES ($1,44700,'XAF','bloque','ESC-OM-138')
      ON CONFLICT DO NOTHING`,
      [O.o2]);

    // ── Reviews ────────────────────────────────────────────────────────────
    console.log("  → Reviews");
    const reviews = [
      [P.p1, U.client, 5, "Produit conforme, livraison rapide via Serge Express. Top !"],
      [P.p4, U.client, 4, "Belle robe, tissu de qualité. Commande en 4 semaines."],
      [P.p6, U.client, 5, "Huile de palme excellente, bidon bien hermétique."],
      [P.p7, U.client, 4, "Café très bon, livraison un peu longue mais correct."],
    ];
    for (const [pid, uid, rating, comment] of reviews) {
      await client.query(`
        INSERT INTO product_reviews (product_id, author_id, rating, comment)
        VALUES ($1,$2,$3,$4)
        ON CONFLICT (product_id, author_id) DO NOTHING`,
        [pid, uid, rating, comment]);
    }

    // ── Notifications ──────────────────────────────────────────────────────
    console.log("  → Notifications");
    const notifs = [
      [U.vendeur1, "Nouvelle commande", "iPhone 14 Pro commandé — escrow reçu",    "order",   { orderId: O.o1 }],
      [U.vendeur1, "Produit signalé",   "Votre produit iPhone 14 a un signalement", "alert",   {}               ],
      [U.vendeur2, "Nouvelle commande", "Boubou + Huile commandés — escrow reçu",   "order",   { orderId: O.o2 }],
      [U.client,   "Colis prêt",        "Votre commande DM-2026-00138 est prête !",  "pickup",  { orderId: O.o2 }],
      [U.client,   "En transit",        "Votre colis DM-2026-00142 est en route",   "transit", { orderId: O.o1 }],
    ];
    for (const [uid, title, body, type, data] of notifs) {
      await client.query(
        "INSERT INTO notifications (user_id, title, body, type, data) VALUES ($1,$2,$3,$4,$5)",
        [uid, title, body, type, JSON.stringify(data)]);
    }

    await client.query("COMMIT");
    console.log("\n✅  Seed complete.");
    console.log("   Demo credentials (all passwords: Demo1234!):");
    console.log("   client@sangomarket.io   → client");
    console.log("   vendeur1@sangomarket.io → vendeur (France)");
    console.log("   vendeur2@sangomarket.io → vendeur (Sénégal)");
    console.log("   vendeur3@sangomarket.io → vendeur (Cameroun)");
    console.log("   transport@sangomarket.io → transporteur");

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌  Seed failed:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
