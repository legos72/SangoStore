export type Locale = "fr" | "en" | "es" | "pt" | "de";

export const LOCALES: { code: Locale; label: string; flag: string; name: string }[] = [
  { code: "fr", label: "FR", flag: "🇫🇷", name: "Français"   },
  { code: "en", label: "EN", flag: "🇬🇧", name: "English"    },
  { code: "es", label: "ES", flag: "🇪🇸", name: "Español"    },
  { code: "pt", label: "PT", flag: "🇧🇷", name: "Português"  },
  { code: "de", label: "DE", flag: "🇩🇪", name: "Deutsch"    },
];

export const translations = {
  // ─── NAVBAR ───────────────────────────────────────────────
  nav: {
    products:    { fr: "Produits",         en: "Products",        es: "Productos",      pt: "Produtos",       de: "Produkte"         },
    transporters:{ fr: "Transporteurs",    en: "Transporters",    es: "Transportistas", pt: "Transportadores",de: "Transporter"      },
    pickup:      { fr: "Points de retrait",en: "Pickup Points",   es: "Puntos de retiro",pt:"Pontos de coleta",de: "Abholpunkte"     },
    howItWorks:  { fr: "Comment ça marche",en: "How It Works",    es: "Cómo funciona",  pt: "Como funciona",  de: "Wie es funktioniert"},
    login:       { fr: "Connecter",         en: "Login",           es: "Iniciar sesión", pt: "Entrar",         de: "Anmelden"         },
    start:       { fr: "Commencer",        en: "Get Started",     es: "Empezar",        pt: "Começar",        de: "Loslegen"         },
    search:      { fr: "Rechercher un produit, un pays…", en: "Search a product, country…", es: "Buscar producto, país…", pt: "Pesquisar produto, país…", de: "Produkt, Land suchen…" },
  },

  // ─── HERO ─────────────────────────────────────────────────
  hero: {
    badge:       { fr: "SangoMarket by Legos — Marketplace officielle", en: "SangoMarket by Legos — Official Marketplace", es: "SangoMarket by Legos — Marketplace oficial", pt: "SangoMarket by Legos — Marketplace oficial", de: "SangoMarket by Legos — Offizielle Marketplace" },
    slides: {
      s1: {
        tag:     { fr: "🇨🇫 Livraison à Bangui",          en: "🇨🇫 Delivery to Bangui",         es: "🇨🇫 Entrega en Bangui",          pt: "🇨🇫 Entrega em Bangui",           de: "🇨🇫 Lieferung nach Bangui"        },
        title:   { fr: "Commandez depuis l'étranger,\nlivrez à Bangui", en: "Order from abroad,\ndeliver to Bangui", es: "Pide desde el extranjero,\nentrega en Bangui", pt: "Peça do exterior,\nentregar em Bangui", de: "Bestellen Sie aus dem Ausland,\nliefern nach Bangui" },
        sub:     { fr: "Vos proches reçoivent vos colis en toute sécurité.", en: "Your loved ones receive your parcels safely.", es: "Tus seres queridos reciben sus paquetes de forma segura.", pt: "Seus entes queridos recebem seus pacotes com segurança.", de: "Ihre Lieben erhalten Ihre Pakete sicher." },
      },
      s2: {
        tag:     { fr: "🔒 Paiement 100% sécurisé",       en: "🔒 100% Secure Payment",          es: "🔒 Pago 100% seguro",             pt: "🔒 Pagamento 100% seguro",         de: "🔒 100% sichere Zahlung"           },
        title:   { fr: "Payez en toute confiance,\nrecevez sans risque", en: "Pay with confidence,\nreceive without risk", es: "Paga con confianza,\nrecibe sin riesgo", pt: "Pague com confiança,\nreceba sem risco", de: "Zahlen Sie vertrauensvoll,\nerhalten Sie risikofrei" },
        sub:     { fr: "Escrow garanti — votre argent libéré à la réception.", en: "Guaranteed escrow — your money released upon receipt.", es: "Garantía de depósito en garantía: su dinero liberado al recibir.", pt: "Garantia de escrow — seu dinheiro liberado na recepção.", de: "Garantiertes Escrow — Ihr Geld wird bei Erhalt freigegeben." },
      },
      s3: {
        tag:     { fr: "👗 Mode & artisanat africain",    en: "👗 African Fashion & Crafts",      es: "👗 Moda y artesanía africana",    pt: "👗 Moda e artesanato africano",    de: "👗 Afrikanische Mode & Handwerk"  },
        title:   { fr: "Tissus wax, boubous,\nsavoir-faire de la diaspora", en: "Wax fabrics, boubous,\ndiaspora craftsmanship", es: "Telas wax, boubous,\nartesanía de la diáspora", pt: "Tecidos wax, boubous,\nartesanato da diáspora", de: "Waxstoffe, Boubous,\nDiaspora-Handwerk" },
        sub:     { fr: "La richesse culturelle africaine livrée à Bangui.", en: "African cultural richness delivered to Bangui.", es: "La riqueza cultural africana entregada en Bangui.", pt: "A riqueza cultural africana entregue em Bangui.", de: "Afrikanischer Kulturreichtum nach Bangui geliefert." },
      },
      s4: {
        tag:     { fr: "📦 Livraison GP sécurisée",       en: "📦 Secure GP Delivery",            es: "📦 Entrega GP segura",            pt: "📦 Entrega GP segura",             de: "📦 Sichere GP-Lieferung"          },
        title:   { fr: "Vos colis arrivent\nen toute sécurité à Bangui", en: "Your parcels arrive\nsafely in Bangui", es: "Sus paquetes llegan\nseguros a Bangui", pt: "Seus pacotes chegam\ncom segurança a Bangui", de: "Ihre Pakete kommen\nsicher in Bangui an" },
        sub:     { fr: "Des transporteurs certifiés GP pour chaque envoi.", en: "Certified GP carriers for every shipment.", es: "Transportistas GP certificados para cada envío.", pt: "Transportadores GP certificados para cada envio.", de: "Zertifizierte GP-Spediteure für jede Sendung." },
      },
    },
    cta:         { fr: "Commander maintenant",  en: "Order Now",          es: "Pedir ahora",          pt: "Pedir agora",           de: "Jetzt bestellen"       },
    ctaHow:      { fr: "Comment ça marche",     en: "How It Works",       es: "Cómo funciona",        pt: "Como funciona",         de: "Wie es funktioniert"   },
    byCountry:   { fr: "Produits disponibles par pays", en: "Products available by country", es: "Productos disponibles por país", pt: "Produtos disponíveis por país", de: "Produkte verfügbar nach Land" },
    trust: {
      escrow:    { fr: "Escrow sécurisé",       en: "Secure Escrow",      es: "Depósito seguro",      pt: "Escrow seguro",          de: "Sicheres Treuhand"     },
      gp:        { fr: "GP certifiés",           en: "Certified GP",       es: "GP certificados",      pt: "GP certificados",        de: "Zertifizierte GP"      },
      payment:   { fr: "Orange Money & Cash",    en: "Orange Money & Cash",es: "Orange Money & Efectivo", pt: "Orange Money & Dinheiro", de: "Orange Money & Bar"  },
    },
  },

  // ─── HOME ─────────────────────────────────────────────────
  home: {
    featured:    { fr: "Produits en vedette",   en: "Featured Products",  es: "Productos destacados", pt: "Produtos em destaque",   de: "Ausgewählte Produkte"  },
    featuredSub: { fr: "Les articles les plus populaires de la diaspora", en: "The most popular items from the diaspora", es: "Los artículos más populares de la diáspora", pt: "Os artigos mais populares da diáspora", de: "Die beliebtesten Artikel der Diaspora" },
    seeAll:      { fr: "Tout voir",             en: "See all",            es: "Ver todo",             pt: "Ver tudo",               de: "Alle anzeigen"         },
    byCountry:   { fr: "Acheter par pays d'origine", en: "Shop by country of origin", es: "Comprar por país de origen", pt: "Comprar por país de origem", de: "Nach Ursprungsland einkaufen" },
    byCountrySub:{ fr: "Découvrez les produits envoyés depuis chaque pays", en: "Discover products shipped from each country", es: "Descubre productos enviados desde cada país", pt: "Descubra produtos enviados de cada país", de: "Entdecken Sie Produkte aus jedem Land" },
    viewProducts:{ fr: "Voir les produits",     en: "View products",      es: "Ver productos",        pt: "Ver produtos",           de: "Produkte ansehen"      },
    howTitle:    { fr: "Comment ça marche ?",   en: "How Does It Work?",  es: "¿Cómo funciona?",     pt: "Como funciona?",         de: "Wie funktioniert es?"  },
    howSub:      { fr: "Simple, sécurisé, pensé pour l'Afrique", en: "Simple, secure, designed for Africa", es: "Simple, seguro, diseñado para África", pt: "Simples, seguro, projetado para a África", de: "Einfach, sicher, für Afrika entwickelt" },
    learnMore:   { fr: "En savoir plus",        en: "Learn more",         es: "Saber más",            pt: "Saber mais",             de: "Mehr erfahren"         },
    steps: {
      s1: {
        title:   { fr: "Choisissez votre produit",  en: "Choose your product",    es: "Elige tu producto",     pt: "Escolha seu produto",    de: "Produkt auswählen"       },
        desc:    { fr: "Parcourez nos produits envoyés par la diaspora depuis la France, le Sénégal, le Cameroun…", en: "Browse our products shipped by the diaspora from France, Senegal, Cameroon…", es: "Explora nuestros productos enviados por la diáspora desde Francia, Senegal, Camerún…", pt: "Navegue pelos nossos produtos enviados pela diáspora da França, Senegal, Camarões…", de: "Stöbern Sie in unseren Produkten, die von der Diaspora aus Frankreich, Senegal, Kamerun versandt werden…" },
      },
      s2: {
        title:   { fr: "Payez en toute sécurité",   en: "Pay securely",           es: "Paga de forma segura",  pt: "Pague com segurança",    de: "Sicher bezahlen"         },
        desc:    { fr: "Orange Money ou cash. Votre argent est bloqué en escrow jusqu'à la livraison.", en: "Orange Money or cash. Your money is held in escrow until delivery.", es: "Orange Money o efectivo. Tu dinero está bloqueado en garantía hasta la entrega.", pt: "Orange Money ou dinheiro. Seu dinheiro fica em escrow até a entrega.", de: "Orange Money oder Bar. Ihr Geld ist bis zur Lieferung in einem Treuhandkonto gesperrt." },
      },
      s3: {
        title:   { fr: "Le vendeur expédie via GP", en: "Seller ships via GP",    es: "El vendedor envía por GP",pt:"O vendedor envia via GP", de: "Verkäufer versendet per GP"},
        desc:    { fr: "Le vendeur choisit un transporteur certifié. Le colis part vers Bangui.", en: "The seller chooses a certified transporter. The parcel heads to Bangui.", es: "El vendedor elige un transportista certificado. El paquete va a Bangui.", pt: "O vendedor escolhe um transportador certificado. O pacote vai para Bangui.", de: "Der Verkäufer wählt einen zertifizierten Transporteur. Das Paket geht nach Bangui." },
      },
      s4: {
        title:   { fr: "Récupérez à Bangui",        en: "Pick up in Bangui",      es: "Recoge en Bangui",      pt: "Retire em Bangui",       de: "Abholen in Bangui"       },
        desc:    { fr: "Le colis arrive au point de retrait. Vous récupérez, l'argent est libéré au vendeur.", en: "The parcel arrives at the pickup point. You collect it, money is released to the seller.", es: "El paquete llega al punto de recogida. Lo recoges, el dinero se libera al vendedor.", pt: "O pacote chega ao ponto de coleta. Você o retira, o dinheiro é liberado ao vendedor.", de: "Das Paket kommt am Abholpunkt an. Sie holen es ab, das Geld wird an den Verkäufer freigegeben." },
      },
    },
    transporters:{ fr: "Transporteurs certifiés",  en: "Certified Transporters", es: "Transportistas certificados", pt: "Transportadores certificados", de: "Zertifizierte Transporter" },
    transportersSub:{ fr: "Nos GPs et transitaires de confiance vers Bangui", en: "Our trusted GPs and forwarders to Bangui", es: "Nuestros GP y transitarios de confianza a Bangui", pt: "Nossos GPs e transitários de confiança para Bangui", de: "Unsere vertrauenswürdigen GPs und Spediteure nach Bangui" },
    allTransporters:{ fr: "Tous les transporteurs", en: "All transporters",       es: "Todos los transportistas", pt: "Todos os transportadores", de: "Alle Transporter"        },
    escrowTitle: { fr: "Votre argent est toujours protégé", en: "Your money is always protected", es: "Tu dinero siempre está protegido", pt: "Seu dinheiro está sempre protegido", de: "Ihr Geld ist immer geschützt" },
    escrowDesc:  { fr: "Notre système d'escrow bloque votre paiement jusqu'à ce que vous récupériez votre colis. Si la livraison échoue, vous êtes remboursé automatiquement.", en: "Our escrow system holds your payment until you collect your parcel. If delivery fails, you are automatically refunded.", es: "Nuestro sistema de garantía bloquea tu pago hasta que recojas tu paquete. Si la entrega falla, recibes un reembolso automático.", pt: "Nosso sistema de escrow bloqueia seu pagamento até você retirar seu pacote. Se a entrega falhar, você é reembolsado automaticamente.", de: "Unser Treuhandsystem hält Ihre Zahlung, bis Sie Ihr Paket abholen. Bei Lieferausfall werden Sie automatisch erstattet." },
    ctaTitle:    { fr: "Prêt à recevoir vos produits à Bangui ?", en: "Ready to receive your products in Bangui?", es: "¿Listo para recibir tus productos en Bangui?", pt: "Pronto para receber seus produtos em Bangui?", de: "Bereit, Ihre Produkte in Bangui zu empfangen?" },
    ctaSub:      { fr: "Créez votre compte gratuitement et commandez dès aujourd'hui.", en: "Create your free account and order today.", es: "Crea tu cuenta gratis y realiza tu pedido hoy.", pt: "Crie sua conta gratuita e faça seu pedido hoje.", de: "Erstellen Sie Ihr kostenloses Konto und bestellen Sie noch heute." },
    createAccount:{ fr: "Créer mon compte",        en: "Create my account",      es: "Crear mi cuenta",       pt: "Criar minha conta",      de: "Konto erstellen"         },
    browseProducts:{ fr: "Parcourir les produits", en: "Browse products",        es: "Explorar productos",    pt: "Explorar produtos",      de: "Produkte durchsuchen"    },
  },

  // ─── PRODUCT CARD ─────────────────────────────────────────
  product: {
    departure:   { fr: "Départ",            en: "From",             es: "Salida",           pt: "Origem",             de: "Abfahrt"           },
    view:        { fr: "Voir",              en: "View",             es: "Ver",              pt: "Ver",                de: "Ansehen"           },
    outOfStock:  { fr: "Indisponible",      en: "Out of stock",     es: "Agotado",          pt: "Esgotado",           de: "Nicht verfügbar"   },
    onlyLeft:    { fr: "Plus que",          en: "Only",             es: "Solo quedan",      pt: "Restam apenas",      de: "Nur noch"          },
    left:        { fr: "",                  en: "left!",            es: "!",                pt: "!",                  de: "übrig!"            },
    inStock:     { fr: "en stock",          en: "in stock",         es: "en stock",         pt: "em estoque",         de: "auf Lager"         },
  },

  // ─── FILTER ───────────────────────────────────────────────
  filter: {
    category:    { fr: "Catégorie",         en: "Category",         es: "Categoría",        pt: "Categoria",          de: "Kategorie"         },
    country:     { fr: "Pays d'origine",    en: "Country of origin",es: "País de origen",   pt: "País de origem",     de: "Ursprungsland"     },
    all:         { fr: "Tous",              en: "All",              es: "Todos",            pt: "Todos",              de: "Alle"              },
    allCountries:{ fr: "Tous les pays",     en: "All countries",    es: "Todos los países", pt: "Todos os países",    de: "Alle Länder"       },
    activeFilters:{ fr: "Filtres actifs",   en: "Active filters",   es: "Filtros activos",  pt: "Filtros ativos",     de: "Aktive Filter"     },
    clearAll:    { fr: "Tout effacer",      en: "Clear all",        es: "Borrar todo",      pt: "Limpar tudo",        de: "Alle löschen"      },
    noProducts:  { fr: "Aucun produit pour ces filtres", en: "No products for these filters", es: "No hay productos para estos filtros", pt: "Nenhum produto para estes filtros", de: "Keine Produkte für diese Filter" },
    reset:       { fr: "Réinitialiser",     en: "Reset",            es: "Restablecer",      pt: "Redefinir",          de: "Zurücksetzen"      },
  },

  // ─── AUTH ─────────────────────────────────────────────────
  auth: {
    welcome:     { fr: "Bon retour !",      en: "Welcome back!",    es: "¡Bienvenido de vuelta!", pt: "Bem-vindo de volta!", de: "Willkommen zurück!" },
    subtitle:    { fr: "Connectez-vous à votre compte SangoMarket", en: "Sign in to your SangoMarket account", es: "Inicia sesión en tu cuenta SangoMarket", pt: "Entre na sua conta SangoMarket", de: "Melden Sie sich bei Ihrem SangoMarket-Konto an" },
    email:       { fr: "Email",             en: "Email",            es: "Correo electrónico",pt:"E-mail",             de: "E-Mail"            },
    password:    { fr: "Mot de passe",      en: "Password",         es: "Contraseña",       pt: "Senha",              de: "Passwort"          },
    forgot:      { fr: "Mot de passe oublié ?", en: "Forgot password?", es: "¿Olvidaste tu contraseña?", pt: "Esqueceu a senha?", de: "Passwort vergessen?" },
    signIn:      { fr: "Se connecter",      en: "Sign In",          es: "Iniciar sesión",   pt: "Entrar",             de: "Anmelden"          },
    loading:     { fr: "Connexion en cours…",en:"Signing in…",      es: "Iniciando sesión…",pt: "Entrando…",          de: "Anmeldung läuft…"  },
    noAccount:   { fr: "Pas encore de compte ?", en: "No account yet?", es: "¿Sin cuenta aún?", pt: "Sem conta ainda?", de: "Noch kein Konto?" },
    register:    { fr: "S'inscrire gratuitement", en: "Sign up for free", es: "Regístrate gratis", pt: "Cadastre-se grátis", de: "Kostenlos anmelden" },
    demoAccounts:{ fr: "Comptes de démonstration", en: "Demo accounts", es: "Cuentas de demostración", pt: "Contas de demonstração", de: "Demo-Konten" },
  },

  // ─── FOOTER ───────────────────────────────────────────────
  footer: {
    tagline:     { fr: "La marketplace qui connecte la diaspora centrafricaine au pays. Commandez depuis Paris, Dakar ou Douala — recevez à Bangui.", en: "The marketplace connecting the Central African diaspora back home. Order from Paris, Dakar or Douala — receive in Bangui.", es: "El marketplace que conecta la diáspora centroafricana con su país. Pide desde París, Dakar o Duala — recibe en Bangui.", pt: "O marketplace que conecta a diáspora centro-africana ao país. Peça em Paris, Dakar ou Douala — receba em Bangui.", de: "Der Marktplatz, der die zentralafrikanische Diaspora mit der Heimat verbindet. Bestellen Sie in Paris, Dakar oder Douala — erhalten Sie in Bangui." },
    marketplace: { fr: "Marketplace",     en: "Marketplace",      es: "Marketplace",      pt: "Marketplace",        de: "Marketplace"       },
    myAccount:   { fr: "Mon compte",      en: "My Account",       es: "Mi cuenta",        pt: "Minha conta",        de: "Mein Konto"        },
    helpLegal:   { fr: "Aide & Légal",    en: "Help & Legal",     es: "Ayuda y Legal",    pt: "Ajuda e Legal",      de: "Hilfe & Rechtliches"},
    rights:      { fr: "Tous droits réservés.", en: "All rights reserved.", es: "Todos los derechos reservados.", pt: "Todos os direitos reservados.", de: "Alle Rechte vorbehalten." },
    payments:    { fr: "Paiements acceptés :", en: "Accepted payments:", es: "Pagos aceptados:", pt: "Pagamentos aceitos:", de: "Akzeptierte Zahlungen:" },
    escrowNote:  { fr: "Paiements sécurisés par escrow — votre argent est protégé jusqu'à la livraison", en: "Payments secured by escrow — your money is protected until delivery", es: "Pagos asegurados por depósito en garantía — su dinero está protegido hasta la entrega", pt: "Pagamentos protegidos por escrow — seu dinheiro está protegido até a entrega", de: "Zahlungen durch Treuhand gesichert — Ihr Geld ist bis zur Lieferung geschützt" },
  },

  // ─── STATS ────────────────────────────────────────────────
  stats: {
    products:    { fr: "Produits",         en: "Products",         es: "Productos",        pt: "Produtos",           de: "Produkte"          },
    sellers:     { fr: "Vendeurs actifs",  en: "Active sellers",   es: "Vendedores activos",pt:"Vendedores ativos",  de: "Aktive Verkäufer"  },
    deliveries:  { fr: "Livraisons",       en: "Deliveries",       es: "Entregas",         pt: "Entregas",           de: "Lieferungen"       },
    transporters:{ fr: "Transporteurs GP", en: "GP Transporters",  es: "Transportistas GP",pt:"Transportadores GP", de: "GP-Transporter"    },
    countries:   { fr: "Pays couverts",    en: "Countries covered",es: "Países cubiertos", pt: "Países cobertos",    de: "Abgedeckte Länder" },
    satisfaction:{ fr: "Satisfaction",     en: "Satisfaction",     es: "Satisfacción",     pt: "Satisfação",         de: "Zufriedenheit"     },
  },
} as const;

export type TranslationKey = keyof typeof translations;

// Helper to get a translation value
export function t(
  obj: Record<Locale, string>,
  locale: Locale
): string {
  return obj[locale] ?? obj["fr"];
}
