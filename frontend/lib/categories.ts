import type { ProductCategory } from "./types";

export interface SubSpace {
  slug:          string;
  label:         string;
  emoji:         string;
  subcategories: string[];
}

export interface SellerCategory {
  slug:          string;
  label:         string;
  emoji:         string;
  color:         string;
  apiCategory:   ProductCategory;
  subcategories: string[];   // niveau 2 direct (si pas de subSpaces)
  subSpaces?:    SubSpace[]; // niveau 2 intermédiaire → niveau 3 subcategories
}

export const SELLER_CATEGORIES: SellerCategory[] = [
  {
    slug: "mode-africaine",
    label: "Mode Africaine",
    emoji: "🌍",
    color: "from-amber-500 to-yellow-400",
    apiCategory: "mode",
    subcategories: [],
    subSpaces: [
      {
        slug: "homme",
        label: "Homme",
        emoji: "👔",
        subcategories: ["Boubou", "Bazin", "Wax Homme", "Ensembles", "Tuniques", "Chemises africaines", "Vestes africaines", "Kaftans", "Tenues cérémonie", "Casual africain", "Sandales", "Bonnets"],
      },
      {
        slug: "femme",
        label: "Femme",
        emoji: "👗",
        subcategories: ["Robes Wax", "Bazin Femme", "Ensembles Femme", "Kaftans Femme", "Robes soirée", "Tenues mariage", "Sacs", "Bijoux", "Foulards", "Talons africains"],
      },
      {
        slug: "mariage",
        label: "Mariage",
        emoji: "💍",
        subcategories: ["Couple africain", "Robes mariage", "Tenues marié homme", "Tenues mariée femme", "Demoiselles d'honneur", "Accessoires mariage", "Bijoux mariage", "Chaussures cérémonie"],
      },
      {
        slug: "enfant",
        label: "Enfants",
        emoji: "🧒",
        subcategories: ["Garçon", "Fille", "Boubou enfant", "Robes enfant", "Ensembles enfant", "Accessoires enfant", "Baptême", "Fêtes"],
      },
      {
        slug: "tissu",
        label: "Tissus & Couture",
        emoji: "🧵",
        subcategories: ["Wax", "Bazin", "Kenté", "Bogolan", "Kita", "Tissus brodés", "Couture Homme", "Couture Femme", "Tailleurs"],
      },
      {
        slug: "accessoire",
        label: "Accessoires",
        emoji: "👜",
        subcategories: ["Sacs", "Bijoux", "Montres", "Bonnets", "Foulards", "Chaussures", "Sandales", "Lunettes", "Ceintures"],
      },
    ],
  },
  {
    slug: "mode-femme",
    label: "Mode Femme",
    emoji: "👗",
    color: "from-pink-500 to-rose-400",
    apiCategory: "mode",
    subcategories: ["Robes", "Sacs", "Chaussures", "Bijoux", "Vêtements", "Montres", "Accessoires", "Parfums", "Maquillage"],
  },
  {
    slug: "mode-homme",
    label: "Mode Homme",
    emoji: "👔",
    color: "from-slate-600 to-slate-400",
    apiCategory: "mode",
    subcategories: ["Sneakers", "Chemises", "Pantalons", "T-shirts", "Vestes", "Montres", "Ceintures", "Chaussures", "Accessoires"],
  },
  {
    slug: "electronique",
    label: "Électronique",
    emoji: "📱",
    color: "from-blue-600 to-blue-400",
    apiCategory: "electronique",
    subcategories: ["Smartphones", "Ordinateurs", "TV & Audio", "Gaming", "Accessoires", "Photo & Caméra", "Tablettes", "Montres connectées"],
  },
  {
    slug: "beaute",
    label: "Beauté & Soins",
    emoji: "💄",
    color: "from-rose-500 to-pink-400",
    apiCategory: "beaute",
    subcategories: ["Soins visage", "Maquillage", "Parfums", "Cheveux", "Corps", "Ongles"],
  },
  {
    slug: "maison",
    label: "Maison",
    emoji: "🏠",
    color: "from-emerald-600 to-green-400",
    apiCategory: "maison",
    subcategories: ["Cuisine", "Décoration", "Éclairage", "Meubles", "Literie", "Électroménager", "Organisation", "Jardin"],
  },
  {
    slug: "alimentation",
    label: "Alimentation",
    emoji: "🥘",
    color: "from-orange-500 to-amber-400",
    apiCategory: "alimentation",
    subcategories: ["Conserves", "Boissons", "Épices", "Snacks", "Bio & Naturel", "Produits locaux", "Céréales", "Huiles"],
  },
  {
    slug: "sport",
    label: "Sport & Loisirs",
    emoji: "⚽",
    color: "from-violet-600 to-purple-400",
    apiCategory: "sport",
    subcategories: ["Fitness", "Football", "Basketball", "Tennis", "Natation", "Vélo", "Camping", "Running"],
  },
  {
    slug: "jouets",
    label: "Jouets & Enfants",
    emoji: "🧸",
    color: "from-yellow-500 to-amber-300",
    apiCategory: "jouets",
    subcategories: ["Jouets éducatifs", "Jeux de société", "Poupées", "Voitures jouets", "Livres enfants", "Plein air"],
  },
  {
    slug: "sante",
    label: "Santé & Bien-être",
    emoji: "💊",
    color: "from-teal-600 to-cyan-400",
    apiCategory: "sante",
    subcategories: ["Vitamines", "Hygiène", "Soins médicaux", "Bien-être", "Maternité", "Fitness santé"],
  },
  {
    slug: "auto",
    label: "Auto & Moto",
    emoji: "🚗",
    color: "from-gray-600 to-gray-400",
    apiCategory: "auto",
    subcategories: ["Accessoires voiture", "GPS & Navigation", "Audio voiture", "Entretien", "Sécurité", "Moto"],
  },
  {
    slug: "autre",
    label: "Autre / Divers",
    emoji: "📦",
    color: "from-gray-400 to-gray-300",
    apiCategory: "autre",
    subcategories: [],
  },
];

export function getCategoryBySlug(slug: string): SellerCategory | undefined {
  return SELLER_CATEGORIES.find(c => c.slug === slug);
}

export function getApiCategory(slug: string): ProductCategory {
  return getCategoryBySlug(slug)?.apiCategory ?? "autre";
}
