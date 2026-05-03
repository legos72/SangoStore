import type { Config } from "tailwindcss";

// ─── Premium palette ──────────────────────────────────────────────────────────
// Brand: deep amber-gold (replaces flat orange for a chic, premium feel)
// Backgrounds: warm ivory / sand tones instead of cool gray

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "480px",
      },
      colors: {
        // Deep amber-gold replaces orange across the entire app
        orange: {
          50:  "#FEFCF0",
          100: "#FDF6D8",
          200: "#FAE8A8",
          300: "#F5D472",
          400: "#EDBA3E",
          500: "#D4961E",   // ← primary CTA — riche, profond, premium
          600: "#B87814",
          700: "#925D0E",
          800: "#72470A",
          900: "#583707",
          950: "#301C03",
        },
        brand: {
          DEFAULT: "#D4961E",
          dark:    "#B87814",
          light:   "#FAE8A8",
        },
        // Warm ivory tones for backgrounds
        cream: {
          50:  "#FDFCF8",
          100: "#FAF7F1",
          200: "#F4EFE4",
          300: "#EAE2D2",
          DEFAULT: "#F7F4EE",
        },
        // Deep navy for dark sections — more premium than gray-900
        navy: {
          800: "#0F1928",
          900: "#0A1120",
          950: "#060B14",
        },
      },
      fontFamily: {
        sans:    ["Inter", "system-ui", "sans-serif"],
        display: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card:        "0 1px 4px rgba(20,15,5,.07), 0 1px 2px rgba(20,15,5,.05)",
        "card-hover":"0 8px 24px rgba(20,15,5,.11), 0 2px 6px rgba(20,15,5,.07)",
        gold:        "0 4px 18px rgba(212,150,30,.40)",
        "gold-lg":   "0 8px 30px rgba(212,150,30,.35)",
        premium:     "0 2px 8px rgba(20,15,5,.08), 0 0 0 1px rgba(20,15,5,.04)",
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #D4961E 0%, #B87814 100%)",
        "warm-gradient": "linear-gradient(180deg, #FDFCF8 0%, #F4EFE4 100%)",
      },
      animation: {
        "fade-in":  "fadeIn .3s ease-in-out",
        "slide-up": "slideUp .35s ease-out",
      },
      keyframes: {
        fadeIn:  { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: { "0%": { opacity: "0", transform: "translateY(12px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
      },
    },
  },
  plugins: [],
};

export default config;
