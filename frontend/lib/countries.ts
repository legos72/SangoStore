import type { Country } from "./types";

export const COUNTRIES: Country[] = [
  // ── Europe ──────────────────────────────────────────────────────────────────
  { code: "FR", name: "France",           flag: "🇫🇷", phonePrefix: "+33"  },
  { code: "BE", name: "Belgique",         flag: "🇧🇪", phonePrefix: "+32"  },
  { code: "CH", name: "Suisse",           flag: "🇨🇭", phonePrefix: "+41"  },
  { code: "DE", name: "Allemagne",        flag: "🇩🇪", phonePrefix: "+49"  },
  { code: "GB", name: "Royaume-Uni",      flag: "🇬🇧", phonePrefix: "+44"  },
  { code: "IT", name: "Italie",           flag: "🇮🇹", phonePrefix: "+39"  },
  { code: "ES", name: "Espagne",          flag: "🇪🇸", phonePrefix: "+34"  },
  { code: "NL", name: "Pays-Bas",         flag: "🇳🇱", phonePrefix: "+31"  },
  { code: "PT", name: "Portugal",         flag: "🇵🇹", phonePrefix: "+351" },
  { code: "LU", name: "Luxembourg",       flag: "🇱🇺", phonePrefix: "+352" },
  { code: "SE", name: "Suède",            flag: "🇸🇪", phonePrefix: "+46"  },
  { code: "NO", name: "Norvège",          flag: "🇳🇴", phonePrefix: "+47"  },
  { code: "DK", name: "Danemark",         flag: "🇩🇰", phonePrefix: "+45"  },
  { code: "AT", name: "Autriche",         flag: "🇦🇹", phonePrefix: "+43"  },
  { code: "FI", name: "Finlande",         flag: "🇫🇮", phonePrefix: "+358" },
  { code: "IE", name: "Irlande",          flag: "🇮🇪", phonePrefix: "+353" },
  { code: "PL", name: "Pologne",          flag: "🇵🇱", phonePrefix: "+48"  },
  { code: "GR", name: "Grèce",            flag: "🇬🇷", phonePrefix: "+30"  },
  // ── Amérique ────────────────────────────────────────────────────────────────
  { code: "US", name: "États-Unis",       flag: "🇺🇸", phonePrefix: "+1"   },
  { code: "CA", name: "Canada",           flag: "🇨🇦", phonePrefix: "+1"   },
  { code: "BR", name: "Brésil",           flag: "🇧🇷", phonePrefix: "+55"  },
  // ── Moyen-Orient ────────────────────────────────────────────────────────────
  { code: "AE", name: "Émirats arabes",   flag: "🇦🇪", phonePrefix: "+971" },
  { code: "SA", name: "Arabie Saoudite",  flag: "🇸🇦", phonePrefix: "+966" },
  { code: "QA", name: "Qatar",            flag: "🇶🇦", phonePrefix: "+974" },
  // ── Océanie ─────────────────────────────────────────────────────────────────
  { code: "AU", name: "Australie",        flag: "🇦🇺", phonePrefix: "+61"  },
  // ── Afrique centrale ────────────────────────────────────────────────────────
  { code: "CF", name: "Centrafrique",     flag: "🇨🇫", phonePrefix: "+236" },
  { code: "CG", name: "Congo-Brazza",     flag: "🇨🇬", phonePrefix: "+242" },
  { code: "CD", name: "RD Congo",         flag: "🇨🇩", phonePrefix: "+243" },
  { code: "GA", name: "Gabon",            flag: "🇬🇦", phonePrefix: "+241" },
  { code: "TD", name: "Tchad",            flag: "🇹🇩", phonePrefix: "+235" },
  { code: "CM", name: "Cameroun",         flag: "🇨🇲", phonePrefix: "+237" },
  { code: "GQ", name: "Guinée équat.",    flag: "🇬🇶", phonePrefix: "+240" },
  // ── Afrique de l'Ouest ──────────────────────────────────────────────────────
  { code: "SN", name: "Sénégal",          flag: "🇸🇳", phonePrefix: "+221" },
  { code: "CI", name: "Côte d'Ivoire",    flag: "🇨🇮", phonePrefix: "+225" },
  { code: "ML", name: "Mali",             flag: "🇲🇱", phonePrefix: "+223" },
  { code: "BF", name: "Burkina Faso",     flag: "🇧🇫", phonePrefix: "+226" },
  { code: "GN", name: "Guinée",           flag: "🇬🇳", phonePrefix: "+224" },
  { code: "NE", name: "Niger",            flag: "🇳🇪", phonePrefix: "+227" },
  { code: "BJ", name: "Bénin",            flag: "🇧🇯", phonePrefix: "+229" },
  { code: "TG", name: "Togo",             flag: "🇹🇬", phonePrefix: "+228" },
  { code: "NG", name: "Nigeria",          flag: "🇳🇬", phonePrefix: "+234" },
  { code: "GH", name: "Ghana",            flag: "🇬🇭", phonePrefix: "+233" },
  { code: "MR", name: "Mauritanie",       flag: "🇲🇷", phonePrefix: "+222" },
  { code: "SL", name: "Sierra Leone",     flag: "🇸🇱", phonePrefix: "+232" },
  { code: "LR", name: "Liberia",          flag: "🇱🇷", phonePrefix: "+231" },
  { code: "GM", name: "Gambie",           flag: "🇬🇲", phonePrefix: "+220" },
  // ── Afrique du Nord ─────────────────────────────────────────────────────────
  { code: "MA", name: "Maroc",            flag: "🇲🇦", phonePrefix: "+212" },
  { code: "DZ", name: "Algérie",          flag: "🇩🇿", phonePrefix: "+213" },
  { code: "TN", name: "Tunisie",          flag: "🇹🇳", phonePrefix: "+216" },
  { code: "EG", name: "Égypte",           flag: "🇪🇬", phonePrefix: "+20"  },
  { code: "LY", name: "Libye",            flag: "🇱🇾", phonePrefix: "+218" },
  // ── Afrique de l'Est & du Sud ────────────────────────────────────────────────
  { code: "ET", name: "Éthiopie",         flag: "🇪🇹", phonePrefix: "+251" },
  { code: "KE", name: "Kenya",            flag: "🇰🇪", phonePrefix: "+254" },
  { code: "TZ", name: "Tanzanie",         flag: "🇹🇿", phonePrefix: "+255" },
  { code: "RW", name: "Rwanda",           flag: "🇷🇼", phonePrefix: "+250" },
  { code: "ZA", name: "Afrique du Sud",   flag: "🇿🇦", phonePrefix: "+27"  },
  { code: "AO", name: "Angola",           flag: "🇦🇴", phonePrefix: "+244" },
  { code: "MZ", name: "Mozambique",       flag: "🇲🇿", phonePrefix: "+258" },
  { code: "SD", name: "Soudan",           flag: "🇸🇩", phonePrefix: "+249" },
];

export const getCountry = (code: string): Country | undefined =>
  COUNTRIES.find((c) => c.code === code);

export const getCountryDisplay = (code: string): string => {
  const c = getCountry(code);
  return c ? `${c.flag} ${c.name}` : code;
};
