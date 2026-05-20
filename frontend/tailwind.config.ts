import type { Config } from "tailwindcss";

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
        orange: {
          50:  "#FEFCF0",
          100: "#FDF6D8",
          200: "#FAE8A8",
          300: "#F5D472",
          400: "#EDBA3E",
          500: "#D4961E",
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
        forest: {
          DEFAULT: "#1B3A2D",
          dark:    "#102419",
          light:   "#2d6a4f",
          muted:   "#F0F7F4",
        },
        cream: {
          50:  "#FDFCF8",
          100: "#FAF7F1",
          200: "#F4EFE4",
          300: "#EAE2D2",
          400: "#D6CBBA",
          DEFAULT: "#F7F4EE",
        },
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
      fontSize: {
        "2xs": ["0.65rem", { lineHeight: "1rem" }],
      },
      spacing: {
        "4.5": "1.125rem",
        "13":  "3.25rem",
        "15":  "3.75rem",
        "18":  "4.5rem",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        card:          "0 1px 3px rgba(15,10,3,.06), 0 1px 2px rgba(15,10,3,.04)",
        "card-hover":  "0 10px 30px rgba(15,10,3,.12), 0 3px 8px rgba(15,10,3,.06)",
        "card-lg":     "0 4px 16px rgba(15,10,3,.09), 0 1px 4px rgba(15,10,3,.05)",
        gold:          "0 4px 20px rgba(212,150,30,.38)",
        "gold-lg":     "0 8px 32px rgba(212,150,30,.32)",
        "gold-sm":     "0 2px 10px rgba(212,150,30,.28)",
        premium:       "0 2px 8px rgba(15,10,3,.08), 0 0 0 1px rgba(15,10,3,.04)",
        "premium-lg":  "0 8px 40px rgba(15,10,3,.14), 0 2px 8px rgba(15,10,3,.06)",
        forest:        "0 4px 20px rgba(27,58,45,.28)",
      },
      backgroundImage: {
        "gold-gradient":   "linear-gradient(135deg, #D4961E 0%, #B87814 100%)",
        "gold-gradient-h": "linear-gradient(90deg, #D4961E 0%, #E8AE38 50%, #D4961E 100%)",
        "warm-gradient":   "linear-gradient(180deg, #FDFCF8 0%, #F4EFE4 100%)",
        "forest-gradient": "linear-gradient(135deg, #1B3A2D 0%, #0D2318 100%)",
        "dark-gradient":   "linear-gradient(180deg, #0D1321 0%, #060C18 100%)",
      },
      animation: {
        "fade-in":    "fadeIn .25s ease-out",
        "fade-up":    "fadeUp .4s ease-out",
        "slide-up":   "slideUp .35s ease-out",
        "slide-down": "slideDown .3s ease-out",
        "shimmer":    "shimmer 1.6s ease-in-out infinite",
        "pop":        "pop .2s ease-out",
        "float":      "float 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn:    { "0%": { opacity: "0" },                                           "100%": { opacity: "1" } },
        fadeUp:    { "0%": { opacity: "0", transform: "translateY(18px)" },            "100%": { opacity: "1", transform: "translateY(0)" } },
        slideUp:   { "0%": { opacity: "0", transform: "translateY(14px)" },            "100%": { opacity: "1", transform: "translateY(0)" } },
        slideDown: { "0%": { opacity: "0", transform: "translateY(-10px)" },           "100%": { opacity: "1", transform: "translateY(0)" } },
        shimmer:   { "0%": { backgroundPosition: "-600px 0" },                         "100%": { backgroundPosition: "600px 0" } },
        pop:       { "0%": { transform: "scale(.9)" }, "60%": { transform: "scale(1.07)" }, "100%": { transform: "scale(1)" } },
        float:     { "0%, 100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-4px)" } },
      },
    },
  },
  plugins: [],
};

export default config;
