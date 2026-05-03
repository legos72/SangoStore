import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/contexts/CartContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { Toaster } from "react-hot-toast";
import { I18nProvider } from "@/lib/i18n/context";

export const metadata: Metadata = {
  title: {
    default: "SangoMarket – La marketplace de la diaspora centrafricaine",
    template: "%s | SangoMarket",
  },
  description:
    "Commandez depuis la diaspora, recevez à Bangui. Produits authentiques depuis la France, le Sénégal, le Cameroun et plus encore. SangoMarket by Legos.",
  keywords: ["sangomarket", "marketplace", "diaspora", "centrafrique", "bangui", "e-commerce", "afrique"],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "SangoMarket",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: "12px",
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
            },
            success: {
              iconTheme: { primary: "#f97316", secondary: "#fff" },
            },
          }}
        />
        <I18nProvider>
          <CurrencyProvider>
            <CartProvider>
              <Navbar />
              <main className="min-h-screen">{children}</main>
              <Footer />
            </CartProvider>
          </CurrencyProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
