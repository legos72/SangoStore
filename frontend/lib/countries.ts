import type { Country } from "./types";

export const COUNTRIES: Country[] = [
  { code: "FR", name: "France",          flag: "🇫🇷", phonePrefix: "+33"  },
  { code: "SN", name: "Sénégal",         flag: "🇸🇳", phonePrefix: "+221" },
  { code: "CM", name: "Cameroun",        flag: "🇨🇲", phonePrefix: "+237" },
  { code: "CI", name: "Côte d'Ivoire",   flag: "🇨🇮", phonePrefix: "+225" },
  { code: "BE", name: "Belgique",        flag: "🇧🇪", phonePrefix: "+32"  },
  { code: "CH", name: "Suisse",          flag: "🇨🇭", phonePrefix: "+41"  },
  { code: "CA", name: "Canada",          flag: "🇨🇦", phonePrefix: "+1"   },
  { code: "DE", name: "Allemagne",       flag: "🇩🇪", phonePrefix: "+49"  },
  { code: "GB", name: "Royaume-Uni",     flag: "🇬🇧", phonePrefix: "+44"  },
  { code: "MA", name: "Maroc",           flag: "🇲🇦", phonePrefix: "+212" },
  { code: "GA", name: "Gabon",           flag: "🇬🇦", phonePrefix: "+241" },
  { code: "CG", name: "Congo (Brazzaville)", flag: "🇨🇬", phonePrefix: "+242" },
  { code: "CF", name: "Centrafrique",    flag: "🇨🇫", phonePrefix: "+236" },
];

export const getCountry = (code: string): Country | undefined =>
  COUNTRIES.find((c) => c.code === code);

export const getCountryDisplay = (code: string): string => {
  const c = getCountry(code);
  return c ? `${c.flag} ${c.name}` : code;
};
